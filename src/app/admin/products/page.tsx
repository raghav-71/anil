"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types";
import {
  Smartphone,
  Plus,
  Search,
  CheckCircle2,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  Layers,
  Upload,
  X,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "missing_photo" | "out_of_stock">("all");

  // Quick Photo Upload Modal State
  const [photoModalProduct, setPhotoModalProduct] = useState<Product | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const loadProducts = () => {
    setLoading(true);
    fetch("/api/products?includeUnpublished=true", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setCategories(data.categories || []);
        setBrands(data.brands || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (productId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    const res = await fetch(`/api/products?id=${productId}`, { method: "DELETE" });
    if (res.ok) {
      setProducts(products.filter((p) => p.id !== productId));
    } else {
      alert("Failed to delete product.");
    }
  };

  const handleToggleActive = async (product: Product) => {
    const updated = !product.isActive;
    const res = await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product.id, isActive: updated }),
    });

    if (res.ok) {
      setProducts(products.map((p) => (p.id === product.id ? { ...p, isActive: updated } : p)));
    } else {
      alert("Failed to update product visibility status.");
    }
  };

  const handleDuplicate = async (product: Product) => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newProduct = {
      ...product,
      id: `prod-${product.slug}-copy-${randomSuffix}`,
      title: `${product.title} (Copy)`,
      slug: `${product.slug}-copy-${randomSuffix}`,
      isActive: false, // Start as draft
      variants: product.variants.map((v, i) => ({
        ...v,
        id: `var-${product.slug}-copy-${i + 1}-${randomSuffix}`,
        sku: `${v.sku}-CP`,
        barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      })),
      createdAt: new Date().toISOString(),
    };

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });

    if (res.ok) {
      loadProducts();
    } else {
      alert("Failed to duplicate product.");
    }
  };

  const handleQuickUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!photoModalProduct || !e.target.files || e.target.files.length === 0) return;
    setUploadingPhoto(true);

    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append("files", e.target.files[i]);
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const newUrls = data.urls || [data.url];
      const updatedImages = [...newUrls, ...photoModalProduct.images];

      const updateRes = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: photoModalProduct.id, images: updatedImages }),
      });

      if (updateRes.ok) {
        setProducts(
          products.map((p) => (p.id === photoModalProduct.id ? { ...p, images: updatedImages } : p))
        );
        setPhotoModalProduct(null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const missingPhotoCount = products.filter(
    (p) => p.images.length === 0 || p.images.every((img) => img.endsWith(".svg"))
  ).length;

  const totalStockCount = products.reduce(
    (acc, p) => acc + p.variants.reduce((vAcc, v) => vAcc + v.stockQuantity, 0),
    0
  );

  const filtered = products.filter((p) => {
    if (categoryFilter !== "all" && p.categoryId !== categoryFilter) return false;
    if (brandFilter !== "all" && p.brandId !== brandFilter) return false;

    const totalStock = p.variants.reduce((acc, v) => acc + v.stockQuantity, 0);
    const isMissingPhoto = p.images.length === 0 || p.images.every((img) => img.endsWith(".svg"));

    if (statusFilter === "published" && !p.isActive) return false;
    if (statusFilter === "draft" && p.isActive) return false;
    if (statusFilter === "missing_photo" && !isMissingPhoto) return false;
    if (statusFilter === "out_of_stock" && totalStock > 0) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchBrand = p.brandName.toLowerCase().includes(q);
      const matchSku = p.variants.some((v) => v.sku?.toLowerCase().includes(q) || v.barcode?.includes(q));
      if (!matchTitle && !matchBrand && !matchSku) return false;
    }

    return true;
  });

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E8D5C5] pb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B597B]">
            Catalog Management
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#493129] tracking-tight mt-0.5">
            Products & Catalog
          </h1>
          <p className="text-xs text-[#806D63] mt-1">
            Manage your mobile shop catalogue, prices, MRP, photos, variants, and storefront visibility
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadProducts}
            className="p-2.5 rounded-full bg-[#FFFAF5] border border-[#E8D5C5] hover:bg-[#FFDEC7] text-[#493129] transition shadow-xs"
            title="Refresh list"
            aria-label="Refresh product list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/admin/products/new"
            className="px-5 py-2.5 rounded-full bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] font-bold text-xs flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* METRIC STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#806D63]">Total Products</span>
          <div className="text-2xl font-serif font-bold text-[#493129] mt-0.5">{products.length}</div>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#27845A]">Published Live</span>
          <div className="text-2xl font-serif font-bold text-[#27845A] mt-0.5">
            {products.filter((p) => p.isActive).length}
          </div>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#B7791F]">Photos Needed</span>
          <div className="text-2xl font-serif font-bold text-[#B7791F] mt-0.5">{missingPhotoCount}</div>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#8B597B]">Live Stock Units</span>
          <div className="text-2xl font-serif font-bold text-[#8B597B] mt-0.5">{totalStockCount}</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#806D63]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product, brand, or model..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#FFFFFF] border border-[#E8D5C5] text-xs text-[#30241F] placeholder-[#806D63]/60 focus:outline-none focus:border-[#8B597B]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2 rounded-full bg-[#FFFFFF] border border-[#E8D5C5] text-xs text-[#30241F] focus:outline-none focus:border-[#8B597B]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Brand Filter */}
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="px-3.5 py-2 rounded-full bg-[#FFFFFF] border border-[#E8D5C5] text-xs text-[#30241F] focus:outline-none focus:border-[#8B597B]"
            >
              <option value="all">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3.5 py-2 rounded-full bg-[#FFFFFF] border border-[#E8D5C5] text-xs text-[#30241F] focus:outline-none focus:border-[#8B597B]"
            >
              <option value="all">All Status</option>
              <option value="published">Published (Live Online)</option>
              <option value="draft">Draft (Hidden)</option>
              <option value="missing_photo">Missing Photo</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-[#806D63] border-b border-[#E8D5C5]">
              <tr>
                <th className="py-3 px-3">Product Name & Category</th>
                <th className="py-3 px-3">Photo</th>
                <th className="py-3 px-3">Variants</th>
                <th className="py-3 px-3">Selling Price / MRP</th>
                <th className="py-3 px-3 text-center">Stock</th>
                <th className="py-3 px-3 text-center">Storefront</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D5C5] text-[#30241F]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#806D63] italic font-serif">
                    Loading catalog products...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#806D63] italic font-serif">
                    No products matching your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const totalStock = prod.variants.reduce((acc, v) => acc + v.stockQuantity, 0);
                  const hasPhoto = prod.images.length > 0 && !prod.images[0].endsWith(".svg");

                  return (
                    <tr key={prod.id} className="hover:bg-[#F5E8DC]/40 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setPhotoModalProduct(prod)}
                            className="relative w-11 h-11 rounded-xl object-contain bg-[#FFFFFF] p-1 border border-[#E8D5C5] flex-shrink-0 group overflow-hidden"
                            title="Click to change photo"
                          >
                            <img
                              src={prod.images[0] || "/images/products/fallback-product.svg"}
                              alt={prod.title}
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (!target.src.includes("fallback-product.svg")) {
                                  target.src = "/images/products/fallback-product.svg";
                                }
                              }}
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-[#493129]/75 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <Upload className="w-3.5 h-3.5 text-[#FFEDDB]" />
                            </div>
                          </button>
                          <div>
                            <Link
                              href={`/admin/products/edit/${prod.id}`}
                              className="font-bold text-[#493129] hover:text-[#8B597B] block transition"
                            >
                              {prod.title}
                            </Link>
                            <span className="text-[11px] text-[#806D63]">
                              {prod.brandName} • {prod.categoryName}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {hasPhoto ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#27845A] bg-[#27845A]/10 border border-[#27845A]/30 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Photo Added</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => setPhotoModalProduct(prod)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#B7791F] bg-[#B7791F]/10 border border-[#B7791F]/30 hover:bg-[#B7791F]/20 px-2.5 py-0.5 rounded-full transition"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Upload Photo</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-[#F5E8DC] text-[#493129] border border-[#E8D5C5] px-2.5 py-0.5 rounded-full">
                          <Layers className="w-3 h-3 text-[#8B597B]" />
                          <span>{prod.variants.length} Variants</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono">
                        {prod.basePrice > 0 ? (
                          <>
                            <span className="font-bold text-[#493129] block">
                              {formatCurrency(prod.basePrice)}
                            </span>
                            {prod.mrp > prod.basePrice && (
                              <span className="text-[#806D63] line-through text-[10px]">
                                {formatCurrency(prod.mrp)}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-[#B7791F] font-sans font-medium text-[11px] block">
                            Price Unset (Enquire)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            totalStock === 0
                              ? "bg-[#C0393A]/10 text-[#C0393A] border border-[#C0393A]/30"
                              : totalStock <= 5
                              ? "bg-[#B7791F]/10 text-[#B7791F] border border-[#B7791F]/30"
                              : "bg-[#27845A]/10 text-[#27845A] border border-[#27845A]/30"
                          }`}
                        >
                          {totalStock} Units
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleActive(prod)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition flex items-center gap-1 mx-auto ${
                            prod.isActive
                              ? "bg-[#27845A]/10 text-[#27845A] border border-[#27845A]/30 hover:bg-[#27845A]/20"
                              : "bg-[#FFDEC7] text-[#493129] border border-[#E8D5C5] hover:bg-[#E8D5C5]"
                          }`}
                        >
                          {prod.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{prod.isActive ? "Published" : "Draft"}</span>
                        </button>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/products/edit/${prod.id}`}
                            className="p-1.5 text-[#806D63] hover:text-[#493129] hover:bg-[#FFDEC7] rounded-full transition"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDuplicate(prod)}
                            className="p-1.5 text-[#806D63] hover:text-[#8B597B] hover:bg-[#FFDEC7] rounded-full transition"
                            title="Duplicate Product"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/product/${prod.slug}`}
                            target="_blank"
                            className="p-1.5 text-[#806D63] hover:text-[#493129] hover:bg-[#FFDEC7] rounded-full transition"
                            title="Preview on Storefront"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(prod.id, prod.title)}
                            className="p-1.5 text-[#C0393A] hover:text-[#C0393A] hover:bg-[#C0393A]/10 rounded-full transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Photo Upload Modal */}
      {photoModalProduct && (
        <div className="fixed inset-0 z-50 bg-[#493129]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-start border-b border-[#E8D5C5] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B597B]">
                  {photoModalProduct.brandName}
                </span>
                <h3 className="text-base font-serif font-bold text-[#493129] mt-0.5">
                  {photoModalProduct.title}
                </h3>
                <p className="text-xs text-[#806D63]">Upload or replace product photograph</p>
              </div>
              <button
                onClick={() => setPhotoModalProduct(null)}
                className="text-[#806D63] hover:text-[#493129] p-1 rounded-full hover:bg-[#FFDEC7] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              onClick={() => photoInputRef.current?.click()}
              className="border-2 border-dashed border-[#E8D5C5] hover:border-[#8B597B] rounded-2xl p-6 text-center cursor-pointer bg-[#FFFFFF] hover:bg-[#F5E8DC] transition space-y-2"
            >
              <input
                ref={photoInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleQuickUploadPhoto}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-[#FFDEC7] text-[#493129] flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[#493129] font-bold block text-xs">
                  {uploadingPhoto ? "Uploading..." : "Click to select JPEG, PNG, or WebP photo"}
                </span>
                <span className="text-[11px] text-[#806D63]">Maximum size 10MB</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPhotoModalProduct(null)}
                className="px-5 py-2 rounded-full bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
