import crypto from "crypto";

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret?: string;
}): boolean {
  const secret = params.secret || process.env.RAZORPAY_KEY_SECRET || "rzp_test_secret_key_12345";
  const body = `${params.orderId}|${params.paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === params.signature;
}

export function isRazorpayConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.includes("dummy")
  );
}

