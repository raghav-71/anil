"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { RazorpayCheckoutButton } from "@/components/RazorpayCheckoutButton";
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Terminal, CreditCard } from "lucide-react";

export default function RazorpayTestPage() {
  const [testAmountInRupees, setTestAmountInRupees] = useState(1);
  const [customerName, setCustomerName] = useState("Test User");
  const [customerEmail, setCustomerEmail] = useState("test@anilcommunications.com");
  const [customerPhone, setCustomerPhone] = useState("9876543210");
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const amountInPaise = Math.round(testAmountInRupees * 100);

  return (
    <div className="flex flex-col min-h-screen bg-[#FFEDDB]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full font-sans">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#8B597B] hover:text-[#493129] font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Storefront</span>
          </Link>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-sm space-y-8">
          {/* Header */}
          <div className="border-b border-[#E8D5C5] pb-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B597B] bg-[#FFDEC7] px-3 py-1 rounded-full">
                Integration Testbed
              </span>
              <span className="text-[10px] font-bold text-[#27845A] bg-[#27845A]/15 px-2.5 py-1 rounded-full">
                Test Mode Active
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#493129] mt-3">
              Razorpay Standard Web Checkout
            </h1>
            <p className="text-xs text-[#806D63] mt-1.5 leading-relaxed">
              Verify the complete 3-step payment flow: <strong>1) Backend Order Creation</strong>,{" "}
              <strong>2) Standard Web Checkout Popup Modal</strong>, and{" "}
              <strong>3) Cryptographic Signature Verification (HMAC-SHA256)</strong>.
            </p>
          </div>

          {/* Config Summary */}
          <div className="p-4 rounded-2xl bg-[#FFF5EC] border border-[#E8D5C5] text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#493129] font-bold">
              <ShieldCheck className="w-4 h-4 text-[#8B597B]" />
              <span>Configured Credentials</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-[#806D63]">
              <div>
                Key ID:{" "}
                <span className="text-[#493129] font-bold">
                  {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_U0K13p9FHXBPXx"}
                </span>
              </div>
              <div>
                Key Secret: <span className="text-[#493129] font-bold">••••••••••••••••••••••••</span> (Server Only)
              </div>
            </div>
          </div>

          {/* Amount & Prefill Configuration */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg text-[#493129]">Payment Parameters</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-[#493129] block mb-1">
                  Test Amount (in INR) *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 10, 100, 500].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTestAmountInRupees(preset)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-bold transition ${
                        testAmountInRupees === preset
                          ? "bg-[#8B597B] text-white border-[#8B597B]"
                          : "bg-white text-[#493129] border-[#E8D5C5] hover:border-[#8B597B]"
                      }`}
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  value={testAmountInRupees}
                  onChange={(e) => setTestAmountInRupees(Math.max(1, Number(e.target.value)))}
                  className="mt-2 w-full px-4 py-2 rounded-xl bg-white border border-[#E8D5C5] font-mono text-sm text-[#30241F] focus:outline-none focus:border-[#8B597B]"
                />
                <span className="text-[10px] text-[#806D63] mt-1 block">
                  Converts to <strong className="font-mono text-[#493129]">{amountInPaise} paise</strong> for Razorpay API (minimum 100 paise).
                </span>
              </div>

              <div>
                <label className="font-semibold text-[#493129] block mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-[#E8D5C5] text-xs text-[#30241F] focus:outline-none focus:border-[#8B597B]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#493129] block mb-1">Customer Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-[#E8D5C5] text-xs text-[#30241F] focus:outline-none focus:border-[#8B597B]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#493129] block mb-1">Customer Mobile</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-[#E8D5C5] text-xs text-[#30241F] focus:outline-none focus:border-[#8B597B]"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
            <RazorpayCheckoutButton
              amountInPaise={amountInPaise}
              currency="INR"
              name="ANIL COMMUNICATION & ZEROX"
              description={`Test Checkout • ₹${testAmountInRupees.toFixed(2)}`}
              prefill={{
                name: customerName,
                email: customerEmail,
                contact: customerPhone,
              }}
              buttonText={`Pay ₹${testAmountInRupees.toFixed(2)} with Razorpay`}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#8B597B] hover:bg-[#493129] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition"
              onSuccess={(response) => {
                setResult(response);
                setErrorMsg(null);
              }}
              onFailure={(error) => {
                setErrorMsg(error);
              }}
            />

            <span className="text-[11px] text-[#806D63]">
              Opens standard popup modal with test UPI, Cards, and NetBanking.
            </span>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-[#C0393A]/10 border border-[#C0393A]/30 text-[#C0393A] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Result View */}
          {result && (
            <div className="p-6 rounded-2xl bg-[#27845A]/10 border border-[#27845A]/30 space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-[#27845A]">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <h3 className="font-serif text-lg font-bold">Payment Verified Successfully!</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 bg-white rounded-xl border border-[#27845A]/20">
                  <span className="text-[10px] text-[#806D63] block">Razorpay Order ID</span>
                  <span className="font-bold text-[#493129]">{result.razorpay_order_id}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#27845A]/20">
                  <span className="text-[10px] text-[#806D63] block">Razorpay Payment ID</span>
                  <span className="font-bold text-[#27845A]">{result.razorpay_payment_id}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#27845A]/20">
                  <span className="text-[10px] text-[#806D63] block">Verification Status</span>
                  <span className="font-bold text-[#27845A]">HMAC-SHA256 Match ✓</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto space-y-1">
                <div className="text-slate-400">// Server Verification Response (/api/verify-payment):</div>
                <pre>{JSON.stringify(result.verificationResult, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* API Curl Reference */}
          <div className="pt-4 border-t border-[#E8D5C5] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#493129]">
              <Terminal className="w-4 h-4 text-[#8B597B]" />
              <span>Direct API Verification (cURL Examples)</span>
            </div>

            <div className="p-3 bg-[#30241F] text-[#FFEDDB] rounded-xl font-mono text-[11px] overflow-x-auto space-y-2">
              <p className="text-[#EFA3A0] font-semibold">// 1. Create Order:</p>
              <code>
                curl -X POST http://localhost:3000/api/create-order \
                  -H &quot;Content-Type: application/json&quot; \
                  -d &apos;{JSON.stringify({ amount: 100, currency: "INR" })}&apos;
              </code>

              <p className="text-[#EFA3A0] font-semibold pt-2">// 2. Verify Payment Signature:</p>
              <code>
                curl -X POST http://localhost:3000/api/verify-payment \
                  -H &quot;Content-Type: application/json&quot; \
                  -d &apos;{JSON.stringify({
                    razorpay_order_id: "order_xyz",
                    razorpay_payment_id: "pay_abc",
                    razorpay_signature: "hmac_signature"
                  })}&apos;
              </code>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
