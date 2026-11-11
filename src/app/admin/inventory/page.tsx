"use client";

import React, { useState, useEffect } from "react";

export const dynamic = "force-dynamic";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Search,
  Plus,
  AlertTriangle,
  X,
  Package,
  Layers,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
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
    fetch("/api/inventory", { cache: "no-store" })
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
          performedBy: "Shop Owner",
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
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E8D5C5] pb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B597B]">
            Inventory Control
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#493129] tracking-tight mt-0.5">
            Inventory & Stock
          </h1>
          <p className="text-xs text-[#806D63] mt-1">
            Real-time stock ledger synchronized across online storefront and product catalogue
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2.5 rounded-full bg-[#FFFAF5] border border-[#E8D5C5] hover:bg-[#FFDEC7] text-[#493129] transition shadow-xs"
            title="Refresh stock"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Tab switch */}
          <div className="flex gap-1 bg-[#FFFAF5] p-1 rounded-full border border-[#E8D5C5] text-xs font-semibold shadow-xs">
            <button
              onClick={() => setActiveTab("stock")}
              className={`px-4 py-1.5 rounded-full transition ${
                activeTab === "stock"
                  ? "bg-[#493129] text-[#FFEDDB] shadow-xs"
                  : "text-[#806D63] hover:text-[#493129]"
              }`}
            >
              Current Stock ({inventory.length})
            </button>
            <button
              onClick={() => setActiveTab("movements")}
              className={`px-4 py-1.5 rounded-full transition ${
                activeTab === "movements"
                  ? "bg-[#493129] text-[#FFEDDB] shadow-xs"
                  : "text-[#806D63] hover:text-[#493129]"
              }`}
            >
              Audit Trail ({movements.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === "stock" ? (
        /* CURRENT STOCK VIEW */
        <div className="bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#806D63]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, SKU, or scan barcode..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#FFFFFF] border border-[#E8D5C5] text-xs text-[#30241F] placeholder-[#806D63]/60 focus:outline-none focus:border-[#8B597B]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-[#806D63] border-b border-[#E8D5C5]">
                <tr>
                  <th className="py-3 px-3">Product & Variant</th>
                  <th className="py-3 px-3">Barcode / SKU</th>
                  <th className="py-3 px-3">Selling Price</th>
                  <th className="py-3 px-3 text-center">Available Stock</th>
                  <th className="py-3 px-3">Valuation</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D5C5] text-[#30241F]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#806D63] italic font-serif">
                      Loading inventory records...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#806D63] italic font-serif">
                      No stock records matched your query.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.variantId} className="hover:bg-[#F5E8DC]/40 transition">
                      <td className="py-3 px-3">
                        <span className="font-bold text-[#493129] block">{item.productTitle}</span>
                        <span className="text-[11px] text-[#806D63]">
                          {item.brandName} • {item.variantName}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <span className="text-[#493129] block">{item.barcode}</span>
                        <span className="text-[#806D63]">{item.sku}</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-[#493129]">{formatCurrency(item.sellingPrice)}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            item.isOutOfStock
                              ? "bg-[#C0393A]/10 text-[#C0393A] border border-[#C0393A]/30"
                              : item.isLowStock
                              ? "bg-[#B7791F]/10 text-[#B7791F] border border-[#B7791F]/30"
                              : "bg-[#27845A]/10 text-[#27845A] border border-[#27845A]/30"
                          }`}
                        >
                          {item.stockQuantity} Units
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-[#8B597B]">{formatCurrency(item.stockValue)}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedVariant(item);
                            setShowModal(true);
                          }}
                          className="px-3.5 py-1.5 bg-[#FFDEC7] hover:bg-[#E8D5C5] text-[#493129] text-xs font-bold rounded-full border border-[#E8D5C5] transition shadow-xs"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* AUDIT MOVEMENTS VIEW */
        <div className="bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-[#806D63] border-b border-[#E8D5C5]">
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
              <tbody className="divide-y divide-[#E8D5C5] text-[#30241F]">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-[#F5E8DC]/40 transition">
                    <td className="py-3 px-3 text-[#806D63] whitespace-nowrap">{formatDate(m.createdAt)}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#493129] block">{m.productName}</span>
                      <span className="text-[11px] text-[#806D63]">{m.variantTitle}</span>
                    </td>
                    <td className="py-3 px-3 uppercase text-[10px] font-bold text-[#8B597B]">
                      {m.movementType.replace("_", " ")}
                    </td>
                    <td className="py-3 px-3 font-bold font-mono">
                      <span className={m.quantityChange > 0 ? "text-[#27845A]" : "text-[#C0393A]"}>
                        {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-[#493129]">{m.newQuantity} Units</td>
                    <td className="py-3 px-3 text-[#806D63] text-[11px] max-w-xs truncate">{m.notes || "N/A"}</td>
                    <td className="py-3 px-3 text-[#30241F] font-medium">{m.performedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Stock Inward & Adjustment */}
      {showModal && selectedVariant && (
        <div className="fixed inset-0 z-50 bg-[#493129]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-start border-b border-[#E8D5C5] pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-[#493129]">
                  Manual Stock Adjustment
                </h3>
                <p className="text-xs text-[#806D63] mt-0.5">
                  {selectedVariant.productTitle} ({selectedVariant.variantName})
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#806D63] hover:text-[#493129] p-1 rounded-full hover:bg-[#FFDEC7] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#493129] block mb-1">Adjustment Type</label>
                <select
                  value={adjustType}
                  onChange={(e: any) => setAdjustType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
                >
                  <option value="adjustment_add">Stock Inward (+) Add Units</option>
                  <option value="adjustment_reduce">Stock Outward (-) Correction</option>
                  <option value="damage">Damaged / Broken Unit Write-off</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#493129] block mb-1">Quantity of Units</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] font-mono font-bold focus:outline-none focus:border-[#8B597B]"
                />
              </div>

              <div>
                <label className="font-bold text-[#493129] block mb-1">Reason / Notes *</label>
                <input
                  type="text"
                  required
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Physical inventory count verified"
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-full bg-[#FFDEC7] hover:bg-[#E8D5C5] border border-[#E8D5C5] text-[#493129] text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-full bg-[#493129] hover:bg-[#8B597B] disabled:opacity-50 text-[#FFEDDB] text-xs font-bold transition shadow-sm"
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
