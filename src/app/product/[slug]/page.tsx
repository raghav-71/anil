"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import { Product, ProductVariant } from "@/types";
import { FrequentlyBoughtTogether } from "@/components/storefront/FrequentlyBoughtTogether";
import { ReviewsSection } from "@/components/storefront/ReviewsSection";
import {
  Star,
  Truck,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Award,
  Heart,
  Scale,
  Maximize2,
  X,
  Sparkles,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { addItem, toggleWishlist, isInWishlist, toggleCompare, isInCompare, addRecentlyViewed } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<{
    valid: boolean;
    city?: string;
    state?: string;
    deliveryDays?: string;
    isCodAvailable?: boolean;
    courier?: string;
    error?: string;
  } | null>(null);
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
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
          addRecentlyViewed(found.id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#ffeedb]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center font-serif text-[#8b597b]">
          Loading instrument details...
        </div>
        <Footer />
      </div>
    );
  }

  if (!product || !selectedVariant) {
    return (
      <div className="min-h-screen flex flex-col bg-[#ffeedb]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <h2 className="font-serif text-2xl text-[#493129]">Instrument Not Found</h2>
          <p className="text-xs text-[#493129]/70 mt-1">This product is either unavailable or has been archived.</p>
          <Link href="/shop" className="mt-4 px-6 py-2.5 bg-[#efa3a0] text-[#493129] rounded-full text-xs font-semibold">
            Explore All Collections
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

  const checkPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6) {
      setPincodeResult({ valid: false, error: "Please enter a valid 6-digit Indian PIN code." });
      return;
    }
    setPincodeChecking(true);
    try {
      const res = await fetch(`/api/pincode/check?code=${pincode}`);
      const data = await res.json();
      setPincodeResult(data);
    } catch {
      setPincodeResult({ valid: false, error: "Unable to verify PIN code serviceability." });
    } finally {
      setPincodeChecking(false);
    }
  };

  const discountPercent =
    selectedVariant.mrp > selectedVariant.sellingPrice
      ? Math.round(((selectedVariant.mrp - selectedVariant.sellingPrice) / selectedVariant.mrp) * 100)
      : 0;

  // JSON-LD Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brandName,
    },
    sku: selectedVariant.sku,
    offers: {
      "@type": "Offer",
      url: `https://anilcommunications.com/product/${product.slug}`,
      priceCurrency: "INR",
      price: selectedVariant.sellingPrice,
      itemCondition: "https://schema.org/NewCondition",
      availability: selectedVariant.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ffeedb]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full">
        {/* Breadcrumb */}
        <nav className="text-[11px] uppercase tracking-[0.2em] text-[#8b597b] mb-8 font-medium">
          <Link href="/">Maison</Link> /{" "}
          <Link href="/shop">The Collection</Link> /{" "}
          <Link href={`/shop?category=${product.categoryId}`}>{product.categoryName}</Link> /{" "}
          <span className="text-[#493129] font-bold">{product.title}</span>
        </nav>

        {/* Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* LEFT: Image Gallery & Zoom */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-3xl bg-[#fffaf5] border border-[#493129]/10 p-8 sm:p-12 flex items-center justify-center min-h-[440px] sm:min-h-[500px] shadow-subtle group">
              <div className="relative w-full h-[360px]">
                <Image
                  src={selectedImage}
                  alt={product.title}
                  fill
                  className="object-contain filter drop-shadow-xl transition duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>

              {/* Brand Pill */}
              <div className="absolute top-5 left-5 bg-[#ffdec7] text-[#493129] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                {product.brandName}
              </div>

              {/* Wishlist & Compare actions */}
              <div className="absolute top-5 right-5 flex items-center gap-2">
                <button
                  onClick={() => toggleCompare(product.id)}
                  className={`p-2.5 rounded-full border transition ${
                    isInCompare(product.id)
                      ? "bg-[#8b597b] text-white border-[#8b597b]"
                      : "bg-white/80 text-[#493129] border-[#493129]/15 hover:bg-white"
                  }`}
                  title="Compare Device"
                >
                  <Scale className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2.5 rounded-full border transition ${
                    isInWishlist(product.id)
                      ? "bg-[#efa3a0] text-[#493129] border-[#efa3a0]"
                      : "bg-white/80 text-[#493129] border-[#493129]/15 hover:bg-white"
                  }`}
                  title="Add to Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-[#493129]" : ""}`} />
                </button>
                <button
                  onClick={() => setIsZoomOpen(true)}
                  className="p-2.5 rounded-full bg-white/80 text-[#493129] border border-[#493129]/15 hover:bg-white transition"
                  title="Enlarge Image"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Thumbnail Carousel Selector */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-2xl bg-[#fffaf5] border p-1 flex-shrink-0 transition overflow-hidden ${
                    selectedImage === img
                      ? "border-[#8b597b] ring-2 ring-[#8b597b]/30"
                      : "border-[#493129]/10 hover:border-[#493129]/30"
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-contain p-1" sizes="80px" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Details & Variant Matrix */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8b597b]">
                  {product.categoryName}
                </span>
                <span>•</span>
                <div className="flex items-center gap-1 text-[#493129] text-xs">
                  <Star className="w-3.5 h-3.5 fill-[#efa3a0] text-[#efa3a0]" />
                  <span className="font-bold">{product.rating}</span>
                  <span className="text-[#493129]/60">({product.reviewCount} customer reviews)</span>
                </div>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl text-[#493129] leading-tight">
                {product.title}
              </h1>

              <p className="text-xs sm:text-sm text-[#493129]/80 mt-3 leading-relaxed font-sans">
                {product.shortDescription}
              </p>
            </div>

            {/* Price Box */}
            <div className="p-6 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-[#493129]">
                    {formatCurrency(selectedVariant.sellingPrice)}
                  </span>
                  {selectedVariant.mrp > selectedVariant.sellingPrice && (
                    <>
                      <span className="text-sm text-[#493129]/40 line-through">
                        MRP: {formatCurrency(selectedVariant.mrp)}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Save {discountPercent}%
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-[#8b597b] font-medium mt-1">
                  Inclusive of all taxes (GST 18% HSN: {product.hsnCode})
                </p>
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#ffdec7] text-[#493129] text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8b597b]" />
                  <span>{selectedVariant.stockQuantity > 0 ? `${selectedVariant.stockQuantity} In Stock` : "Reserved"}</span>
                </span>
              </div>
            </div>

            {/* Variant Selector */}
            {product.variants.length > 1 && (
              <div className="space-y-3 p-6 rounded-3xl bg-[#fffaf5] border border-[#493129]/10">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b597b] block">
                  Select Specifications & Color
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3.5 rounded-2xl border text-left transition ${
                        selectedVariant.id === v.id
                          ? "border-[#8b597b] bg-[#ffeedb] ring-1 ring-[#8b597b]"
                          : "border-[#493129]/10 hover:border-[#493129]/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#493129]">
                          {[v.storage, v.ram].filter(Boolean).join(" / ") || "Standard"}
                        </span>
                        {v.colorCode && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: v.colorCode }}
                          />
                        )}
                      </div>
                      <p className="text-[11px] text-[#493129]/60 mt-0.5">{v.color || "Standard Edition"}</p>
                      <p className="text-xs font-bold text-[#8b597b] mt-1.5">{formatCurrency(v.sellingPrice)}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons: Add to Bag & Buy Now */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={selectedVariant.stockQuantity <= 0}
                className="flex-1 py-4 px-6 rounded-full bg-[#493129] hover:bg-[#35221b] disabled:opacity-40 text-[#ffeedb] font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Bag</span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={selectedVariant.stockQuantity <= 0}
                className="flex-1 py-4 px-6 rounded-full bg-[#efa3a0] hover:bg-[#e58e8b] disabled:opacity-40 text-[#493129] font-bold text-xs flex items-center justify-center gap-2 shadow-coral transition"
              >
                <span>Buy Now (Instant Checkout)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Real-time Indian Pincode Serviceability Checker */}
            <form onSubmit={checkPincode} className="p-5 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 space-y-2">
              <label className="text-xs font-bold text-[#493129] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8b597b]" />
                <span>Check Delivery Date & Cash on Delivery</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter 6-digit Indian PIN code (e.g. 560001)"
                  className="flex-1 px-4 py-2 text-xs rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                />
                <button
                  type="submit"
                  disabled={pincodeChecking}
                  className="px-5 py-2 bg-[#ffdec7] hover:bg-[#f2caa9] text-[#493129] text-xs font-semibold rounded-full transition disabled:opacity-50"
                >
                  {pincodeChecking ? "Checking..." : "Verify PIN"}
                </button>
              </div>

              {pincodeResult && (
                <div className="pt-2 text-xs">
                  {pincodeResult.valid ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-900">
                      <div className="font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Serviceable in {pincodeResult.city}, {pincodeResult.state}</span>
                      </div>
                      <div className="text-[11px] text-emerald-800">
                        • Estimated Delivery: <strong>{pincodeResult.deliveryDays}</strong> via {pincodeResult.courier}
                      </div>
                      <div className="text-[11px] text-emerald-800">
                        • Cash on Delivery (COD): <strong>{pincodeResult.isCodAvailable ? "Available" : "Prepaid Only"}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-[11px]">
                      {pincodeResult.error || "PIN code not serviceable."}
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Warranty & Guarantee */}
            <div className="grid grid-cols-2 gap-3 text-xs text-[#493129]/80">
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#fffaf5] border border-[#493129]/10">
                <Award className="w-4 h-4 text-[#8b597b] flex-shrink-0" />
                <span>{product.warrantySummary}</span>
              </div>
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#fffaf5] border border-[#493129]/10">
                <Truck className="w-4 h-4 text-[#8b597b] flex-shrink-0" />
                <span>Insured White-Glove Shipping</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amazon-Level: Frequently Bought Together Bundle */}
        <FrequentlyBoughtTogether productId={product.id} />

        {/* Technical Specifications Matrix */}
        <div className="mt-16 space-y-6">
          <div className="border-b border-[#493129]/10 pb-4">
            <h2 className="font-serif text-2xl text-[#493129]">Technical Specifications & Provenance</h2>
          </div>

          <div className="bg-[#fffaf5] rounded-3xl p-8 border border-[#493129]/10 shadow-subtle">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="p-4 bg-[#ffeedb]/50 rounded-2xl">
                <dt className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b597b]">Model Designation</dt>
                <dd className="font-serif text-sm text-[#493129] mt-1">{product.brandName} - {product.title}</dd>
              </div>
              <div className="p-4 bg-[#ffeedb]/50 rounded-2xl">
                <dt className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b597b]">Tax Classification & HSN</dt>
                <dd className="font-mono text-xs text-[#493129] mt-1">HSN {product.hsnCode} (GST {product.gstRate}%)</dd>
              </div>
              <div className="p-4 bg-[#ffeedb]/50 rounded-2xl sm:col-span-2">
                <dt className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b597b]">Editorial Synopsis</dt>
                <dd className="text-xs text-[#493129]/80 mt-1 leading-relaxed">{product.description}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Amazon-Level: Customer Reviews & Ratings */}
        <ReviewsSection productId={product.id} productName={product.title} />
      </main>

      {/* Fullscreen Image Zoom Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#493129]/80 backdrop-blur-md">
          <div className="relative max-w-4xl w-full h-[80vh] bg-white rounded-3xl p-6 flex items-center justify-center">
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#ffeedb] text-[#493129] hover:bg-[#ffdec7]"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-full">
              <Image src={selectedImage} alt={product.title} fill className="object-contain p-4" sizes="80vw" />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
