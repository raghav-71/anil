"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import { Product, Category, Brand } from "@/types";
import {
  Search,
  Star,
  ShoppingBag,
  SlidersHorizontal,
  RotateCcw,
  Heart,
  Scale,
  ArrowRight,
  Zap,
} from "lucide-react";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialBrand = searchParams.get("brand") || "all";
  const initialQuery = searchParams.get("q") || "";

  const { addItem, toggleWishlist, isInWishlist, toggleCompare, isInCompare } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState("featured");
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setCategories(data.categories || []);
        setBrands(data.brands || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== "all") {
      const matchCat =
        p.categoryId === selectedCategory ||
        p.categoryId.replace("cat-", "") === selectedCategory.replace("cat-", "") ||
        p.categoryName.toLowerCase() === selectedCategory.toLowerCase();
      if (!matchCat) return false;
    }
    if (selectedBrand !== "all") {
      const matchBrand =
        p.brandId === selectedBrand ||
        p.brandId.replace("b-", "") === selectedBrand.replace("b-", "") ||
        p.brandName.toLowerCase() === selectedBrand.toLowerCase();
      if (!matchBrand) return false;
    }
    if (p.basePrice > 0 && p.basePrice > maxPrice) return false;

    if (inStockOnly) {
      const stock = p.variants.reduce((acc, v) => acc + v.stockQuantity, 0);
      if (stock <= 0) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchBrand = p.brandName.toLowerCase().includes(q);
      const matchCat = p.categoryName.toLowerCase().includes(q);
      if (!matchTitle && !matchBrand && !matchCat) return false;
    }
    return true;
  });

  if (sortBy === "price-low") {
    filteredProducts.sort((a, b) => a.basePrice - b.basePrice);
  } else if (sortBy === "price-high") {
    filteredProducts.sort((a, b) => b.basePrice - a.basePrice);
  } else if (sortBy === "rating") {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "newest") {
    filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSearchQuery("");
    setSortBy("featured");
    setMaxPrice(200000);
    setInStockOnly(false);
  };

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

  const handleBuyNow = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    handleQuickAdd(product, e);
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ffeedb]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-[#493129]/10">
          <div>
            <nav className="text-[11px] uppercase tracking-[0.2em] text-[#8b597b] mb-1 font-semibold">
              <Link href="/">Maison</Link> / <span>The Full Collection</span>
            </nav>
            <h1 className="font-serif text-3xl sm:text-5xl text-[#493129]">
              The Complete Collection
            </h1>
            <p className="text-xs text-[#493129]/70 mt-1.5 font-sans">
              Displaying {filteredProducts.length} authenticated instruments of communication & acoustic design
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#fffaf5] rounded-full border border-[#493129]/15 px-4 py-2 text-xs text-[#493129]">
              <span className="text-[#8b597b] font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-[#493129] focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Editorial Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-8">
            <div className="bg-[#fffaf5] rounded-3xl p-6 border border-[#493129]/10 space-y-6 sticky top-28">
              <div className="flex items-center justify-between pb-3 border-b border-[#493129]/10">
                <span className="font-serif text-sm font-bold text-[#493129]">Curate Filters</span>
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-[#8b597b] hover:text-[#493129] font-medium flex items-center gap-1 uppercase tracking-wider"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* In-Stock Filter Toggle */}
              <label className="flex items-center justify-between p-3 rounded-2xl bg-[#ffeedb] border border-[#493129]/10 text-xs font-semibold text-[#493129] cursor-pointer">
                <span>In-Stock Ready to Dispatch</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#8b597b] rounded"
                />
              </label>

              {/* Categories */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b597b] block">Category</span>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition ${
                      selectedCategory === "all" ? "bg-[#ffdec7] text-[#493129] font-bold" : "text-[#493129]/80 hover:bg-[#ffeedb]"
                    }`}
                  >
                    All Items
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition ${
                        selectedCategory === c.id ? "bg-[#ffdec7] text-[#493129] font-bold" : "text-[#493129]/80 hover:bg-[#ffeedb]"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b597b] block">Manufacturer</span>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedBrand("all")}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition ${
                      selectedBrand === "all" ? "bg-[#ffdec7] text-[#493129] font-bold" : "text-[#493129]/80 hover:bg-[#ffeedb]"
                    }`}
                  >
                    All Manufacturers
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBrand(b.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition ${
                        selectedBrand === b.id ? "bg-[#ffdec7] text-[#493129] font-bold" : "text-[#493129]/80 hover:bg-[#ffeedb]"
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Price Slider */}
              <div className="space-y-2 pt-2 border-t border-[#493129]/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b597b]">Price Ceiling</span>
                  <span className="font-serif font-bold text-[#493129]">{formatCurrency(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="200000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#efa3a0] cursor-pointer"
                />
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-20 text-[#8b597b] font-serif">Curating the collection...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-[#fffaf5] rounded-3xl p-12 text-center border border-[#493129]/10 space-y-3">
                <p className="font-serif text-lg text-[#493129]">No items match your curation</p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2 bg-[#efa3a0] text-[#493129] rounded-full text-xs font-semibold"
                >
                  Clear Selection
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const variant = product.variants[0];
                  const totalStock = product.variants.reduce((acc, v) => acc + v.stockQuantity, 0);

                  return (
                    <div
                      key={product.id}
                      className="editorial-card rounded-3xl p-6 flex flex-col justify-between group bg-[#FFFAF5] border border-[#E8D5C5]"
                    >
                      <div>
                        <div className="relative h-56 rounded-2xl bg-[#FFEDDB]/50 flex items-center justify-center p-4 overflow-hidden border border-[#E8D5C5]/50">
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
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                            />
                          </Link>

                          {/* Brand badge */}
                          <div className="absolute top-3 left-3 bg-[#FFDEC7] text-[#493129] text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-[#E8D5C5]">
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
                                  ? "bg-[#8B597B] text-white border-[#8B597B]"
                                  : "bg-white text-[#493129] border-[#E8D5C5] hover:bg-[#FFDEC7]"
                              }`}
                              title="Compare Device"
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
                                  ? "bg-[#EFA3A0] text-[#493129] border-[#EFA3A0]"
                                  : "bg-white text-[#493129] border-[#E8D5C5] hover:bg-[#FFDEC7]"
                              }`}
                              title="Save to Wishlist"
                            >
                              <Heart className={`w-3.5 h-3.5 ${isInWishlist(product.id) ? "fill-[#493129]" : ""}`} />
                            </button>
                          </div>
                        </div>

                        <div className="pt-5 space-y-1">
                          <div className="flex items-center gap-1 text-[#8B597B] text-xs">
                            <Star className="w-3.5 h-3.5 fill-[#EFA3A0] text-[#EFA3A0]" />
                            <span className="font-bold">{product.rating}</span>
                            <span className="text-[#806D63] text-[10px]">({product.reviewCount})</span>
                          </div>

                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B597B] block">
                            {product.categoryName}
                          </span>

                          <Link href={`/product/${product.slug}`}>
                            <h3 className="font-serif text-base text-[#493129] hover:text-[#8B597B] transition line-clamp-1">
                              {product.title}
                            </h3>
                          </Link>
                          <p className="text-xs text-[#806D63] line-clamp-2">{product.shortDescription}</p>
                        </div>
                      </div>

                      <div className="pt-5 border-t border-[#E8D5C5] mt-5 space-y-3">
                        <div className="flex items-baseline justify-between">
                          {((variant ? variant.sellingPrice : product.basePrice) || 0) > 0 ? (
                            <span className="font-serif text-lg font-bold text-[#493129]">
                              {formatCurrency(variant ? variant.sellingPrice : product.basePrice)}
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

                        {((variant ? variant.sellingPrice : product.basePrice) || 0) > 0 && totalStock > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={(e) => handleQuickAdd(product, e)}
                              className="py-2.5 px-3 rounded-full bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] text-xs font-semibold flex items-center justify-center gap-1 transition shadow-xs"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Add to Bag</span>
                            </button>
                            <Link
                              href={`/product/${product.slug}`}
                              className="py-2.5 px-3 rounded-full bg-[#FFDEC7] hover:bg-[#E8D5C5] text-[#493129] text-xs font-semibold flex items-center justify-center gap-1 transition text-center"
                            >
                              <span>Details</span>
                            </Link>
                          </div>
                        ) : (
                          <Link
                            href={`/product/${product.slug}`}
                            className="w-full block py-2.5 px-3 rounded-full bg-[#FFDEC7] hover:bg-[#E8D5C5] text-[#493129] text-xs font-semibold text-center transition"
                          >
                            View Details
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#ffeedb] flex items-center justify-center text-[#8b597b]">Loading collection...</div>}>
      <ShopContent />
    </Suspense>
  );
}
