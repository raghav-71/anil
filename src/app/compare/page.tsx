"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types";
import { Scale, Trash2, Plus, ShoppingBag, Check, ArrowRight } from "lucide-react";

export default function ComparePage() {
  const { compareList, toggleCompare, clearCompare, addItem } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectorOpen, setSelectorOpen] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setAllProducts(data.products);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const comparedProducts = allProducts.filter((p) => compareList.includes(p.id));

  const handleAddToCart = (product: Product) => {
    const v = product.variants[0];
    if (!v) return;
    addItem({
      variantId: v.id,
      productId: product.id,
      title: product.title,
      color: v.color,
      storage: v.storage,
      ram: v.ram,
      image: product.images[0],
      price: v.sellingPrice,
      mrp: v.mrp,
      quantity: 1,
      stockAvailable: v.stockQuantity,
      sku: v.sku,
      barcode: v.barcode,
      gstRate: product.gstRate,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ffeedb]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-[#8b597b]">
              <Scale className="w-4 h-4 text-[#efa3a0]" />
              <span>Side-by-Side Instrument Comparison</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#493129] mt-1">
              Compare Flagships & Audio Equipment
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {comparedProducts.length > 0 && (
              <button
                onClick={clearCompare}
                className="px-4 py-2 rounded-full border border-[#493129]/20 text-xs text-[#493129] hover:bg-[#ffdec7] transition"
              >
                Clear All
              </button>
            )}
            {comparedProducts.length < 4 && (
              <button
                onClick={() => setSelectorOpen(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#493129] hover:bg-[#38261f] text-[#ffeedb] text-xs font-semibold shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5 text-[#efa3a0]" />
                <span>Add Device to Compare</span>
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {comparedProducts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#fffaf5] border border-[#493129]/15 shadow-subtle space-y-4">
            <Scale className="w-16 h-16 stroke-1 text-[#493129]/30 mx-auto" />
            <h2 className="font-serif text-2xl text-[#493129]">No instruments currently selected</h2>
            <p className="text-xs text-[#493129]/70 max-w-md mx-auto font-sans leading-relaxed">
              Click the scale icon on any flagship or accessory card to compare specifications, display technology, and pricing side-by-side.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#efa3a0] text-[#493129] text-xs font-bold shadow-coral"
              >
                <span>Browse The Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Comparison Grid Table */
          <div className="overflow-x-auto rounded-3xl bg-[#fffaf5] border border-[#493129]/15 shadow-subtle">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#493129]/10 bg-[#ffeedb]/50">
                  <th className="p-4 sm:p-6 w-44 font-serif text-sm text-[#493129]">Specifications</th>
                  {comparedProducts.map((p) => (
                    <th key={p.id} className="p-4 sm:p-6 min-w-[240px] max-w-[280px] align-top">
                      <div className="space-y-3">
                        <div className="relative w-full h-44 bg-white rounded-2xl border border-[#493129]/10 p-2 overflow-hidden">
                          <Image src={p.images[0]} alt={p.title} fill className="object-contain p-2" sizes="240px" />
                          <button
                            onClick={() => toggleCompare(p.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-[#ffeedb] text-[#493129] hover:text-red-600 transition"
                            title="Remove from comparison"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8b597b]">{p.brandName}</span>
                          <h3 className="font-serif text-base text-[#493129] font-bold mt-0.5 line-clamp-2">{p.title}</h3>
                          <div className="text-sm font-bold text-[#8b597b] mt-1">{formatCurrency(p.basePrice)}</div>
                        </div>
                        <button
                          onClick={() => handleAddToCart(p)}
                          className="w-full py-2.5 px-3 rounded-full bg-[#efa3a0] hover:bg-[#e58e8b] text-[#493129] font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Bag</span>
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#493129]/10">
                <tr>
                  <td className="p-4 sm:p-6 font-semibold text-[#8b597b]">Starting Price</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-4 sm:p-6 font-serif font-bold text-sm text-[#493129]">
                      {formatCurrency(p.basePrice)}
                      {p.mrp > p.basePrice && (
                        <span className="block text-[11px] text-[#493129]/40 line-through font-sans">
                          MRP: {formatCurrency(p.mrp)}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 font-semibold text-[#8b597b]">Customer Rating</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-4 sm:p-6 text-[#493129]">
                      <span className="font-bold">★ {p.rating}</span> ({p.reviewCount} reviews)
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 font-semibold text-[#8b597b]">Available Variants</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-4 sm:p-6 text-[#493129] space-y-1">
                      {p.variants.map((v) => (
                        <div key={v.id} className="text-[11px] bg-[#ffeedb] px-2 py-0.5 rounded-md inline-block mr-1">
                          {[v.color, v.storage, v.ram].filter(Boolean).join(" • ")}
                        </div>
                      ))}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 font-semibold text-[#8b597b]">Stock Status</td>
                  {comparedProducts.map((p) => {
                    const totalStock = p.variants.reduce((acc, v) => acc + v.stockQuantity, 0);
                    return (
                      <td key={p.id} className="p-4 sm:p-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${totalStock > 0 ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                          {totalStock > 0 ? `${totalStock} Available` : "Backorder Only"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 font-semibold text-[#8b597b]">Warranty Coverage</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-4 sm:p-6 text-[#493129] text-xs">
                      {p.warrantySummary}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 font-semibold text-[#8b597b]">Tax & Classification</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-4 sm:p-6 font-mono text-[11px] text-[#493129]/80">
                      HSN {p.hsnCode} (GST {p.gstRate}%)
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 font-semibold text-[#8b597b]">Full Synopsis</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-4 sm:p-6 text-[#493129]/80 text-[11px] leading-relaxed">
                      {p.shortDescription}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Add Device Modal */}
        {selectorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#493129]/40 backdrop-blur-xs font-sans">
            <div className="w-full max-w-xl bg-[#fffaf5] border border-[#493129]/20 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#493129]/10 pb-3">
                <h3 className="font-serif text-xl text-[#493129]">Select an Instrument to Compare</h3>
                <button onClick={() => setSelectorOpen(false)} className="text-[#493129]/50 hover:text-[#493129]">
                  ✕
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {allProducts.map((prod) => {
                  const isAlreadySelected = compareList.includes(prod.id);
                  return (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#ffeedb]/50 border border-[#493129]/10 text-xs hover:bg-[#ffeedb] transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 bg-white rounded-xl border border-[#493129]/10 overflow-hidden flex-shrink-0">
                          <Image src={prod.images[0]} alt={prod.title} fill className="object-contain p-1" sizes="48px" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-serif font-bold text-sm text-[#493129] truncate">{prod.title}</div>
                          <div className="text-[11px] text-[#8b597b] font-medium">{formatCurrency(prod.basePrice)}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          toggleCompare(prod.id);
                          if (!isAlreadySelected) setSelectorOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-full font-semibold text-xs transition ${
                          isAlreadySelected
                            ? "bg-[#8b597b] text-white"
                            : "bg-[#efa3a0] text-[#493129] hover:bg-[#e58e8b]"
                        }`}
                      >
                        {isAlreadySelected ? "Added" : "Select"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

