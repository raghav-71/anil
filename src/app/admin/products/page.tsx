"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Product } from "@/types";
import {
  Smartphone,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  ExternalLink,
  Barcode,
  Layers,
  ArrowRight,
  Printer,
  X,
} from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Barcode Printing Modal State
  const [barcodeModalProduct, setBarcodeModalProduct] = useState<Product | null>(null);
  const [labelQuantity, setLabelQuantity] = useState(12);

  // Quick Edit Pricing & Stock Modal State
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editMrp, setEditMrp] = useState<number>(0);
  const [editCost, setEditCost] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  const [editIsActive, setEditIsActive] = useState<boolean>(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const openEditModal = (p: Product) => {
    setEditProduct(p);
    setEditPrice(p.basePrice || 0);
    setEditMrp(p.mrp || 0);
    const firstVar = p.variants[0];
    setEditCost(firstVar?.costPrice || 0);
    const totalStk = p.variants.reduce((acc, v) => acc + v.stockQuantity, 0);
    setEditStock(totalStk || 0);
    setEditIsActive(p.isActive);
  };

  const handleSaveEdit = async () => {
    if (!editProduct) return;
    setSavingEdit(true);
    try {
      const updatedVariants = editProduct.variants.map((v, i) => ({
        ...v,
        sellingPrice: editPrice,
        mrp: editMrp,
        costPrice: editCost,
        stockQuantity: i === 0 ? editStock : v.stockQuantity,
        isActive: editIsActive,
      }));

      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editProduct.id,
          basePrice: editPrice,
          mrp: editMrp,
          isActive: editIsActive,
          variants: updatedVariants,
        }),
      });

      if (res.ok) {
        setProducts(
          products.map((p) =>
            p.id === editProduct.id
              ? {
                  ...p,
                  basePrice: editPrice,
                  mrp: editMrp,
                  isActive: editIsActive,
                  variants: updatedVariants,
                }
              : p
          )
        );
        setEditProduct(null);
      } else {
        alert("Failed to update product");
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const loadProducts = () => {
    setLoading(true);
    fetch("/api/products?includeUnpublished=true")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setCategories(data.categories || []);
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
    const updatedStatus = !product.isActive;
    const res = await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product.id, isActive: updatedStatus }),
    });

    if (res.ok) {
      setProducts(products.map((p) => (p.id === product.id ? { ...p, isActive: updatedStatus } : p)));
    }
  };

  const filtered = products.filter((p) => {
    if (categoryFilter !== "all" && p.categoryId !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchBrand = p.brandName.toLowerCase().includes(q);
      const matchVariant = p.variants.some((v) => v.barcode.includes(q) || v.sku.toLowerCase().includes(q));
      if (!matchTitle && !matchBrand && !matchVariant) return false;
    }
    return true;
  });

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Inventory & Catalog</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
            Product Catalog Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage smartphones, accessories, variants, pricing, barcodes, and HSN tax codes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, brand, SKU or barcode..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
            >
              <option value="all">All Categories</option>
              {categories.length > 0 ? (
                categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="cat-smartphones">Smartphones</option>
                  <option value="cat-keypad">Keypad Phones</option>
                  <option value="cat-earbuds">Earbuds</option>
                  <option value="cat-neckbands">Neckbands</option>
                  <option value="cat-headphones">Headphones</option>
                  <option value="cat-chargers">Chargers & Cables</option>
                  <option value="cat-audio">Audio & Headphones</option>
                  <option value="cat-powerbanks">Power Banks</option>
                  <option value="cat-accessories">Cases & Protection</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Product Name & Category</th>
                <th className="py-3 px-3">Variants</th>
                <th className="py-3 px-3">Base Price / MRP</th>
                <th className="py-3 px-3">HSN Code & GST</th>
                <th className="py-3 px-3 text-center">Total Stock</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filtered.map((prod) => {
                const totalStock = prod.variants.reduce((acc, v) => acc + v.stockQuantity, 0);

                return (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="w-10 h-10 rounded-xl object-contain bg-slate-800 p-1 border border-slate-700 flex-shrink-0"
                        />
                        <div>
                          <span className="font-bold text-white block">{prod.title}</span>
                          <span className="text-[11px] text-slate-400">
                            {prod.brandName} • {prod.categoryName}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                        <Layers className="w-3 h-3 text-blue-400" />
                        <span>{prod.variants.length} Variants</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {prod.basePrice > 0 ? (
                        <>
                          <span className="font-bold text-white block">{formatCurrency(prod.basePrice)}</span>
                          {prod.mrp > prod.basePrice && (
                            <span className="text-slate-500 line-through text-[10px]">{formatCurrency(prod.mrp)}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-amber-400 font-sans font-medium text-[11px] block">Unset (Draft)</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <span className="text-blue-400 block">{prod.hsnCode}</span>
                      <span className="text-slate-500 font-sans text-[10px]">GST {prod.gstRate}%</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          totalStock === 0
                            ? "bg-red-950 text-red-300 border border-red-800"
                            : totalStock <= 5
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        }`}
                      >
                        {totalStock} Units
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggleActive(prod)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition ${
                          prod.isActive
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : prod.basePrice === 0
                            ? "bg-amber-950/60 text-amber-300 border border-amber-800"
                            : "bg-slate-800 text-slate-500 border border-slate-700"
                        }`}
                      >
                        {prod.isActive ? "Published" : prod.basePrice === 0 ? "Draft" : "Unpublished"}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 transition"
                          title="Edit Pricing & Stock"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setBarcodeModalProduct(prod)}
                          className="p-1.5 text-slate-400 hover:text-blue-400"
                          title="Print Barcode Labels"
                        >
                          <Barcode className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/product/${prod.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-white"
                          title="View on Storefront"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(prod.id, prod.title)}
                          className="p-1.5 text-slate-400 hover:text-red-400"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Barcode Sticker Label Sheet Modal */}
      {barcodeModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Barcode className="w-5 h-5 text-blue-400" />
                  <span>Print Barcode Sticker Sheet (24-up)</span>
                </h3>
                <p className="text-xs text-slate-400">{barcodeModalProduct.title}</p>
              </div>
              <button onClick={() => setBarcodeModalProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
              <span>Select Label Quantity:</span>
              <div className="flex gap-2">
                {[6, 12, 24].map((qty) => (
                  <button
                    key={qty}
                    onClick={() => setLabelQuantity(qty)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                      labelQuantity === qty ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {qty} Labels
                  </button>
                ))}
              </div>
            </div>

            {/* Printable Label Grid Preview */}
            <div className="max-h-96 overflow-y-auto bg-white rounded-2xl p-4 text-black font-sans">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[...Array(labelQuantity)].map((_, i) => {
                  const v = barcodeModalProduct.variants[0];
                  return (
                    <div
                      key={i}
                      className="border border-dashed border-gray-400 p-2.5 rounded-lg text-center space-y-1 bg-white shadow-2xs"
                    >
                      <div className="text-[9px] font-black tracking-wider uppercase text-gray-800">
                        ANIL COMMUNICATIONS
                      </div>
                      <div className="text-[10px] font-bold truncate leading-tight text-gray-900">
                        {barcodeModalProduct.title}
                      </div>
                      <div className="text-[8px] text-gray-600">
                        {[v?.color, v?.storage].filter(Boolean).join(" • ") || "Standard Edition"}
                      </div>
                      {/* Barcode Graphic Representation */}
                      <div className="py-0.5 flex justify-center">
                        <div className="font-mono text-xs tracking-widest font-black py-0.5 px-2 bg-gray-100 rounded border border-gray-300">
                          |||| ||| ||||| |||||
                        </div>
                      </div>
                      <div className="text-[9px] font-mono font-bold text-gray-700">{v?.barcode || "8901234567890"}</div>
                      <div className="text-[10px] font-black text-gray-900">
                        MRP: ₹{v?.mrp.toLocaleString("en-IN")} • SALE: ₹{v?.sellingPrice.toLocaleString("en-IN")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setBarcodeModalProduct(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close Preview
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print Sticker Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Edit Pricing & Stock Modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {editProduct.brandName} • {editProduct.categoryName}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{editProduct.title}</h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">HSN: {editProduct.hsnCode} • GST: {editProduct.gstRate}%</p>
              </div>
              <button onClick={() => setEditProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter selling price"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editMrp}
                    onChange={(e) => setEditMrp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter printed MRP"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cost / Purchase Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editCost}
                    onChange={(e) => setEditCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter unit cost"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Available Stock (Units)</label>
                  <input
                    type="number"
                    min="0"
                    value={editStock}
                    onChange={(e) => setEditStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-blue-500"
                    placeholder="Units in shop"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Publish on Storefront & POS</span>
                  <span className="text-[11px] text-slate-400">
                    When active, product will be visible to online customers and searchable in POS.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditProduct(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingEdit}
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {savingEdit ? "Saving Changes..." : "Save & Update Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
