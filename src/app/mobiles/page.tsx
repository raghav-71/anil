"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types";
import { Star, ShoppingBag, ArrowRight, Smartphone } from "lucide-react";

export default function MobilesPage() {
  const { addItem } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<"smartphones" | "keypad">("smartphones");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const displayedProducts = allProducts.filter((p) => {
    if (activeCategory === "smartphones") {
      return p.categoryId === "cat-smartphones" || p.categoryName === "Smartphones";
    }
    return p.categoryId === "cat-keypad" || p.categoryName === "Keypad Phones";
  });

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    const primary = product.variants[0];
    if (!primary || primary.sellingPrice <= 0) return;

    addItem({
      variantId: primary.id,
      productId: product.id,
      title: product.title,
      color: primary.color,
      storage: primary.storage,
      ram: primary.ram,
      image: product.images[0] || "",
      price: primary.sellingPrice,
      mrp: primary.mrp,
      quantity: 1,
      stockAvailable: primary.stockQuantity,
      sku: primary.sku,
      barcode: primary.barcode,
      gstRate: product.gstRate,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ffeedb]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Editorial Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#8b597b] font-semibold">
            The Flagship Assemblage
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#493129]">
            {activeCategory === "smartphones" ? "Curated Smartphones" : "Durable Keypad Phones"}
          </h1>
          <p className="text-xs sm:text-sm text-[#493129]/75 font-sans leading-relaxed">
            {activeCategory === "smartphones"
              ? "From revolutionary 5G processors to sculptural camera glass, experience mobile telecommunications engineering refined to perfection."
              : "Classic tactile durability, extraordinary battery longevity, and dependable connectivity for everyday peace of mind."}
          </p>

          {/* Sub-Category Switcher Tabs */}
          <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-[#fffaf5] border border-[#493129]/15 mt-4">
            <button
              onClick={() => setActiveCategory("smartphones")}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition ${
                activeCategory === "smartphones"
                  ? "bg-[#493129] text-[#ffeedb] shadow-xs"
                  : "text-[#493129] hover:bg-[#ffdec7]"
              }`}
            >
              Smartphones (5G & 4G)
            </button>
            <button
              onClick={() => setActiveCategory("keypad")}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition ${
                activeCategory === "keypad"
                  ? "bg-[#493129] text-[#ffeedb] shadow-xs"
                  : "text-[#493129] hover:bg-[#ffdec7]"
              }`}
            >
              Keypad Feature Phones
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#8b597b] font-serif">Curating mobile collection...</div>
        ) : displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedProducts.map((product) => {
              const variant = product.variants[0];
              const price = (variant ? variant.sellingPrice : product.basePrice) || 0;
              const totalStock = product.variants.reduce((acc, v) => acc + v.stockQuantity, 0);

              return (
                <div key={product.id} className="editorial-card rounded-3xl p-7 flex flex-col justify-between bg-[#FFFAF5] border border-[#E8D5C5]">
                  <div>
                    <div className="relative h-64 rounded-2xl bg-[#FFEDDB]/50 flex items-center justify-center p-6 border border-[#E8D5C5]/50">
                      <Link href={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center">
                        <img
                          src={product.images[0] || `/images/products/${product.slug}.svg`}
                          alt={product.title}
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes(".svg")) {
                              target.src = `/images/products/${product.slug}.svg`;
                            } else if (!target.src.includes("fallback-product.svg")) {
                              target.src = "/images/products/fallback-product.svg";
                            }
                          }}
                          className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      <div className="absolute top-3 left-3 bg-[#FFDEC7] text-[#493129] text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-[#E8D5C5]">
                        {product.brandName}
                      </div>
                    </div>

                    <div className="pt-6 space-y-2">
                      <div className="flex items-center gap-1 text-[#8B597B] text-xs">
                        <Star className="w-3.5 h-3.5 fill-[#EFA3A0] text-[#EFA3A0]" />
                        <span>{product.rating}</span>
                        <span className="text-[#806D63]">({product.reviewCount} customer reviews)</span>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B597B] block">
                        {product.categoryName}
                      </span>

                      <Link href={`/product/${product.slug}`}>
                        <h3 className="font-serif text-xl text-[#493129] hover:text-[#8B597B] transition line-clamp-1">
                          {product.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-[#806D63] line-clamp-2 leading-relaxed">
                        {product.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#E8D5C5] mt-6 space-y-3">
                    <div className="flex items-baseline justify-between">
                      {price > 0 ? (
                        <span className="font-serif text-2xl font-bold text-[#493129]">
                          {formatCurrency(price)}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-[#8B597B] italic">
                          Price coming soon
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-bold text-[#8B597B]">
                        {totalStock > 0 ? "In Stock" : "Check availability"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {price > 0 && totalStock > 0 ? (
                        <>
                          <button
                            onClick={(e) => handleQuickAdd(product, e)}
                            className="py-3 px-4 rounded-full bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add to Bag</span>
                          </button>
                          <Link
                            href={`/product/${product.slug}`}
                            className="py-3 px-4 rounded-full bg-[#FFDEC7] hover:bg-[#E8D5C5] text-[#493129] text-xs font-semibold text-center transition flex items-center justify-center"
                          >
                            Details
                          </Link>
                        </>
                      ) : (
                        <Link
                          href={`/product/${product.slug}`}
                          className="col-span-2 py-3 px-4 rounded-full bg-[#FFDEC7] hover:bg-[#E8D5C5] text-[#493129] text-xs font-semibold text-center transition"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#fffaf5] rounded-3xl border border-[#493129]/10 max-w-md mx-auto p-8 space-y-3">
            <h2 className="font-serif text-xl text-[#493129]">No models available</h2>
            <p className="text-xs text-[#493129]/70">New models are currently being received.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
