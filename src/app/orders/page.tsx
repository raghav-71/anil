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
  AlertCircle,
  FileText,
} from "lucide-react";

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: "confirmed", label: "Consignment Confirmed", desc: "Order reserved & payment settled" },
  { key: "processing", label: "Inspected & Packed", desc: "GST tax invoice sealed at boutique warehouse" },
  { key: "shipped", label: "In Transit", desc: "Handed over to premium insured courier partner" },
  { key: "out_for_delivery", label: "Out For Delivery", desc: "Arriving with designated delivery associate" },
  { key: "delivered", label: "Delivered", desc: "Successfully delivered with client verification" },
];

function OrdersContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";

  const [orderQuery, setOrderQuery] = useState(initialOrderId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

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
        setError(`No consignment found matching "${query}". Please check your Order ID.`);
      }
    } catch {
      setError("Unable to retrieve order details. Please try again.");
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
    <div className="flex flex-col min-h-screen bg-[#ffeedb]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        {/* Search Consignment Box */}
        <div className="bg-[#fffaf5] rounded-3xl p-8 sm:p-12 border border-[#493129]/10 shadow-subtle space-y-6">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8b597b]">
              Client Services
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#493129]">
              Consignment Tracking
            </h1>
            <p className="text-xs text-[#493129]/70 leading-relaxed font-sans">
              Enter your Order Number (e.g. <strong className="font-mono text-[#493129]">ORD-2026-94812</strong>) or registered phone number.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#493129]/40" />
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Order # or 10-digit phone"
                className="w-full pl-8 pr-3 py-3 text-xs rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#efa3a0] hover:bg-[#e58e8b] disabled:opacity-50 text-[#493129] text-xs font-semibold rounded-full shadow-coral transition"
            >
              {loading ? "Searching..." : "Track"}
            </button>
          </form>

          {error && (
            <div className="p-3 bg-[#ffdec7]/50 border border-[#ffdec7] text-[#493129] text-xs rounded-2xl flex items-center gap-2 max-w-md mx-auto">
              <AlertCircle className="w-4 h-4 text-[#8b597b] flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Consignment Live Details */}
        {order && (
          <div className="mt-10 space-y-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b597b]">Consignment Reference</span>
                <h2 className="font-serif text-2xl text-[#493129] mt-0.5">#{order.orderNumber}</h2>
                <p className="text-xs text-[#493129]/60 mt-1">Confirmed on {formatDate(order.createdAt)}</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ffdec7] text-[#493129] uppercase">
                  <Package className="w-3.5 h-3.5 text-[#8b597b]" />
                  <span>{order.status.replace(/_/g, " ")}</span>
                </span>
                {order.trackingNumber && (
                  <p className="text-[11px] text-[#8b597b] font-mono mt-1">Airway Bill: {order.trackingNumber}</p>
                )}
              </div>
            </div>

            {/* Stepper */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle space-y-8">
              <h3 className="font-serif text-xl text-[#493129]">Milestone Timeline</h3>

              <div className="relative pl-8 sm:pl-10 space-y-8 border-l-2 border-[#ffdec7] ml-4">
                {STATUS_STEPS.map((step, idx) => {
                  const state = getStepStatus(step.key, order.status);
                  const isCompleted = state === "completed";
                  const isActive = state === "active";

                  return (
                    <div key={idx} className="relative">
                      <div
                        className={`absolute -left-[41px] sm:-left-[49px] top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          isCompleted
                            ? "bg-[#8b597b] text-white"
                            : isActive
                            ? "bg-[#efa3a0] text-[#493129] ring-4 ring-[#ffdec7]"
                            : "bg-[#ffeedb] text-[#493129]/40 border border-[#493129]/10"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div>
                        <h4
                          className={`font-serif text-base ${
                            isCompleted || isActive ? "text-[#493129] font-bold" : "text-[#493129]/40"
                          }`}
                        >
                          {step.label}
                        </h4>
                        <p className="text-xs text-[#493129]/70 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items & Shipping Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b597b]">Ordered Pieces</span>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-xs border-b border-[#493129]/10 pb-3">
                      {item.image && (
                        <img src={item.image} alt={item.productName} className="w-12 h-12 object-contain rounded-xl bg-[#ffeedb] p-1 border border-[#493129]/10" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-serif font-bold text-[#493129] truncate">{item.productName}</p>
                        <p className="text-[11px] text-[#493129]/60">{item.variantDetails} • Qty: {item.quantity}</p>
                      </div>
                      <span className="font-serif font-bold text-[#493129]">{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 flex justify-between text-xs font-bold text-[#493129]">
                  <span>Total Amount Paid</span>
                  <span className="font-serif text-base text-[#8b597b]">{formatCurrency(order.grandTotal)}</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 space-y-3 text-xs">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b597b]">Delivery Destination</span>
                <div className="space-y-1 text-[#493129]/80 font-sans">
                  <p className="font-serif text-base font-bold text-[#493129]">{order.customerName}</p>
                  <p>{order.shippingAddress.street}</p>
                  {order.shippingAddress.landmark && <p>Landmark: {order.shippingAddress.landmark}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  <p className="pt-2 text-[#8b597b] font-mono">Mobile: +91 {order.customerPhone}</p>
                  <p className="text-[#493129]/60">Email: {order.customerEmail}</p>
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

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#ffeedb] flex items-center justify-center text-[#8b597b]">Loading orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
}

