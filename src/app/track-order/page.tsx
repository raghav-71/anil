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
  { key: "shipped", label: "Handed to Courier", desc: "Dispatched from Belagavi Store" },
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
      const cleanQ = query.trim();
      const isPhone = cleanQ.replace(/\D/g, "").length >= 10;
      const param = isPhone ? `phone=${encodeURIComponent(cleanQ.replace(/\D/g, ""))}` : `orderNumber=${encodeURIComponent(cleanQ)}`;

      const res = await fetch(`/api/orders/user?${param}`);
      const data = await res.json();
      const foundOrders: Order[] = data.orders || [];

      if (foundOrders.length > 0) {
        setOrder(foundOrders[0]);
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
      packed: 3,
      shipped: 4,
      out_for_delivery: 5,
      delivered: 6,
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
    <div className="flex flex-col min-h-screen bg-[#FFEDDB]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Search Tracker Card */}
        <div className="bg-[#FFFAF5] rounded-3xl p-6 sm:p-10 border border-[#E8D5C5] shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FFDEC7] text-[#493129] flex items-center justify-center mx-auto shadow-xs">
              <Truck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#493129] tracking-tight">
              Track Your Order
            </h1>
            <p className="text-xs sm:text-sm text-[#806D63] max-w-md mx-auto">
              Enter your Order Number (e.g. <strong className="font-mono text-[#493129]">ORD-2026-94812</strong>) or registered phone number
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#806D63]" />
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Enter Order # or 10-digit Phone"
                className="w-full pl-9 pr-3 py-3 text-xs sm:text-sm rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] placeholder-[#806D63]/60 focus:outline-none focus:border-[#8B597B]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#493129] hover:bg-[#8B597B] disabled:opacity-50 text-[#FFEDDB] text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition"
            >
              {loading ? "Searching..." : "Track"}
            </button>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-[#FFEDDB] border border-[#C0393A]/30 text-[#C0393A] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#C0393A] flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ORDER DETAILS & LIVE PROGRESS TIMELINE */}
        {order && (
          <div className="mt-8 space-y-6">
            {/* Status Header */}
            <div className="p-6 rounded-3xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8B597B]">Order Information</span>
                <h2 className="text-xl font-bold text-[#493129] font-mono mt-0.5">#{order.orderNumber}</h2>
                <p className="text-xs text-[#806D63] mt-1">Placed on {formatDate(order.createdAt)}</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFDEC7] text-[#493129] border border-[#E8D5C5] uppercase">
                  <Package className="w-3.5 h-3.5" />
                  <span>Status: {order.status.replace(/_/g, " ")}</span>
                </span>
                {order.trackingNumber && (
                  <p className="text-xs text-[#806D63] mt-1 font-mono">AWB: {order.trackingNumber}</p>
                )}
              </div>
            </div>

            {/* Stepper Progress */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-xs space-y-8">
              <h3 className="text-sm font-serif font-bold text-[#493129] uppercase tracking-wider">
                Live Shipment Timeline
              </h3>

              <div className="relative pl-6 sm:pl-8 space-y-8 border-l-2 border-[#E8D5C5] ml-4">
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
                            ? "bg-[#27845A] text-white"
                            : isActive
                            ? "bg-[#8B597B] text-white ring-4 ring-[#8B597B]/20"
                            : "bg-[#F5E8DC] text-[#806D63]"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div>
                        <h4
                          className={`text-sm font-bold ${
                            isCompleted || isActive ? "text-[#493129]" : "text-[#806D63]/70"
                          }`}
                        >
                          {step.label}
                        </h4>
                        <p className="text-xs text-[#806D63] mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items & Shipping Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ordered Products */}
              <div className="p-6 rounded-3xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B597B]">Items in this Package</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-xs border-b border-[#E8D5C5]/60 pb-2">
                      {item.image && (
                        <img src={item.image} alt={item.productName} className="w-12 h-12 object-contain rounded-lg bg-[#FFEDDB] p-1 border border-[#E8D5C5]" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#493129] truncate">{item.productName}</p>
                        <p className="text-[#806D63]">{item.variantDetails} • Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-[#493129]">{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-between text-xs font-bold text-[#493129]">
                  <span>Grand Total</span>
                  <span className="text-[#8B597B] font-mono text-sm">{formatCurrency(order.grandTotal)}</span>
                </div>
              </div>

              {/* Delivery Destination */}
              <div className="p-6 rounded-3xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-xs space-y-3 text-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B597B]">Shipping Details</h3>
                <div className="space-y-1 text-[#30241F]">
                  <p className="font-bold text-sm text-[#493129]">{order.customerName}</p>
                  <p>{order.shippingAddress.street}</p>
                  {order.shippingAddress.landmark && <p>Landmark: {order.shippingAddress.landmark}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  <p className="pt-2 text-[#806D63] font-medium">Phone: +91 {order.customerPhone}</p>
                  <p className="text-[#806D63]">Email: {order.customerEmail}</p>
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
    <Suspense fallback={<div className="min-h-screen bg-[#FFEDDB] flex items-center justify-center text-[#806D63]">Loading tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
