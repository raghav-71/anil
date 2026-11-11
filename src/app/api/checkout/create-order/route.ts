import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { dispatchWhatsAppNotification } from "@/lib/whatsapp";
import { dispatchOrderEmailNotification } from "@/lib/email";
import { syncOrderToSupabase } from "@/lib/database/supabase-orders";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      fulfillmentType,
      items,
      paymentMethod,
      discountAmount,
      couponCode,
      idempotencyKey,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Shopping bag cannot be empty" }, { status: 400 });
    }

    // Pre-flight check stock
    for (const item of items) {
      const v = db.getVariantById(item.variantId);
      if (!v) {
        return NextResponse.json({ error: "Product variant not found in store database" }, { status: 400 });
      }
      if (item.quantity <= 0) {
        return NextResponse.json({ error: "Invalid item quantity" }, { status: 400 });
      }
      if (v.variant.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${v.product.title} (${v.variant.color || ""} ${v.variant.storage || ""}). Only ${v.variant.stockQuantity} available.`,
          },
          { status: 400 }
        );
      }
    }

    if (paymentMethod === "cod") {
      // Process Cash on Delivery immediately
      const result = db.completeOnlineOrder({
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress,
        fulfillmentType: fulfillmentType || "delivery",
        items,
        paymentMethod: "cod",
        paymentStatus: "pending", // Unpaid until collected at doorstep
        discountAmount: discountAmount || 0,
        couponCode,
        idempotencyKey,
      });

      if (!result.success || !result.order) {
        return NextResponse.json({ error: result.error || "Failed to process COD order" }, { status: 400 });
      }

      const order = result.order;

      // Sync order to Supabase PostgreSQL (Single Source of Truth)
      syncOrderToSupabase(order).catch((e) => console.error("Supabase order sync error:", e));

      // Trigger asynchronous owner notification via WhatsApp (non-blocking)
      dispatchWhatsAppNotification({
        eventType: "order_created",
        dedupKey: `order_created_${order.orderNumber}`,
        title: "New Cash on Delivery Order Received",
        details: {
          orderNumber: order.orderNumber,
          customer: order.customerName,
          phone: `+91 ${order.customerPhone}`,
          fulfillment: order.fulfillmentType === "pickup" ? "In-Store Pickup (Pant Nagar)" : "Doorstep Delivery",
          itemsCount: `${order.items.length} item(s)`,
          totalAmount: `₹${order.grandTotal.toLocaleString("en-IN")}`,
          paymentMode: "Cash on Delivery (Pending Collection)",
          deliveryPincode: order.fulfillmentType === "pickup" ? "In-Store Pickup" : (shippingAddress?.pincode || "591103"),
        },
      }).catch((e) => console.error("WhatsApp notification dispatch failed:", e));

      // Trigger asynchronous owner email notification (non-blocking)
      dispatchOrderEmailNotification(order).catch((e) => console.error("Email notification dispatch failed:", e));

      // Check for low stock alerts on purchased items
      for (const item of items) {
        const v = db.getVariantById(item.variantId);
        if (v && v.variant.stockQuantity <= 3) {
          dispatchWhatsAppNotification({
            eventType: "low_stock_alert",
            dedupKey: `low_stock_${v.variant.id}_${v.variant.stockQuantity}`,
            title: "Low Inventory Warning",
            details: {
              productName: v.product.title,
              variant: `${v.variant.color || ""} ${v.variant.storage || ""}`.trim() || "Standard",
              remainingStock: `${v.variant.stockQuantity} units left`,
              sku: v.variant.sku,
            },
          }).catch((e) => console.error("Low stock WhatsApp alert failed:", e));
        }
      }

      return NextResponse.json({
        success: true,
        order,
      });
    }

    // For Razorpay online payments, calculate grand total server-side
    let subtotal = 0;
    for (const item of items) {
      const v = db.getVariantById(item.variantId)!;
      subtotal += v.variant.sellingPrice * item.quantity;
    }
    const appliedDiscount = Math.max(0, discountAmount || 0);
    const taxableBasis = Math.max(0, subtotal - appliedDiscount);
    const settings = db.getShopSettings();
    const isPickup = fulfillmentType === "pickup";
    const shippingFee = isPickup
      ? 0
      : (taxableBasis >= settings.freeShippingThreshold ? 0 : settings.standardShippingFee);
    const grandTotal = taxableBasis + shippingFee;

    // Razorpay Order ID for checkout session
    const razorpayOrderId = `order_${Math.random().toString(36).substring(2, 12)}`;

    return NextResponse.json({
      success: true,
      requiresPayment: true,
      razorpayOrderId,
      amount: grandTotal * 100, // In Paise
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mobile_store_key",
      customerDetails: { customerName, customerPhone, customerEmail },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to initiate order" }, { status: 500 });
  }
}

