"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Product, ProductVariant, Category, Brand } from "@/types";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Barcode,
  CheckCircle2,
  Upload,
  AlertTriangle,
  Layers,
  Tag,
  ShieldCheck,
  FileText,
  DollarSign,
  Sparkles,
  Eye,
  RefreshCw,
  Star,
  X,
} from "lucide-react";

interface ProductFormProps {
  initialProduct?: Product;
  isEdit?: boolean;
}

export function ProductForm({ initialProduct, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Available categories & brands
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Inline custom category & brand modal/inputs
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [showNewBrandInput, setShowNewBrandInput] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");

  // Basic Information
  const [title, setTitle] = useState(initialProduct?.title || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [brandId, setBrandId] = useState(initialProduct?.brandId || "b-motorola");
  const [brandName, setBrandName] = useState(initialProduct?.brandName || "Motorola");
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId || "cat-smartphones");
  const [categoryName, setCategoryName] = useState(initialProduct?.categoryName || "Smartphones");
  const [modelNumber, setModelNumber] = useState(initialProduct?.modelNumber || "");
  const [hsnCode, setHsnCode] = useState(initialProduct?.hsnCode || "85171300");
  const [gstRate, setGstRate] = useState(initialProduct?.gstRate || 18);
  const [shortDescription, setShortDescription] = useState(initialProduct?.shortDescription || "");
  const [description, setDescription] = useState(initialProduct?.description || "");

  // Pricing
  const [basePrice, setBasePrice] = useState<number>(initialProduct?.basePrice || 0);
  const [mrp, setMrp] = useState<number>(initialProduct?.mrp || 0);
  const [promotionalPrice, setPromotionalPrice] = useState<number>(initialProduct?.promotionalPrice || 0);

  // Images
  const [images, setImages] = useState<string[]>(initialProduct?.images || []);
  const [customImageUrl, setCustomImageUrl] = useState("");

  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialProduct?.variants || [
      {
        id: `var-${Date.now()}-1`,
        productId: initialProduct?.id || "",
        color: "Standard",
        colorCode: "#493129",
        ram: "4GB",
        storage: "128GB",
        sellingPrice: initialProduct?.basePrice || 0,
        mrp: initialProduct?.mrp || 0,
        costPrice: 0,
        stockQuantity: 10,
        lowStockThreshold: 3,
        sku: `AC-PROD-01`,
        barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        isActive: true,
      },
    ]
  );

  // Additional Information
  const [warrantySummary, setWarrantySummary] = useState(
    initialProduct?.warrantySummary || "1 Year Official Brand Warranty on Handset, 6 Months on Accessories"
  );
  const [returnPolicy, setReturnPolicy] = useState(
    initialProduct?.returnPolicy || "7 Days Replacement for Technical & Hardware Defects"
  );
  const [highlights, setHighlights] = useState<string[]>(
    initialProduct?.highlights || [
      "100% Genuine Brand New Retail Unit",
      "Official Manufacturer Warranty with GST Invoice",
      "Express Secure Delivery in Pant Nagar & Across India",
    ]
  );
  const [newHighlight, setNewHighlight] = useState("");

  // Specifications
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    initialProduct?.specifications
      ? Object.entries(initialProduct.specifications).map(([key, value]) => ({ key, value }))
      : [
          { key: "Network Type", value: "5G, 4G VOLTE, 3G, 2G" },
          { key: "SIM Type", value: "Dual SIM (Nano-SIM, dual stand-by)" },
          { key: "In The Box", value: "Handset, Adapter, USB Cable, SIM Ejector, Protective Case" },
        ]
  );
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  // SEO & Meta
  const [seoTitle, setSeoTitle] = useState(initialProduct?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialProduct?.seoDescription || "");

  // Fetch categories & brands
  useEffect(() => {
    fetch("/api/products?includeUnpublished=true", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
        if (data.brands) setBrands(data.brands);
      })
      .catch(() => {});
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const handleBasePriceChange = (val: number) => {
    setBasePrice(val);
    if (variants.length > 0) {
      const updated = [...variants];
      updated[0] = { ...updated[0], sellingPrice: val };
      setVariants(updated);
    }
  };

  const handleMrpChange = (val: number) => {
    setMrp(val);
    if (variants.length > 0) {
      const updated = [...variants];
      updated[0] = { ...updated[0], mrp: val };
      setVariants(updated);
    }
  };

  // Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImage(true);

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

      const urls = data.urls || [data.url];
      setImages([...images, ...urls]);
    } catch (err: any) {
      alert(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddCustomImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setImages([...images, customImageUrl.trim()]);
    setCustomImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSetMainImage = (index: number) => {
    if (index === 0 || index >= images.length) return;
    const nextImages = [...images];
    const [moved] = nextImages.splice(index, 1);
    nextImages.unshift(moved);
    setImages(nextImages);
  };

  const triggerReplaceImage = (index: number) => {
    setReplacingIndex(index);
    replaceFileInputRef.current?.click();
  };

  const handleReplaceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || replacingIndex === null) return;
    setUploadingImage(true);

    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const newUrl = data.url || (data.urls && data.urls[0]);
      if (newUrl) {
        const nextImages = [...images];
        nextImages[replacingIndex] = newUrl;
        setImages(nextImages);
      }
    } catch (err: any) {
      alert(err.message || "Failed to replace image");
    } finally {
      setUploadingImage(false);
      setReplacingIndex(null);
      if (replaceFileInputRef.current) {
        replaceFileInputRef.current.value = "";
      }
    }
  };

  // Add Variant
  const handleAddVariant = () => {
    const randomBarcode = `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const brandCode = (brandName || "AC").substring(0, 3).toUpperCase();
    const slugCode = (slug || "PROD").substring(0, 4).toUpperCase();

    setVariants([
      ...variants,
      {
        id: `var-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        productId: initialProduct?.id || "",
        color: "Standard",
        colorCode: "#493129",
        ram: "6GB",
        storage: "128GB",
        sellingPrice: basePrice,
        mrp: mrp,
        costPrice: 0,
        stockQuantity: 10,
        lowStockThreshold: 3,
        sku: `AC-${brandCode}-${slugCode}-${variants.length + 1}`,
        barcode: randomBarcode,
        isActive: true,
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, val: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: val };
    if (index === 0 && field === "sellingPrice") {
      setBasePrice(Number(val));
    }
    if (index === 0 && field === "mrp") {
      setMrp(Number(val));
    }
    setVariants(updated);
  };

  // Highlights
  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    setHighlights([...highlights, newHighlight.trim()]);
    setNewHighlight("");
  };

  const handleRemoveHighlight = (idx: number) => {
    setHighlights(highlights.filter((_, i) => i !== idx));
  };

  // Specifications
  const handleAddSpec = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) return;
    setSpecs([...specs, { key: newSpecKey.trim(), value: newSpecValue.trim() }]);
    setNewSpecKey("");
    setNewSpecValue("");
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  // Submit Handler
  const handleSubmit = async (publishImmediately: boolean) => {
    if (!title.trim()) {
      setErrorMsg("Product name is required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const finalSlug =
        slug.trim() ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

      const prodId = initialProduct?.id || `prod-${finalSlug}`;

      const specObj: Record<string, string> = {};
      specs.forEach((s) => {
        if (s.key && s.value) specObj[s.key] = s.value;
      });

      // Synchronize variants and ensure variant 0 matches basePrice & mrp
      const finalVariants = variants.map((v, i) => ({
        ...v,
        productId: prodId,
        id: v.id || `var-${finalSlug}-${i + 1}`,
        sellingPrice: i === 0 && basePrice > 0 ? Number(basePrice) : Number(v.sellingPrice || basePrice),
        mrp: i === 0 && mrp > 0 ? Number(mrp) : Number(v.mrp || mrp),
        costPrice: Number(v.costPrice || 0),
        stockQuantity: Number(v.stockQuantity || 0),
        lowStockThreshold: Number(v.lowStockThreshold || 3),
        isActive: publishImmediately,
      }));

      const finalImages = images.length > 0 ? images : [`/images/products/${finalSlug}.svg`];

      const payload = {
        id: prodId,
        title: title.trim(),
        slug: finalSlug,
        brandId,
        brandName,
        categoryId,
        categoryName,
        modelNumber: modelNumber.trim() || undefined,
        shortDescription:
          shortDescription.trim() ||
          (title.toLowerCase().startsWith(brandName.toLowerCase())
            ? `${title} authentic mobile device with Indian warranty.`
            : `${brandName} ${title} authentic mobile device with Indian warranty.`),
        description:
          description.trim() ||
          (title.toLowerCase().startsWith(brandName.toLowerCase())
            ? `${title}. Fully backed by official Indian warranty.`
            : `${title} by ${brandName}. Fully backed by official Indian warranty.`),
        basePrice: Number(basePrice),
        mrp: Number(mrp),
        promotionalPrice: promotionalPrice > 0 ? Number(promotionalPrice) : undefined,
        hsnCode,
        gstRate: Number(gstRate),
        images: finalImages,
        isFeatured: initialProduct?.isFeatured || false,
        isActive: publishImmediately,
        warrantySummary,
        returnPolicy,
        highlights,
        specifications: specObj,
        seoTitle: seoTitle.trim() || `${title} - ANIL COMMUNICATION & ZEROX Pant Nagar`,
        seoDescription: seoDescription.trim() || shortDescription,
        rating: initialProduct?.rating || 4.8,
        reviewCount: initialProduct?.reviewCount || 1,
        variants: finalVariants,
        createdAt: initialProduct?.createdAt || new Date().toISOString(),
      };

      const endpoint = "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product.");

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-7 max-w-5xl mx-auto">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E8D5C5] pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2.5 rounded-full bg-[#FFFAF5] border border-[#E8D5C5] text-[#493129] hover:bg-[#FFDEC7] transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B597B]">
              {isEdit ? "Catalog Editor" : "New Catalog Entry"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#493129] tracking-tight">
              {isEdit ? `Edit "${title || initialProduct?.title}"` : "Add New Product"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit(false)}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-[#FFDEC7] hover:bg-[#E8D5C5] text-[#493129] text-xs font-bold flex items-center justify-center gap-2 border border-[#E8D5C5] shadow-xs transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save as Draft</span>
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit(true)}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-full bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Publish to Website</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form Body */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6 text-xs">
        {/* 1. BASIC INFORMATION */}
        <div className="bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E8D5C5]">
            <FileText className="w-4 h-4 text-[#8B597B]" />
            <h2 className="text-sm font-serif font-bold text-[#493129]">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[#493129] font-bold mb-1">
                Product Name <span className="text-[#C0393A]">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Realme 16 Pro 5G"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
              />
            </div>

            <div>
              <label className="block text-[#493129] font-bold mb-1">URL Handle / Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="realme-16-pro-5g"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none font-mono text-[11px] focus:border-[#8B597B]"
              />
            </div>

            <div>
              <label className="block text-[#493129] font-bold mb-1">Model Number</label>
              <input
                type="text"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                placeholder="RMX-3840"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[#493129] font-bold">Brand</label>
                <button
                  type="button"
                  onClick={() => setShowNewBrandInput(!showNewBrandInput)}
                  className="text-[11px] text-[#8b597b] font-semibold hover:underline"
                >
                  {showNewBrandInput ? "Select Existing" : "+ New Brand"}
                </button>
              </div>
              {showNewBrandInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="Enter brand name..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newBrandName.trim()) return;
                      const slugName = newBrandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                      const b: Brand = { id: `b-${slugName}`, name: newBrandName.trim(), slug: slugName, isFeatured: false };
                      setBrands([...brands, b]);
                      setBrandId(b.id);
                      setBrandName(b.name);
                      setShowNewBrandInput(false);
                      setNewBrandName("");
                    }}
                    className="px-3 py-2 rounded-xl bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] font-bold transition"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select
                  value={brandId}
                  onChange={(e) => {
                    setBrandId(e.target.value);
                    const b = brands.find((br) => br.id === e.target.value);
                    if (b) setBrandName(b.name);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[#493129] font-bold">Category</label>
                <button
                  type="button"
                  onClick={() => setShowNewCatInput(!showNewCatInput)}
                  className="text-[11px] text-[#8b597b] font-semibold hover:underline"
                >
                  {showNewCatInput ? "Select Existing" : "+ New Category"}
                </button>
              </div>
              {showNewCatInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Enter category name..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newCatName.trim()) return;
                      const slugName = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                      const c: Category = { id: `cat-${slugName}`, name: newCatName.trim(), slug: slugName, isActive: true };
                      setCategories([...categories, c]);
                      setCategoryId(c.id);
                      setCategoryName(c.name);
                      setShowNewCatInput(false);
                      setNewCatName("");
                    }}
                    className="px-3 py-2 rounded-xl bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] font-bold transition"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    const c = categories.find((cat) => cat.id === e.target.value);
                    if (c) setCategoryName(c.name);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#493129] font-bold mb-1">Short One-Line Summary</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="5G flagship with Sony OIS Camera, Snapdragon 7s Gen 2, and 67W SuperVOOC"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#493129] font-bold mb-1">Detailed Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide comprehensive details about design, display, battery life, processor..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
              />
            </div>
          </div>
        </div>

        {/* 2. PRICING & GST COMPLIANCE */}
        <div className="bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E8D5C5]">
            <DollarSign className="w-4 h-4 text-[#8B597B]" />
            <h2 className="text-sm font-serif font-bold text-[#493129]">
              Pricing & Customer MRP (Synchronized Instantly)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#493129] font-bold mb-1">
                Selling Price (₹) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={basePrice}
                onChange={(e) => handleBasePriceChange(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] font-mono font-bold text-sm focus:outline-none focus:border-[#8B597B]"
              />
              <span className="text-[10px] text-[#806D63] mt-1 block">
                Actual price customers pay at checkout
              </span>
            </div>

            <div>
              <label className="block text-[#493129] font-bold mb-1">
                Maximum Retail Price (MRP ₹)
              </label>
              <input
                type="number"
                min="0"
                value={mrp}
                onChange={(e) => handleMrpChange(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] font-mono focus:outline-none focus:border-[#8B597B]"
              />
              <span className="text-[10px] text-[#806D63] mt-1 block">
                Strike-through reference price
              </span>
            </div>

            <div>
              <label className="block text-[#493129] font-bold mb-1">Promotional Deal Price (₹)</label>
              <input
                type="number"
                min="0"
                value={promotionalPrice}
                onChange={(e) => setPromotionalPrice(Number(e.target.value))}
                placeholder="Optional flash sale price"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] font-mono focus:outline-none focus:border-[#8B597B]"
              />
            </div>

            <div>
              <label className="block text-[#493129] font-bold mb-1">HSN Code</label>
              <input
                type="text"
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] font-mono focus:outline-none focus:border-[#8B597B]"
              />
            </div>

            <div>
              <label className="block text-[#493129] font-bold mb-1">GST Tax Rate (%)</label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
              >
                <option value={18}>18% (Smartphones & Mobile Handsets)</option>
                <option value={12}>12% (Telecom Equipment)</option>
                <option value={28}>28% (Luxury Audio)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. MEDIA & PHOTOGRAPHS */}
        <div className="bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8D5C5]">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#8B597B]" />
              <h2 className="text-sm font-serif font-bold text-[#493129]">
                Product Photographs & Media
              </h2>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-1.5 rounded-full bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingImage ? "Uploading..." : "Upload Photo"}</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />

          <input
            ref={replaceFileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleReplaceImageUpload}
            className="hidden"
          />

          <div className="flex gap-2">
            <input
              type="text"
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              placeholder="Or paste external image URL (https://...)"
              className="flex-1 px-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
            />
            <button
              type="button"
              onClick={handleAddCustomImageUrl}
              className="px-4 py-2 rounded-xl bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] font-bold transition"
            >
              Add URL
            </button>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
              {images.map((imgUrl, i) => (
                <div
                  key={i}
                  className={`relative group bg-[#FFEDDB] border rounded-2xl p-2 aspect-square flex items-center justify-center overflow-hidden shadow-xs transition ${
                    i === 0 ? "border-[#8B597B] ring-2 ring-[#8B597B]/30" : "border-[#E8D5C5]"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Product preview ${i + 1}`}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => setPreviewImage(imgUrl)}
                  />
                  {i === 0 ? (
                    <span className="absolute top-1.5 left-1.5 bg-[#493129] text-[#FFEDDB] text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                      Main / Cover
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetMainImage(i)}
                      className="absolute top-1.5 left-1.5 p-1 bg-[#8B597B] text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm hover:scale-110"
                      title="Set as Main Product Image"
                    >
                      <Star className="w-3 h-3 fill-white" />
                    </button>
                  )}

                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(imgUrl)}
                      className="p-1 bg-[#493129] text-white rounded-full shadow-sm hover:scale-110"
                      title="Preview full image"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerReplaceImage(i)}
                      className="p-1 bg-[#B7791F] text-white rounded-full shadow-sm hover:scale-110"
                      title="Replace this image"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="p-1 bg-[#C0393A] text-white rounded-full shadow-sm hover:scale-110"
                      title="Delete image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-[#E8D5C5] rounded-2xl bg-[#F5E8DC]/50">
              <Upload className="w-8 h-8 text-[#8B597B] mx-auto mb-2 opacity-50" />
              <p className="text-xs text-[#806D63]">No custom photos uploaded yet.</p>
            </div>
          )}

          {/* Image Preview Modal */}
          {previewImage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#493129]/80 backdrop-blur-xs">
              <div className="relative max-w-2xl w-full max-h-[85vh] bg-[#FFFFFF] rounded-3xl p-6 flex flex-col items-center border border-[#E8D5C5]">
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-[#FFEDDB] text-[#493129] hover:bg-[#FFDEC7] transition"
                  title="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="font-serif text-sm font-bold text-[#493129] mb-4 self-start">Image Preview</h3>
                <div className="relative w-full h-[500px] flex items-center justify-center bg-[#FFFAF5] rounded-2xl p-4 border border-[#E8D5C5]">
                  <img src={previewImage} alt="Preview" className="max-w-full max-h-full object-contain" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. PRODUCT VARIANTS MATRIX */}
        <div className="bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8D5C5]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8B597B]" />
              <h2 className="text-sm font-serif font-bold text-[#493129]">
                Product Variants Matrix (Color, Storage, SKU, Stock)
              </h2>
            </div>
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-4 py-1.5 rounded-full bg-[#FFDEC7] hover:bg-[#efa3a0] text-[#493129] font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variant</span>
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div
                key={v.id || idx}
                className="p-4 rounded-2xl bg-[#F5E8DC] border border-[#E8D5C5] space-y-3"
              >
                <div className="flex justify-between items-center text-[11px] font-bold text-[#493129]">
                  <span>Variant #{idx + 1}</span>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="text-[#C0393A] hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#806D63] mb-1 font-semibold">Color</label>
                    <input
                      type="text"
                      value={v.color || ""}
                      onChange={(e) => handleVariantChange(idx, "color", e.target.value)}
                      placeholder="e.g. Midnight Black"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] text-xs focus:outline-none focus:border-[#8B597B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#806D63] mb-1 font-semibold">RAM / Storage</label>
                    <input
                      type="text"
                      value={v.storage || ""}
                      onChange={(e) => handleVariantChange(idx, "storage", e.target.value)}
                      placeholder="8GB / 256GB"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] text-xs focus:outline-none focus:border-[#8B597B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#806D63] mb-1 font-semibold">Price (₹)</label>
                    <input
                      type="number"
                      value={v.sellingPrice || basePrice}
                      onChange={(e) => handleVariantChange(idx, "sellingPrice", Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] font-mono font-bold text-xs focus:outline-none focus:border-[#8B597B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#806D63] mb-1 font-semibold">MRP (₹)</label>
                    <input
                      type="number"
                      value={v.mrp || mrp}
                      onChange={(e) => handleVariantChange(idx, "mrp", Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] font-mono text-xs focus:outline-none focus:border-[#8B597B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#806D63] mb-1 font-semibold">Stock Units</label>
                    <input
                      type="number"
                      min="0"
                      value={v.stockQuantity}
                      onChange={(e) => handleVariantChange(idx, "stockQuantity", Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] font-mono text-xs focus:outline-none focus:border-[#8B597B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#806D63] mb-1 font-semibold">SKU Code</label>
                    <input
                      type="text"
                      value={v.sku || ""}
                      onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] font-mono text-[10px] focus:outline-none focus:border-[#8B597B]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. HIGHLIGHTS & KEY SELLING POINTS */}
        <div className="bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E8D5C5]">
            <Sparkles className="w-4 h-4 text-[#8B597B]" />
            <h2 className="text-sm font-serif font-bold text-[#493129]">Key Selling Highlights</h2>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              placeholder="e.g. 50MP Sony IMX890 Camera with OIS"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
            />
            <button
              type="button"
              onClick={handleAddHighlight}
              className="px-5 py-2.5 rounded-xl bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] font-bold transition"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {highlights.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5E8DC] border border-[#E8D5C5] text-xs text-[#30241F]"
              >
                <span>• {h}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveHighlight(i)}
                  className="text-[#C0393A] hover:underline p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 6. SPECIFICATIONS TABLE */}
        <div className="bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E8D5C5]">
            <Tag className="w-4 h-4 text-[#8B597B]" />
            <h2 className="text-sm font-serif font-bold text-[#493129]">Technical Specifications</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newSpecKey}
              onChange={(e) => setNewSpecKey(e.target.value)}
              placeholder="Feature name (e.g. Battery Capacity)"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
            />
            <input
              type="text"
              value={newSpecValue}
              onChange={(e) => setNewSpecValue(e.target.value)}
              placeholder="Value (e.g. 5000 mAh Li-Po)"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
            />
            <button
              type="button"
              onClick={handleAddSpec}
              className="px-5 py-2.5 rounded-xl bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] font-bold transition"
            >
              Add Spec
            </button>
          </div>

          <div className="space-y-1.5 pt-1">
            {specs.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5E8DC] border border-[#E8D5C5] text-xs"
              >
                <div className="flex gap-4">
                  <span className="font-bold text-[#493129] w-36">{s.key}</span>
                  <span className="text-[#30241F]">{s.value}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSpec(i)}
                  className="text-[#C0393A] hover:underline p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 7. WARRANTY & POLICIES */}
        <div className="bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E8D5C5]">
            <ShieldCheck className="w-4 h-4 text-[#8B597B]" />
            <h2 className="text-sm font-serif font-bold text-[#493129]">Warranty & Return Policy</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#493129] font-bold mb-1">Warranty Summary</label>
              <input
                type="text"
                value={warrantySummary}
                onChange={(e) => setWarrantySummary(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
              />
            </div>
            <div>
              <label className="block text-[#493129] font-bold mb-1">Replacement & Return Terms</label>
              <input
                type="text"
                value={returnPolicy}
                onChange={(e) => setReturnPolicy(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON BAR */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#E8D5C5]">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit(false)}
            className="px-6 py-2.5 rounded-full bg-[#FFDEC7] hover:bg-[#efa3a0] text-[#493129] text-xs font-bold transition shadow-xs"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit(true)}
            className="px-7 py-2.5 rounded-full bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] text-xs font-bold transition shadow-sm"
          >
            Publish to Storefront
          </button>
        </div>
      </form>
    </div>
  );
}
