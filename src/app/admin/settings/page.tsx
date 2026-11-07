"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Settings,
  Building2,
  Printer,
  ShieldAlert,
  CheckCircle2,
  Save,
  Laptop,
  KeyRound,
  Trash2,
  Lock,
} from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    storeName: "Anil Communications",
    tagline: "Premium Smartphones & High-Speed Accessories",
    phone: "+91 98765 43210",
    email: "support@anilcommunications.com",
    address: "Shop No. 14, Main Electronics Market, MG Road, Bengaluru - 560001",
    gstin: "29AAAAA0000A1Z5",
    invoicePrefix: "AC-2026",
    thermalPrinterType: "80mm",
    footerTerms: "Goods once sold carry manufacturer warranty.\nPlease preserve this invoice for warranty and claim services.",
    codEnabled: true,
    freeShippingThreshold: 999,
  });

  const [devices, setDevices] = useState<any[]>([]);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);

  const loadDevices = () => {
    fetch("/api/admin/device/verify")
      .then((res) => res.json())
      .then((data) => {
        setDevices(data.devices || []);
        setAccessLogs(data.logs || []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleRevokeDevice = async (deviceId: string) => {
    if (!confirm("Are you sure you want to revoke this device? POS operations will be immediately blocked on this machine.")) return;
    const res = await fetch("/api/admin/device/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    });

    if (res.ok) {
      loadDevices();
      alert("Device token revoked successfully.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">System Configuration</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
            Store & Device Security Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure GST identification, thermal receipt formatting, and owner-only trusted devices
          </p>
        </div>

        {saved && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Shop Identity Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Business Branding & GST Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Store / Legal Name *</label>
              <input
                type="text"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Store Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">GSTIN Number *</label>
              <input
                type="text"
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white uppercase font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Support Phone *</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-300 block mb-1">Store Physical Address (Printed on Invoices) *</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
          </div>
        </div>

        {/* Invoicing & Thermal Printer Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
            <Printer className="w-4 h-4 text-purple-400" />
            <span>POS Invoicing & Thermal Roll Formatting</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Sequential Invoice Prefix</label>
              <input
                type="text"
                value={form.invoicePrefix}
                onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Output example: AC-2026-00002</span>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Thermal Receipt Width</label>
              <select
                value={form.thermalPrinterType}
                onChange={(e) => setForm({ ...form, thermalPrinterType: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                <option value="80mm">80mm ESC/POS Standard Thermal Paper</option>
                <option value="58mm">58mm Compact Thermal Slip</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-300 block mb-1">Receipt Footer Warranty Disclaimer</label>
              <textarea
                rows={3}
                value={form.footerTerms}
                onChange={(e) => setForm({ ...form, footerTerms: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* OWNER-ONLY TRUSTED DEVICE REGISTRATION & REVOCATION CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Owner-Only Trusted Hardware Devices (POS Lockout Guard)</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
            Enforcement Active
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          The POS terminal and shop management system can only execute transactions on explicitly enrolled hardware. Unregistered computers or customer browsers are automatically rejected.
        </p>

        <div className="space-y-3 pt-2">
          {devices.map((dev) => (
            <div
              key={dev.id}
              className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                dev.isRevoked
                  ? "bg-red-950/20 border-red-900/40 opacity-60"
                  : "bg-slate-800/80 border-slate-700"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white text-sm">{dev.deviceName}</span>
                  {dev.isRevoked ? (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-300 border border-red-800 font-bold uppercase">
                      Revoked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold uppercase">
                      Authorized
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Token: {dev.token.slice(0, 18)}••••••••
                </p>
                <p className="text-[10px] text-slate-500">
                  Enrolled by {dev.enrolledBy} on {formatDate(dev.enrolledAt)}
                </p>
              </div>

              {!dev.isRevoked && (
                <button
                  type="button"
                  onClick={() => handleRevokeDevice(dev.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-semibold border border-red-800 flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Revoke Device Access</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
