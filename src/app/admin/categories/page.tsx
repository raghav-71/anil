"use client";

import React, { useState, useEffect } from "react";
import { FolderTree, Plus, Search, CheckCircle2, XCircle, Tag, Layers, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  productCount: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCategories = () => {
    setLoading(true);
    fetch("/api/products?includeUnpublished=true", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const cats = data.categories || [];
        const prods = data.products || [];

        const enriched: CategoryItem[] = cats.map((c: any) => {
          const count = prods.filter(
            (p: any) => p.categoryId === c.id || p.categoryName?.toLowerCase() === c.name?.toLowerCase()
          ).length;
          return {
            id: c.id,
            name: c.name,
            slug: c.slug || c.id,
            description: c.description || `${c.name} department for Anil Communications`,
            isActive: c.isActive !== false,
            productCount: count,
          };
        });

        setCategories(enriched);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setSaving(true);
    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newCat: CategoryItem = {
      id: `cat-${slug}-${Date.now()}`,
      name: newCatName.trim(),
      slug,
      description: newCatDesc.trim() || `${newCatName.trim()} department`,
      isActive: true,
      productCount: 0,
    };

    setCategories((prev) => [...prev, newCat]);
    setNewCatName("");
    setNewCatDesc("");
    setShowAddModal(false);
    setSaving(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8b597b]">
            <FolderTree className="w-4 h-4" />
            <span>Store Catalog Structure</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#493129] tracking-tight mt-1">
            Product Categories
          </h1>
          <p className="text-xs text-[#493129]/70 mt-0.5">
            Manage product departments, category visibility, and storefront classification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCategories}
            className="p-2.5 rounded-full bg-[#fffaf5] border border-[#493129]/10 hover:bg-[#ffeedb] text-[#493129] transition shadow-xs"
            title="Refresh categories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-full bg-[#493129] hover:bg-[#38241e] text-[#ffeedb] text-xs font-bold flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#fffaf5] border border-[#493129]/10 rounded-2xl p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#493129]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-[#ffeedb]/50 border border-[#493129]/10 text-xs text-[#493129] placeholder-[#493129]/40 focus:outline-none focus:ring-1 focus:ring-[#8b597b]"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#493129]/60">Loading store categories...</div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-12 bg-[#fffaf5] border border-[#493129]/10 rounded-2xl text-center space-y-2">
          <FolderTree className="w-8 h-8 text-[#493129]/30 mx-auto" />
          <p className="text-sm font-semibold text-[#493129]">No categories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-[#fffaf5] border border-[#493129]/10 rounded-2xl p-5 shadow-xs hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#8b597b]/10 text-[#8b597b] flex items-center justify-center font-bold">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#493129]">{cat.name}</h3>
                    <span className="text-[10px] text-[#493129]/50 font-mono">/{cat.slug}</span>
                  </div>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    cat.isActive ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {cat.isActive ? "Active" : "Hidden"}
                </span>
              </div>

              <p className="text-xs text-[#493129]/70 line-clamp-2">{cat.description}</p>

              <div className="pt-2 border-t border-[#493129]/10 flex items-center justify-between text-xs text-[#493129]/70">
                <span className="flex items-center gap-1.5 font-medium">
                  <Layers className="w-3.5 h-3.5 text-[#8b597b]" />
                  <span>{cat.productCount} Products</span>
                </span>
                <span className="text-[10px] text-[#8b597b] font-bold">Live in Store</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fffaf5] border border-[#493129]/15 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#493129]">Create Store Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#493129] block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Smart Watches"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#ffeedb]/50 border border-[#493129]/15 text-[#493129] focus:outline-none focus:ring-1 focus:ring-[#8b597b]"
                />
              </div>

              <div>
                <label className="font-bold text-[#493129] block mb-1">Description (Optional)</label>
                <textarea
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  rows={2}
                  placeholder="Brief description for storefront filter"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#ffeedb]/50 border border-[#493129]/15 text-[#493129] focus:outline-none focus:ring-1 focus:ring-[#8b597b]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full border border-[#493129]/20 text-[#493129] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-full bg-[#493129] text-[#ffeedb] font-bold"
                >
                  {saving ? "Saving..." : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

