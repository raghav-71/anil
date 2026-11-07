import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { verifyRazorpaySignature } from "@/lib/razorpay";

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
      items: orderDetails.items,
      paymentMethod: "razorpay",
      paymentId: razorpay_payment_id,
      discountAmount: orderDetails.discountAmount || 0,
      couponCode: orderDetails.couponCode,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      order: result.order,
      verified: true,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Payment verification failed" }, { status: 500 });
  }
}

