"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  Users,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

export default function AdminDashboardPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => {
        setReportData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !reportData) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading real-time business telemetry...
      </div>
    );
  }

  const { summary, monthlyRevenue, paymentData, recentInvoices, recentOrders } = reportData;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Store Performance Telemetry
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
            Executive Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time synchronization across physical counter and online storefront
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/admin/pos"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
          >
            <Layers className="w-4 h-4" />
            <span>Open POS Terminal</span>
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Revenue (POS + Web)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{formatCurrency(summary.totalRevenue)}</div>
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Synchronized across all sales channels
          </p>
        </div>

        {/* Gross Profit (Revenue - Real Purchase COGS) */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Gross Profit (Real COGS)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">{formatCurrency(summary.grossProfit)}</div>
          <p className="text-[11px] text-slate-400">
            Margin: <strong className="text-emerald-300">{summary.profitMargin}%</strong> (after product cost)
          </p>
        </div>

        {/* Total Stock Units */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Live Inventory Units</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{summary.totalStockUnits} Units</div>
          <p className="text-[11px] text-slate-400">
            Across {summary.totalProducts} catalog products
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Low & Out of Stock</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400">
            {summary.lowStockCount + summary.outOfStockCount} Items
          </div>
          <p className="text-[11px] text-amber-300/80">
            {summary.lowStockCount} low stock, {summary.outOfStockCount} sold out
          </p>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Revenue & Gross Profit Area Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">Monthly Revenue & Net Gross Profit</h3>
              <p className="text-xs text-slate-400 mt-0.5">Calculated using true supplier cost prices</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Revenue
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Gross Profit
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(val: any) => [formatCurrency(Number(val)), ""]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-white">Payment Method Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Counter POS & Online gateways</p>
          </div>

          <div className="space-y-3 pt-2">
            {paymentData.map((p: any) => {
              const pct = summary.totalRevenue > 0 ? ((p.value / summary.totalRevenue) * 100).toFixed(1) : 0;
              return (
                <div key={p.name} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-semibold">{p.name}</span>
                    <span>{formatCurrency(p.value)} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p>• Split payments are audited by session ID</p>
            <p>• Cash drawers are reconciled at shift close</p>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-white">Recent POS Counter Invoices</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time synchronized checkout entries</p>
          </div>
          <Link
            href="/admin/pos"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            + Create New Bill
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Items</th>
                <th className="py-2.5 px-3">Grand Total</th>
                <th className="py-2.5 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {recentInvoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono font-bold text-blue-400">{inv.invoiceNumber}</td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-white">{inv.customerName}</span>
                    <span className="block text-[10px] text-slate-500">{inv.customerPhone}</span>
                  </td>
                  <td className="py-3 px-3 uppercase text-[10px] font-bold text-slate-400">{inv.paymentMethod}</td>
                  <td className="py-3 px-3">{inv.items.length} items</td>
                  <td className="py-3 px-3 font-bold text-white">{formatCurrency(inv.grandTotal)}</td>
                  <td className="py-3 px-3 text-slate-500">{formatDate(inv.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

