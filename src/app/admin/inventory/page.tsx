"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  History,
  RotateCcw,
  CheckCircle2,
  X,
  FileSpreadsheet,
} from "lucide-react";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"stock" | "movements">("stock");

  // Adjustment Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<"adjustment_add" | "adjustment_reduce" | "damage">("adjustment_add");
  const [adjustNotes, setAdjustNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    setLoading(true);
    fetch("/api/inventory")
      .then((res) => res.json())
      .then((data) => {
        setInventory(data.inventoryList || []);
        setMovements(data.movements || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;
    setIsSubmitting(true);

    try {
      const qtyChange = adjustType === "adjustment_add" ? Math.abs(adjustQty) : -Math.abs(adjustQty);
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: selectedVariant.variantId,
          quantityChange: qtyChange,
          type: adjustType,
          notes: adjustNotes || "Manual stock adjustment",
          performedBy: "Admin",
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "Adjustment failed");
      } else {
        setShowModal(false);
        setAdjustNotes("");
        setAdjustQty(1);
        loadData();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = inventory.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.productTitle.toLowerCase().includes(q) ||
      item.brandName.toLowerCase().includes(q) ||
      item.barcode.includes(q) ||
      item.sku.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Inventory Management</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
            Live Stock & Audit Movements
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock ledger synchronized across online storefront and supermarket POS counter
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("stock")}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === "stock" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            Current Stock ({inventory.length})
          </button>
          <button
            onClick={() => setActiveTab("movements")}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === "movements" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            Stock Movement History ({movements.length})
          </button>
        </div>
      </div>

      {activeTab === "stock" ? (
        /* CURRENT STOCK VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, SKU, or scan barcode..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Product & Variant</th>
                  <th className="py-3 px-3">Barcode / SKU</th>
                  <th className="py-3 px-3">Cost Price</th>
                  <th className="py-3 px-3">Selling Price</th>
                  <th className="py-3 px-3 text-center">Available Stock</th>
                  <th className="py-3 px-3">Valuation</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredItems.map((item) => (
                  <tr key={item.variantId} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <span className="font-bold text-white block">{item.productTitle}</span>
                      <span className="text-[11px] text-slate-400">
                        {item.brandName} • {item.variantName}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <span className="text-slate-300 block">{item.barcode}</span>
                      <span className="text-slate-500">{item.sku}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-400">{formatCurrency(item.costPrice)}</td>
                    <td className="py-3 px-3 font-bold text-white">{formatCurrency(item.sellingPrice)}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          item.isOutOfStock
                            ? "bg-red-950 text-red-300 border border-red-800"
                            : item.isLowStock
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        }`}
                      >
                        {item.stockQuantity} Units
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-200">{formatCurrency(item.stockValue)}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedVariant(item);
                          setShowModal(true);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold rounded-lg border border-slate-700 transition"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* AUDIT MOVEMENTS VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Change</th>
                  <th className="py-3 px-3">Balance Stock</th>
                  <th className="py-3 px-3">Reference / Notes</th>
                  <th className="py-3 px-3">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{formatDate(m.createdAt)}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-white block">{m.productName}</span>
                      <span className="text-[11px] text-slate-400">{m.variantTitle}</span>
                    </td>
                    <td className="py-3 px-3 uppercase text-[10px] font-bold text-blue-400">
                      {m.movementType.replace("_", " ")}
                    </td>
                    <td className="py-3 px-3 font-bold font-mono">
                      <span className={m.quantityChange > 0 ? "text-emerald-400" : "text-red-400"}>
                        {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">{m.newQuantity} Units</td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs truncate">{m.notes || "N/A"}</td>
                    <td className="py-3 px-3 text-slate-300">{m.performedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Stock Inward & Adjustment */}
      {showModal && selectedVariant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white">Manual Stock Adjustment</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedVariant.productTitle} ({selectedVariant.variantName})</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Adjustment Type</label>
                <select
                  value={adjustType}
                  onChange={(e: any) => setAdjustType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="adjustment_add">Stock Inward (+) Add Units</option>
                  <option value="adjustment_reduce">Stock Outward (-) Correction</option>
                  <option value="damage">Damaged / Broken Unit Write-off</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Quantity of Units</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Reason / Reference Notes *</label>
                <input
                  type="text"
                  required
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Physical inventory count discrepancy or sample display"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold"
                >
                  {isSubmitting ? "Updating..." : "Confirm & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

