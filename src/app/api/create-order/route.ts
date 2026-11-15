import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

/**
 * STEP 1: BACKEND - Create Order
 * Endpoint: POST /api/create-order
 * Calls Razorpay API: POST https://api.razorpay.com/v1/orders
 * Request: { amount (paise), currency, receipt }
 * Return: { order_id, amount, currency }
 * Minimum amount: 100 paise
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { amount, currency = "INR", receipt, notes } = body;

    // Validate amount: must be a number and at least 100 paise (₹1.00)
    if (typeof amount !== "number" || isNaN(amount) || amount < 100) {
      return NextResponse.json(
        { error: "Invalid amount. Minimum amount is 100 paise (₹1.00)." },
        { status: 400 }
      );
    }

    let razorpay;
    try {
      razorpay = getRazorpayClient();
    } catch (authError: any) {
      console.error("[Razorpay create-order] Client init error:", authError);
      return NextResponse.json(
        { error: "Razorpay credentials are not configured or invalid." },
        { status: 401 }
      );
    }

    try {
      const orderOptions = {
        amount: Math.round(amount), // ensure integer paise
        currency: currency || "INR",
        receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        notes: notes || {},
      };

      const razorpayOrder = await razorpay.orders.create(orderOptions);

      return NextResponse.json({
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      });
    } catch (apiError: any) {
      console.error("[Razorpay API Error]:", apiError);

      const statusCode = apiError?.statusCode || apiError?.error?.statusCode;
      if (statusCode === 401 || apiError?.error?.code === "BAD_REQUEST_ERROR" && apiError?.error?.description?.toLowerCase().includes("auth")) {
        return NextResponse.json(
          { error: "Razorpay authentication failed. Verify API credentials." },
          { status: 401 }
        );
      }

      const description = apiError?.error?.description || apiError.message || "Failed to create order on Razorpay";
      return NextResponse.json(
        { error: description },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("[Create Order Exception]:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
