"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  Lock,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shippingFee, grandTotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: "Ramesh Sharma",
    phone: "9845012345",
    email: "ramesh.sharma@example.com",
    street: "Flat 402, Prestige Palms, Indiranagar",
    landmark: "Near BDA Complex",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    paymentMethod: "razorpay" as "razorpay" | "cod",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.fullName || !formData.phone || !formData.street || !formData.pincode) {
        throw new Error("Please complete all required shipping details.");
      }

      const payload = {
        customerName: formData.fullName,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        shippingAddress: {
          street: formData.street,
          landmark: formData.landmark,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        paymentMethod: formData.paymentMethod,
      };

      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order initialization failed.");

      if (formData.paymentMethod === "cod") {
        setOrderSuccess(data.order);
        clearCart();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 12)}`;
        const mockSignature = `sig_${Math.random().toString(36).substring(2, 16)}`;

        const verifyRes = await fetch("/api/checkout/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: data.razorpayOrderId,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: mockSignature,
            orderDetails: payload,
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification declined.");

        setOrderSuccess(verifyData.order);
        clearCart();
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while confirming checkout.");
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS CONFIRMATION
  if (orderSuccess) {
    return (
      <div className="flex flex-col min-h-screen bg-[#ffeedb]">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full text-center">
          <div className="bg-[#fffaf5] rounded-3xl p-8 sm:p-14 border border-[#493129]/10 shadow-subtle space-y-6">
            <div className="w-20 h-20 bg-[#ffdec7] text-[#8b597b] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8b597b]">
                Consignment Confirmed
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#493129]">
                Your Order Has Been Secured
              </h1>
              <p className="text-xs sm:text-sm text-[#493129]/80 max-w-md mx-auto font-sans leading-relaxed">
                Consignment <strong className="font-mono text-[#8b597b]">#{orderSuccess.orderNumber}</strong> has been allocated in our physical inventory ledger and prepared for dispatch.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#ffeedb]/60 border border-[#493129]/10 text-left text-xs space-y-3 font-sans">
              <div className="flex justify-between border-b border-[#493129]/10 pb-2">
                <span className="text-[#493129]/60">Consignment #</span>
                <span className="font-bold text-[#493129] font-mono">#{orderSuccess.orderNumber}</span>
              </div>
              <div className="flex justify-between border-b border-[#493129]/10 pb-2">
                <span className="text-[#493129]/60">Settlement</span>
                <span className="font-bold text-[#8b597b] uppercase">{orderSuccess.paymentStatus} ({orderSuccess.paymentMethod.toUpperCase()})</span>
              </div>
              <div className="flex justify-between border-b border-[#493129]/10 pb-2">
                <span className="text-[#493129]/60">Delivery Address</span>
                <span className="font-medium text-[#493129] text-right">
                  {orderSuccess.customerName}, {orderSuccess.shippingAddress.street}, {orderSuccess.shippingAddress.city} - {orderSuccess.shippingAddress.pincode}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="font-bold text-[#493129]">Total Settled (GST 18% Included)</span>
                <span className="font-serif text-xl font-bold text-[#8b597b]">{formatCurrency(orderSuccess.grandTotal)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href={`/orders?orderId=${orderSuccess.orderNumber}`}
                className="flex-1 py-3.5 px-6 rounded-full bg-[#efa3a0] hover:bg-[#e58e8b] text-[#493129] text-xs font-bold flex items-center justify-center gap-1.5 shadow-coral transition"
              >
                <span>Track Live Consignment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/shop"
                className="flex-1 py-3.5 px-6 rounded-full border border-[#493129]/20 hover:bg-[#ffdec7]/40 text-[#493129] text-xs font-semibold text-center transition"
              >
                Return to Collections
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-[#ffeedb]">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="font-serif text-2xl text-[#493129]">Your shopping bag is empty.</p>
          <Link href="/shop" className="mt-4 inline-block px-6 py-2.5 bg-[#efa3a0] text-[#493129] rounded-full text-xs font-bold">
            Browse The Collection
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#ffeedb]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8 pb-4 border-b border-[#493129]/10">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8b597b]">
            Secure Acquisition
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#493129] mt-1">Express Checkout</h1>
          <p className="text-xs text-[#493129]/70 font-sans mt-1">Provide your delivery particulars and choose payment method</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-[#ffdec7]/60 border border-[#ffdec7] text-[#493129] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#8b597b] flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 font-sans">
          {/* Shipping Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-8 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle space-y-4">
              <h2 className="font-serif text-lg text-[#493129]">1. Contact & Delivery Recipient</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-[#493129] block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#493129] block mb-1">Phone Number (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b] font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-[#493129] block mb-1">Email (For Tax Invoice & Warranty) *</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle space-y-4">
              <h2 className="font-serif text-lg text-[#493129]">2. Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-[#493129] block mb-1">House / Building / Street *</label>
                  <input
                    type="text"
                    required
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#493129] block mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#493129] block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#493129] block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#493129] block mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle space-y-4">
              <h2 className="font-serif text-lg text-[#493129]">3. Settlement Method</h2>
              <div className="space-y-3">
                <label
                  className={`p-5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    formData.paymentMethod === "razorpay"
                      ? "border-[#8b597b] bg-[#ffeedb] ring-1 ring-[#8b597b]"
                      : "border-[#493129]/10 hover:border-[#493129]/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={formData.paymentMethod === "razorpay"}
                      onChange={handleChange}
                      className="accent-[#8b597b]"
                    />
                    <div>
                      <span className="font-serif text-sm font-bold text-[#493129] block">
                        Online Payment (UPI, Credit/Debit Cards, NetBanking)
                      </span>
                      <p className="text-[11px] text-[#493129]/60 mt-0.5">
                        Secured through Razorpay • Instant reservation & insured dispatch
                      </p>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-[#8b597b]" />
                </label>

                <label
                  className={`p-5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    formData.paymentMethod === "cod"
                      ? "border-[#8b597b] bg-[#ffeedb] ring-1 ring-[#8b597b]"
                      : "border-[#493129]/10 hover:border-[#493129]/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={handleChange}
                      className="accent-[#8b597b]"
                    />
                    <div>
                      <span className="font-serif text-sm font-bold text-[#493129] block">
                        Cash on Delivery (COD)
                      </span>
                      <p className="text-[11px] text-[#493129]/60 mt-0.5">
                        Settle cash or UPI directly with courier associate upon delivery
                      </p>
                    </div>
                  </div>
                  <Banknote className="w-5 h-5 text-[#8b597b]" />
                </label>
              </div>
            </div>
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle space-y-6 sticky top-28">
              <h2 className="font-serif text-xl text-[#493129] pb-3 border-b border-[#493129]/10">
                Consignment Summary ({items.length} items)
              </h2>

              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {items.map((item) => (
                  <div key={item.variantId} className="flex items-center gap-3 text-xs">
                    <img src={item.image} alt={item.title} className="w-12 h-12 rounded-xl object-contain bg-[#ffeedb] border p-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-bold text-[#493129] truncate">{item.title}</p>
                      <p className="text-[11px] text-[#493129]/60">Qty: {item.quantity} • {item.storage || item.color || "Standard"}</p>
                    </div>
                    <span className="font-serif font-bold text-[#493129]">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs pt-4 border-t border-[#493129]/10">
                <div className="flex justify-between text-[#493129]/70">
                  <span>Subtotal (GST Included)</span>
                  <span className="font-bold text-[#493129] font-serif">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#493129]/70">
                  <span>Insured Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-[#8b597b] uppercase">Complimentary</strong> : formatCurrency(shippingFee)}</span>
                </div>
                <div className="pt-3 border-t border-[#493129]/10 flex justify-between items-baseline">
                  <span className="font-serif text-base font-bold text-[#493129]">Total Payable</span>
                  <span className="font-serif text-2xl font-bold text-[#8b597b]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-[#efa3a0] hover:bg-[#e58e8b] disabled:opacity-50 text-[#493129] font-bold text-xs flex items-center justify-center gap-2 shadow-coral transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{loading ? "Authorizing & Reserving Stock..." : `Settle ${formatCurrency(grandTotal)} & Secure Order`}</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#493129]/50 font-serif">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8b597b]" />
                <span>GST Tax Invoice Included • 100% Insured Delivery</span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
