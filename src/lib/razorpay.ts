import crypto from "crypto";
import Razorpay from "razorpay";

/**
 * Returns an authenticated Razorpay instance using environment variables.
 * Safe for server-side usage only. Never expose KEY_SECRET to frontend code.
 */
export function getRazorpayClient(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are not configured.");
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}

/**
 * Cryptographically verifies Razorpay payment signature using HMAC-SHA256
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret?: string;
}): boolean {
  const secret = params.secret || process.env.RAZORPAY_KEY_SECRET;

  if (!secret || !params.orderId || !params.paymentId || !params.signature) {
    return false;
  }

  const body = `${params.orderId}|${params.paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  // Constant-time string comparison to prevent timing attacks
  if (expectedSignature.length !== params.signature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "utf-8"),
    Buffer.from(params.signature, "utf-8")
  );
}

/**
 * Checks if Razorpay keys are configured in environment
 */
export function isRazorpayConfigured(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  return Boolean(
    keyId &&
    keySecret &&
    !keyId.includes("dummy") &&
    !keySecret.includes("dummy")
  );
}
