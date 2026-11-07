"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Order, OrderStatus } from "@/types";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: "confirmed", label: "Order Confirmed", desc: "Payment received & stock reserved" },
  { key: "processing", label: "Packed & Invoiced", desc: "GST tax invoice generated at warehouse" },
  { key: "shipped", label: "Handed to Courier", desc: "Dispatched from Bengaluru Hub" },
  { key: "out_for_delivery", label: "Out for Delivery", desc: "Courier partner is on the way" },
  { key: "delivered", label: "Delivered", desc: "Delivered safely with OTP verification" },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";

  const [orderQuery, setOrderQuery] = useState(initialOrderId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/reports`);
      const data = await res.json();
      const allOrders: Order[] = data.recentOrders || [];

      const found = allOrders.find(
        (o) =>
          o.orderNumber.toLowerCase() === query.trim().toLowerCase() ||
          o.customerPhone === query.trim() ||
          o.id === query.trim()
      );

      if (found) {
        setOrder(found);
      } else {
        setOrder(null);
        setError(`No order found matching "${query}". Please check your order ID or phone number.`);
      }
    } catch {
      setError("Failed to fetch order details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      fetchOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderQuery);
  };

  const getStepStatus = (stepKey: OrderStatus, currentStatus: OrderStatus) => {
    const orderRank: Record<OrderStatus, number> = {
      pending: 0,
      confirmed: 1,
      processing: 2,
      shipped: 3,
      out_for_delivery: 4,
      delivered: 5,
      cancelled: -1,
      returned: -1,
    };

    const currentRank = orderRank[currentStatus] || 1;
    const thisRank = orderRank[stepKey];

    if (currentRank > thisRank) return "completed";
    if (currentRank === thisRank) return "active";
    return "pending";
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Search Tracker Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Track Your Order
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Enter your Order Number (e.g. <strong className="font-mono text-slate-700">ORD-2026-94812</strong>) or registered phone number
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Enter Order # or 10-digit Phone"
                className="w-full pl-9 pr-3 py-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition"
            >
              {loading ? "Searching..." : "Track"}
            </button>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ORDER DETAILS & LIVE PROGRESS TIMELINE */}
        {order && (
          <div className="mt-8 space-y-6">
            {/* Status Header */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Information</span>
                <h2 className="text-xl font-bold text-slate-900 font-mono mt-0.5">#{order.orderNumber}</h2>
                <p className="text-xs text-slate-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  <Package className="w-3.5 h-3.5" />
                  <span>Status: {order.status.replace(/_/g, " ")}</span>
                </span>
                {order.trackingNumber && (
                  <p className="text-xs text-slate-500 mt-1 font-mono">AWB: {order.trackingNumber}</p>
                )}
              </div>
            </div>

            {/* Stepper Progress */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-8">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Live Shipment Timeline
              </h3>

              <div className="relative pl-6 sm:pl-8 space-y-8 border-l-2 border-slate-200 ml-4">
                {STATUS_STEPS.map((step, idx) => {
                  const state = getStepStatus(step.key, order.status);
                  const isCompleted = state === "completed";
                  const isActive = state === "active";

                  return (
                    <div key={idx} className="relative">
                      {/* Step Circle Marker */}
                      <div
                        className={`absolute -left-[31px] sm:-left-[39px] top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          isCompleted
                            ? "bg-emerald-600 text-white"
                            : isActive
                            ? "bg-blue-600 text-white ring-4 ring-blue-100"
                            : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div>
                        <h4
                          className={`text-sm font-bold ${
                            isCompleted || isActive ? "text-slate-900" : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items & Shipping Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ordered Products */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Items in this Package</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-xs border-b border-slate-100 pb-2">
                      {item.image && (
                        <img src={item.image} alt={item.productName} className="w-12 h-12 object-contain rounded-lg bg-slate-50 p-1 border" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{item.productName}</p>
                        <p className="text-slate-400">{item.variantDetails} • Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-slate-900">{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-between text-xs font-bold text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-blue-600">{formatCurrency(order.grandTotal)}</span>
                </div>
              </div>

              {/* Delivery Destination */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3 text-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Shipping Details</h3>
                <div className="space-y-1 text-slate-700">
                  <p className="font-bold text-sm text-slate-900">{order.customerName}</p>
                  <p>{order.shippingAddress.street}</p>
                  {order.shippingAddress.landmark && <p>Landmark: {order.shippingAddress.landmark}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  <p className="pt-2 text-slate-500 font-medium">Phone: +91 {order.customerPhone}</p>
                  <p className="text-slate-500">Email: {order.customerEmail}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Loading tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
