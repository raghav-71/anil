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
  MessageCircle,
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
      <div className="flex flex-col min-h-screen bg-[#FFEDDB]">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#FFDEC7] text-[#8B597B] flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#493129]">Your Shopping Bag is Empty</h1>
          <p className="text-xs sm:text-sm text-[#806D63] mt-2 max-w-md font-sans">
            You have not yet selected any flagship devices or accessories for acquisition.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#493129] text-[#FFEDDB] font-bold text-xs hover:bg-[#8B597B] transition"
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
    <div className="flex flex-col min-h-screen bg-[#FFEDDB]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E8D5C5]">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#493129]">Your Shopping Bag</h1>
            <p className="text-xs text-[#806D63] mt-1 font-sans">
              Review your selected pieces, apply promotional vouchers, and proceed to checkout
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-[#8B597B] hover:text-[#493129] font-semibold flex items-center gap-1 uppercase tracking-wider"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Bag</span>
            </button>
          )}
        </div>

        {/* Free Shipping Meter */}
        <div className="p-4 rounded-2xl bg-[#FFDEC7]/60 border border-[#E8D5C5] mb-8">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-[#493129]">
            {amountNeededForFree > 0 ? (
              <span>
                Add <strong>{formatCurrency(amountNeededForFree)}</strong> more for <strong>Complimentary Insured Shipping</strong>
              </span>
            ) : (
              <span className="text-[#27845A] font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#27845A]" />
                <span>Complimentary Insured Shipping Unlocked</span>
              </span>
            )}
            <span className="text-[#8B597B] font-bold">{Math.round(freeDeliveryPercent)}%</span>
          </div>
          <div className="w-full bg-[#FFEDDB] h-2 rounded-full overflow-hidden border border-[#E8D5C5]">
            <div className="bg-[#8B597B] h-full rounded-full transition-all" style={{ width: `${freeDeliveryPercent}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Bag Items & Saved for Later */}
          <div className="lg:col-span-8 space-y-6">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="p-6 rounded-3xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 rounded-2xl bg-[#FFFFFF] p-2 border border-[#E8D5C5] flex-shrink-0 overflow-hidden">
                    <Image src={item.image} alt={item.title} fill className="object-contain p-1" sizes="80px" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#493129]">{item.title}</h3>
                    <p className="text-xs text-[#806D63] mt-0.5">
                      {[item.color, item.storage, item.ram].filter(Boolean).join(" • ")}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-[#27845A] font-semibold bg-[#27845A]/10 px-2.5 py-0.5 rounded-full border border-[#27845A]/30">
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
                    <p className="text-[11px] text-[#806D63]">({formatCurrency(item.price)} each)</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-[#F5E8DC] rounded-full px-3 py-1 border border-[#E8D5C5]">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="hover:text-[#8B597B] transition"
                      >
                        <Minus className="w-3 h-3 text-[#493129]" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center text-[#493129]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.stockAvailable}
                        className="hover:text-[#8B597B] disabled:opacity-30 transition"
                      >
                        <Plus className="w-3 h-3 text-[#493129]" />
                      </button>
                    </div>

                    <button
                      onClick={() => saveForLater(item.variantId)}
                      className="p-2 text-[#8B597B] hover:text-[#493129] transition"
                      title="Save for later"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="p-2 text-[#806D63] hover:text-[#C0393A] transition"
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
              <div className="pt-6 border-t border-[#E8D5C5] space-y-4">
                <h3 className="font-serif text-xl text-[#493129]">Saved For Later ({savedForLater.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedForLater.map((s) => (
                    <div key={s.variantId} className="p-4 rounded-2xl bg-[#FFFAF5] border border-[#E8D5C5] flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl bg-white border border-[#E8D5C5] p-1 flex-shrink-0 overflow-hidden">
                          <Image src={s.image} alt={s.title} fill className="object-contain p-0.5" sizes="48px" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-serif font-bold text-sm text-[#493129] truncate">{s.title}</div>
                          <div className="text-[#8B597B] font-bold">{formatCurrency(s.price)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moveToCart(s.variantId)}
                          className="px-3 py-1.5 rounded-full bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] font-bold text-xs"
                        >
                          Move to Bag
                        </button>
                        <button onClick={() => removeSavedItem(s.variantId)} className="text-[#806D63] hover:text-[#C0393A] p-1">
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
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#8B597B] hover:text-[#493129] pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Perusing The Collection</span>
            </Link>
          </div>

          {/* Summary Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-8 rounded-3xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-sm space-y-6">
              <h2 className="font-serif text-xl text-[#493129] pb-3 border-b border-[#E8D5C5]">
                Order Estimation
              </h2>

              {/* Coupon */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B597B] block">
                  Privilege Voucher Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME500"
                    className="flex-1 px-4 py-2 text-xs uppercase rounded-full bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B] font-medium"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#FFDEC7] hover:bg-[#E8D5C5] text-[#493129] text-xs font-semibold rounded-full border border-[#E8D5C5] transition"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-[11px] ${couponMessage.success ? "text-[#27845A] font-semibold" : "text-[#C0393A] font-medium"}`}>
                    {couponMessage.text}
                  </p>
                )}
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-xs text-[#27845A] bg-[#27845A]/10 p-2 rounded-xl border border-[#27845A]/30 mt-2">
                    <span>Applied: <strong>{appliedCoupon.code}</strong></span>
                    <button type="button" onClick={removeCoupon} className="text-[#C0393A] underline text-[11px]">
                      Remove
                    </button>
                  </div>
                )}
              </form>

              {/* Breakdown */}
              <div className="space-y-2 text-xs pt-4 border-t border-[#E8D5C5] font-sans">
                <div className="flex justify-between text-[#806D63]">
                  <span>Gross Subtotal</span>
                  <span className="font-bold text-[#493129] font-serif">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#27845A] font-semibold">
                    <span>Privilege Voucher Savings</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#806D63]">
                  <span>Insured Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-[#8B597B] uppercase">Complimentary</strong> : formatCurrency(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-[#806D63] text-[11px]">
                  <span>GST (18% Included)</span>
                  <span>{formatCurrency(Math.round(subtotal * 0.1525))}</span>
                </div>

                <div className="pt-4 border-t border-[#E8D5C5] flex justify-between items-baseline">
                  <span className="font-serif text-base font-bold text-[#493129]">Total Payable</span>
                  <span className="font-serif text-2xl font-bold text-[#8B597B]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                disabled={items.length === 0}
                className="w-full py-4 rounded-full bg-[#493129] hover:bg-[#8B597B] disabled:opacity-40 text-[#FFEDDB] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <span>Proceed to Express Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {items.length > 0 && (
                <a
                  href={`https://wa.me/919380124254?text=${encodeURIComponent(
                    `Hello ANIL COMMUNICATION & ZEROX, I have an enquiry about my cart with ${items.length} item(s): ${items.map((i) => `${i.title} (${i.quantity}x)`).join(", ")}. Total: ${formatCurrency(grandTotal)}. Can you provide store assistance?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-full bg-[#27845A] hover:bg-[#206f4c] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs text-center"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Enquire on WhatsApp (+91 9380124254)</span>
                </a>
              )}

              <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-[#806D63] font-serif">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8B597B]" />
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
