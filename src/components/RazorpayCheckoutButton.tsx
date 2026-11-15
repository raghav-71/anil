"use client";

import React, { useState } from "react";
import Script from "next/script";
import { CreditCard, Loader2 } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutButtonProps {
  amountInPaise?: number; // e.g., 100 for ₹1.00
  currency?: string;
  name?: string;
  description?: string;
  receipt?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  buttonText?: string;
  className?: string;
  onSuccess?: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    verificationResult: any;
  }) => void;
  onFailure?: (error: string) => void;
}

export function RazorpayCheckoutButton({
  amountInPaise = 100, // Minimum 100 paise (₹1.00)
  currency = "INR",
  name = "ANIL COMMUNICATION & ZEROX",
  description = "Online Payment",
  receipt,
  prefill,
  notes,
  buttonText = "Pay with Razorpay",
  className = "px-6 py-3 rounded-full bg-[#8B597B] hover:bg-[#493129] text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2",
  onSuccess,
  onFailure,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Verify Razorpay script is loaded in window
      if (typeof window === "undefined" || !window.Razorpay) {
        throw new Error("Razorpay SDK is not loaded yet. Please wait a moment and try again.");
      }

      // STEP 1: Call Backend to create order
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
          notes,
        }),
      });

      const orderData = await res.json();

      if (!res.ok || !orderData.order_id) {
        throw new Error(orderData.error || "Failed to create Razorpay order.");
      }

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_U0K13p9FHXBPXx";

      // STEP 2: Open Razorpay Standard Checkout Modal
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || currency,
        name,
        description,
        order_id: orderData.order_id,
        prefill: {
          name: prefill?.name || "",
          email: prefill?.email || "",
          contact: prefill?.contact || "",
        },
        theme: {
          color: "#8B597B",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            if (onFailure) {
              onFailure("Payment was cancelled by user.");
            }
          },
        },
        // On payment success in modal
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // STEP 3: Verify Signature via Backend
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.verified) {
              throw new Error(verifyData.error || "Payment signature verification failed.");
            }

            if (onSuccess) {
              onSuccess({
                ...response,
                verificationResult: verifyData,
              });
            }
          } catch (verifyError: any) {
            console.error("Payment verification failed:", verifyError);
            if (onFailure) {
              onFailure(verifyError.message || "Payment verification failed.");
            }
          } finally {
            setLoading(false);
          }
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", (response: any) => {
        setLoading(false);
        const errorMsg =
          response.error?.description || response.error?.reason || "Payment processing failed.";
        if (onFailure) {
          onFailure(errorMsg);
        }
      });

      razorpayInstance.open();
    } catch (err: any) {
      console.error("Razorpay payment initiation error:", err);
      setLoading(false);
      if (onFailure) {
        onFailure(err.message || "Failed to launch payment checkout.");
      }
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setSdkReady(true)}
      />

      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            <span>{buttonText}</span>
          </>
        )}
      </button>
    </>
  );
}
