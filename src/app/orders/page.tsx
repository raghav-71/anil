"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Printer,
  ShieldCheck,
  RotateCcw,
  XCircle,
} from "lucide-react";

const EIGHT_STAGE_LIFECYCLE: { key: OrderStatus; label: string; desc: string }[] = [
  { key: "pending", label: "1. Order Placed", desc: "Digital consignment intent logged" },
  { key: "confirmed", label: "2. Payment Confirmed", desc: "Payment verified & inventory reserved" },
  { key: "processing", label: "3. Quality Inspected", desc: "IMEI verified & hardware inspected" },
  { key: "packed", label: "4. Boutique Packed", desc: "Sealed in tamper-evident boutique box" },
  { key: "shipped", label: "5. In Transit", desc: "Dispatched via air courier partner" },
  { key: "out_for_delivery", label: "6. Out for Delivery", desc: "Designated logistics associate en route" },
  { key: "delivered", label: "7. Delivered", desc: "Safely received with client verification" },
];

function OrdersContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || searchParams.get("query") || "";

  const [orderQuery, setOrderQuery] = useState(initialOrderId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchOrder = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/reports`);
      const data = await res.json();
      const allOrders: Order[] = data.recentOrders || [];

      const cleanQuery = query.trim().toLowerCase();
      const found = allOrders.find(
        (o) =>
          o.orderNumber.toLowerCase() === cleanQuery ||
          o.customerPhone.includes(cleanQuery.replace(/\D/g, "")) ||
          o.id === cleanQuery
      );

      if (found) {
        setOrder(found);
      } else {
        setOrder(null);
        setError(`No consignment found matching "${query}". Please verify your Order Number or Phone Number.`);
      }
    } catch {
      setError("Unable to retrieve order details. Please check connection.");
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

  const handleCancelOrder = async () => {
    if (!order) return;
    const reason = prompt("Please confirm reason for cancelling this order:");
    if (!reason) return;

    try {
      const res = await fetch("/api/orders/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, action: "cancel", reason }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        setOrder({ ...order, status: "cancelled" });
      } else {
        alert(data.error);
      }
    } catch {
      alert("Cancellation request failed.");
    }
  };

  const handleReturnOrder = async () => {
    if (!order) return;
    const reason = prompt("Please indicate reason for return or replacement request:");
    if (!reason) return;

    try {
      const res = await fetch("/api/orders/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, action: "return", reason }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        setOrder({ ...order, status: "returned" });
      } else {
        alert(data.error);
      }
    } catch {
      alert("Return request failed.");
    }
  };

  const getStepState = (stepKey: OrderStatus, currentStatus: OrderStatus) => {
    const rankMap: Record<OrderStatus, number> = {
      pending: 0,
      confirmed: 1,
      processing: 2,
      packed: 3,
      shipped: 4,
      out_for_delivery: 5,
      delivered: 6,
      cancelled: -1,
      returned: -1,
    };

    const currentRank = rankMap[currentStatus] ?? 1;
    const stepRank = rankMap[stepKey];

    if (currentRank > stepRank) return "completed";
    if (currentRank === stepRank) return "active";
    return "pending";
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ffeedb]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        {/* Search Consignment Box */}
        <div className="bg-[#fffaf5] rounded-3xl p-8 sm:p-12 border border-[#493129]/10 shadow-subtle space-y-6">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8b597b]">
              Maison Logistics
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
              {loading ? "Locating..." : "Track"}
            </button>
          </form>

          {error && (
            <div className="p-3 bg-[#ffdec7]/50 border border-[#ffdec7] text-[#493129] text-xs rounded-2xl flex items-center gap-2 max-w-md mx-auto">
              <AlertCircle className="w-4 h-4 text-[#8b597b] flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {actionMessage && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center justify-between">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-emerald-700 font-bold ml-4">✕</button>
          </div>
        )}

        {/* Consignment Live Details */}
        {order && (
          <div className="mt-10 space-y-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b597b]">Consignment Reference</span>
                <h2 className="font-serif text-2xl text-[#493129] mt-0.5">#{order.orderNumber}</h2>
                <p className="text-xs text-[#493129]/60 mt-1">Confirmed on {formatDate(order.createdAt)}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  order.status === "delivered" ? "bg-emerald-100 text-emerald-800" :
                  order.status === "cancelled" ? "bg-red-100 text-red-800" :
                  order.status === "returned" ? "bg-amber-100 text-amber-800" :
                  "bg-[#ffdec7] text-[#493129]"
                }`}>
                  <Package className="w-3.5 h-3.5 text-[#8b597b]" />
                  <span>{order.status.replace(/_/g, " ")}</span>
                </span>

                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#493129]/20 hover:bg-[#ffeedb] text-xs font-semibold text-[#493129] transition"
                >
                  <Printer className="w-3.5 h-3.5 text-[#8b597b]" />
                  <span>Print GST Invoice</span>
                </button>
              </div>
            </div>

            {/* Airway Bill & Carrier Info */}
            <div className="p-5 rounded-2xl bg-[#ffeedb]/60 border border-[#493129]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#8b597b]" />
                <div>
                  <div className="font-bold text-[#493129]">
                    Carrier Partner: {order.trackingNumber ? "BlueDart Express Logistics" : "Anil Boutique Express"}
                  </div>
                  <div className="text-[11px] text-[#493129]/70 font-mono">
                    AWB Tracking Code: {order.trackingNumber || "BLUEDART-AIR-7729103"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(order.status === "confirmed" || order.status === "pending") && (
                  <button
                    onClick={handleCancelOrder}
                    className="px-4 py-1.5 rounded-full border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold transition flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Consignment</span>
                  </button>
                )}
                {order.status === "delivered" && (
                  <button
                    onClick={handleReturnOrder}
                    className="px-4 py-1.5 rounded-full border border-[#8b597b]/30 text-[#8b597b] hover:bg-[#ffdec7] text-xs font-semibold transition flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Request Return / Replacement</span>
                  </button>
                )}
              </div>
            </div>

            {/* Amazon-Level 8-Stage Milestone Stepper */}
            {order.status !== "cancelled" && order.status !== "returned" && (
              <div className="p-8 sm:p-10 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle space-y-6">
                <h3 className="font-serif text-xl text-[#493129]">Consignment Lifecycle</h3>

                <div className="relative pl-8 sm:pl-10 space-y-7 border-l-2 border-[#ffdec7] ml-4">
                  {EIGHT_STAGE_LIFECYCLE.map((step, idx) => {
                    const state = getStepState(step.key, order.status);
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
            )}

            {/* Items & Shipping Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b597b]">Ordered Pieces</span>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-xs border-b border-[#493129]/10 pb-3">
                      {item.image && (
                        <div className="relative w-12 h-12 rounded-xl bg-white border border-[#493129]/10 p-1 overflow-hidden flex-shrink-0">
                          <Image src={item.image} alt={item.productName} fill className="object-contain p-0.5" sizes="48px" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-serif font-bold text-[#493129] truncate">{item.productName}</p>
                        <p className="text-[11px] text-[#493129]/60">{item.variantDetails} • Qty: {item.quantity}</p>
                      </div>
                      <span className="font-serif font-bold text-[#493129]">{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 space-y-1 text-xs">
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-800 font-semibold">
                      <span>Voucher Discount</span>
                      <span>-{formatCurrency(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-[#493129] pt-1 border-t border-[#493129]/10">
                    <span>Total Amount Paid</span>
                    <span className="font-serif text-base text-[#8b597b]">{formatCurrency(order.grandTotal)}</span>
                  </div>
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
