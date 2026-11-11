"use client";

import React, { useState, useEffect } from "react";
import { FileSpreadsheet, Download, RefreshCw, Package, Receipt, IndianRupee, BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/orders", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/products?includeUnpublished=true", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([ordersData, productsData]) => {
        setOrders(ordersData.orders || []);
        setProducts(productsData.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalStockUnits = products.reduce(
    (acc, p) => acc + (p.variants || []).reduce((sum: number, v: any) => sum + (v.stockQuantity || 0), 0),
    0
  );

  const totalInventoryAssetValue = products.reduce(
    (acc, p) =>
      acc +
      (p.variants || []).reduce(
        (sum: number, v: any) => sum + (v.stockQuantity || 0) * (v.sellingPrice || p.basePrice || 0),
        0
      ),
    0
  );

  const totalSalesRevenue = orders.reduce((acc, o) => acc + (o.grandTotal || 0), 0);
  const estimatedGstCollected = Math.round((totalSalesRevenue * 18) / 118);

  const exportOrdersCSV = () => {
    if (orders.length === 0) return;
    const headers = ["Order Number", "Date", "Customer Name", "Phone", "Payment Method", "Status", "Amount (INR)"];
    const rows = orders.map((o) => [
      o.orderNumber || o.id,
      new Date(o.createdAt).toLocaleDateString("en-IN"),
      `"${o.customerName}"`,
      o.customerPhone,
      o.paymentMethod || "COD",
      o.status,
      o.grandTotal,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `anil_communications_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportInventoryCSV = () => {
    if (products.length === 0) return;
    const headers = ["Product ID", "Title", "Brand", "Category", "Variant", "SKU", "Stock", "Price (INR)"];
    const rows: string[][] = [];

    products.forEach((p) => {
      (p.variants || []).forEach((v: any) => {
        rows.push([
          p.id,
          `"${p.title}"`,
          p.brandName || "N/A",
          p.categoryName || "N/A",
          `"${v.color || ""} ${v.storage || ""}".trim()`,
          v.sku || "N/A",
          v.stockQuantity || 0,
          v.sellingPrice || p.basePrice || 0,
        ]);
      });
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `anil_communications_inventory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8b597b]">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Store Operations &amp; Tax Auditing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#493129] tracking-tight mt-1">
            Business &amp; Inventory Reports
          </h1>
          <p className="text-xs text-[#493129]/70 mt-0.5">
            Compliance exports, inventory valuation, GST tax summaries, and order ledger data.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-full bg-[#fffaf5] border border-[#493129]/10 hover:bg-[#ffeedb] text-[#493129] transition shadow-xs self-start sm:self-auto"
          title="Refresh reports data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inventory Report Card */}
        <div className="bg-[#fffaf5] border border-[#493129]/10 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8b597b]/10 text-[#8b597b] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#493129]">Stock &amp; Inventory Asset Valuation</h3>
              <p className="text-xs text-[#493129]/60">Complete audit of SKUs and current inventory value</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-[#493129]/10">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8b597b]">Total Physical Units</span>
              <p className="text-xl font-serif font-bold text-[#493129]">{totalStockUnits} units</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8b597b]">Asset Worth</span>
              <p className="text-xl font-serif font-bold text-[#493129]">{formatCurrency(totalInventoryAssetValue)}</p>
            </div>
          </div>

          <button
            onClick={exportInventoryCSV}
            className="w-full py-2.5 rounded-full bg-[#493129] hover:bg-[#38241e] text-[#ffeedb] text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Inventory Valuation CSV</span>
          </button>
        </div>

        {/* GST / Sales Tax Card */}
        <div className="bg-[#fffaf5] border border-[#493129]/10 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#493129]">Sales Ledger &amp; GST Audit</h3>
              <p className="text-xs text-[#493129]/60">Indian GST tax breakdown (18% rate) and ledger records</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-[#493129]/10">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700">Gross Sales Volume</span>
              <p className="text-xl font-serif font-bold text-[#493129]">{formatCurrency(totalSalesRevenue)}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700">Estimated 18% GST</span>
              <p className="text-xl font-serif font-bold text-emerald-800">{formatCurrency(estimatedGstCollected)}</p>
            </div>
          </div>

          <button
            onClick={exportOrdersCSV}
            className="w-full py-2.5 rounded-full bg-[#493129] hover:bg-[#38241e] text-[#ffeedb] text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Orders Ledger &amp; Tax CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}

