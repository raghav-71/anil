"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, subtotal, shippingFee, grandTotal } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ text: string; success: boolean } | null>(null);

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === "WELCOME500") {
      setCouponDiscount(500);
      setCouponMessage({ text: "Privilege code WELCOME500 applied: ₹500 off", success: true });
    } else if (code === "ANIL5") {
      const discount = Math.round(subtotal * 0.05);
      setCouponDiscount(discount);
      setCouponMessage({ text: `Privilege code ANIL5 applied: 5% off (₹${discount})`, success: true });
    } else {
      setCouponDiscount(0);
      setCouponMessage({ text: "Invalid code. Try WELCOME500 or ANIL5", success: false });
    }
  };

  const finalPayable = Math.max(0, grandTotal - couponDiscount);

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-[#ffeedb]">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#ffdec7] text-[#8b597b] flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#493129]">Your Shopping Bag is Empty</h1>
          <p className="text-xs sm:text-sm text-[#493129]/70 mt-2 max-w-md font-sans">
            You have not yet selected any flagship devices or accessories for acquisition.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#efa3a0] text-[#493129] font-bold text-xs shadow-coral hover:bg-[#e58e8b] transition"
          >
            <span>Explore The Collection</span>
            <ArrowRight className="w-4 h-4" />
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#493129]/10">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#493129]">Shopping Bag</h1>
            <p className="text-xs text-[#493129]/70 mt-1 font-sans">Review your selected pieces prior to checkout</p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-[#8b597b] hover:text-[#493129] font-semibold flex items-center gap-1 uppercase tracking-wider"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Bag</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Bag Items */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="p-6 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-5">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-contain rounded-2xl bg-[#ffeedb] p-2 border border-[#493129]/10 flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#493129]">{item.title}</h3>
                    <p className="text-xs text-[#493129]/60 mt-0.5">
                      {[item.color, item.storage, item.ram].filter(Boolean).join(" • ")}
                    </p>
                    <span className="inline-block mt-1 text-[11px] text-[#8b597b] font-semibold">
                      Factory Sealed • In Stock
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                  <div className="text-right">
                    <span className="font-serif text-xl font-bold text-[#493129]">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                    <p className="text-[11px] text-[#493129]/50">({formatCurrency(item.price)} each)</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-[#ffeedb] rounded-full px-3 py-1 border border-[#493129]/10">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="hover:text-[#8b597b] transition"
                      >
                        <Minus className="w-3 h-3 text-[#493129]" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center text-[#493129]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.stockAvailable}
                        className="hover:text-[#8b597b] disabled:opacity-30 transition"
                      >
                        <Plus className="w-3 h-3 text-[#493129]" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="p-2 text-[#493129]/40 hover:text-[#8b597b] transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#8b597b] hover:text-[#493129] pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Perusing The Collection</span>
            </Link>
          </div>

          {/* Summary Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-8 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle space-y-6">
              <h2 className="font-serif text-xl text-[#493129] pb-3 border-b border-[#493129]/10">
                Order Estimation
              </h2>

              {/* Coupon */}
              <form onSubmit={applyCoupon} className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b597b] block">
                  Privilege Voucher Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="e.g. WELCOME500"
                    className="flex-1 px-4 py-2 text-xs uppercase rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b] font-medium"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#ffdec7] hover:bg-[#f2caa9] text-[#493129] text-xs font-semibold rounded-full transition"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-[11px] ${couponMessage.success ? "text-[#8b597b]" : "text-red-700"}`}>
                    {couponMessage.text}
                  </p>
                )}
              </form>

              {/* Breakdown */}
              <div className="space-y-2 text-xs pt-4 border-t border-[#493129]/10 font-sans">
                <div className="flex justify-between text-[#493129]/80">
                  <span>Gross Subtotal</span>
                  <span className="font-bold text-[#493129] font-serif">{formatCurrency(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[#8b597b] font-medium">
                    <span>Privilege Voucher</span>
                    <span>-{formatCurrency(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#493129]/80">
                  <span>White-Glove Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-[#8b597b] uppercase">Complimentary</strong> : formatCurrency(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-[#493129]/50 text-[11px]">
                  <span>GST (18% Included)</span>
                  <span>{formatCurrency(Math.round(subtotal * 0.1525))}</span>
                </div>

                <div className="pt-4 border-t border-[#493129]/10 flex justify-between items-baseline">
                  <span className="font-serif text-base font-bold text-[#493129]">Total Payable</span>
                  <span className="font-serif text-2xl font-bold text-[#8b597b]">{formatCurrency(finalPayable)}</span>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full py-4 rounded-full bg-[#efa3a0] hover:bg-[#e58e8b] text-[#493129] font-bold text-xs flex items-center justify-center gap-2 shadow-coral transition"
              >
                <span>Proceed to Express Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-[#493129]/50 font-serif">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8b597b]" />
                <span>GST Tax Invoicing • Official 1-Year Indian Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
