import { NextRequest, NextResponse } from "next/server";
import { POST as verifyPaymentHandler } from "@/app/api/verify-payment/route";

export const dynamic = "force-dynamic";

/**
 * Checkout Payment Verification Endpoint
 * Forwards to the central /api/verify-payment handler
 */
export async function POST(req: NextRequest) {
  return verifyPaymentHandler(req);
}
