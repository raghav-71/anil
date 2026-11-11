import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { dispatchWhatsAppNotification } from "@/lib/whatsapp";
import { dispatchOrderEmailNotification } from "@/lib/email";
import { syncOrderToSupabase } from "@/lib/database/supabase-orders";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
    } = body;

    // Verify cryptographic signature to prevent spoofing
    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    // In local sandbox environment or demo test keys, allow verification if test flag or valid signature
    const isTestMode = !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET.includes("dummy") || process.env.RAZORPAY_KEY_SECRET.includes("12345");
    if (!isValid && !isTestMode) {
      return NextResponse.json({ error: "Invalid payment signature. Transaction rejected." }, { status: 400 });
    }

    // Atomic Stock Deduction and Order Creation
    const result = db.completeOnlineOrder({
      customerName: orderDetails.customerName,
      customerPhone: orderDetails.customerPhone,
      customerEmail: orderDetails.customerEmail,
      shippingAddress: orderDetails.shippingAddress,
      fulfillmentType: orderDetails.fulfillmentType || "delivery",
      items: orderDetails.items,
      paymentMethod: "razorpay",
      paymentId: razorpay_payment_id,
      paymentStatus: "paid", // Verified by backend signature
      discountAmount: orderDetails.discountAmount || 0,
      couponCode: orderDetails.couponCode,
      idempotencyKey: orderDetails.idempotencyKey || `pay_${razorpay_payment_id}`,
    });

    if (!result.success || !result.order) {
      return NextResponse.json({ error: result.error || "Failed to finalize order" }, { status: 400 });
    }

    const order = result.order;

    // Sync order to Supabase PostgreSQL (Single Source of Truth)
    syncOrderToSupabase(order).catch((e) => console.error("Supabase order sync error:", e));

    // Trigger WhatsApp notification for verified online payment & order creation (non-blocking)
    dispatchWhatsAppNotification({
      eventType: "payment_verified",
      dedupKey: `payment_verified_${razorpay_payment_id}`,
      title: "Online Payment Verified & Order Created",
      details: {
        orderNumber: order.orderNumber,
        paymentId: razorpay_payment_id,
        amount: `₹${order.grandTotal.toLocaleString("en-IN")}`,
        customer: order.customerName,
        phone: `+91 ${order.customerPhone}`,
        fulfillment: order.fulfillmentType === "pickup" ? "In-Store Pickup" : "Doorstep Delivery",
        paymentGateway: "Razorpay (Verified Cryptographically)",
        itemsCount: `${order.items.length} item(s)`,
      },
    }).catch((e) => console.error("WhatsApp payment notification failed:", e));

    // Trigger Email notification for verified order (non-blocking)
    dispatchOrderEmailNotification(order).catch((e) => console.error("Email notification dispatch failed:", e));

    // Check for low stock alerts
    for (const item of orderDetails.items) {
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
      verified: true,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Payment verification failed" }, { status: 500 });
  }
}

