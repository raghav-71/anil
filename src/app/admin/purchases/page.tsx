"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Truck, Plus, Search, FileText, CheckCircle2, X } from "lucide-react";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Purchase Form
  const [form, setForm] = useState({
    supplierName: "Apex Mobile Distributors Pvt Ltd",
    supplierId: "sup-1",
    invoiceNo: "",
    variantId: "",
    quantity: 5,
    unitCost: 50000,
    notes: "",
  });

  const loadData = () => {
    setLoading(true);
    fetch("/api/products?includeUnpublished=true")
      .then((res) => res.json())
      .then((d) => setProducts(d.products || []));

    // Preset mock purchases
    setPurchases([
      {
        id: "pur-1",
        supplierName: "Apex Mobile Distributors Pvt Ltd",
        purchaseInvoiceNo: "APX-INV-9021",
        purchaseDate: "2026-11-01",
        grandTotal: 604160,
        itemsCount: 1,
        paymentStatus: "paid",
        notes: "Stock refill for Apple iPhone 16 Pro Max",
      },
      {
        id: "pur-2",
        supplierName: "Prime Accessories Wholesale Hub",
        purchaseInvoiceNo: "PRM-BILL-4412",
        purchaseDate: "2026-10-25",
        grandTotal: 98000,
        itemsCount: 2,
        paymentStatus: "paid",
        notes: "20W Adapters & Anker 20,000mAh Power Banks",
      },
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.invoiceNo || !form.variantId) {
      alert("Please enter invoice number and select a product variant.");
      return;
    }

    const total = form.quantity * form.unitCost * 1.18; // with 18% GST

    const newEntry = {
      id: `pur-${Date.now()}`,
      supplierName: form.supplierName,
      purchaseInvoiceNo: form.invoiceNo,
      purchaseDate: new Date().toISOString().slice(0, 10),
      grandTotal: total,
      itemsCount: 1,
      paymentStatus: "paid",
      notes: form.notes || "Inward stock purchase",
    };

    setPurchases([newEntry, ...purchases]);
    setShowModal(false);
    alert(`Purchase #${form.invoiceNo} recorded successfully! Stock increased by ${form.quantity} units.`);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Procurement & PO</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
            Supplier Purchases & Inward Stock
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Record supplier bills to automatically increment physical inventory and compute gross margins
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Bill</span>
        </button>
      </div>

      {/* Purchases List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Bill / Invoice #</th>
                <th className="py-3 px-3">Supplier Name</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Bill Total</th>
                <th className="py-3 px-3">Payment Status</th>
                <th className="py-3 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono font-bold text-blue-400">{p.purchaseInvoiceNo}</td>
                  <td className="py-3 px-3 font-semibold text-white">{p.supplierName}</td>
                  <td className="py-3 px-3 text-slate-400">{p.purchaseDate}</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">{formatCurrency(p.grandTotal)}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px]">{p.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Record New Purchase */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Record Inward Purchase Bill</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPurchase} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Supplier *</label>
                <select
                  value={form.supplierName}
                  onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="Apex Mobile Distributors Pvt Ltd">Apex Mobile Distributors Pvt Ltd</option>
                  <option value="Prime Accessories Wholesale Hub">Prime Accessories Wholesale Hub</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Supplier Invoice Number *</label>
                <input
                  type="text"
                  required
                  value={form.invoiceNo}
                  onChange={(e) => setForm({ ...form, invoiceNo: e.target.value.toUpperCase() })}
                  placeholder="e.g. APX-INV-9942"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Product Variant *</label>
                <select
                  value={form.variantId}
                  onChange={(e) => setForm({ ...form, variantId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="">Select Variant</option>
                  {products.flatMap((p) =>
                    p.variants.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {p.title} - {v.color || ""} {v.storage || ""} (Cost: ₹{v.costPrice})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Quantity Inward *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Unit Cost (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.unitCost}
                    onChange={(e) => setForm({ ...form, unitCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. Bulk discount applied"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Save & Inward Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

