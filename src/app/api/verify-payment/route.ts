import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { db } from "@/lib/database/store";
import { syncOrderToSupabase } from "@/lib/database/supabase-orders";
import { dispatchWhatsAppNotification } from "@/lib/whatsapp";
import { dispatchOrderEmailNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * STEP 3: BACKEND - Verify Signature
 * Endpoint: POST /api/verify-payment
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * Compare generated signature with razorpay_signature
 * Return success only if signatures match
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Support both Razorpay standard response keys and generic keys
    const order_id = body.razorpay_order_id || body.order_id;
    const payment_id = body.razorpay_payment_id || body.payment_id;
    const signature = body.razorpay_signature || body.signature;
    const orderDetails = body.orderDetails;

    // Validate missing fields -> return 400
    if (!order_id || !payment_id || !signature) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required payment parameters. Expected order_id, payment_id, and signature.",
        },
        { status: 400 }
      );
    }

    // Cryptographic verification using HMAC-SHA256
    const isValid = verifyRazorpaySignature({
      orderId: order_id,
      paymentId: payment_id,
      signature: signature,
    });

    // Signature mismatch -> return 400, do NOT mark as paid
    if (!isValid) {
      console.warn(`[Razorpay verify-payment] Signature mismatch for order: ${order_id}, payment: ${payment_id}`);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment signature. Verification failed.",
        },
        { status: 400 }
      );
    }

    // If orderDetails are provided (storefront checkout), persist genuine order to Supabase
    let createdOrder = null;
    if (orderDetails && Array.isArray(orderDetails.items)) {
      const result = db.completeOnlineOrder({
        customerName: orderDetails.customerName,
        customerPhone: orderDetails.customerPhone,
        customerEmail: orderDetails.customerEmail,
        shippingAddress: orderDetails.shippingAddress,
        fulfillmentType: orderDetails.fulfillmentType || "delivery",
        items: orderDetails.items,
        paymentMethod: "razorpay",
        paymentId: payment_id,
        paymentStatus: "paid", // Verified by backend HMAC-SHA256
        discountAmount: orderDetails.discountAmount || 0,
        couponCode: orderDetails.couponCode,
        idempotencyKey: orderDetails.idempotencyKey || `pay_${payment_id}`,
      });

      if (!result.success || !result.order) {
        return NextResponse.json(
          { error: result.error || "Payment was verified but failed to record order." },
          { status: 500 }
        );
      }

      createdOrder = result.order;
      createdOrder.notes = `Razorpay Order ID: ${order_id} | Payment ID: ${payment_id}`;

      // Await sync to Supabase PostgreSQL (Single Source of Truth)
      try {
        const syncRes = await syncOrderToSupabase(createdOrder);
        if (!syncRes.success) {
          console.error("[Razorpay verify-payment] Supabase sync warning:", syncRes.error);
        }
      } catch (dbErr: any) {
        console.error("[Razorpay verify-payment] Supabase order sync exception:", dbErr.message);
      }

      // Non-blocking notifications
      dispatchWhatsAppNotification({
        eventType: "payment_verified",
        dedupKey: `payment_verified_${payment_id}`,
        title: "Online Payment Verified & Order Created",
        details: {
          orderNumber: createdOrder.orderNumber,
          paymentId: payment_id,
          amount: `₹${createdOrder.grandTotal.toLocaleString("en-IN")}`,
          customer: createdOrder.customerName,
          phone: `+91 ${createdOrder.customerPhone}`,
          fulfillment: createdOrder.fulfillmentType === "pickup" ? "In-Store Pickup" : "Doorstep Delivery",
          paymentGateway: "Razorpay Standard Checkout (HMAC Verified)",
        },
      }).catch((e) => console.error("WhatsApp notification error:", e));

      dispatchOrderEmailNotification(createdOrder).catch((e) =>
        console.error("Email notification error:", e)
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Payment signature verified successfully.",
      order: createdOrder,
    });
  } catch (err: any) {
    console.error("[Verify Payment Exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Payment verification encountered an internal error." },
      { status: 500 }
    );
  }
}
