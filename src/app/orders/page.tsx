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
  Printer,
  RotateCcw,
  XCircle,
  MessageCircle,
  Store,
} from "lucide-react";

const REAL_ORDER_STAGES: { key: OrderStatus; label: string; desc: string }[] = [
  { key: "pending", label: "1. Order Received", desc: "Order details received in store database" },
  { key: "confirmed", label: "2. Confirmed", desc: "Payment/Order verified and stock reserved" },
  { key: "packed", label: "3. Packed & Ready", desc: "Item inspected and securely packed at Belagavi store" },
  { key: "shipped", label: "4. Out for Delivery / Shipped", desc: "Handed over to delivery associate or courier" },
  { key: "delivered", label: "5. Delivered", desc: "Safely delivered to customer" },
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
      const cleanQ = query.trim();
      const isPhone = cleanQ.replace(/\D/g, "").length >= 10;
      const param = isPhone
        ? `phone=${encodeURIComponent(cleanQ.replace(/\D/g, ""))}`
        : `orderNumber=${encodeURIComponent(cleanQ)}`;

      const res = await fetch(`/api/orders/user?${param}`);
      const data = await res.json();
      const foundOrders: Order[] = data.orders || [];

      if (foundOrders.length > 0) {
        setOrder(foundOrders[0]);
      } else {
        setOrder(null);
        setError(`No order found matching "${query}". Please check your Order Number or 10-digit Mobile Number.`);
      }
    } catch {
      setError("Unable to retrieve order details. Please check your network connection.");
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
        body: JSON.stringify({
          orderId: order.id,
          action: "cancel",
          reason,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message || "Order cancellation requested.");
        setOrder({ ...order, status: "cancelled" });
      } else {
        alert(data.error || "Failed to cancel order.");
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
        body: JSON.stringify({
          orderId: order.id,
          action: "return",
          reason,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message || "Return request submitted.");
        setOrder({ ...order, status: "returned" });
      } else {
        alert(data.error || "Failed to submit return request.");
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
      packed: 2,
      shipped: 3,
      out_for_delivery: 3,
      delivered: 4,
      cancelled: -1,
      returned: -1,
    };

    const currentRank = rankMap[currentStatus] ?? 1;
    const stepRank = rankMap[stepKey] ?? 0;

    if (currentRank > stepRank) return "completed";
    if (currentRank === stepRank) return "active";
    return "pending";
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ffeedb]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        {/* Search Order Box */}
        <div className="bg-[#fffaf5] rounded-3xl p-8 sm:p-12 border border-[#493129]/10 shadow-subtle space-y-6">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8b597b]">
              ANIL COMMUNICATION &amp; ZEROX
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#493129]">
              Track Your Order
            </h1>
            <p className="text-xs text-[#493129]/70 leading-relaxed font-sans">
              Enter your Order Number (e.g. <strong className="font-mono text-[#493129]">ORD-261110-G6MPY</strong>) or registered 10-digit mobile number.
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

        {/* Live Order Details */}
        {order && (
          <div className="mt-10 space-y-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b597b]">Order Reference</span>
                <h2 className="font-serif text-2xl text-[#493129] mt-0.5">#{order.orderNumber}</h2>
                <p className="text-xs text-[#493129]/60 mt-1">Placed on {formatDate(order.createdAt)}</p>
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
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>

            {/* Delivery & Status Bar */}
            <div className="p-5 rounded-2xl bg-[#ffeedb]/60 border border-[#493129]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                {order.fulfillmentType === "pickup" ? (
                  <Store className="w-5 h-5 text-[#8b597b]" />
                ) : (
                  <Truck className="w-5 h-5 text-[#8b597b]" />
                )}
                <div>
                  <div className="font-bold text-[#493129]">
                    {order.fulfillmentType === "pickup"
                      ? "In-Store Pickup • Belagavi Outlet"
                      : "Doorstep Delivery • Belagavi & Nearby"}
                  </div>
                  <div className="text-[11px] text-[#493129]/70">
                    {order.trackingNumber
                      ? `Tracking / Dispatch ID: ${order.trackingNumber}`
                      : "Being processed at ANIL COMMUNICATION & ZEROX, Belagavi"}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`https://wa.me/919380124254?text=${encodeURIComponent(
                    `Hello ANIL COMMUNICATION & ZEROX, I am inquiring about my order #${order.orderNumber}. Could you please update me on its status?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp Store (+91 9380124254)</span>
                </a>

                {(order.status === "confirmed" || order.status === "pending") && (
                  <button
                    onClick={handleCancelOrder}
                    className="px-4 py-1.5 rounded-full border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold transition flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Order</span>
                  </button>
                )}

                {order.status === "delivered" && (
                  <button
                    onClick={handleReturnOrder}
                    className="px-4 py-1.5 rounded-full border border-[#8b597b]/30 text-[#8b597b] hover:bg-[#ffdec7] text-xs font-semibold transition flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Return / Replacement</span>
                  </button>
                )}
              </div>
            </div>

            {/* Clean Real Progression Stepper */}
            {order.status !== "cancelled" && order.status !== "returned" && (
              <div className="p-8 sm:p-10 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle space-y-6">
                <h3 className="font-serif text-xl text-[#493129]">Order Progression</h3>

                <div className="relative pl-8 sm:pl-10 space-y-7 border-l-2 border-[#ffdec7] ml-4">
                  {REAL_ORDER_STAGES.map((step, idx) => {
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
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b597b]">Items Ordered</span>
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
                        <p className="text-[10px] text-[#493129]/60">{item.variantDetails || "Standard"}</p>
                        <p className="text-[10px] text-[#493129]/80 font-mono mt-0.5">
                          Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <div className="text-right font-mono font-bold text-[#493129]">
                        {formatCurrency(item.totalPrice)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-xs space-y-1.5 border-t border-[#493129]/10">
                  <div className="flex justify-between text-[#493129]/70">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount</span>
                      <span className="font-mono">-{formatCurrency(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#493129]/70">
                    <span>Delivery</span>
                    <span className="font-mono">{order.shippingFee === 0 ? "FREE" : formatCurrency(order.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#493129] text-sm pt-1 border-t border-[#493129]/10">
                    <span>Total Paid</span>
                    <span className="font-mono text-[#8b597b]">{formatCurrency(order.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery / Store Details */}
              <div className="p-6 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b597b]">
                  {order.fulfillmentType === "pickup" ? "Store Pickup Information" : "Delivery Destination"}
                </span>

                <div className="text-xs space-y-3">
                  <div>
                    <span className="text-[10px] text-[#493129]/60 uppercase font-bold block">Customer Contact</span>
                    <p className="font-bold text-[#493129]">{order.customerName}</p>
                    <p className="text-[#493129]/80 font-mono">{order.customerPhone}</p>
                    {order.customerEmail && <p className="text-[#493129]/80">{order.customerEmail}</p>}
                  </div>

                  <div>
                    <span className="text-[10px] text-[#493129]/60 uppercase font-bold block">Address</span>
                    {order.fulfillmentType === "pickup" ? (
                      <p className="text-[#493129] leading-relaxed">
                        <strong>ANIL COMMUNICATION &amp; ZEROX</strong><br />
                        Near Canara Bank, Belagavi, Karnataka - 591103
                      </p>
                    ) : (
                      <p className="text-[#493129] leading-relaxed">
                        {order.shippingAddress.street}<br />
                        {order.shippingAddress.landmark && `${order.shippingAddress.landmark}, `}
                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-[#493129]/60 uppercase font-bold block">Payment Status</span>
                    <p className="font-bold text-[#8b597b] uppercase">
                      {order.paymentStatus} • {order.paymentMethod.toUpperCase()}
                    </p>
                    {order.notes && (
                      <p className="text-[10px] text-[#493129]/70 italic mt-0.5">{order.notes}</p>
                    )}
                  </div>
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
    <Suspense fallback={<div className="min-h-screen bg-[#ffeedb] flex items-center justify-center text-xs font-serif text-[#493129]">Loading...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
