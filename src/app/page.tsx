"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types";
import {
  ArrowRight,
  Star,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Award,
  Shield,
  Heart,
  Scale,
  Tag,
  Copy,
  Clock,
} from "lucide-react";

export default function HomePage() {
  const { addItem, toggleWishlist, isInWishlist, toggleCompare, isInCompare, recentlyViewed } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const featuredPhones = products.filter((p) => p.categoryId === "cat-smartphones");
  const accessories = products.filter((p) => p.categoryId !== "cat-smartphones");
  const recentProducts = products.filter((p) => recentlyViewed.includes(p.id)).slice(0, 4);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    const primaryVariant = product.variants[0];
    if (!primaryVariant) return;

    addItem({
      variantId: primaryVariant.id,
      productId: product.id,
      title: product.title,
      color: primaryVariant.color,
      storage: primaryVariant.storage,
      ram: primaryVariant.ram,
      image: product.images[0] || "",
      price: primaryVariant.sellingPrice,
      mrp: primaryVariant.mrp,
      quantity: 1,
      stockAvailable: primaryVariant.stockQuantity,
      sku: primaryVariant.sku,
      barcode: primaryVariant.barcode,
      gstRate: product.gstRate,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ffeedb]">
      <Navbar />

      <main className="flex-1">
        {/* EDITORIAL HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 border-b border-[#493129]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Editorial Headline & Story */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ffdec7] text-[#493129] text-xs font-semibold uppercase tracking-[0.2em]">
                  <Sparkles className="w-3.5 h-3.5 text-[#8b597b]" />
                  <span>Autumn 2026 Curated Collection</span>
                </div>

                <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-[#493129] tracking-tight leading-[1.08]">
                  Precision <br />
                  <span className="italic font-normal text-[#8b597b]">Titanium</span> & Light.
                </h1>

                <p className="text-base sm:text-lg text-[#493129]/80 max-w-xl font-sans leading-relaxed">
                  Welcome to Anil Communications. We present an extraordinary assembly of flagship telecommunications devices, sculptural audio systems, and rapid GaN charging accoutrements.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 bg-[#efa3a0] hover:bg-[#e58e8b] text-[#493129] font-semibold text-sm px-7 py-3.5 rounded-full shadow-coral transition transform hover:-translate-y-0.5"
                  >
                    <span>Explore The Collection</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/mobiles"
                    className="inline-flex items-center gap-2 bg-[#fffaf5] hover:bg-[#ffdec7]/60 text-[#493129] font-semibold text-sm px-7 py-3.5 rounded-full border border-[#493129]/15 transition"
                  >
                    <span>View Flagships</span>
                  </Link>
                </div>

                {/* Sub-Headline Guarantees */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#493129]/10 max-w-lg">
                  <div>
                    <span className="font-serif text-2xl font-bold text-[#493129]">100%</span>
                    <p className="text-[11px] text-[#8b597b] uppercase tracking-wider font-semibold mt-0.5">
                      Factory Sealed
                    </p>
                  </div>
                  <div>
                    <span className="font-serif text-2xl font-bold text-[#493129]">1 Year</span>
                    <p className="text-[11px] text-[#8b597b] uppercase tracking-wider font-semibold mt-0.5">
                      Brand Warranty
                    </p>
                  </div>
                  <div>
                    <span className="font-serif text-2xl font-bold text-[#493129]">GST</span>
                    <p className="text-[11px] text-[#8b597b] uppercase tracking-wider font-semibold mt-0.5">
                      Input Tax Credit
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Editorial Showcase Masterpiece */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto rounded-3xl p-8 bg-[#fffaf5] border border-[#493129]/10 shadow-card">
                  <div className="absolute top-5 right-5 bg-[#ffdec7] text-[#493129] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    The Pinnacle
                  </div>

                  <div className="h-72 sm:h-80 w-full rounded-2xl bg-[#ffeedb]/60 flex items-center justify-center p-6">
                    <img
                      src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80"
                      alt="iPhone 16 Pro Max Natural Titanium"
                      className="max-h-full max-w-full object-contain filter drop-shadow-xl hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8b597b]">
                        Apple India Flagship
                      </span>
                      <div className="flex items-center gap-1 text-[#493129] text-xs font-semibold">
                        <Star className="w-3.5 h-3.5 fill-[#efa3a0] text-[#efa3a0]" />
                        <span>4.9</span>
                      </div>
                    </div>

                    <h3 className="font-serif text-2xl text-[#493129]">iPhone 16 Pro Max</h3>
                    <p className="text-xs text-[#493129]/70 line-clamp-1 font-sans">
                      Grade 5 Titanium, A18 Pro silicon, and revolutionary 48MP Camera Control
                    </p>

                    <div className="pt-2 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-serif font-bold text-[#493129]">
                          {formatCurrency(144900)}
                        </span>
                        <span className="text-xs text-[#493129]/40 line-through">
                          {formatCurrency(149900)}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#8b597b] uppercase tracking-wider">
                        Immediate Dispatch
                      </span>
                    </div>

                    <div className="pt-4 flex gap-2">
                      <Link
                        href="/product/apple-iphone-16-pro-max"
                        className="flex-1 py-3 rounded-full bg-[#493129] hover:bg-[#35221b] text-[#ffeedb] text-xs font-semibold text-center transition"
                      >
                        Acquire Now
                      </Link>
                      <button
                        onClick={(e) => {
                          const p = products.find((x) => x.id === "prod-iphone-16-pro");
                          if (p) handleQuickAdd(p, e);
                        }}
                        className="px-5 py-3 rounded-full bg-[#efa3a0] hover:bg-[#e58e8b] text-[#493129] text-xs font-semibold transition"
                        title="Add to Bag"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MAISON BRANDS RUNWAY */}
        <section className="py-10 border-b border-[#493129]/10 bg-[#fffaf5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-[10px] uppercase font-bold tracking-[0.3em] text-[#8b597b] mb-6">
              Authorized Stockist For Celebrated Manufacturers
            </p>
            <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
              {["Apple", "Samsung Galaxy", "OnePlus", "Nothing", "Sony Audio", "Anker Power"].map((brandName) => (
                <span
                  key={brandName}
                  className="font-serif text-lg md:text-xl font-normal text-[#493129]/80 tracking-wide hover:text-[#8b597b] transition cursor-default"
                >
                  {brandName}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CURATED SMARTPHONES COLLECTION */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8b597b]">
                  The Salon Collection
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#493129] mt-1">
                  Masterpiece Smartphones
                </h2>
                <p className="text-xs text-[#493129]/70 mt-1 max-w-md">
                  Precision telecommunications crafted in titanium, aerospace aluminum, and sculpted glass.
                </p>
              </div>

              <Link
                href="/mobiles"
                className="text-xs font-bold uppercase tracking-[0.15em] text-[#8b597b] hover:text-[#493129] flex items-center gap-1 group pb-1 border-b border-[#8b597b]"
              >
                <span>Browse All Mobiles</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredPhones.slice(0, 4).map((product) => {
                const variant = product.variants[0];
                const totalStock = product.variants.reduce((acc, v) => acc + v.stockQuantity, 0);

                return (
                  <div
                    key={product.id}
                    className="editorial-card rounded-3xl p-6 flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Visual */}
                      <div className="relative h-60 rounded-2xl bg-[#ffeedb]/40 flex items-center justify-center p-4 overflow-hidden">
                        <Link href={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center">
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-500"
                          />
                        </Link>
                        <div className="absolute top-3 left-3 bg-[#ffdec7] text-[#493129] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                          {product.brandName}
                        </div>

                        {/* Card Actions: Wishlist & Compare */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleCompare(product.id);
                            }}
                            className={`p-1.5 rounded-full border transition ${
                              isInCompare(product.id)
                                ? "bg-[#8b597b] text-white border-[#8b597b]"
                                : "bg-white/80 text-[#493129] border-[#493129]/15 hover:bg-white"
                            }`}
                            title="Compare"
                          >
                            <Scale className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleWishlist(product.id);
                            }}
                            className={`p-1.5 rounded-full border transition ${
                              isInWishlist(product.id)
                                ? "bg-[#efa3a0] text-[#493129] border-[#efa3a0]"
                                : "bg-white/80 text-[#493129] border-[#493129]/15 hover:bg-white"
                            }`}
                            title="Save"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isInWishlist(product.id) ? "fill-[#493129]" : ""}`} />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="pt-5 space-y-1.5">
                        <div className="flex items-center gap-1 text-[#8b597b] text-xs font-medium">
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
                        {((variant ? variant.sellingPrice : product.basePrice) || 0) > 0 ? (
                          <span className="font-serif text-xl font-bold text-[#493129]">
                            {formatCurrency(variant ? variant.sellingPrice : product.basePrice)}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-[#8b597b] italic">
                            Price coming soon
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-bold text-[#8b597b]">
                          {totalStock > 0 ? "Available" : "Check availability"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={`/product/${product.slug}`}
                          className={`py-2.5 px-3 rounded-full border border-[#493129]/20 hover:bg-[#ffdec7]/40 text-[#493129] text-xs font-semibold text-center transition ${
                            ((variant ? variant.sellingPrice : product.basePrice) || 0) <= 0 || totalStock <= 0 ? "col-span-2" : ""
                          }`}
                        >
                          View Details
                        </Link>
                        {((variant ? variant.sellingPrice : product.basePrice) || 0) > 0 && totalStock > 0 && (
                          <button
                            onClick={(e) => handleQuickAdd(product, e)}
                            className="py-2.5 px-3 rounded-full bg-[#efa3a0] hover:bg-[#e58e8b] text-[#493129] text-xs font-semibold flex items-center justify-center gap-1 transition"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Bag</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PROMOTIONAL PRIVILEGE OFFERS & VOUCHERS */}
        <section className="py-12 bg-[#ffdec7]/40 border-y border-[#493129]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8b597b]">Exclusive Privileges</span>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#493129]">Boutique Promotional Codes</h3>
              </div>
              <p className="text-xs text-[#493129]/70 font-sans max-w-sm">
                Apply during checkout for immediate discount on insured consignments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { code: "WELCOME500", desc: "Flat ₹500 discount on flagship phones above ₹10,000", tag: "First Order" },
                { code: "ANIL5", desc: "5% savings on all flagship devices & genuine accessories", tag: "Storewide" },
                { code: "FESTIVE1000", desc: "₹1,000 festive gift voucher on orders above ₹25,000", tag: "Festive Exclusive" },
              ].map((v) => (
                <div key={v.code} className="p-5 rounded-3xl bg-[#fffaf5] border border-[#493129]/15 shadow-subtle space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#ffeedb] text-[#8b597b]">
                      {v.tag}
                    </span>
                    <button
                      onClick={() => handleCopyCoupon(v.code)}
                      className="text-xs font-semibold text-[#8b597b] hover:text-[#493129] flex items-center gap-1 transition"
                    >
                      {copiedCoupon === v.code ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-[#8b597b]" />}
                      <span>{copiedCoupon === v.code ? "Copied" : "Copy Code"}</span>
                    </button>
                  </div>
                  <div>
                    <span className="font-mono font-bold text-lg text-[#493129] tracking-wider block">{v.code}</span>
                    <p className="text-xs text-[#493129]/70 mt-1">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HIGHLIGHTED PEACH SECTION: ACOUSTIC & CHARGING ACCESSOIRES */}
        <section className="py-16 md:py-24 bg-[#ffdec7]/50 border-y border-[#493129]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8b597b]">
                  Acoustic & Rapid Power
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#493129] mt-1">
                  Accessories of Distinction
                </h2>
                <p className="text-xs text-[#493129]/70 mt-1 max-w-md">
                  GaN high-velocity adapters, studio active noise-cancelling acoustics, and military-spec armors.
                </p>
              </div>

              <Link
                href="/accessories"
                className="text-xs font-bold uppercase tracking-[0.15em] text-[#8b597b] hover:text-[#493129] flex items-center gap-1 group pb-1 border-b border-[#8b597b]"
              >
                <span>Explore Accessories</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {accessories.slice(0, 3).map((item) => {
                const variant = item.variants[0];
                return (
                  <div
                    key={item.id}
                    className="editorial-card rounded-3xl p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-52 rounded-2xl bg-[#ffeedb] flex items-center justify-center p-4">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="max-h-full max-w-full object-contain hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="pt-4 space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#8b597b]">
                          {item.categoryName}
                        </span>
                        <h3 className="font-serif text-base text-[#493129] line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-[#493129]/70 line-clamp-2">{item.shortDescription}</p>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-[#493129]/10 mt-4 flex items-center justify-between">
                      {((variant ? variant.sellingPrice : item.basePrice) || 0) > 0 ? (
                        <span className="font-serif text-lg font-bold text-[#493129]">
                          {formatCurrency(variant ? variant.sellingPrice : item.basePrice)}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-[#8b597b] italic">
                          Price coming soon
                        </span>
                      )}
                      {((variant ? variant.sellingPrice : item.basePrice) || 0) > 0 && (variant?.stockQuantity || 0) > 0 ? (
                        <button
                          onClick={(e) => handleQuickAdd(item, e)}
                          className="py-2 px-4 rounded-full bg-[#efa3a0] hover:bg-[#e58e8b] text-[#493129] text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      ) : (
                        <Link
                          href={`/product/${item.slug}`}
                          className="py-1.5 px-3 rounded-full border border-[#493129]/20 hover:bg-[#ffdec7]/40 text-[#493129] text-xs font-semibold"
                        >
                          Details
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* RECENTLY VIEWED SHELF */}
        {recentProducts.length > 0 && (
          <section className="py-14 bg-[#fffaf5] border-b border-[#493129]/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b597b]">Your Session</span>
                  <h3 className="font-serif text-2xl text-[#493129]">Recently Perused Instruments</h3>
                </div>
                <Link href="/account?tab=recent" className="text-xs font-semibold text-[#8b597b] hover:underline">
                  View All History
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recentProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    className="p-4 rounded-2xl bg-[#ffeedb]/40 border border-[#493129]/10 hover:border-[#8b597b] transition group"
                  >
                    <div className="relative h-36 bg-white rounded-xl p-2 mb-2 flex items-center justify-center overflow-hidden">
                      <img src={p.images[0]} alt={p.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition" />
                    </div>
                    <span className="text-[10px] font-bold uppercase text-[#8b597b]">{p.brandName}</span>
                    <h4 className="font-serif font-bold text-xs text-[#493129] truncate">{p.title}</h4>
                    <span className="text-xs font-bold text-[#8b597b] mt-1 block">{formatCurrency(p.basePrice)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* BOUTIQUE ATELIER ESSAY */}
        <section className="py-20 bg-[#fffaf5]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8b597b]">
              The Anil Communications Promise
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#493129] leading-snug">
              &ldquo;Technology elevated into an art form, backed by unmatched personal service.&rdquo;
            </h2>
            <p className="text-xs sm:text-sm text-[#493129]/75 font-sans max-w-2xl mx-auto leading-relaxed">
              Founded on the belief that a smartphone is the most intimate artifact of modern existence, our Bengaluru salon delivers an unparalleled purchasing experience. Every unit is factory sealed, official Indian specification, and backed by genuine manufacturer warranty.
            </p>
            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8b597b] hover:text-[#493129] pb-1 border-b border-[#8b597b]"
              >
                <span>Read The Maison Heritage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
