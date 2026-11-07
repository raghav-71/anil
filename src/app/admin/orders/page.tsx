"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Order, OrderStatus } from "@/types";
import {
  ShoppingBag,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  PackageCheck,
  AlertCircle,
} from "lucide-react";

export default function OrdersManagerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadOrders = () => {
    setLoading(true);
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.recentOrders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const tracking = prompt("Enter courier tracking number / AWB (Optional):");
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus, trackingNumber: tracking || o.trackingNumber } : o
    );
    setOrders(updated);
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchPhone = o.customerPhone.includes(q);
      if (!matchNum && !matchName && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Storefront Fulfillment</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
            Online Orders Dispatcher
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track web customer orders, assign delivery tracking, and manage fulfillment
          </p>
        </div>

        <div className="flex gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, customer name, phone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Order #</th>
                <th className="py-3 px-3">Customer Details</th>
                <th className="py-3 px-3">Items Summary</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Update Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-blue-400 block">#{ord.orderNumber}</span>
                    <span className="text-[10px] text-slate-500">{formatDate(ord.createdAt)}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-white block">{ord.customerName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">+91 {ord.customerPhone}</span>
                    <span className="text-[10px] text-slate-500 block truncate max-w-xs">
                      {ord.shippingAddress.city}, {ord.shippingAddress.state} - {ord.shippingAddress.pincode}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-200 block">{ord.items.length} items</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-xs block">
                      {ord.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-white block">{formatCurrency(ord.grandTotal)}</span>
                    <span className="text-[10px] uppercase font-semibold text-emerald-400">
                      {ord.paymentStatus} ({ord.paymentMethod})
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        ord.status === "delivered"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : ord.status === "shipped"
                          ? "bg-blue-950 text-blue-300 border border-blue-800"
                          : "bg-amber-950 text-amber-300 border border-amber-800"
                      }`}
                    >
                      {ord.status.replace("_", " ")}
                    </span>
                    {ord.trackingNumber && (
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">AWB: {ord.trackingNumber}</p>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <select
                      value={ord.status}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 text-slate-200 cursor-pointer"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

