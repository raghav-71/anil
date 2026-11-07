"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Smartphone, Plus, Trash2, ArrowLeft, Save, Barcode, CheckCircle2 } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [brandName, setBrandName] = useState("Apple");
  const [brandId, setBrandId] = useState("b-apple");
  const [categoryName, setCategoryName] = useState("Smartphones");
  const [categoryId, setCategoryId] = useState("cat-smartphones");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState(79999);
  const [mrp, setMrp] = useState(84999);
  const [hsnCode, setHsnCode] = useState("85171300");
  const [gstRate, setGstRate] = useState(18);
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80");
  const [warrantySummary, setWarrantySummary] = useState("1 Year Official Brand Warranty");

  // Variants Matrix
  const [variants, setVariants] = useState<any[]>([
    {
      id: `var-${Date.now()}-1`,
      color: "Space Black",
      colorCode: "#1c1c1e",
      ram: "8GB",
      storage: "128GB",
      sellingPrice: 79999,
      mrp: 84999,
      costPrice: 69000,
      stockQuantity: 10,
      lowStockThreshold: 3,
      sku: "APL-16-128-BLK",
      barcode: "8901234569011",
      isActive: true,
    },
  ]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    );
  };

  const addVariantRow = () => {
    const randomBarcode = `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setVariants([
      ...variants,
      {
        id: `var-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        color: "Silver",
        colorCode: "#e5e7eb",
        ram: "8GB",
        storage: "256GB",
        sellingPrice: basePrice + 10000,
        mrp: mrp + 10000,
        costPrice: basePrice + 2000,
        stockQuantity: 8,
        lowStockThreshold: 3,
        sku: `SKU-${Date.now().toString().slice(-6)}`,
        barcode: randomBarcode,
        isActive: true,
      },
    ]);
  };

  const removeVariantRow = (idx: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const handleVariantChange = (idx: number, field: string, val: any) => {
    const updated = [...variants];
    updated[idx] = { ...updated[idx], [field]: val };
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || variants.length === 0) return;
    setSubmitting(true);

    try {
      const newProductPayload = {
        id: `prod-${Date.now()}`,
        title,
        slug,
        brandId,
        brandName,
        categoryId,
        categoryName,
        shortDescription,
        description,
        basePrice: Number(basePrice),
        mrp: Number(mrp),
        hsnCode,
        gstRate: Number(gstRate),
        images: [imageUrl],
        isFeatured: true,
        isActive: true,
        warrantySummary,
        rating: 4.8,
        reviewCount: 1,
        variants,
        createdAt: new Date().toISOString(),
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProductPayload),
      });

      if (!res.ok) throw new Error("Failed to add product");

      router.push("/admin/products");
    } catch (err: any) {
      alert(err.message || "Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Catalog Entry</span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Add New Product</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Core Product Information */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3">General Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-300 block mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Apple iPhone 16 Plus"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">URL Slug</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Brand *</label>
              <select
                value={brandName}
                onChange={(e) => {
                  setBrandName(e.target.value);
                  setBrandId(e.target.value === "Apple" ? "b-apple" : e.target.value === "Samsung" ? "b-samsung" : "b-oneplus");
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="OnePlus">OnePlus</option>
                <option value="Nothing">Nothing</option>
                <option value="Sony">Sony</option>
                <option value="Anker">Anker</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setCategoryName(e.target.value === "cat-smartphones" ? "Smartphones" : "Chargers & Cables");
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                <option value="cat-smartphones">Smartphones</option>
                <option value="cat-chargers">Chargers & Cables</option>
                <option value="cat-audio">Audio & Headphones</option>
                <option value="cat-powerbanks">Power Banks</option>
                <option value="cat-accessories">Cases & Protection</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">HSN Tax Code *</label>
              <input
                type="text"
                required
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-300 block mb-1">Image URL</label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-300 block mb-1">Short Description</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="A18 Bionic, Ceramic Shield, Super Retina XDR"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
          </div>
        </div>

        {/* Variants Matrix */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white">Product Variants, Stock & Barcodes</h2>
            <button
              type="button"
              onClick={addVariantRow}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variant</span>
            </button>
          </div>

          <div className="space-y-4">
            {variants.map((v, idx) => (
              <div key={v.id} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                  <span>Variant #{idx + 1}</span>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariantRow(idx)}
                      className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[11px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Color</label>
                    <input
                      type="text"
                      value={v.color}
                      onChange={(e) => handleVariantChange(idx, "color", e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Storage / Size</label>
                    <input
                      type="text"
                      value={v.storage}
                      onChange={(e) => handleVariantChange(idx, "storage", e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Selling Price (₹)</label>
                    <input
                      type="number"
                      value={v.sellingPrice}
                      onChange={(e) => handleVariantChange(idx, "sellingPrice", Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Cost Price (COGS ₹)</label>
                    <input
                      type="number"
                      value={v.costPrice}
                      onChange={(e) => handleVariantChange(idx, "costPrice", Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Initial Stock Qty</label>
                    <input
                      type="number"
                      value={v.stockQuantity}
                      onChange={(e) => handleVariantChange(idx, "stockQuantity", Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Barcode / EAN</label>
                    <input
                      type="text"
                      value={v.barcode}
                      onChange={(e) => handleVariantChange(idx, "barcode", e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">SKU</label>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/products"
            className="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Publishing Product..." : "Save & Publish Product"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

