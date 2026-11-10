"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Award, Bookmark, Tag } from "lucide-react";

export function CartDrawer() {
  const {
    items,
    savedForLater,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
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

  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 999;
  const amountNeededForFree = Math.max(0, freeDeliveryThreshold - (subtotal - discountAmount));
  const freeDeliveryPercent = Math.min(100, ((subtotal - discountAmount) / freeDeliveryThreshold) * 100);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
    if (res.success) setCouponInput("");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Editorial Backdrop */}
      <div
        className="absolute inset-0 bg-[#493129]/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FFFAF5] border-l border-[#E8D5C5] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#E8D5C5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#8B597B]" />
              <h2 className="font-serif text-2xl text-[#493129]">Your Shopping Bag</h2>
              <span className="bg-[#FFDEC7] text-[#493129] text-[11px] px-2.5 py-0.5 rounded-full font-bold ml-1">
                {items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-[#FFEDDB] text-[#806D63] hover:text-[#493129] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Insured Shipping Progress */}
          <div className="px-6 py-3 bg-[#FFDEC7]/60 border-b border-[#E8D5C5]">
            {amountNeededForFree > 0 ? (
              <p className="text-xs text-[#493129]">
                Add <span className="font-bold">{formatCurrency(amountNeededForFree)}</span> more for{" "}
                <span className="text-[#8B597B] font-bold">Complimentary Insured Shipping</span>
              </p>
            ) : (
              <p className="text-xs text-[#27845A] font-semibold flex items-center gap-1.5">
                ✨ Complimentary Insured Shipping Unlocked
              </p>
            )}
            <div className="w-full bg-[#FFEDDB] h-1.5 rounded-full mt-2 overflow-hidden border border-[#E8D5C5]">
              <div
                className="bg-[#8B597B] h-full transition-all duration-300 rounded-full"
                style={{ width: `${freeDeliveryPercent}%` }}
              />
            </div>
          </div>

          {/* Bag Items Scroll Area */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center py-6 text-[#806D63]">
                <ShoppingBag className="w-12 h-12 stroke-1 text-[#806D63]/40 mb-2" />
                <p className="font-serif text-lg text-[#493129]">Your bag is empty</p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 inline-flex items-center gap-1.5 bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] text-xs font-semibold px-5 py-2.5 rounded-full transition"
                >
                  <span>Explore The Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="p-3.5 rounded-2xl bg-[#F5E8DC] border border-[#E8D5C5] space-y-2"
                >
                  <div className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-xl bg-white border border-[#E8D5C5] p-1 flex-shrink-0 overflow-hidden">
                      <Image src={item.image} alt={item.title} fill className="object-contain p-1" sizes="64px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-sm text-[#493129] font-bold truncate">{item.title}</h3>
                      <p className="text-[11px] text-[#806D63] mt-0.5">
                        {[item.color, item.storage, item.ram].filter(Boolean).join(" • ")}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="font-serif font-bold text-sm text-[#493129]">
                          {formatCurrency(item.price)}
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-2 bg-[#FFFFFF] rounded-full border border-[#E8D5C5] px-2 py-0.5 shadow-2xs">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="p-1 hover:text-[#8B597B] transition"
                            aria-label="Decrease quantity"
                          >
                            {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-[#C0393A]" /> : <Minus className="w-3 h-3" />}
                          </button>
                          <span className="text-xs font-bold w-4 text-center text-[#493129]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= item.stockAvailable}
                            className="p-1 hover:text-[#8B597B] disabled:opacity-30 transition"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Save for later & Remove */}
                  <div className="flex items-center justify-end gap-3 pt-1 border-t border-[#E8D5C5]/60 text-[11px]">
                    <button
                      onClick={() => saveForLater(item.variantId)}
                      className="inline-flex items-center gap-1 text-[#8B597B] hover:text-[#493129] transition font-medium"
                    >
                      <Bookmark className="w-3 h-3" />
                      <span>Save for later</span>
                    </button>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-[#806D63] hover:text-[#C0393A] transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Saved for Later Shelf */}
            {savedForLater.length > 0 && (
              <div className="pt-4 border-t border-[#E8D5C5] space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#8B597B] uppercase tracking-wider">
                  <span>Saved For Later ({savedForLater.length})</span>
                </div>
                {savedForLater.map((sItem) => (
                  <div
                    key={sItem.variantId}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#FFFAF5] border border-[#E8D5C5] text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-10 h-10 rounded-lg bg-white border border-[#E8D5C5] overflow-hidden flex-shrink-0">
                        <Image src={sItem.image} alt={sItem.title} fill className="object-contain p-0.5" sizes="40px" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-serif font-bold text-[#493129] truncate">{sItem.title}</div>
                        <div className="text-[11px] text-[#8B597B] font-medium">{formatCurrency(sItem.price)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => moveToCart(sItem.variantId)}
                        className="px-2.5 py-1 rounded-full bg-[#FFDEC7] text-[#493129] hover:bg-[#E8D5C5] font-semibold text-[11px] border border-[#E8D5C5] transition"
                      >
                        Move to Bag
                      </button>
                      <button
                        onClick={() => removeSavedItem(sItem.variantId)}
                        className="text-[#806D63] hover:text-[#C0393A] p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-[#E8D5C5] bg-[#FFFAF5] space-y-3">
              {/* Voucher Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#806D63]" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Voucher code (e.g. WELCOME500)"
                    className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#E8D5C5] text-xs text-[#30241F] uppercase focus:outline-none focus:border-[#8B597B]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-full bg-[#493129] text-[#FFEDDB] text-xs font-semibold hover:bg-[#8B597B] transition"
                >
                  Apply
                </button>
              </form>

              {couponFeedback && (
                <div className={`text-[11px] px-3 py-1 rounded-lg ${couponFeedback.success ? "bg-[#27845A]/10 text-[#27845A] border border-[#27845A]/30" : "bg-[#C0393A]/10 text-[#C0393A] border border-[#C0393A]/30"}`}>
                  {couponFeedback.message}
                </div>
              )}

              {appliedCoupon && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#FFDEC7]/60 border border-[#8B597B]/20 text-xs text-[#493129]">
                  <span className="font-semibold text-[#8B597B]">Voucher {appliedCoupon.code} Active</span>
                  <button onClick={removeCoupon} className="text-[#C0393A] hover:underline text-[11px] font-medium">
                    Remove
                  </button>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs pt-1">
                <div className="flex justify-between text-[#806D63]">
                  <span>Subtotal (Inclusive of GST)</span>
                  <span className="font-serif font-bold text-[#493129]">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#27845A] font-semibold">
                    <span>Coupon Savings</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#806D63]">
                  <span>Insured Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-[#8B597B] uppercase">Complimentary</strong> : formatCurrency(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-base font-serif font-bold text-[#493129] pt-2 border-t border-[#E8D5C5]">
                  <span>Total Payable</span>
                  <span className="text-[#8B597B]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Navigation CTAs */}
              <div className="flex gap-2 pt-1">
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="flex-1 py-2.5 px-3 rounded-full bg-[#FFDEC7] border border-[#E8D5C5] text-center text-xs font-semibold text-[#493129] hover:bg-[#E8D5C5] transition"
                >
                  View Full Bag
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="flex-[2] py-2.5 px-4 rounded-full bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] text-center text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#806D63] pt-0.5 font-serif">
                <Award className="w-3.5 h-3.5 text-[#8B597B]" />
                <span>Genuine Factory Sealed Units • 100% Brand Warranty</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
