"use client";

import React, { useState, useEffect, useRef } from "react";

export const dynamic = "force-dynamic";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Order, OrderStatus } from "@/types";
import {
  Search,
  RefreshCw,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Volume2,
  VolumeX,
  Bell,
  Eye,
  X,
  ExternalLink,
  MessageCircle,
  Phone,
  Store,
  DollarSign,
  Package,
  Layers,
  ArrowRight,
} from "lucide-react";

/**
 * Synthesizes a pleasant 2-tone melodic chime using Web Audio API.
 * Guaranteed to work offline and in modern browsers without external audio assets.
 */
function playOrderChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(587.33, now, 0.28); // D5
    playTone(880.0, now + 0.14, 0.45); // A5
  } catch (e) {
    // Audio context may be restricted before initial user gesture
  }
}

export default function OrdersManagerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const initialLoadRef = useRef(true);
  const prevOrdersCountRef = useRef(0);
  const latestOrderIdRef = useRef<string>("");

  // Load sound preference from localStorage
  useEffect(() => {
    const savedSound = localStorage.getItem("anil_order_sound_enabled");
    if (savedSound !== null) {
      setSoundEnabled(savedSound === "true");
    }
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("anil_order_sound_enabled", String(next));
      if (next) playOrderChime();
      return next;
    });
  };

  const fetchOrders = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const incomingOrders: Order[] = data.orders || [];

        // Check for new incoming orders in real-time
        if (!initialLoadRef.current && incomingOrders.length > 0) {
          const newest = incomingOrders[0];
          const hasNewOrder =
            incomingOrders.length > prevOrdersCountRef.current ||
            (latestOrderIdRef.current && newest.id !== latestOrderIdRef.current);

          if (hasNewOrder) {
            setNewOrderAlert(newest);
            if (soundEnabled) {
              playOrderChime();
            }
          }
        }

        if (incomingOrders.length > 0) {
          latestOrderIdRef.current = incomingOrders[0].id;
        }
        prevOrdersCountRef.current = incomingOrders.length;
        initialLoadRef.current = false;

        setOrders(incomingOrders);

        // Keep selected modal order updated if currently open
        if (selectedOrder) {
          const refreshed = incomingOrders.find((o) => o.id === selectedOrder.id);
          if (refreshed) setSelectedOrder(refreshed);
        }
      }
    } catch {
      // Quiet background failure
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOrders(false);
  }, []);

  // Real-time automatic polling every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [soundEnabled, selectedOrder]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    let tracking: string | null = null;
    if (newStatus === "shipped") {
      tracking = prompt("Enter courier tracking number / AWB (e.g. DEL-591103-9021):");
      if (tracking === null) return; // User cancelled
    }

    setUpdating(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          trackingNumber: tracking || undefined,
        }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: newStatus,
                  trackingNumber: tracking || o.trackingNumber,
                  updatedAt: new Date().toISOString(),
                }
              : o
          )
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) =>
            prev
              ? {
                  ...prev,
                  status: newStatus,
                  trackingNumber: tracking || prev.trackingNumber,
                  updatedAt: new Date().toISOString(),
                }
              : null
          );
        }
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update order status.");
      }
    } catch {
      alert("Network error connecting to order dispatcher.");
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkPaymentPaid = async (orderId: string) => {
    const confirm = window.confirm("Mark Cash on Delivery as PAID and collected?");
    if (!confirm) return;

    setUpdating(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          paymentStatus: "paid",
          paymentSettledRef: "Cash collected at delivery",
        }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  paymentStatus: "paid",
                  updatedAt: new Date().toISOString(),
                }
              : o
          )
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) =>
            prev
              ? {
                  ...prev,
                  paymentStatus: "paid",
                  updatedAt: new Date().toISOString(),
                }
              : null
          );
        }
      } else {
        const err = await res.json();
        alert(err.error || "Failed to mark payment as paid.");
      }
    } catch {
      alert("Network error updating payment status.");
    } finally {
      setUpdating(false);
    }
  };

  // Status counts for badge tabs
  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending" || o.paymentStatus === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    returned: orders.filter((o) => o.status === "returned").length,
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "pending") {
      if (o.status !== "pending" && o.paymentStatus !== "pending") return false;
    } else if (statusFilter !== "all" && o.status !== statusFilter) {
      return false;
    }

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
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Real-time Order Arrival Banner */}
      {newOrderAlert && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFAF5] border-2 border-[#8B597B] shadow-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8B597B] text-white flex items-center justify-center animate-bounce">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8B597B]">
                  Live Order Alert!
                </span>
                <span className="text-[10px] bg-[#27845A]/15 text-[#27845A] font-bold px-2 py-0.5 rounded-full">
                  Just Now
                </span>
              </div>
              <p className="text-sm font-bold text-[#493129] mt-0.5">
                New Order #{newOrderAlert.orderNumber} received from{" "}
                <span className="font-serif">{newOrderAlert.customerName}</span> (
                {formatCurrency(newOrderAlert.grandTotal)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedOrder(newOrderAlert);
                setNewOrderAlert(null);
              }}
              className="px-4 py-2 rounded-full bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] text-xs font-bold transition shadow-xs"
            >
              View Order
            </button>
            <button
              onClick={() => setNewOrderAlert(null)}
              className="p-2 rounded-full hover:bg-[#FFDEC7] text-[#806D63] transition"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E8D5C5] pb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B597B]">
            Storefront Fulfillment Hub
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#493129] tracking-tight mt-0.5">
            Online Orders &amp; Shipments
          </h1>
          <p className="text-xs text-[#806D63] mt-1">
            Real-time customer orders, automatic WhatsApp alerts to +91 9380124254, and courier dispatch
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Audio Chime Toggle */}
          <button
            onClick={toggleSound}
            className={`px-3.5 py-2 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition shadow-xs ${
              soundEnabled
                ? "bg-[#FFFAF5] border-[#E8D5C5] text-[#27845A]"
                : "bg-[#F5E8DC] border-[#E8D5C5] text-[#806D63]"
            }`}
            title={soundEnabled ? "Audio alerts enabled (Click to mute)" : "Audio alerts muted (Click to enable)"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#27845A]" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[11px]">{soundEnabled ? "Sound ON" : "Sound Muted"}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={() => fetchOrders(false)}
            className="p-2.5 rounded-full bg-[#FFFAF5] border border-[#E8D5C5] hover:bg-[#FFDEC7] text-[#493129] transition shadow-xs"
            title="Refresh order ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        {[
          { key: "all", label: "All Orders", count: counts.all },
          { key: "pending", label: "Pending COD / Unpaid", count: counts.pending },
          { key: "confirmed", label: "Confirmed", count: counts.confirmed },
          { key: "processing", label: "Processing", count: counts.processing },
          { key: "shipped", label: "Shipped", count: counts.shipped },
          { key: "delivered", label: "Delivered", count: counts.delivered },
          { key: "cancelled", label: "Cancelled", count: counts.cancelled },
          { key: "returned", label: "Returns / Refunds", count: counts.returned },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              statusFilter === tab.key
                ? "bg-[#493129] text-[#FFEDDB] shadow-xs"
                : "bg-[#FFFAF5] border border-[#E8D5C5] text-[#806D63] hover:text-[#493129] hover:bg-[#FFDEC7]"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                statusFilter === tab.key ? "bg-[#8B597B] text-white" : "bg-[#F5E8DC] text-[#493129]"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Table Card */}
      <div className="bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#806D63]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, customer name, phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#FFFFFF] border border-[#E8D5C5] text-xs text-[#30241F] placeholder-[#806D63]/60 focus:outline-none focus:border-[#8B597B]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-[#806D63] border-b border-[#E8D5C5]">
              <tr>
                <th className="py-3 px-3">Order Number</th>
                <th className="py-3 px-3">Customer Details</th>
                <th className="py-3 px-3">Products &amp; Units</th>
                <th className="py-3 px-3">Fulfillment</th>
                <th className="py-3 px-3">Total Amount</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D5C5] text-[#30241F]">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#806D63] italic font-serif">
                    Loading customer orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#806D63] italic font-serif">
                    No matching customer orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const totalUnits = ord.items.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <tr key={ord.id} className="hover:bg-[#F5E8DC]/40 transition">
                      {/* Order Number & Timestamp */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="font-mono font-bold text-[#8B597B] hover:underline text-left block"
                        >
                          #{ord.orderNumber}
                        </button>
                        <span className="text-[10px] text-[#806D63] block">{formatDate(ord.createdAt)}</span>
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-[#493129] block">{ord.customerName}</span>
                        <a
                          href={`tel:+91${ord.customerPhone}`}
                          className="text-[11px] text-[#806D63] font-mono hover:text-[#493129] block"
                        >
                          +91 {ord.customerPhone}
                        </a>
                      </td>

                      {/* Products Summary & Total Units */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-[#493129] block">
                          {totalUnits} unit{totalUnits !== 1 ? "s" : ""} ({ord.items.length} product
                          {ord.items.length !== 1 ? "s" : ""})
                        </span>
                        <span className="text-[10px] text-[#806D63] truncate max-w-xs block">
                          {ord.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}
                        </span>
                      </td>

                      {/* Fulfillment Type */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.fulfillmentType === "pickup"
                              ? "bg-[#27845A]/15 text-[#27845A] border border-[#27845A]/30"
                              : "bg-[#FFDEC7] text-[#493129]"
                          }`}
                        >
                          {ord.fulfillmentType === "pickup" ? (
                            <>
                              <Store className="w-3 h-3" />
                              <span>Store Pickup</span>
                            </>
                          ) : (
                            <>
                              <Truck className="w-3 h-3" />
                              <span>Delivery</span>
                            </>
                          )}
                        </span>
                        <span className="text-[10px] text-[#806D63] block truncate max-w-[140px] mt-0.5">
                          {ord.fulfillmentType === "pickup"
                            ? "Belagavi Store"
                            : `${ord.shippingAddress?.city || "Belagavi"} - ${ord.shippingAddress?.pincode || "591103"}`}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-[#493129] font-mono text-sm block">
                          {formatCurrency(ord.grandTotal)}
                        </span>
                        <span className="text-[9px] text-[#806D63]">GST Included</span>
                      </td>

                      {/* Payment Mode & Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ord.paymentStatus === "paid"
                              ? "bg-[#27845A]/15 text-[#27845A]"
                              : ord.paymentStatus === "failed"
                              ? "bg-[#C0393A]/15 text-[#C0393A]"
                              : "bg-[#B7791F]/15 text-[#B7791F]"
                          }`}
                        >
                          {ord.paymentStatus === "paid" ? "Paid" : "Unpaid / Pending"}
                        </span>
                        <span className="text-[10px] text-[#806D63] uppercase block font-medium mt-0.5">
                          {ord.paymentMethod.toUpperCase()}
                        </span>
                      </td>

                      {/* Order Status Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ord.status === "delivered"
                              ? "bg-[#27845A]/10 text-[#27845A] border border-[#27845A]/30"
                              : ord.status === "shipped"
                              ? "bg-[#8B597B]/10 text-[#8B597B] border border-[#8B597B]/30"
                              : ord.status === "cancelled"
                              ? "bg-[#C0393A]/10 text-[#C0393A] border border-[#C0393A]/30"
                              : ord.status === "returned"
                              ? "bg-[#B7791F]/10 text-[#B7791F] border border-[#B7791F]/30"
                              : "bg-[#FFDEC7] text-[#493129] border border-[#E8D5C5]"
                          }`}
                        >
                          {ord.status.replace("_", " ")}
                        </span>
                        {ord.trackingNumber && (
                          <p className="text-[9px] font-mono text-[#8B597B] mt-0.5 truncate max-w-[120px]">
                            AWB: {ord.trackingNumber}
                          </p>
                        )}
                      </td>

                      {/* Fast Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1.5 rounded-full bg-[#FFDEC7] hover:bg-[#efa3a0] text-[#493129] transition shadow-xs"
                            title="Inspect complete order particulars"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <select
                            value={ord.status}
                            disabled={updating}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                            className="px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#FFDEC7] text-xs font-semibold rounded-full border border-[#E8D5C5] text-[#493129] cursor-pointer focus:outline-none transition shadow-xs"
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="returned">Returned</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL ORDER PARTICULARS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-[#493129]/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 shadow-2xl animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E8D5C5] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B597B]">
                  Consignment Particulars
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#493129] mt-0.5">
                  Order #{selectedOrder.orderNumber}
                </h2>
                <p className="text-xs text-[#806D63]">Placed on {formatDate(selectedOrder.createdAt)}</p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full hover:bg-[#FFEDDB] text-[#806D63] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="p-4 rounded-2xl bg-[#F5E8DC] border border-[#E8D5C5] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[#806D63] block text-[10px] uppercase font-bold">Fulfillment Status</span>
                <span className="font-bold text-[#493129] text-sm uppercase">
                  {selectedOrder.status.replace("_", " ")}
                </span>
                {selectedOrder.trackingNumber && (
                  <p className="text-[11px] font-mono text-[#8B597B] mt-0.5">
                    AWB Tracking: {selectedOrder.trackingNumber}
                  </p>
                )}
              </div>

              <div>
                <span className="text-[#806D63] block text-[10px] uppercase font-bold">Payment Settlement</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold text-sm uppercase ${
                      selectedOrder.paymentStatus === "paid" ? "text-[#27845A]" : "text-[#B7791F]"
                    }`}
                  >
                    {selectedOrder.paymentStatus} ({selectedOrder.paymentMethod.toUpperCase()})
                  </span>
                  {selectedOrder.paymentStatus !== "paid" && (
                    <button
                      onClick={() => handleMarkPaymentPaid(selectedOrder.id)}
                      className="px-2.5 py-1 bg-[#27845A] hover:bg-[#1f6b49] text-white font-bold rounded-lg text-[10px] transition shadow-xs"
                    >
                      Mark Collected
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Contact & Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E8D5C5] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B597B] block">
                  Customer Particulars
                </span>
                <p className="font-serif text-sm font-bold text-[#493129]">{selectedOrder.customerName}</p>
                <p className="text-[#30241F] font-mono flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#806D63]" />
                  <span>+91 {selectedOrder.customerPhone}</span>
                </p>
                {selectedOrder.customerEmail && (
                  <p className="text-[#806D63] truncate">{selectedOrder.customerEmail}</p>
                )}
                <div className="pt-2 flex gap-2">
                  <a
                    href={`https://wa.me/91${selectedOrder.customerPhone}?text=${encodeURIComponent(
                      `Hello ${selectedOrder.customerName}, this is ANIL COMMUNICATION & ZEROX regarding your order #${selectedOrder.orderNumber}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-3 rounded-lg bg-[#27845A] hover:bg-[#1f6b49] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:+91${selectedOrder.customerPhone}`}
                    className="py-1.5 px-3 rounded-lg bg-[#FFDEC7] hover:bg-[#efa3a0] text-[#493129] text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E8D5C5] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B597B] block">
                  {selectedOrder.fulfillmentType === "pickup" ? "In-Store Pickup Hub" : "Doorstep Delivery Destination"}
                </span>
                {selectedOrder.fulfillmentType === "pickup" ? (
                  <div className="space-y-1">
                    <p className="font-bold text-[#493129]">ANIL COMMUNICATION &amp; ZEROX</p>
                    <p className="text-[#806D63] text-[11px]">
                      Near Canara Bank, Belagavi, Karnataka - 591103
                    </p>
                    <p className="text-[11px] text-[#27845A] font-bold pt-1">
                      Ready for pickup within 2 hours of store opening
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 text-[#30241F]">
                    <p className="font-medium">{selectedOrder.shippingAddress.street}</p>
                    {selectedOrder.shippingAddress.landmark && (
                      <p className="text-[#806D63]">Landmark: {selectedOrder.shippingAddress.landmark}</p>
                    )}
                    <p className="font-bold text-[#493129]">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{" "}
                      {selectedOrder.shippingAddress.pincode}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Ordered Items Table */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B597B] block">
                Consignment Items ({selectedOrder.items.length})
              </span>
              <div className="border border-[#E8D5C5] rounded-2xl overflow-hidden bg-[#FFFFFF]">
                <table className="w-full text-left">
                  <thead className="bg-[#F5E8DC] text-[10px] font-bold uppercase text-[#806D63]">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8D5C5]">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-3 flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-10 h-10 object-contain rounded-lg bg-[#FFEDDB] p-1 border border-[#E8D5C5]"
                            />
                          )}
                          <div>
                            <span className="font-bold text-[#493129] block">{item.productName}</span>
                            <span className="text-[11px] text-[#806D63]">{item.variantDetails}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center font-bold text-[#493129]">{item.quantity}</td>
                        <td className="p-3 text-right font-mono text-[#806D63]">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-[#493129]">
                          {formatCurrency(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-2xl bg-[#FFEDDB] border border-[#E8D5C5] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#806D63]">
                <span>Items Subtotal:</span>
                <span className="font-mono">{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-[#27845A]">
                  <span>Promotional Discount:</span>
                  <span className="font-mono">-{formatCurrency(selectedOrder.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#806D63]">
                <span>Doorstep Delivery Fee:</span>
                <span className="font-mono">
                  {selectedOrder.shippingFee === 0 ? "FREE" : formatCurrency(selectedOrder.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E8D5C5] text-sm font-bold text-[#493129]">
                <span>Grand Total Settled:</span>
                <span className="font-serif text-base text-[#8B597B]">
                  {formatCurrency(selectedOrder.grandTotal)}
                </span>
              </div>
            </div>

            {/* Update Status Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8D5C5]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#493129]">Update Status:</span>
                <select
                  value={selectedOrder.status}
                  disabled={updating}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                  className="px-4 py-2 bg-[#FFFFFF] hover:bg-[#FFDEC7] text-xs font-bold rounded-full border border-[#E8D5C5] text-[#493129] cursor-pointer focus:outline-none transition shadow-xs"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 rounded-full bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] text-xs font-bold transition shadow-xs"
              >
                Close Particulars
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
