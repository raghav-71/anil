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
      utrNumber,
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

    const isOnlinePayment = paymentMethod === "razorpay" || paymentMethod === "razorpay_link" || paymentMethod === "online";
    const initialPaymentStatus = isOnlinePayment ? (utrNumber ? "paid" : "pending") : "pending";
    const paymentId = utrNumber ? String(utrNumber).trim() : (isOnlinePayment ? "razorpay_link_unconfirmed" : undefined);

    // Process Order directly
    const result = db.completeOnlineOrder({
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      fulfillmentType: fulfillmentType || "delivery",
      items,
      paymentMethod: isOnlinePayment ? "razorpay" : "cod",
      paymentStatus: initialPaymentStatus,
      paymentId,
      discountAmount: discountAmount || 0,
      couponCode,
      idempotencyKey,
    });

    if (!result.success || !result.order) {
      return NextResponse.json({ error: result.error || "Failed to process order" }, { status: 400 });
    }

    const order = result.order;
    if (utrNumber) {
      order.notes = `Paid via Razorpay Link (https://razorpay.me/@raghavendra4969). UTR/Ref: ${utrNumber}`;
    }

    // Sync order to Supabase PostgreSQL (Single Source of Truth)
    syncOrderToSupabase(order).catch((e) => console.error("Supabase order sync error:", e));

    // Trigger asynchronous owner notification via WhatsApp (non-blocking)
    dispatchWhatsAppNotification({
      eventType: isOnlinePayment ? "payment_verified" : "order_created",
      dedupKey: `order_${order.orderNumber}`,
      title: isOnlinePayment ? "Online Payment Order Received (Razorpay Link)" : "New Cash on Delivery Order Received",
      details: {
        orderNumber: order.orderNumber,
        customer: order.customerName,
        phone: `+91 ${order.customerPhone}`,
        fulfillment: order.fulfillmentType === "pickup" ? "In-Store Pickup (Belagavi)" : "Doorstep Delivery",
        itemsCount: `${order.items.length} item(s)`,
        totalAmount: `₹${order.grandTotal.toLocaleString("en-IN")}`,
        paymentMode: isOnlinePayment
          ? `Razorpay Link (${utrNumber ? `UTR: ${utrNumber}` : "Pending Verification"})`
          : "Cash on Delivery (Pending Collection)",
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to initiate order" }, { status: 500 });
  }
}
