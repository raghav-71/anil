"use client";

import React, { useState, useEffect } from "react";

export const dynamic = "force-dynamic";
import {
  Settings,
  Building2,
  CheckCircle2,
  Save,
  Truck,
  Store,
  Bell,
  Mail,
  MessageSquare,
  AlertCircle,
  Send,
  Loader2,
} from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testingWa, setTestingWa] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState<{ type: "wa" | "email"; message: string; success: boolean } | null>(null);

  const [serviceStatus, setServiceStatus] = useState<any>(null);

  const [form, setForm] = useState({
    storeName: "ANIL COMMUNICATION & ZEROX",
    tagline: "Premium Mobile Phones & Genuine Accessories",
    phone: "+91 9380124254",
    email: "",
    address: "Near Canara Bank, Belagavi, Karnataka - 591103, India",
    city: "Belagavi",
    state: "Karnataka",
    pincode: "591103",
    gstin: "29CQWPK2582Q1ZC",
    invoicePrefix: "AC-2026",
    footerTerms: "Goods once sold carry official brand warranty. Please preserve tax invoice for warranty claims.",
    codEnabled: true,
    freeShippingThreshold: 999,
    standardShippingFee: 99,
    ownerNotificationEmail: "",
    ownerWhatsAppNumber: "919380124254",
    whatsappOrderAlertsEnabled: true,
    emailOrderAlertsEnabled: true,
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setForm((prev) => ({ ...prev, ...data.settings }));
        }
        if (data.status) {
          setServiceStatus(data.status);
        }
      }
    } catch {
      // Use fallback defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: form }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3500);
      } else {
        alert("Failed to save settings to server.");
      }
    } catch {
      alert("Network error connecting to settings server.");
    }
  };

  const handleTestWhatsApp = async () => {
    setTestingWa(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_notification" }),
      });
      const data = await res.json();
      setTestResult({
        type: "wa",
        success: data.success,
        message: data.message || (data.success ? "Test sent!" : data.error || "Failed"),
      });
    } catch (err: any) {
      setTestResult({
        type: "wa",
        success: false,
        message: err.message || "Failed to reach WhatsApp service.",
      });
    } finally {
      setTestingWa(false);
    }
  };

  const handleTestEmail = async () => {
    if (!form.ownerNotificationEmail) {
      alert("Please enter an owner notification email first.");
      return;
    }
    setTestingEmail(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_email", email: form.ownerNotificationEmail }),
      });
      const data = await res.json();
      setTestResult({
        type: "email",
        success: data.success,
        message: data.message || (data.success ? "Test email sent!" : data.error || "Failed"),
      });
    } catch (err: any) {
      setTestResult({
        type: "email",
        success: false,
        message: err.message || "Failed to reach email service.",
      });
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E8D5C5] pb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B597B]">
            Store Configuration
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#493129] tracking-tight mt-0.5">
            Store Settings
          </h1>
          <p className="text-xs text-[#806D63] mt-1">
            Configure store business details, address, owner notifications (WhatsApp & Email), and checkout shipping rules
          </p>
        </div>

        {saved && (
          <div className="px-4 py-2 rounded-full bg-[#27845A]/10 border border-[#27845A]/30 text-[#27845A] text-xs font-bold flex items-center gap-1.5 animate-fadeIn shadow-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      {testResult && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
            testResult.success
              ? "bg-[#27845A]/10 border-[#27845A]/30 text-[#27845A]"
              : "bg-[#FFEDDB] border-[#C0393A]/30 text-[#493129]"
          }`}
        >
          <AlertCircle
            className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
              testResult.success ? "text-[#27845A]" : "text-[#B7791F]"
            }`}
          />
          <div className="flex-1">
            <p className="font-bold">
              {testResult.type === "wa" ? "WhatsApp Diagnostic" : "Email Diagnostic"}
            </p>
            <p className="text-[11px] mt-0.5 leading-relaxed">{testResult.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* 1. Owner Order Notifications */}
        <div className="bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E8D5C5]">
            <Bell className="w-4 h-4 text-[#8B597B]" />
            <h2 className="text-sm font-serif font-bold text-[#493129]">
              Instant Owner Order Notifications
            </h2>
          </div>

          <p className="text-[#806D63] text-[11px] leading-relaxed">
            Configure automated owner alerts when customers complete checkout. System triggers WhatsApp messages to the store phone and email summaries.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* WhatsApp Notification Block */}
            <div className="p-4 rounded-2xl bg-[#F5E8DC]/60 border border-[#E8D5C5] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#27845A]" />
                  <span className="font-bold text-[#493129]">Owner WhatsApp Alerts</span>
                </div>
                <span
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    serviceStatus?.whatsapp?.isConfigured
                      ? "bg-[#27845A]/15 text-[#27845A] border border-[#27845A]/30"
                      : "bg-[#FFDEC7] text-[#806D63] border border-[#E8D5C5]"
                  }`}
                >
                  {serviceStatus?.whatsapp?.isConfigured ? "Connected" : "Setup Pending"}
                </span>
              </div>

              <div>
                <label className="block text-[#493129] font-semibold mb-1">
                  Recipient WhatsApp Number
                </label>
                <input
                  type="text"
                  required
                  value={form.ownerWhatsAppNumber}
                  onChange={(e) => setForm({ ...form, ownerWhatsAppNumber: e.target.value })}
                  placeholder="919380124254"
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] font-mono focus:outline-none focus:border-[#8B597B]"
                />
                <span className="text-[10px] text-[#806D63] mt-1 block">
                  Official shop phone: +91 9380124254 (Country code without +)
                </span>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  disabled={testingWa}
                  onClick={handleTestWhatsApp}
                  className="w-full py-2 px-3 rounded-xl bg-[#27845A] hover:bg-[#1f6b49] disabled:opacity-50 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  {testingWa ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Test WhatsApp Alert</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Email Notification Block */}
            <div className="p-4 rounded-2xl bg-[#F5E8DC]/60 border border-[#E8D5C5] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#8B597B]" />
                  <span className="font-bold text-[#493129]">Owner Email Alerts</span>
                </div>
                <span
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    serviceStatus?.email?.isConfigured
                      ? "bg-[#27845A]/15 text-[#27845A] border border-[#27845A]/30"
                      : "bg-[#FFDEC7] text-[#806D63] border border-[#E8D5C5]"
                  }`}
                >
                  {serviceStatus?.email?.isConfigured ? "Connected" : "Setup Pending"}
                </span>
              </div>

              <div>
                <label className="block text-[#493129] font-semibold mb-1">
                  Recipient Owner Email Address
                </label>
                <input
                  type="email"
                  value={form.ownerNotificationEmail}
                  onChange={(e) => setForm({ ...form, ownerNotificationEmail: e.target.value })}
                  placeholder="owner@anilcommunications.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
                />
                <span className="text-[10px] text-[#806D63] mt-1 block">
                  Configurable store owner inbox for order confirmations
                </span>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  disabled={testingEmail}
                  onClick={handleTestEmail}
                  className="w-full py-2 px-3 rounded-xl bg-[#493129] hover:bg-[#8B597B] disabled:opacity-50 text-[#FFEDDB] font-bold text-[11px] flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  {testingEmail ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying Provider...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Test Email Alert</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Business Identity */}
        <div className="bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E8D5C5]">
            <Building2 className="w-4 h-4 text-[#8B597B]" />
            <h2 className="text-sm font-serif font-bold text-[#493129]">
              Store Identification & Public Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#493129] font-bold mb-1">Store Name</label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
              />
            </div>

            <div>
              <label className="block text-[#493129] font-bold mb-1">Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
              />
            </div>

            <div>
              <label className="block text-[#493129] font-bold mb-1">Store Frontline Phone</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B] font-mono"
              />
            </div>

            <div>
              <label className="block text-[#493129] font-bold mb-1">Store Public Contact Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#493129] font-bold mb-1">Physical Store & Pickup Address</label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
              />
            </div>

            <div>
              <label className="block text-[#493129] font-bold mb-1">City</label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
              />
            </div>

            <div>
              <label className="block text-[#493129] font-bold mb-1">PIN Code</label>
              <input
                type="text"
                required
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] font-mono focus:outline-none focus:border-[#8B597B]"
              />
            </div>

            <div>
              <label className="block text-[#493129] font-bold mb-1">GSTIN (Optional)</label>
              <input
                type="text"
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                placeholder="Unregistered / Composition"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] font-mono focus:outline-none focus:border-[#8B597B]"
              />
            </div>

            <div>
              <label className="block text-[#493129] font-bold mb-1">Order / Invoice Prefix</label>
              <input
                type="text"
                value={form.invoicePrefix}
                onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] font-mono focus:outline-none focus:border-[#8B597B]"
              />
            </div>
          </div>
        </div>

        {/* 3. Shipping & Checkout Rules */}
        <div className="bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E8D5C5]">
            <Truck className="w-4 h-4 text-[#8B597B]" />
            <h2 className="text-sm font-serif font-bold text-[#493129]">
              Shipping & Fulfillment Rules
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#493129] font-bold mb-1">
                Free Delivery Order Threshold (₹)
              </label>
              <input
                type="number"
                min="0"
                value={form.freeShippingThreshold}
                onChange={(e) => setForm({ ...form, freeShippingThreshold: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] font-mono focus:outline-none focus:border-[#8B597B]"
              />
              <span className="text-[10px] text-[#806D63] mt-1 block">
                Orders above this amount qualify for ₹0 free doorstep delivery
              </span>
            </div>

            <div>
              <label className="block text-[#493129] font-bold mb-1">Standard Shipping Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={form.standardShippingFee}
                onChange={(e) => setForm({ ...form, standardShippingFee: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] font-mono focus:outline-none focus:border-[#8B597B]"
              />
            </div>

            <div>
              <label className="block text-[#493129] font-bold mb-1">Cash on Delivery (COD)</label>
              <select
                value={form.codEnabled ? "yes" : "no"}
                onChange={(e) => setForm({ ...form, codEnabled: e.target.value === "yes" })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
              >
                <option value="yes">Enabled (Doorstep cash collection)</option>
                <option value="no">Disabled (Prepaid online only)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3 rounded-full bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] text-xs font-bold flex items-center gap-2 shadow-sm transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
