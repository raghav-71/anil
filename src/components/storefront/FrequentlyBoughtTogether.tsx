"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Check, ShoppingBag, Sparkles } from "lucide-react";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";

interface BundleData {
  mainProduct: Product;
  bundledProducts: Product[];
  bundleDiscountPercent: number;
  originalPrice: number;
  bundlePrice: number;
  savings: number;
}

export function FrequentlyBoughtTogether({ productId }: { productId: string }) {
  const { addItem } = useCart();
  const [bundle, setBundle] = useState<BundleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/recommendations?productId=${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.bundle) {
          setBundle(data.bundle);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  if (loading || !bundle || bundle.bundledProducts.length === 0) return null;

  const handleAddBundleToCart = () => {
    // Add main product variant
    const mainVariant = bundle.mainProduct.variants[0];
    if (mainVariant) {
      addItem({
        variantId: mainVariant.id,
        productId: bundle.mainProduct.id,
        title: bundle.mainProduct.title,
        color: mainVariant.color,
        storage: mainVariant.storage,
        ram: mainVariant.ram,
        image: bundle.mainProduct.images[0],
        price: mainVariant.sellingPrice,
        mrp: mainVariant.mrp,
        quantity: 1,
        stockAvailable: mainVariant.stockQuantity,
        sku: mainVariant.sku,
        barcode: mainVariant.barcode,
        gstRate: bundle.mainProduct.gstRate,
      });
    }

    // Add bundled accessories
    bundle.bundledProducts.forEach((bProd) => {
      const bVariant = bProd.variants[0];
      if (bVariant) {
        addItem({
          variantId: bVariant.id,
          productId: bProd.id,
          title: bProd.title,
          color: bVariant.color,
          storage: bVariant.storage,
          ram: bVariant.ram,
          image: bProd.images[0],
          price: bVariant.sellingPrice,
          mrp: bVariant.mrp,
          quantity: 1,
          stockAvailable: bVariant.stockQuantity,
          sku: bVariant.sku,
          barcode: bVariant.barcode,
          gstRate: bProd.gstRate,
        });
      }
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  const allBundleItems = [bundle.mainProduct, ...bundle.bundledProducts];

  return (
    <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-[#8B597B]" />
        <h3 className="font-serif text-xl sm:text-2xl text-[#493129]">
          Frequently Bought Together
        </h3>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FFDEC7] text-[#493129] ml-2">
          Save {bundle.bundleDiscountPercent}% on Combo
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Products Visual Strip */}
        <div className="lg:col-span-8 flex flex-wrap items-center gap-3 sm:gap-4">
          {allBundleItems.map((item, idx) => (
            <React.Fragment key={item.id}>
              <div className="flex items-center gap-3 p-3 bg-[#F5E8DC] rounded-2xl border border-[#E8D5C5] max-w-[220px]">
                <div className="relative w-14 h-14 bg-white rounded-xl border border-[#E8D5C5] p-1 flex-shrink-0 overflow-hidden">
                  <Image src={item.images[0]} alt={item.title} fill className="object-contain p-1" sizes="56px" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-serif font-bold text-[#493129] truncate">{item.title}</div>
                  <div className="text-[11px] font-semibold text-[#8B597B] mt-0.5">
                    {formatCurrency(item.basePrice)}
                  </div>
                </div>
              </div>
              {idx < allBundleItems.length - 1 && (
                <div className="w-7 h-7 rounded-full bg-[#FFDEC7] text-[#493129] flex items-center justify-center flex-shrink-0 font-bold">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Pricing Summary & 1-Click Bundle Add */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#FFEDDB] border border-[#E8D5C5] space-y-3">
          <div className="text-xs text-[#806D63] space-y-1">
            <div className="flex justify-between">
              <span>Combined Items Value:</span>
              <span className="line-through">{formatCurrency(bundle.originalPrice)}</span>
            </div>
            <div className="flex justify-between text-[#27845A] font-semibold">
              <span>Combo Bundle Savings:</span>
              <span>-{formatCurrency(bundle.savings)}</span>
            </div>
            <div className="flex justify-between text-base font-serif font-bold text-[#493129] pt-1 border-t border-[#E8D5C5]">
              <span>Bundle Total:</span>
              <span className="text-[#8B597B]">{formatCurrency(bundle.bundlePrice)}</span>
            </div>
          </div>

          <button
            onClick={handleAddBundleToCart}
            className={`w-full py-3 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition ${
              added
                ? "bg-[#27845A] text-white"
                : "bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB]"
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>All {allBundleItems.length} Items Added to Bag!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add All {allBundleItems.length} Items to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

