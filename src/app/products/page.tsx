"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import { Product, Category, Brand } from "@/types";
import {
  Search,
  Filter,
  Star,
  ShoppingBag,
  CheckCircle2,
  SlidersHorizontal,
  X,
  RotateCcw,
} from "lucide-react";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialBrand = searchParams.get("brand") || "all";
  const initialQuery = searchParams.get("q") || "";

  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setCategories(data.categories || []);
        setBrands(data.brands || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter & sort logic
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== "all" && p.categoryId !== selectedCategory) return false;
    if (selectedBrand !== "all" && p.brandId !== selectedBrand) return false;
    if (p.basePrice > maxPrice) return false;
    if (inStockOnly && !p.variants.some((v) => v.stockQuantity > 0)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchBrand = p.brandName.toLowerCase().includes(q);
      const matchVariant = p.variants.some(
        (v) => v.barcode.includes(q) || v.sku.toLowerCase().includes(q) || v.color?.toLowerCase().includes(q)
      );
      if (!matchTitle && !matchBrand && !matchVariant) return false;
    }
    return true;
  });

  if (sortBy === "price-low") {
    filteredProducts.sort((a, b) => a.basePrice - b.basePrice);
  } else if (sortBy === "price-high") {
    filteredProducts.sort((a, b) => b.basePrice - a.basePrice);
  } else if (sortBy === "rating") {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSearchQuery("");
    setSortBy("featured");
    setInStockOnly(false);
    setMaxPrice(200000);
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <nav className="text-xs text-slate-500 mb-1">
              <Link href="/" className="hover:underline">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-slate-800 font-medium">Products Catalog</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              All Smartphones & Accessories
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Showing {filteredProducts.length} verified products synchronized with live stock
            </p>
          </div>

          {/* Quick Actions (Filter toggle on mobile, Sort selector) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-1.5 shadow-2xs text-xs">
              <span className="text-slate-400 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid: Filters Sidebar + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 sticky top-28">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  <span>Filter Products</span>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Search Inside Catalog */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Search</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Brand, model, barcode..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Categories Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</label>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedCategory === "all" ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        selectedCategory === c.id ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Brand</label>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedBrand("all")}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedBrand === "all" ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    All Brands
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBrand(b.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        selectedBrand === b.id ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold uppercase tracking-wider text-slate-400">Max Price</label>
                  <span className="font-bold text-slate-900">{formatCurrency(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="200000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* In-Stock Only Switch */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <label htmlFor="inStockSwitch" className="text-xs font-medium text-slate-700 cursor-pointer">
                  In-Stock Only
                </label>
                <input
                  type="checkbox"
                  id="inStockSwitch"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </aside>

          {/* PRODUCTS LIST GRID */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-20 text-slate-400">Loading catalog...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
                <p className="text-base font-semibold text-slate-800">No matching products found</p>
                <p className="text-xs text-slate-400 mt-1">Try relaxing your search terms or filters.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
                >
                  Clear All Filters
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
                      className="group rounded-3xl p-5 bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Preview & Badges */}
                        <div className="relative h-52 rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center p-4">
                          <Link href={`/products/${product.slug}`} className="w-full h-full flex items-center justify-center">
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-700 border border-slate-200 shadow-2xs">
                            {product.brandName}
                          </div>
                          {totalStock <= 0 ? (
                            <div className="absolute top-3 right-3 bg-red-500/10 border border-red-500/20 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              Out of Stock
                            </div>
                          ) : totalStock <= 5 ? (
                            <div className="absolute top-3 right-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              Only {totalStock} left
                            </div>
                          ) : null}
                        </div>

                        {/* Details */}
                        <div className="pt-4 space-y-1.5">
                          <div className="flex items-center gap-1 text-amber-500 text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span className="font-semibold text-slate-700">{product.rating}</span>
                            <span className="text-slate-400">({product.reviewCount})</span>
                          </div>

                          <Link href={`/products/${product.slug}`}>
                            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition text-sm sm:text-base line-clamp-1">
                              {product.title}
                            </h3>
                          </Link>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {product.shortDescription}
                          </p>
                        </div>
                      </div>

                      <div className="pt-5 border-t border-slate-100 mt-4 space-y-3">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-base font-extrabold text-slate-900">
                              {formatCurrency(variant ? variant.sellingPrice : product.basePrice)}
                            </span>
                            {product.mrp > product.basePrice && (
                              <span className="text-xs text-slate-400 line-through ml-2">
                                {formatCurrency(product.mrp)}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            GST 18% Inc.
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            href={`/products/${product.slug}`}
                            className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold text-center transition"
                          >
                            Details
                          </Link>
                          <button
                            onClick={(e) => handleQuickAdd(product, e)}
                            disabled={totalStock <= 0}
                            className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition"
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
