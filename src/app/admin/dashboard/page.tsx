"use client";

import React, { useState, useEffect } from "react";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Plus,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface DashboardSummary {
  todaySales: number;
  totalRevenue: number;
  cogs: number;
  grossProfit: number;
  profitMargin: string;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalStockUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  profit: number;
}

interface PaymentItem {
  name: string;
  value: number;
}

interface DashboardData {
  summary: DashboardSummary;
  monthlyRevenue: MonthlyData[];
  paymentData: PaymentItem[];
  recentOrders: any[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch("/api/admin/dashboard", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        return res.json();
      })
      .then((d: DashboardData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      fetch("/api/admin/dashboard", { cache: "no-store" })
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((d: DashboardData | null) => {
          if (d?.summary) setData(d);
        })
        .catch(() => {});
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 sm:p-12 text-center text-[#493129]/70 space-y-3">
        <div className="w-10 h-10 border-3 border-[#8b597b] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-serif italic text-sm">Loading live store telemetry & catalog metrics...</p>
      </div>
    );
  }

  const { summary, monthlyRevenue, paymentData, recentOrders } = data;

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E8D5C5] pb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B597B]">
            Owner Control Center
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#493129] tracking-tight mt-0.5">
            Store Dashboard
          </h1>
          <p className="text-xs text-[#806D63] mt-1">
            Real-time synchronization across 38 original catalog items, inventory stock, and customer shipments
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2.5 rounded-full bg-[#FFFAF5] border border-[#E8D5C5] hover:bg-[#FFDEC7] text-[#493129] transition shadow-xs"
            title="Refresh metrics"
            aria-label="Refresh metrics"
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

      {/* KPI METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Genuine Revenue */}
        <div className="p-5 rounded-2xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#806D63]">
            <span className="text-xs font-semibold">Total Online Revenue</span>
            <div className="w-8 h-8 rounded-full bg-[#FFDEC7] text-[#493129] flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#493129]">
            {formatCurrency(summary.totalRevenue)}
          </div>
          <p className="text-[11px] text-[#8B597B] font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {summary.totalOrders} total genuine online orders
          </p>
        </div>

        {/* Gross Profit Margin */}
        <div className="p-5 rounded-2xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#806D63]">
            <span className="text-xs font-semibold">Gross Profit (COGS)</span>
            <div className="w-8 h-8 rounded-full bg-[#8B597B]/15 text-[#8B597B] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#493129]">
            {formatCurrency(summary.grossProfit)}
          </div>
          <p className="text-[11px] text-[#806D63]">
            Gross Margin: <strong className="text-[#8B597B]">{summary.profitMargin}%</strong>
          </p>
        </div>

        {/* Live Inventory Units */}
        <div className="p-5 rounded-2xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#806D63]">
            <span className="text-xs font-semibold">Live Inventory Units</span>
            <div className="w-8 h-8 rounded-full bg-[#FFDEC7] text-[#493129] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#493129]">
            {summary.totalStockUnits} Units
          </div>
          <p className="text-[11px] text-[#806D63]">
            Across {summary.totalProducts} verified catalog products
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-2xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#806D63]">
            <span className="text-xs font-semibold">Low & Out of Stock</span>
            <div className="w-8 h-8 rounded-full bg-[#B7791F]/15 text-[#B7791F] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#B7791F]">
            {summary.lowStockCount + summary.outOfStockCount} Items
          </div>
          <p className="text-[11px] text-[#B7791F]">
            {summary.lowStockCount} low stock, {summary.outOfStockCount} sold out
          </p>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Revenue & Gross Profit Area Chart */}
        <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-[#493129]">
                Monthly Sales & Revenue Growth
              </h3>
              <p className="text-xs text-[#806D63] mt-0.5">
                Authentic paid e-commerce order revenue over time
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-[#493129]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#493129]" /> Revenue
              </span>
              <span className="flex items-center gap-1.5 text-[#8B597B]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8B597B]" /> Gross Profit
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#493129" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#493129" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B597B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B597B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8D5C5" />
                <XAxis dataKey="month" stroke="#806D63" fontSize={11} />
                <YAxis stroke="#806D63" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFAF5",
                    borderColor: "#E8D5C5",
                    borderRadius: "16px",
                    fontSize: "12px",
                    color: "#30241F",
                    boxShadow: "0 4px 12px rgba(73, 49, 41, 0.08)",
                  }}
                  formatter={(val: any) => [formatCurrency(Number(val)), ""]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#493129" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" stroke="#8B597B" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-xs space-y-4">
          <div>
            <h3 className="font-serif font-bold text-base text-[#493129]">Payment Channels</h3>
            <p className="text-xs text-[#806D63] mt-0.5">Customer payment mode distribution</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {paymentData.map((p) => {
              const pct = summary.totalRevenue > 0 ? ((p.value / summary.totalRevenue) * 100).toFixed(1) : "0";
              return (
                <div key={p.name} className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#493129]">
                    <span className="font-semibold">{p.name}</span>
                    <span className="font-medium text-[#806D63]">
                      {formatCurrency(p.value)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#FFDEC7] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#8B597B] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(Number(pct), 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#E8D5C5] text-[11px] text-[#806D63] space-y-1.5">
            <p className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#27845A] flex-shrink-0" />
              <span>Razorpay & UPI Instant Settlement active</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#8B597B] flex-shrink-0" />
              <span>Inventory auto-decremented on confirmed order</span>
            </p>
          </div>
        </div>
      </div>

      {/* RECENT ONLINE ORDERS TABLE */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-[#493129]">
              Recent Customer Orders
            </h3>
            <p className="text-xs text-[#806D63] mt-0.5">
              Real-time online orders and fulfillment pipeline
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#8B597B] hover:text-[#493129] transition flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-[#806D63] border-b border-[#E8D5C5]">
              <tr>
                <th className="py-2.5 px-3">Order #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Items</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Total Amount</th>
                <th className="py-2.5 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D5C5] text-[#30241F]">
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-[#F5E8DC]/50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-[#8B597B]">
                      {ord.orderNumber || ord.id}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold block text-[#493129]">{ord.customerName}</span>
                      <span className="text-[10px] text-[#806D63]">
                        {ord.shippingAddress?.phone || ord.customerPhone}
                      </span>
                    </td>
                    <td className="py-3 px-3 uppercase text-[10px] font-bold text-[#806D63]">
                      {ord.paymentMethod}
                    </td>
                    <td className="py-3 px-3">{ord.items?.length || 1} items</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          ord.status === "delivered"
                            ? "bg-[#27845A]/10 text-[#27845A] border border-[#27845A]/30"
                            : ord.status === "cancelled"
                            ? "bg-[#C0393A]/10 text-[#C0393A] border border-[#C0393A]/30"
                            : ord.status === "shipped"
                            ? "bg-[#8B597B]/10 text-[#8B597B] border border-[#8B597B]/30"
                            : "bg-[#FFDEC7] text-[#493129] border border-[#E8D5C5]"
                        }`}
                      >
                        {ord.status || "confirmed"}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-[#493129]">{formatCurrency(ord.grandTotal)}</td>
                    <td className="py-3 px-3 text-[#806D63]">{formatDate(ord.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#806D63] italic font-serif">
                    No customer orders placed yet. Orders will appear here in real time as customers checkout.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
