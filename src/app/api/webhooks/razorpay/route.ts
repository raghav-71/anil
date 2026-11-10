import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/database/store";
import { dispatchWhatsAppNotification } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

/**
 * Backend Razorpay Webhook Handler
 * Cryptographically verifies asynchronous gateway notifications and updates order & payment states.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "rzp_whsec_secret_12345";

    // In production, strictly enforce signature verification
    const isLocalTest = !process.env.RAZORPAY_WEBHOOK_SECRET || webhookSecret.includes("12345");
    
    if (signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (signature !== expectedSignature && !isLocalTest) {
        console.error("[Razorpay Webhook] Signature mismatch. Webhook rejected.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else if (!isLocalTest) {
      return NextResponse.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    const paymentId = paymentEntity?.id;
    const orderNumberNote = paymentEntity?.notes?.orderNumber || orderEntity?.notes?.orderNumber;

    if (orderNumberNote) {
      const order = db.getOrderByIdOrNumber(orderNumberNote);

      if (order) {
        if (event === "payment.captured" || event === "order.paid") {
          order.paymentStatus = "paid";
          order.updatedAt = new Date().toISOString();
          db.saveOrdersToDisk();

          dispatchWhatsAppNotification({
            eventType: "payment_verified",
            dedupKey: `webhook_paid_${paymentId}`,
            title: "Gateway Webhook: Payment Verified & Settled",
            details: {
              orderNumber: order.orderNumber,
              paymentId,
              amount: `₹${(paymentEntity.amount / 100).toLocaleString("en-IN")}`,
              customer: order.customerName,
              gatewayEvent: event,
            },
          }).catch((e) => console.error("Webhook WhatsApp alert error:", e));
        } else if (event === "payment.failed") {
          order.paymentStatus = "failed";
          order.notes = `Payment failed via gateway: ${paymentEntity.error_description || "Declined by bank"}`;
          order.updatedAt = new Date().toISOString();
          db.saveOrdersToDisk();
        } else if (event === "refund.processed" || event === "refund.created") {
          order.paymentStatus = "refunded";
          order.status = "returned";
          order.notes = `Refund of ₹${(payload.payload?.refund?.entity?.amount / 100) || 0} processed via Razorpay.`;
          order.updatedAt = new Date().toISOString();
          db.saveOrdersToDisk();
        }
      }
    }

    return NextResponse.json({ status: "ok", received: true });
  } catch (err: any) {
    console.error("[Razorpay Webhook] Error processing event:", err);
    return NextResponse.json({ error: err.message || "Webhook handling error" }, { status: 500 });
  }
}

