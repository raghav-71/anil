"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, ShoppingBag, CreditCard, Banknote, Calendar, ArrowUpRight, RefreshCw, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function AdminSalesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSales = () => {
    setLoading(true);
    fetch("/api/orders", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadSales();
  }, []);

  const paidOrders = orders.filter((o) => o.paymentStatus === "paid" || o.status === "delivered");
  const totalRevenue = orders.reduce((acc, o) => acc + (o.grandTotal || 0), 0);
  const paidRevenue = paidOrders.reduce((acc, o) => acc + (o.grandTotal || 0), 0);
  const aov = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  const razorpayOrders = orders.filter((o) => o.paymentMethod === "razorpay");
  const codOrders = orders.filter((o) => o.paymentMethod === "cod" || !o.paymentMethod);

  const razorpayRevenue = razorpayOrders.reduce((acc, o) => acc + (o.grandTotal || 0), 0);
  const codRevenue = codOrders.reduce((acc, o) => acc + (o.grandTotal || 0), 0);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8b597b]">
            <TrendingUp className="w-4 h-4" />
            <span>Store Financial Performance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#493129] tracking-tight mt-1">
            Sales &amp; Revenue Analytics
          </h1>
          <p className="text-xs text-[#493129]/70 mt-0.5">
            Real-time transaction settlement, payment gateway metrics, and average order value.
          </p>
        </div>

        <button
          onClick={loadSales}
          className="p-2.5 rounded-full bg-[#fffaf5] border border-[#493129]/10 hover:bg-[#ffeedb] text-[#493129] transition shadow-xs self-start sm:self-auto"
          title="Refresh sales"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#fffaf5] border border-[#493129]/10 rounded-2xl p-5 shadow-xs space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b597b]">Gross Store Volume</span>
          <p className="text-2xl font-serif font-bold text-[#493129]">{formatCurrency(totalRevenue)}</p>
          <span className="text-[10px] text-[#493129]/60 block">{orders.length} total orders recorded</span>
        </div>

        <div className="bg-[#fffaf5] border border-[#493129]/10 rounded-2xl p-5 shadow-xs space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Settled Revenue</span>
          <p className="text-2xl font-serif font-bold text-emerald-800">{formatCurrency(paidRevenue)}</p>
          <span className="text-[10px] text-emerald-700/80 block">{paidOrders.length} payments collected</span>
        </div>

        <div className="bg-[#fffaf5] border border-[#493129]/10 rounded-2xl p-5 shadow-xs space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b597b]">Average Order Value</span>
          <p className="text-2xl font-serif font-bold text-[#493129]">{formatCurrency(aov)}</p>
          <span className="text-[10px] text-[#493129]/60 block">Per checkout transaction</span>
        </div>

        <div className="bg-[#fffaf5] border border-[#493129]/10 rounded-2xl p-5 shadow-xs space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b597b]">Est. Gross Profit</span>
          <p className="text-2xl font-serif font-bold text-[#493129]">{formatCurrency(Math.round(totalRevenue * 0.18))}</p>
          <span className="text-[10px] text-[#493129]/60 block">~18% blended margin</span>
        </div>
      </div>

      {/* Payment Channel Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#fffaf5] border border-[#493129]/10 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#8b597b]" />
              <h3 className="text-sm font-bold text-[#493129]">Razorpay Online Gateway</h3>
            </div>
            <span className="text-xs font-bold text-[#493129]">{razorpayOrders.length} orders</span>
          </div>
          <p className="text-xl font-serif font-bold text-[#493129]">{formatCurrency(razorpayRevenue)}</p>
          <div className="w-full bg-[#ffeedb] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#8b597b] h-full"
              style={{ width: `${totalRevenue > 0 ? (razorpayRevenue / totalRevenue) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-[#fffaf5] border border-[#493129]/10 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-[#8b597b]" />
              <h3 className="text-sm font-bold text-[#493129]">Cash on Delivery / In-Store</h3>
            </div>
            <span className="text-xs font-bold text-[#493129]">{codOrders.length} orders</span>
          </div>
          <p className="text-xl font-serif font-bold text-[#493129]">{formatCurrency(codRevenue)}</p>
          <div className="w-full bg-[#ffeedb] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#493129] h-full"
              style={{ width: `${totalRevenue > 0 ? (codRevenue / totalRevenue) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sales Transactions Table */}
      <div className="bg-[#fffaf5] border border-[#493129]/10 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#493129]/10 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#493129]">Recent Sales Orders</h3>
          <span className="text-xs text-[#8b597b] font-semibold">{orders.length} transactions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#ffeedb]/60 border-b border-[#493129]/10 text-[#493129] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Order #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#493129]/10">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#ffeedb]/30 transition">
                  <td className="p-4 font-mono font-bold text-[#493129]">{o.orderNumber || o.id}</td>
                  <td className="p-4 font-bold text-[#493129]">{o.customerName}</td>
                  <td className="p-4 uppercase text-[10px] font-semibold text-[#8b597b]">
                    {o.paymentMethod === "razorpay" ? "Razorpay Online" : "Cash on Delivery"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        o.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {o.paymentStatus || "pending"}
                    </span>
                  </td>
                  <td className="p-4 text-right font-serif font-bold text-[#493129]">{formatCurrency(o.grandTotal)}</td>
                  <td className="p-4 text-[#493129]/70 text-[11px]">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

