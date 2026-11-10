"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  MessageCircle,
  Truck,
  Store,
} from "lucide-react";

export default function CheckoutPage() {
  const { items, subtotal, discountAmount, appliedCoupon, shippingFee, grandTotal, clearCart } = useCart();

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("custom");
  const [fulfillmentType, setFulfillmentType] = useState<"delivery" | "pickup">("delivery");
  const [idempotencyKey] = useState(() => `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

  const [formData, setFormData] = useState({
    fullName: "Ramesh Sharma",
    phone: "9845012345",
    email: "ramesh.sharma@example.com",
    street: "",
    landmark: "",
    city: "",
    state: "Karnataka",
    pincode: "",
    paymentMethod: "razorpay" as "razorpay" | "cod",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  React.useEffect(() => {
    fetch("/api/addresses")
      .then((res) => res.json())
      .then((d) => {
        if (d.addresses && d.addresses.length > 0) {
          setSavedAddresses(d.addresses);
          const defaultAddr = d.addresses.find((a: any) => a.isDefault) || d.addresses[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setFormData((prev) => ({
              ...prev,
              fullName: defaultAddr.name,
              phone: defaultAddr.phone.replace(/\D/g, ""),
              street: defaultAddr.street,
              landmark: defaultAddr.landmark || "",
              city: defaultAddr.city,
              state: defaultAddr.state,
              pincode: defaultAddr.pincode,
            }));
          }
        }
      })
      .catch(() => { });
  }, []);

  const handleSelectAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setFormData((prev) => ({
      ...prev,
      fullName: addr.name,
      phone: addr.phone.replace(/\D/g, ""),
      street: addr.street,
      landmark: addr.landmark || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.fullName || !formData.phone) {
        throw new Error("Please enter your name and 10-digit mobile number.");
      }

      if (fulfillmentType === "delivery" && (!formData.street || !formData.pincode || !formData.city)) {
        throw new Error("Please complete all required delivery address details (street, city, pincode).");
      }

      const shippingAddress =
        fulfillmentType === "pickup"
          ? {
              street: "Bagalkot Main Road, Pant Nagar, Near Canara Bank",
              landmark: "Near Canara Bank",
              city: "Pant Nagar",
              state: "Karnataka",
              pincode: "591103",
            }
          : {
              street: formData.street,
              landmark: formData.landmark,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
            };

      const payload = {
        customerName: formData.fullName,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        shippingAddress,
        fulfillmentType,
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        paymentMethod: formData.paymentMethod,
        discountAmount: discountAmount || 0,
        couponCode: appliedCoupon?.code,
        idempotencyKey,
      };

      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order initialization failed.");

      if (formData.paymentMethod === "cod") {
        setOrderSuccess(data.order);
        clearCart();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 12)}`;
        const mockSignature = `sig_${Math.random().toString(36).substring(2, 16)}`;

        const verifyRes = await fetch("/api/checkout/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: data.razorpayOrderId,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: mockSignature,
            orderDetails: payload,
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification declined.");

        setOrderSuccess(verifyData.order);
        clearCart();
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while confirming checkout.");
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS CONFIRMATION
  if (orderSuccess) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FFEDDB]">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full text-center">
          <div className="bg-[#FFFAF5] rounded-3xl p-8 sm:p-14 border border-[#E8D5C5] shadow-sm space-y-6">
            <div className="w-20 h-20 bg-[#27845A]/10 text-[#27845A] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B597B]">
                Consignment Confirmed
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#493129]">
                Your Order Has Been Secured
              </h1>
              <p className="text-xs sm:text-sm text-[#806D63] max-w-md mx-auto font-sans leading-relaxed">
                Consignment <strong className="font-mono text-[#8B597B]">#{orderSuccess.orderNumber}</strong> has been allocated in our physical inventory ledger and prepared for dispatch.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5E8DC] border border-[#E8D5C5] text-left text-xs space-y-3 font-sans">
              <div className="flex justify-between border-b border-[#E8D5C5] pb-2">
                <span className="text-[#806D63]">Consignment #</span>
                <span className="font-bold text-[#493129] font-mono">#{orderSuccess.orderNumber}</span>
              </div>
              <div className="flex justify-between border-b border-[#E8D5C5] pb-2">
                <span className="text-[#806D63]">Settlement</span>
                <span className="font-bold text-[#8B597B] uppercase">{orderSuccess.paymentStatus} ({orderSuccess.paymentMethod.toUpperCase()})</span>
              </div>
              <div className="flex justify-between border-b border-[#E8D5C5] pb-2">
                <span className="text-[#806D63]">
                  {orderSuccess.fulfillmentType === "pickup" ? "Pickup Hub" : "Delivery Address"}
                </span>
                <span className="font-medium text-[#493129] text-right">
                  {orderSuccess.fulfillmentType === "pickup"
                    ? "Bagalkot Main Road, Pant Nagar, Near Canara Bank (Ready in 2 hrs)"
                    : `${orderSuccess.customerName}, ${orderSuccess.shippingAddress.street}, ${orderSuccess.shippingAddress.city} - ${orderSuccess.shippingAddress.pincode}`}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="font-bold text-[#493129]">Total Settled (GST 18% Included)</span>
                <span className="font-serif text-xl font-bold text-[#8B597B]">{formatCurrency(orderSuccess.grandTotal)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href={`/orders?orderId=${orderSuccess.orderNumber}`}
                className="flex-1 py-3.5 px-6 rounded-full bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <span>Track Live Consignment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/shop"
                className="flex-1 py-3.5 px-6 rounded-full bg-[#FFDEC7] hover:bg-[#E8D5C5] text-[#493129] text-xs font-semibold text-center border border-[#E8D5C5] transition"
              >
                Return to Collections
              </Link>
            </div>

            {/* Direct WhatsApp Order Tracking & Enquiry */}
            <div className="pt-2">
              <a
                href={`https://wa.me/919380124254?text=${encodeURIComponent(
                  `Hello ANIL COMMUNICATION & ZEROX, I am inquiring regarding my order #${orderSuccess.orderNumber}. Could you please update me on dispatch and delivery status?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-full bg-[#27845A] hover:bg-[#206f4c] text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Track Order on WhatsApp (+91 9380124254)</span>
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FFEDDB]">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="font-serif text-2xl text-[#493129]">Your shopping bag is empty.</p>
          <Link href="/shop" className="mt-4 inline-block px-6 py-2.5 bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] rounded-full text-xs font-bold">
            Browse The Collection
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FFEDDB]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8 pb-4 border-b border-[#E8D5C5]">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B597B]">
            Secure Acquisition
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#493129] mt-1">Express Checkout</h1>
          <p className="text-xs text-[#806D63] font-sans mt-1">Provide your delivery particulars and choose payment method</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-[#C0393A]/10 border border-[#C0393A]/30 text-[#C0393A] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#C0393A] flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 font-sans">
          {/* Shipping Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-8 rounded-3xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-sm space-y-4">
              <h2 className="font-serif text-lg text-[#493129]">1. Contact & Delivery Recipient</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-[#493129] block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-full bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#493129] block mb-1">Phone Number (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-full bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B] font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-[#493129] block mb-1">Email (For Tax Invoice & Warranty) *</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-full bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg text-[#493129]">2. Delivery & Fulfillment Mode</h2>
              </div>

              {/* Delivery vs Store Pickup Selector */}
              <div className="grid grid-cols-2 gap-3 pb-2">
                <button
                  type="button"
                  onClick={() => setFulfillmentType("delivery")}
                  className={`p-3.5 rounded-2xl border text-left text-xs transition flex flex-col gap-1 ${
                    fulfillmentType === "delivery"
                      ? "border-[#8B597B] bg-[#FFDEC7] ring-1 ring-[#8B597B]"
                      : "border-[#E8D5C5] bg-[#FFFFFF] hover:border-[#8B597B]"
                  }`}
                >
                  <span className="font-bold text-[#493129] flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#8B597B]" />
                    <span>Doorstep Delivery</span>
                  </span>
                  <span className="text-[10px] text-[#806D63]">
                    Dispatched from Pant Nagar store to your address
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType("pickup")}
                  className={`p-3.5 rounded-2xl border text-left text-xs transition flex flex-col gap-1 ${
                    fulfillmentType === "pickup"
                      ? "border-[#8B597B] bg-[#FFDEC7] ring-1 ring-[#8B597B]"
                      : "border-[#E8D5C5] bg-[#FFFFFF] hover:border-[#8B597B]"
                  }`}
                >
                  <span className="font-bold text-[#493129] flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-[#8B597B]" />
                    <span>In-Store Pickup</span>
                  </span>
                  <span className="text-[10px] text-[#27845A] font-bold">
                    FREE • Ready in 2 Hours
                  </span>
                </button>
              </div>

              {fulfillmentType === "pickup" ? (
                <div className="p-4 rounded-2xl bg-[#FFEDDB] border border-[#E8D5C5] text-xs space-y-2">
                  <div className="flex items-center gap-2 text-[#493129] font-bold">
                    <Store className="w-4 h-4 text-[#8B597B]" />
                    <span>Store Pickup Hub: ANIL COMMUNICATION &amp; ZEROX</span>
                  </div>
                  <p className="text-[11px] text-[#806D63] leading-relaxed">
                    Bagalkot Main Road, Pant Nagar, Near Canara Bank, 591103, Karnataka, India
                  </p>
                  <p className="text-[10px] text-[#493129] font-medium pt-1">
                    📞 Helpline: +91 9380124254 • Timing: 10:00 AM - 8:30 PM (Mon-Sat)
                  </p>
                  <span className="inline-block px-2.5 py-1 rounded-full bg-[#27845A]/15 text-[#27845A] font-bold text-[10px]">
                    ✓ No shipping fee applies on self-pickup
                  </span>
                </div>
              ) : (
                <>
                  {savedAddresses.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleSelectAddress(addr)}
                          className={`p-3 rounded-2xl border text-left text-xs transition ${
                            selectedAddressId === addr.id
                              ? "border-[#8B597B] bg-[#FFDEC7] ring-1 ring-[#8B597B]"
                              : "border-[#E8D5C5] bg-[#FFFFFF] hover:border-[#8B597B]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#493129]">{addr.name}</span>
                            <span className="text-[10px] uppercase font-bold text-[#8B597B]">{addr.type}</span>
                          </div>
                          <p className="text-[11px] text-[#806D63] truncate mt-1">{addr.street}</p>
                          <p className="text-[11px] text-[#806D63]">{addr.city} - {addr.pincode}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="sm:col-span-2">
                      <label className="font-semibold text-[#493129] block mb-1">House / Building / Street *</label>
                      <input
                        type="text"
                        required={fulfillmentType === "delivery"}
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-full bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-[#493129] block mb-1">Landmark (Optional)</label>
                      <input
                        type="text"
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-full bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-[#493129] block mb-1">City *</label>
                      <input
                        type="text"
                        required={fulfillmentType === "delivery"}
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-full bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-[#493129] block mb-1">State *</label>
                      <input
                        type="text"
                        required={fulfillmentType === "delivery"}
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-full bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-[#493129] block mb-1">PIN Code *</label>
                      <input
                        type="text"
                        required={fulfillmentType === "delivery"}
                        maxLength={6}
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-full bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-8 rounded-3xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-sm space-y-4">
              <h2 className="font-serif text-lg text-[#493129]">3. Settlement Method</h2>
              <div className="space-y-3">
                <label
                  className={`p-5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${formData.paymentMethod === "razorpay"
                    ? "border-[#8B597B] bg-[#FFDEC7] ring-1 ring-[#8B597B]"
                    : "border-[#E8D5C5] bg-[#FFFFFF] hover:border-[#8B597B]"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={formData.paymentMethod === "razorpay"}
                      onChange={handleChange}
                      className="accent-[#8B597B]"
                    />
                    <div>
                      <span className="font-serif text-sm font-bold text-[#493129] block">
                        Online Payment (UPI, Credit/Debit Cards, NetBanking)
                      </span>
                      <p className="text-[11px] text-[#806D63] mt-0.5">
                        Secured through Razorpay • Instant reservation & insured dispatch
                      </p>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-[#8B597B]" />
                </label>

                <label
                  className={`p-5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${formData.paymentMethod === "cod"
                    ? "border-[#8B597B] bg-[#FFDEC7] ring-1 ring-[#8B597B]"
                    : "border-[#E8D5C5] bg-[#FFFFFF] hover:border-[#8B597B]"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={handleChange}
                      className="accent-[#8B597B]"
                    />
                    <div>
                      <span className="font-serif text-sm font-bold text-[#493129] block">
                        Cash on Delivery (COD)
                      </span>
                      <p className="text-[11px] text-[#806D63] mt-0.5">
                        Settle cash or UPI directly with courier associate upon delivery
                      </p>
                    </div>
                  </div>
                  <Banknote className="w-5 h-5 text-[#8B597B]" />
                </label>
              </div>
            </div>
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-sm space-y-6 sticky top-28">
              <h2 className="font-serif text-xl text-[#493129] pb-3 border-b border-[#E8D5C5]">
                Consignment Summary ({items.length} items)
              </h2>

              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {items.map((item) => (
                  <div key={item.variantId} className="flex items-center gap-3 text-xs">
                    <img
                      src={item.image || "/images/products/fallback-product.svg"}
                      alt={item.title}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes("fallback-product.svg")) {
                          target.src = "/images/products/fallback-product.svg";
                        }
                      }}
                      className="w-12 h-12 rounded-xl object-contain bg-[#FFFFFF] border border-[#E8D5C5] p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-bold text-[#493129] truncate">{item.title}</p>
                      <p className="text-[11px] text-[#806D63]">Qty: {item.quantity} • {item.storage || item.color || "Standard"}</p>
                    </div>
                    <span className="font-serif font-bold text-[#493129]">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs pt-4 border-t border-[#E8D5C5]">
                <div className="flex justify-between text-[#806D63]">
                  <span>Subtotal (GST Included)</span>
                  <span className="font-bold text-[#493129] font-serif">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#27845A] font-semibold">
                    <span>Coupon Savings ({appliedCoupon?.code})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#806D63]">
                  <span>Insured Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-[#8B597B] uppercase">Complimentary</strong> : formatCurrency(shippingFee)}</span>
                </div>
                <div className="pt-3 border-t border-[#E8D5C5] flex justify-between items-baseline">
                  <span className="font-serif text-base font-bold text-[#493129]">Total Payable</span>
                  <span className="font-serif text-2xl font-bold text-[#8B597B]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-[#493129] hover:bg-[#8B597B] disabled:opacity-50 text-[#FFEDDB] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{loading ? "Authorizing & Reserving Stock..." : `Settle ${formatCurrency(grandTotal)} & Secure Order`}</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#806D63] font-serif">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8B597B]" />
                <span>GST Tax Invoice Included • 100% Insured Delivery</span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
