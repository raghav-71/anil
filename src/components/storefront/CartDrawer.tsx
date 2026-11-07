"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Award } from "lucide-react";

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeItem, subtotal, shippingFee, grandTotal } = useCart();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 999;
  const amountNeededForFree = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryPercent = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Editorial Backdrop */}
      <div
        className="absolute inset-0 bg-[#493129]/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#fffaf5] border-l border-[#493129]/15 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[#493129]/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#8b597b]" />
              <h2 className="font-serif text-2xl text-[#493129]">Your Shopping Bag</h2>
              <span className="bg-[#ffdec7] text-[#493129] text-[11px] px-2.5 py-0.5 rounded-full font-bold ml-1">
                {items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-[#ffeedb] text-[#493129]/60 hover:text-[#493129] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Insured Shipping Progress */}
          <div className="px-6 py-3 bg-[#ffdec7]/40 border-b border-[#493129]/10">
            {amountNeededForFree > 0 ? (
              <p className="text-xs text-[#493129]">
                Add <span className="font-bold">{formatCurrency(amountNeededForFree)}</span> more for <span className="text-[#8b597b] font-bold">Complimentary Insured Shipping</span>
              </p>
            ) : (
              <p className="text-xs text-[#8b597b] font-semibold flex items-center gap-1.5">
                ✨ Complimentary Insured Shipping Unlocked
              </p>
            )}
            <div className="w-full bg-[#ffeedb] h-1.5 rounded-full mt-2 overflow-hidden border border-[#493129]/10">
              <div
                className="bg-[#8b597b] h-full transition-all duration-300 rounded-full"
                style={{ width: `${freeDeliveryPercent}%` }}
              />
            </div>
          </div>

          {/* Bag Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-[#493129]/50">
                <ShoppingBag className="w-16 h-16 stroke-1 text-[#493129]/30 mb-3" />
                <p className="font-serif text-xl text-[#493129]">Your bag is empty</p>
                <p className="text-xs text-[#493129]/60 mt-1 max-w-xs font-sans">
                  Discover our flagship smartphones, rapid GaN adapters, and acoustic audio equipment.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 inline-flex items-center gap-2 bg-[#efa3a0] hover:bg-[#e58e8b] text-[#493129] text-xs font-semibold px-6 py-3 rounded-full shadow-coral transition"
                >
                  <span>Explore The Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-4 p-4 rounded-2xl bg-[#ffeedb]/60 border border-[#493129]/10"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-contain rounded-xl bg-white border border-[#493129]/10 p-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-sm text-[#493129] font-bold line-clamp-1">{item.title}</h3>
                    <p className="text-[11px] text-[#493129]/60 mt-0.5">
                      {[item.color, item.storage, item.ram].filter(Boolean).join(" • ")}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="font-serif font-bold text-sm text-[#493129]">
                        {formatCurrency(item.price)}
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center gap-2 bg-[#fffaf5] rounded-full border border-[#493129]/15 px-2 py-0.5 shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1 hover:text-[#8b597b] transition"
                        >
                          {item.quantity === 1 ? <Trash2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-[#493129]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.stockAvailable}
                          className="p-1 hover:text-[#8b597b] disabled:opacity-30 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Actions */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#493129]/10 bg-[#fffaf5] space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#493129]/70">
                  <span>Subtotal (Inclusive of GST)</span>
                  <span className="font-serif font-bold text-[#493129]">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#493129]/70">
                  <span>Insured Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-[#8b597b] uppercase">Complimentary</strong> : formatCurrency(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-base font-serif font-bold text-[#493129] pt-2 border-t border-[#493129]/10">
                  <span>Total Payable</span>
                  <span className="text-[#8b597b]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="flex-1 py-3 px-4 rounded-full border border-[#493129]/20 text-center text-xs font-semibold text-[#493129] hover:bg-[#ffeedb] transition"
                >
                  View Full Bag
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="flex-[2] py-3 px-4 rounded-full bg-[#efa3a0] hover:bg-[#e58e8b] text-[#493129] text-center text-xs font-bold flex items-center justify-center gap-1.5 shadow-coral transition"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#493129]/50 pt-1 font-serif">
                <Award className="w-3.5 h-3.5 text-[#8b597b]" />
                <span>Genuine Factory Sealed Units • Official Brand Warranty</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
