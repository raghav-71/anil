"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Bookmark,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    savedForLater,
    updateQuantity,
    removeItem,
    clearCart,
    saveForLater,
    moveToCart,
    removeSavedItem,
    subtotal,
    appliedCoupon,
    discountAmount,
    shippingFee,
    grandTotal,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ text: string; success: boolean } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    setCouponMessage({ text: res.message, success: res.success });
    if (res.success) setCouponCode("");
  };

  const freeDeliveryThreshold = 999;
  const amountNeededForFree = Math.max(0, freeDeliveryThreshold - (subtotal - discountAmount));
  const freeDeliveryPercent = Math.min(100, ((subtotal - discountAmount) / freeDeliveryThreshold) * 100);

  if (items.length === 0 && savedForLater.length === 0) {
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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#493129]/10">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#493129]">Your Shopping Bag</h1>
            <p className="text-xs text-[#493129]/70 mt-1 font-sans">
              Review your selected pieces, apply promotional vouchers, and proceed to checkout
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-[#8b597b] hover:text-[#493129] font-semibold flex items-center gap-1 uppercase tracking-wider"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Bag</span>
            </button>
          )}
        </div>

        {/* Free Shipping Meter */}
        <div className="p-4 rounded-2xl bg-[#ffdec7]/50 border border-[#493129]/10 mb-8">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-[#493129]">
            {amountNeededForFree > 0 ? (
              <span>
                Add <strong>{formatCurrency(amountNeededForFree)}</strong> more for <strong>Complimentary Insured Shipping</strong>
              </span>
            ) : (
              <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Complimentary Insured Shipping Unlocked</span>
              </span>
            )}
            <span className="text-[#8b597b] font-bold">{Math.round(freeDeliveryPercent)}%</span>
          </div>
          <div className="w-full bg-[#ffeedb] h-2 rounded-full overflow-hidden border border-[#493129]/10">
            <div className="bg-[#8b597b] h-full rounded-full transition-all" style={{ width: `${freeDeliveryPercent}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Bag Items & Saved for Later */}
          <div className="lg:col-span-8 space-y-6">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="p-6 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 rounded-2xl bg-[#ffeedb] p-2 border border-[#493129]/10 flex-shrink-0 overflow-hidden">
                    <Image src={item.image} alt={item.title} fill className="object-contain p-1" sizes="80px" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#493129]">{item.title}</h3>
                    <p className="text-xs text-[#493129]/60 mt-0.5">
                      {[item.color, item.storage, item.ram].filter(Boolean).join(" • ")}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        In Stock ({item.stockAvailable} units)
                      </span>
                    </div>
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
                      onClick={() => saveForLater(item.variantId)}
                      className="p-2 text-[#8b597b] hover:text-[#493129] transition"
                      title="Save for later"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="p-2 text-[#493129]/40 hover:text-red-600 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Saved for Later Shelf */}
            {savedForLater.length > 0 && (
              <div className="pt-6 border-t border-[#493129]/15 space-y-4">
                <h3 className="font-serif text-xl text-[#493129]">Saved For Later ({savedForLater.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedForLater.map((s) => (
                    <div key={s.variantId} className="p-4 rounded-2xl bg-[#fffaf5] border border-[#493129]/10 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl bg-white border border-[#493129]/10 p-1 flex-shrink-0 overflow-hidden">
                          <Image src={s.image} alt={s.title} fill className="object-contain p-0.5" sizes="48px" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-serif font-bold text-sm text-[#493129] truncate">{s.title}</div>
                          <div className="text-[#8b597b] font-bold">{formatCurrency(s.price)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moveToCart(s.variantId)}
                          className="px-3 py-1.5 rounded-full bg-[#efa3a0] text-[#493129] font-bold text-xs shadow-xs"
                        >
                          Move to Bag
                        </button>
                        <button onClick={() => removeSavedItem(s.variantId)} className="text-slate-400 hover:text-red-600 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b597b] block">
                  Privilege Voucher Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
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
                  <p className={`text-[11px] ${couponMessage.success ? "text-emerald-800 font-semibold" : "text-red-700 font-medium"}`}>
                    {couponMessage.text}
                  </p>
                )}
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200 mt-2">
                    <span>Applied: <strong>{appliedCoupon.code}</strong></span>
                    <button type="button" onClick={removeCoupon} className="text-red-700 underline text-[11px]">
                      Remove
                    </button>
                  </div>
                )}
              </form>

              {/* Breakdown */}
              <div className="space-y-2 text-xs pt-4 border-t border-[#493129]/10 font-sans">
                <div className="flex justify-between text-[#493129]/80">
                  <span>Gross Subtotal</span>
                  <span className="font-bold text-[#493129] font-serif">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>Privilege Voucher Savings</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#493129]/80">
                  <span>Insured Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-[#8b597b] uppercase">Complimentary</strong> : formatCurrency(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-[#493129]/50 text-[11px]">
                  <span>GST (18% Included)</span>
                  <span>{formatCurrency(Math.round(subtotal * 0.1525))}</span>
                </div>

                <div className="pt-4 border-t border-[#493129]/10 flex justify-between items-baseline">
                  <span className="font-serif text-base font-bold text-[#493129]">Total Payable</span>
                  <span className="font-serif text-2xl font-bold text-[#8b597b]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                disabled={items.length === 0}
                className="w-full py-4 rounded-full bg-[#efa3a0] hover:bg-[#e58e8b] disabled:opacity-40 text-[#493129] font-bold text-xs flex items-center justify-center gap-2 shadow-coral transition"
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
