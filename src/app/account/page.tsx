"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Order, Product, UserAddress } from "@/types";
import {
  User,
  Package,
  Heart,
  MapPin,
  Clock,
  Shield,
  Plus,
  Trash2,
  CheckCircle2,
  ShoppingBag,
  ExternalLink,
  RotateCcw,
  XCircle,
  Truck,
} from "lucide-react";

function AccountContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "orders";
  const { user } = useAuth();
  const { wishlist, toggleWishlist, recentlyViewed, addItem } = useCart();

  const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "addresses" | "recent" | "security">(
    initialTab as any
  );

  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: "Raghav Anil",
    phone: "+91 98450 12345",
    street: "",
    landmark: "",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "",
    type: "home" as "home" | "work" | "other",
    isDefault: false,
  });

  // Action status message
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Fetch products
    fetch("/api/products")
      .then((res) => res.json())
      .then((d) => setAllProducts(d.products || []));

    // Fetch user addresses
    fetch("/api/addresses")
      .then((res) => res.json())
      .then((d) => setAddresses(d.addresses || []));

    // Fetch orders (customer orders)
    fetch("/api/orders/user?phone=9845012345")
      .then((res) => res.json())
      .then((d) => {
        setOrders(d.orders || []);
        setLoadingOrders(false);
      })
      .catch(() => {
        // Fallback fetch all orders
        fetch("/api/reports")
          .then((res) => res.json())
          .then(() => setLoadingOrders(false))
          .catch(() => setLoadingOrders(false));
      });
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddr),
      });
      const data = await res.json();
      if (data.success) {
        setAddresses((prev) => [...prev, data.address]);
        setShowAddressModal(false);
        setNewAddr({
          name: "Raghav Anil",
          phone: "+91 98450 12345",
          street: "",
          landmark: "",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "",
          type: "home",
          isDefault: false,
        });
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // ignore
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await fetch("/api/addresses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
    } catch {
      // ignore
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const reason = prompt("Please provide a reason for cancelling this consignment:");
    if (!reason) return;
    try {
      const res = await fetch("/api/orders/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "cancel", reason }),
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback(data.message);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
        );
      } else {
        alert(data.error);
      }
    } catch {
      alert("Failed to process cancellation.");
    }
  };

  const handleReturnOrder = async (orderId: string) => {
    const reason = prompt("Please state the reason for requesting return/replacement:");
    if (!reason) return;
    try {
      const res = await fetch("/api/orders/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "return", reason }),
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback(data.message);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "returned" } : o))
        );
      } else {
        alert(data.error);
      }
    } catch {
      alert("Failed to register return.");
    }
  };

  const wishlistProducts = allProducts.filter((p) => wishlist.includes(p.id));
  const recentProducts = allProducts.filter((p) => recentlyViewed.includes(p.id));

  return (
    <div className="flex flex-col min-h-screen bg-[#ffeedb]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Client Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#fffaf5] border border-[#493129]/15 shadow-subtle mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#ffdec7] border border-[#493129]/15 flex items-center justify-center font-serif text-2xl font-bold text-[#493129]">
              {(user?.name || user?.fullName || "Raghav").charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl text-[#493129]">
                  {user?.name || user?.fullName || "Raghav Anil"}
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#8b597b] text-white">
                  Gold Boutique Member
                </span>
              </div>
              <p className="text-xs text-[#493129]/70 mt-0.5 font-sans">
                {user?.email || "raghav@anilcommunications.com"} • Authorized Client Concierge
              </p>
            </div>
          </div>
        </div>

        {actionFeedback && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center justify-between">
            <span>{actionFeedback}</span>
            <button onClick={() => setActionFeedback(null)} className="text-emerald-700 font-bold ml-4">✕</button>
          </div>
        )}

        {/* Tab Strip */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-[#493129]/10">
          {[
            { id: "orders", label: "Consignments & Orders", icon: Package },
            { id: "wishlist", label: `Wishlist (${wishlist.length})`, icon: Heart },
            { id: "addresses", label: `Saved Addresses (${addresses.length})`, icon: MapPin },
            { id: "recent", label: "Recently Viewed", icon: Clock },
            { id: "security", label: "Security & Profile", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? "bg-[#493129] text-[#ffeedb] shadow-xs"
                    : "bg-[#fffaf5] text-[#493129] hover:bg-[#ffdec7]/60 border border-[#493129]/10"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#efa3a0]" : "text-[#8b597b]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Consignments & Orders */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-[#493129]">Your Consignments</h2>
              <Link href="/orders" className="text-xs font-semibold text-[#8b597b] hover:underline flex items-center gap-1">
                <span>Direct AWB Tracking Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingOrders ? (
              <div className="p-8 text-center text-xs text-[#493129]/60">Loading your orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#fffaf5] border border-[#493129]/15">
                <Package className="w-12 h-12 stroke-1 text-[#493129]/30 mx-auto mb-2" />
                <h3 className="font-serif text-lg text-[#493129]">No recent orders found</h3>
                <Link
                  href="/shop"
                  className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#efa3a0] text-[#493129] text-xs font-bold shadow-coral"
                >
                  <span>Explore The Collection</span>
                </Link>
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-6 rounded-3xl bg-[#fffaf5] border border-[#493129]/15 shadow-subtle space-y-4 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#493129]/10 pb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#8b597b]">Order Number</span>
                      <div className="font-mono font-bold text-sm text-[#493129]">{ord.orderNumber}</div>
                      <span className="text-[11px] text-[#493129]/60">Placed on {formatDate(ord.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        ord.status === "delivered" ? "bg-emerald-100 text-emerald-800" :
                        ord.status === "cancelled" ? "bg-red-100 text-red-800" :
                        ord.status === "returned" ? "bg-amber-100 text-amber-800" :
                        "bg-[#ffdec7] text-[#493129]"
                      }`}>
                        {ord.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  {/* Items Strip */}
                  <div className="divide-y divide-[#493129]/10">
                    {ord.items.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <div className="relative w-12 h-12 rounded-xl bg-white border border-[#493129]/10 p-1 overflow-hidden flex-shrink-0">
                              <Image src={item.image} alt={item.productName} fill className="object-contain p-0.5" sizes="48px" />
                            </div>
                          )}
                          <div>
                            <div className="font-serif font-bold text-sm text-[#493129]">{item.productName}</div>
                            <div className="text-[11px] text-[#493129]/60">{item.variantDetails} • Qty: {item.quantity}</div>
                          </div>
                        </div>
                        <div className="font-serif font-bold text-sm text-[#493129]">
                          {formatCurrency(item.totalPrice)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary & Actions */}
                  <div className="pt-2 border-t border-[#493129]/10 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[#493129]/70">Grand Total: </span>
                      <strong className="font-serif font-bold text-[#8b597b] text-sm">{formatCurrency(ord.grandTotal)}</strong>
                      <span className="ml-2 text-[11px] text-[#493129]/50">({ord.paymentMethod.toUpperCase()} • {ord.paymentStatus})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/orders?query=${ord.orderNumber}`}
                        className="px-4 py-2 rounded-full bg-[#ffeedb] hover:bg-[#ffdec7] text-[#493129] font-semibold text-xs transition"
                      >
                        Live Tracking
                      </Link>

                      {ord.status === "confirmed" && (
                        <button
                          onClick={() => handleCancelOrder(ord.id)}
                          className="px-4 py-2 rounded-full border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold transition"
                        >
                          Cancel Order
                        </button>
                      )}

                      {ord.status === "delivered" && (
                        <button
                          onClick={() => handleReturnOrder(ord.id)}
                          className="px-4 py-2 rounded-full border border-[#8b597b]/30 text-[#8b597b] hover:bg-[#ffdec7]/40 text-xs font-semibold transition"
                        >
                          Request Return
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: Wishlist */}
        {activeTab === "wishlist" && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl text-[#493129]">Your Saved Wishlist ({wishlistProducts.length})</h2>
            {wishlistProducts.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#fffaf5] border border-[#493129]/15">
                <Heart className="w-12 h-12 stroke-1 text-[#493129]/30 mx-auto mb-2" />
                <h3 className="font-serif text-lg text-[#493129]">Your wishlist is clear</h3>
                <p className="text-xs text-[#493129]/60 mt-1">Tap the heart on any product card to curate your wishlist.</p>
                <Link href="/shop" className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#efa3a0] text-[#493129] text-xs font-bold shadow-coral">
                  Discover Flagships
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistProducts.map((p) => {
                  const v = p.variants[0];
                  return (
                    <div key={p.id} className="p-5 rounded-3xl bg-[#fffaf5] border border-[#493129]/15 shadow-subtle space-y-3">
                      <div className="relative w-full h-44 bg-white rounded-2xl border border-[#493129]/10 p-2 overflow-hidden">
                        <Image src={p.images[0]} alt={p.title} fill className="object-contain p-2" sizes="240px" />
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-[#ffeedb] text-red-600 hover:bg-[#ffdec7]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#8b597b]">{p.brandName}</span>
                        <h3 className="font-serif text-base text-[#493129] font-bold truncate mt-0.5">{p.title}</h3>
                        <div className="font-serif font-bold text-sm text-[#8b597b] mt-1">{formatCurrency(p.basePrice)}</div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Link
                          href={`/product/${p.slug}`}
                          className="flex-1 py-2 rounded-full border border-[#493129]/20 text-center text-xs font-semibold text-[#493129] hover:bg-[#ffeedb]"
                        >
                          Details
                        </Link>
                        {v && (
                          <button
                            onClick={() =>
                              addItem({
                                variantId: v.id,
                                productId: p.id,
                                title: p.title,
                                color: v.color,
                                storage: v.storage,
                                ram: v.ram,
                                image: p.images[0],
                                price: v.sellingPrice,
                                mrp: v.mrp,
                                quantity: 1,
                                stockAvailable: v.stockQuantity,
                                sku: v.sku,
                                barcode: v.barcode,
                                gstRate: p.gstRate,
                              })
                            }
                            className="flex-1 py-2 rounded-full bg-[#efa3a0] hover:bg-[#e58e8b] text-[#493129] text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add to Bag</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Saved Delivery Addresses */}
        {activeTab === "addresses" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-[#493129]">Saved Delivery Addresses</h2>
              <button
                onClick={() => setShowAddressModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#493129] hover:bg-[#38261f] text-[#ffeedb] text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#efa3a0]" />
                <span>Add New Address</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-6 rounded-3xl bg-[#fffaf5] border space-y-3 text-xs relative ${
                    addr.isDefault ? "border-[#8b597b] ring-1 ring-[#8b597b]/30" : "border-[#493129]/15"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-[#493129]">{addr.name}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#ffdec7] text-[#493129]">
                        {addr.type}
                      </span>
                    </div>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold text-[#8b597b] bg-[#8b597b]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Default Address
                      </span>
                    )}
                  </div>

                  <p className="text-[#493129]/80 font-sans leading-relaxed">
                    {addr.street}
                    {addr.landmark ? `, Near ${addr.landmark}` : ""}
                    <br />
                    {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                    <br />
                    Phone: {addr.phone}
                  </p>

                  <div className="flex items-center gap-3 pt-2 border-t border-[#493129]/10">
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="text-xs text-[#8b597b] font-semibold hover:underline"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-xs text-red-600 hover:underline ml-auto"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Recently Viewed */}
        {activeTab === "recent" && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl text-[#493129]">Recently Viewed Instruments ({recentProducts.length})</h2>
            {recentProducts.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#fffaf5] border border-[#493129]/15 text-xs text-[#493129]/60">
                You have not browsed any products recently.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    className="p-4 rounded-2xl bg-[#fffaf5] border border-[#493129]/10 hover:border-[#8b597b] transition group"
                  >
                    <div className="relative w-full h-36 bg-white rounded-xl border border-[#493129]/10 p-2 overflow-hidden mb-2">
                      <Image src={p.images[0]} alt={p.title} fill className="object-contain p-1" sizes="160px" />
                    </div>
                    <div className="text-[10px] uppercase font-bold text-[#8b597b]">{p.brandName}</div>
                    <div className="font-serif font-bold text-xs text-[#493129] group-hover:text-[#8b597b] transition truncate">
                      {p.title}
                    </div>
                    <div className="text-xs font-bold text-[#8b597b] mt-1">{formatCurrency(p.basePrice)}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Security & Profile */}
        {activeTab === "security" && (
          <div className="max-w-2xl p-6 sm:p-8 rounded-3xl bg-[#fffaf5] border border-[#493129]/15 shadow-subtle space-y-6 text-xs text-[#493129]">
            <h2 className="font-serif text-2xl text-[#493129]">Account Credentials & Security</h2>
            <div className="space-y-4">
              <div>
                <label className="font-semibold block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  defaultValue={user?.name || user?.fullName || "Raghav Anil"}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#ffeedb] border border-[#493129]/15"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Registered Contact Email</label>
                <input
                  type="email"
                  defaultValue={user?.email || "raghav@anilcommunications.com"}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#ffeedb] border border-[#493129]/15"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Primary Mobile Number (OTP Verified)</label>
                <input
                  type="text"
                  defaultValue="+91 98450 12345"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#ffeedb] border border-[#493129]/15"
                />
              </div>
              <button
                type="button"
                onClick={() => alert("Profile credentials updated successfully.")}
                className="px-6 py-2.5 rounded-full bg-[#493129] text-[#ffeedb] font-semibold text-xs hover:bg-[#38261f] transition"
              >
                Save Profile Changes
              </button>
            </div>
          </div>
        )}

        {/* Add Address Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#493129]/40 backdrop-blur-xs font-sans">
            <div className="w-full max-w-lg bg-[#fffaf5] border border-[#493129]/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#493129]/10 pb-3">
                <h3 className="font-serif text-xl text-[#493129]">Add New Delivery Address</h3>
                <button onClick={() => setShowAddressModal(false)} className="text-[#493129]/50 hover:text-[#493129]">
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#493129] block mb-1">Contact Name</label>
                    <input
                      type="text"
                      required
                      value={newAddr.name}
                      onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#ffeedb] border border-[#493129]/15"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#493129] block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#ffeedb] border border-[#493129]/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#493129] block mb-1">Flat / House No. / Building / Street</label>
                  <input
                    type="text"
                    required
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    placeholder="e.g. Flat 402, Prestige Hermitage, MG Road"
                    className="w-full px-3 py-2 rounded-xl bg-[#ffeedb] border border-[#493129]/15"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#493129] block mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={newAddr.landmark}
                      onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                      placeholder="e.g. Near Metro Station"
                      className="w-full px-3 py-2 rounded-xl bg-[#ffeedb] border border-[#493129]/15"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#493129] block mb-1">6-digit PIN Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      placeholder="e.g. 560001"
                      className="w-full px-3 py-2 rounded-xl bg-[#ffeedb] border border-[#493129]/15"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#493129] block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#ffeedb] border border-[#493129]/15"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#493129] block mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#ffeedb] border border-[#493129]/15"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <span className="font-semibold text-[#493129]">Address Type:</span>
                  {(["home", "work", "other"] as const).map((t) => (
                    <label key={t} className="flex items-center gap-1.5 cursor-pointer uppercase text-[11px] font-bold">
                      <input
                        type="radio"
                        name="addrType"
                        checked={newAddr.type === t}
                        onChange={() => setNewAddr({ ...newAddr, type: t })}
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={newAddr.isDefault}
                    onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                  />
                  <span>Make this my default shipping address</span>
                </label>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1 py-2.5 rounded-full border border-[#493129]/20 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full bg-[#efa3a0] text-[#493129] font-bold shadow-coral"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#ffeedb] flex items-center justify-center font-serif text-[#8b597b]">Loading account...</div>}>
      <AccountContent />
    </Suspense>
  );
}
