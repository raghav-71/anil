"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Search, ShoppingBag, ArrowRight } from "lucide-react";

const CATEGORIES = [
  "All",
  "Smartphones",
  "Keypad Phones",
  "Earbuds",
  "Neckbands",
  "Headphones",
] as const;

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<typeof CATEGORIES[number]>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const visibleProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const categoryMatch =
        category === "All" ||
        p.categoryName === category ||
        (category === "Headphones" && p.categoryName.includes("Headphones"));
      const searchMatch =
        !q ||
        [p.title, p.brandName, p.categoryName, ...p.variants.map((v) => `${v.ram || ""} ${v.storage || ""}`)]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return categoryMatch && searchMatch;
    });
  }, [products, category, query]);

  return (
    <div className="flex flex-col min-h-screen bg-[#fffaf5] text-[#493129]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header */}
        <header className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#8b597b]">
            ANIL COMMUNICATION &amp; ZEROX · PANT NAGAR
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#493129] font-medium leading-tight">
            Find your next favourite.
          </h1>
          <p className="text-sm text-[#493129]/70 font-sans max-w-xl mx-auto">
            Explore authentic smartphones and everyday tech essentials, selected for you with official Indian warranty.
          </p>

          {/* Search Bar */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#8b597b]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search phones, earbuds, neckbands, accessories..."
                className="w-full pl-11 pr-4 py-3.5 rounded-full border border-[#493129]/15 bg-white text-xs sm:text-sm text-[#493129] placeholder-[#493129]/45 focus:outline-none focus:ring-2 focus:ring-[#8b597b]/30 shadow-xs"
              />
            </div>
          </div>
        </header>

        {/* Category Tabs */}
        <nav className="flex justify-center flex-wrap gap-2 mb-10" aria-label="Product categories">
          {CATEGORIES.map((item) => {
            const isActive = category === item;
            return (
              <button
                key={item}
                onClick={() => setCategory(item)}
                type="button"
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition ${
                  isActive
                    ? "bg-[#493129] text-[#ffeedb] shadow-xs"
                    : "bg-[#ffeedb] text-[#493129] hover:bg-[#ffdec7] border border-[#493129]/10"
                }`}
              >
                {item}
              </button>
            );
          })}
        </nav>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-20 text-[#8b597b] font-serif">Curating collection...</div>
        ) : visibleProducts.length > 0 ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleProducts.map((product) => {
              const totalStock = product.variants.reduce((acc, v) => acc + v.stockQuantity, 0);
              const variantStrings = product.variants
                .map((v) => [v.ram, v.storage].filter(Boolean).join(" / "))
                .filter(Boolean);

              return (
                <article
                  key={product.id}
                  className="editorial-card rounded-3xl border border-[#E8D5C5] bg-[#FFFAF5] overflow-hidden flex flex-col justify-between group"
                >
                  <div className="p-5 flex items-center justify-center bg-[#FFEDDB]/50 relative h-56 border-b border-[#E8D5C5]/50">
                    <img
                      src={product.images[0] || `/images/products/${product.slug}.svg`}
                      alt={product.title}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes(".svg")) {
                          target.src = `/images/products/${product.slug}.svg`;
                        } else if (!target.src.includes("fallback-product.svg")) {
                          target.src = "/images/products/fallback-product.svg";
                        }
                      }}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-[#FFDEC7] text-[#493129] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#E8D5C5]">
                      {product.brandName}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8B597B]">
                        {product.categoryName}
                      </p>
                      <h2 className="font-serif text-lg font-semibold text-[#493129] mt-0.5 line-clamp-1">
                        {product.title}
                      </h2>
                      {variantStrings.length > 0 && (
                        <p className="text-[11px] text-[#806D63] mt-1 line-clamp-1">
                          {variantStrings.join(" · ")}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#E8D5C5] space-y-2">
                      <div className="flex items-baseline justify-between">
                        {product.basePrice > 0 ? (
                          <div className="font-mono">
                            <span className="text-base font-bold text-[#493129]">
                              {formatCurrency(product.basePrice)}
                            </span>
                            {product.mrp > product.basePrice && (
                              <span className="text-xs text-[#806D63] line-through ml-2">
                                {formatCurrency(product.mrp)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-[#8B597B] italic">
                            Price available in store
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-semibold ${
                            totalStock > 0 ? "text-[#27845A]" : "text-[#8B597B]"
                          }`}
                        >
                          {totalStock > 0 ? "In stock" : "Enquire in store"}
                        </span>
                      </div>

                      <Link
                        href={`/product/${product.slug}`}
                        className="w-full py-2.5 rounded-full bg-[#FFDEC7] hover:bg-[#E8D5C5] text-[#493129] text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#493129]/10 max-w-md mx-auto p-8 space-y-3">
            <h2 className="font-serif text-xl text-[#493129]">No published products found</h2>
            <p className="text-xs text-[#493129]/70">
              Products for this category are awaiting retail pricing confirmation in the shop manager.
            </p>
            <button
              onClick={() => {
                setCategory("All");
                setQuery("");
              }}
              className="px-4 py-2 rounded-full bg-[#493129] text-white text-xs font-semibold"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

