"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types";
import { Star, ShoppingBag, Zap, Headphones, Shield } from "lucide-react";

export default function AccessoriesPage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const acc = (data.products as Product[]).filter((p) => p.categoryId !== "cat-smartphones");
        setProducts(acc);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    const primary = product.variants[0];
    if (!primary) return;

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
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#8b597b] font-semibold">
            Audio, Power & Protection
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#493129]">
            Accessories of Distinction
          </h1>
          <p className="text-xs sm:text-sm text-[#493129]/75 font-sans leading-relaxed">
            Engineered GaN fast chargers, acoustic active noise-cancelling headphones, and premium power storage.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#8b597b] font-serif">Curating accessories...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const variant = product.variants[0];
              return (
                <div key={product.id} className="editorial-card rounded-3xl p-7 flex flex-col justify-between">
                  <div>
                    <div className="relative h-60 rounded-2xl bg-[#ffeedb]/60 flex items-center justify-center p-6">
                      <Link href={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center">
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      <div className="absolute top-3 left-3 bg-[#ffdec7] text-[#493129] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                        {product.categoryName}
                      </div>
                    </div>

                    <div className="pt-6 space-y-2">
                      <div className="flex items-center gap-1 text-[#8b597b] text-xs">
                        <Star className="w-3.5 h-3.5 fill-[#efa3a0] text-[#efa3a0]" />
                        <span>{product.rating}</span>
                        <span className="text-[#493129]/40">({product.reviewCount})</span>
                      </div>

                      <Link href={`/product/${product.slug}`}>
                        <h3 className="font-serif text-lg text-[#493129] hover:text-[#8b597b] transition line-clamp-1">
                          {product.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-[#493129]/70 line-clamp-2 leading-relaxed">
                        {product.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#493129]/10 mt-6 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="font-serif text-xl font-bold text-[#493129]">
                        {formatCurrency(variant ? variant.sellingPrice : product.basePrice)}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#8b597b]">Available</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/product/${product.slug}`}
                        className="py-2.5 px-3 rounded-full border border-[#493129]/20 hover:bg-[#ffdec7]/40 text-[#493129] text-xs font-semibold text-center transition"
                      >
                        Specs
                      </Link>
                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        className="py-2.5 px-3 rounded-full bg-[#efa3a0] hover:bg-[#e58e8b] text-[#493129] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

