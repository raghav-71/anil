"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import { Product, ProductVariant } from "@/types";
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  ShoppingBag,
  ArrowRight,
  Barcode,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MapPin,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const found = (data.products as Product[]).find((p) => p.slug === slug);
        if (found) {
          setProduct(found);
          const firstVariant = found.variants[0] || null;
          setSelectedVariant(firstVariant);
          setSelectedImage(found.images[0] || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-slate-400">Loading product...</div>
        <Footer />
      </div>
    );
  }

  if (!product || !selectedVariant) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">The requested product could not be found or has been archived.</p>
          <Link href="/products" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
            Browse All Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      title: product.title,
      color: selectedVariant.color,
      storage: selectedVariant.storage,
      ram: selectedVariant.ram,
      image: selectedImage || product.images[0],
      price: selectedVariant.sellingPrice,
      mrp: selectedVariant.mrp,
      quantity: 1,
      stockAvailable: selectedVariant.stockQuantity,
      sku: selectedVariant.sku,
      barcode: selectedVariant.barcode,
      gstRate: product.gstRate,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const checkPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setPincodeStatus("Delivery available! Express Dispatch within 24 hours.");
    } else {
      setPincodeStatus("Please enter a valid 6-digit Indian PIN code.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:underline">Products</Link>
          <span className="mx-2">/</span>
          <Link href={`/products?category=${product.categoryId}`} className="hover:underline">
            {product.categoryName}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800 font-medium">{product.title}</span>
        </nav>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-3xl bg-white border border-slate-200/80 p-8 flex items-center justify-center min-h-[420px] shadow-xs">
              <img
                src={selectedImage}
                alt={product.title}
                className="max-h-[360px] max-w-full object-contain filter drop-shadow-xl"
              />
              <div className="absolute top-4 left-4 bg-slate-900 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                {product.brandName}
              </div>
            </div>

            {/* Thumbnail selector */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl bg-white border p-2 flex-shrink-0 transition ${
                    selectedImage === img
                      ? "border-blue-600 ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info & Variant Selector */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  {product.categoryName}
                </span>
                <span>•</span>
                <div className="flex items-center gap-1 text-amber-500 text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span className="font-bold text-slate-800">{product.rating}</span>
                  <span className="text-slate-400">({product.reviewCount} customer reviews)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {product.title}
              </h1>

              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {product.shortDescription}
              </p>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-slate-900">
                  {formatCurrency(selectedVariant.sellingPrice)}
                </span>
                {selectedVariant.mrp > selectedVariant.sellingPrice && (
                  <span className="text-sm text-slate-400 line-through ml-2">
                    {formatCurrency(selectedVariant.mrp)}
                  </span>
                )}
                <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Inclusive of all taxes (GST 18% HSN: {product.hsnCode})
                </p>
              </div>

              {selectedVariant.stockQuantity > 0 ? (
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>In Stock ({selectedVariant.stockQuantity} units)</span>
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Available at Shop Counter</p>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>Out of Stock</span>
                </span>
              )}
            </div>

            {/* Variants Selector (Color & Storage) */}
            {product.variants.length > 1 && (
              <div className="space-y-4 p-5 rounded-2xl bg-white border border-slate-200/80">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Select Model / Storage Variant
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-xl border text-left transition ${
                        selectedVariant.id === v.id
                          ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          {[v.storage, v.ram].filter(Boolean).join(" / ") || "Standard"}
                        </span>
                        {v.colorCode && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300"
                            style={{ backgroundColor: v.colorCode }}
                          />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{v.color || "Standard"}</p>
                      <p className="text-xs font-semibold text-blue-700 mt-1">{formatCurrency(v.sellingPrice)}</p>
                    </button>
                  ))}
                </div>

                {/* Barcode & SKU transparency */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-mono">
                    <Barcode className="w-3.5 h-3.5 text-slate-400" /> Barcode: {selectedVariant.barcode}
                  </span>
                  <span className="font-mono">SKU: {selectedVariant.sku}</span>
                </div>
              </div>
            )}

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={selectedVariant.stockQuantity <= 0}
                className="flex-1 py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={selectedVariant.stockQuantity <= 0}
                className="flex-1 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition"
              >
                <span>Buy Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* PIN Code Delivery Checker */}
            <form onSubmit={checkPincode} className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Check Delivery & Store Pickup Availability</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter 6-digit PIN code"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition"
                >
                  Verify
                </button>
              </div>
              {pincodeStatus && (
                <p className={`text-xs ${pincodeStatus.includes("available") ? "text-emerald-600" : "text-amber-600"}`}>
                  {pincodeStatus}
                </p>
              )}
            </form>

            {/* Official Warranty & Policy Badges */}
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200/70">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{product.warrantySummary}</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200/70">
                <Truck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Free Express Shipping on ₹999+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications & Extended Description */}
        <div className="mt-14 space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900">Technical Specifications</h2>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <dt className="text-slate-400 uppercase font-bold text-[10px]">Brand & Model</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">{product.brandName} - {product.title}</dd>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <dt className="text-slate-400 uppercase font-bold text-[10px]">HSN / Tax Rate</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">HSN {product.hsnCode} (GST {product.gstRate}%)</dd>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <dt className="text-slate-400 uppercase font-bold text-[10px]">Active Variant SKU</dt>
                <dd className="font-semibold text-slate-800 mt-0.5 font-mono">{selectedVariant.sku}</dd>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <dt className="text-slate-400 uppercase font-bold text-[10px]">Scan Barcode / EAN</dt>
                <dd className="font-semibold text-slate-800 mt-0.5 font-mono">{selectedVariant.barcode}</dd>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl sm:col-span-2">
                <dt className="text-slate-400 uppercase font-bold text-[10px]">Detailed Description</dt>
                <dd className="text-slate-600 mt-1 leading-relaxed">{product.description}</dd>
              </div>
            </dl>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

