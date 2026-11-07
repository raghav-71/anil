"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, Coupon } from "@/types";
import { AVAILABLE_COUPONS } from "./constants";
export { AVAILABLE_COUPONS };

interface CartContextType {
  items: CartItem[];
  savedForLater: CartItem[];
  wishlist: string[];
  recentlyViewed: string[];
  compareList: string[];
  appliedCoupon: Coupon | null;
  discountAmount: number;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  saveForLater: (variantId: string) => void;
  moveToCart: (variantId: string) => void;
  removeSavedItem: (variantId: string) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  addRecentlyViewed: (productId: string) => void;
  toggleCompare: (productId: string) => boolean;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  grandTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("anil_cart");
      if (storedCart) setItems(JSON.parse(storedCart));

      const storedSaved = localStorage.getItem("anil_saved_for_later");
      if (storedSaved) setSavedForLater(JSON.parse(storedSaved));

      const storedWishlist = localStorage.getItem("anil_wishlist");
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));

      const storedRecent = localStorage.getItem("anil_recently_viewed");
      if (storedRecent) setRecentlyViewed(JSON.parse(storedRecent));

      const storedCompare = localStorage.getItem("anil_compare");
      if (storedCompare) setCompareList(JSON.parse(storedCompare));

      const storedCoupon = localStorage.getItem("anil_coupon");
      if (storedCoupon) setAppliedCoupon(JSON.parse(storedCoupon));
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("anil_cart", JSON.stringify(items));
    localStorage.setItem("anil_saved_for_later", JSON.stringify(savedForLater));
    localStorage.setItem("anil_wishlist", JSON.stringify(wishlist));
    localStorage.setItem("anil_recently_viewed", JSON.stringify(recentlyViewed));
    localStorage.setItem("anil_compare", JSON.stringify(compareList));
    if (appliedCoupon) {
      localStorage.setItem("anil_coupon", JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem("anil_coupon");
    }
  }, [items, savedForLater, wishlist, recentlyViewed, compareList, appliedCoupon, isLoaded]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === newItem.variantId);
      if (existing) {
        const nextQty = Math.min(existing.quantity + newItem.quantity, newItem.stockAvailable);
        return prev.map((i) => (i.variantId === newItem.variantId ? { ...i, quantity: nextQty } : i));
      }
      return [...prev, newItem];
    });
    // Remove from saved for later if it was there
    setSavedForLater((prev) => prev.filter((i) => i.variantId !== newItem.variantId));
    setIsCartOpen(true);
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.variantId === variantId) {
          const validQty = Math.min(quantity, i.stockAvailable);
          return { ...i, quantity: validQty };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const saveForLater = (variantId: string) => {
    const item = items.find((i) => i.variantId === variantId);
    if (item) {
      setItems((prev) => prev.filter((i) => i.variantId !== variantId));
      setSavedForLater((prev) => {
        if (prev.some((s) => s.variantId === variantId)) return prev;
        return [...prev, item];
      });
    }
  };

  const moveToCart = (variantId: string) => {
    const item = savedForLater.find((i) => i.variantId === variantId);
    if (item) {
      setSavedForLater((prev) => prev.filter((i) => i.variantId !== variantId));
      addItem(item);
    }
  };

  const removeSavedItem = (variantId: string) => {
    setSavedForLater((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const addRecentlyViewed = (productId: string) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      return [productId, ...filtered].slice(0, 10);
    });
  };

  const toggleCompare = (productId: string): boolean => {
    if (compareList.includes(productId)) {
      setCompareList((prev) => prev.filter((id) => id !== productId));
      return false;
    }
    if (compareList.length >= 4) {
      alert("You can compare up to 4 devices simultaneously.");
      return false;
    }
    setCompareList((prev) => [...prev, productId]);
    return true;
  };

  const isInCompare = (productId: string) => compareList.includes(productId);
  const clearCompare = () => setCompareList([]);

  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  // Coupon calculation
  let discountAmount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrderValue) {
    if (appliedCoupon.discountType === "percentage") {
      const raw = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      discountAmount = appliedCoupon.maxDiscount ? Math.min(raw, appliedCoupon.maxDiscount) : raw;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = AVAILABLE_COUPONS.find((c) => c.code === cleanCode);
    if (!found) {
      return { success: false, message: `Coupon '${code}' is invalid or expired.` };
    }
    if (subtotal < found.minOrderValue) {
      return {
        success: false,
        message: `Requires minimum bag value of ₹${found.minOrderValue.toLocaleString("en-IN")}.`,
      };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Promo code ${found.code} applied successfully!` };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const shippingFee = subtotal >= 999 || items.length === 0 ? 0 : 99;
  const taxableBasis = Math.max(0, subtotal - discountAmount);
  // 18% GST included in retail price
  const taxAmount = Math.round(taxableBasis - taxableBasis / 1.18);
  const grandTotal = Math.max(0, taxableBasis + shippingFee);

  return (
    <CartContext.Provider
      value={{
        items,
        savedForLater,
        wishlist,
        recentlyViewed,
        compareList,
        appliedCoupon,
        discountAmount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        saveForLater,
        moveToCart,
        removeSavedItem,
        toggleWishlist,
        isInWishlist,
        addRecentlyViewed,
        toggleCompare,
        isInCompare,
        clearCompare,
        applyCoupon,
        removeCoupon,
        totalItems,
        subtotal,
        shippingFee,
        taxAmount,
        grandTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
