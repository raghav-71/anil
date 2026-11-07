"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Users, Plus, Phone, Mail, MapPin, Building2, CheckCircle2, X } from "lucide-react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([
    {
      id: "sup-1",
      companyName: "Apex Mobile Distributors Pvt Ltd",
      contactPerson: "Suresh Agarwal",
      phone: "+91 98440 11223",
      email: "orders@apexdistributors.com",
      gstin: "29AABCA9001D1ZF",
      address: "Plot 45, Peenya Industrial Area Phase 2, Bengaluru",
      paymentTerms: "Net 15",
      totalPurchases: 1850000,
      outstandingBalance: 120000,
    },
    {
      id: "sup-2",
      companyName: "Prime Accessories Wholesale Hub",
      contactPerson: "Kishore Kumar",
      phone: "+91 97411 88990",
      email: "sales@primeaccessories.in",
      gstin: "29AABCP3344F1ZK",
      address: "SP Road Electronics Market, Nagarathpete, Bengaluru",
      paymentTerms: "Immediate / COD",
      totalPurchases: 420000,
      outstandingBalance: 0,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    gstin: "",
    address: "",
    paymentTerms: "Net 30",
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.phone) return;

    setSuppliers([
      ...suppliers,
      {
        ...form,
        id: `sup-${Date.now()}`,
        totalPurchases: 0,
        outstandingBalance: 0,
      },
    ]);
    setShowModal(false);
    setForm({ companyName: "", contactPerson: "", phone: "", email: "", gstin: "", address: "", paymentTerms: "Net 30" });
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Vendor Management</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
            Suppliers Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage wholesale distributors, payment terms, and vendor contacts
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Supplier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map((s) => (
          <div key={s.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base text-white">{s.companyName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Contact: {s.contactPerson}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {s.paymentTerms}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-mono">{s.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>{s.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-mono">GSTIN: {s.gstin}</span>
              </div>
              <div className="flex items-start gap-2 pt-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                <span>{s.address}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Total Procured</span>
                <p className="font-bold text-white text-sm mt-0.5">{formatCurrency(s.totalPurchases)}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Outstanding Balance</span>
                <p className="font-bold text-amber-400 text-sm mt-0.5">{formatCurrency(s.outstandingBalance)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Add Supplier</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Company / Business Name *</label>
                <input
                  type="text"
                  required
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">GSTIN</label>
                <input
                  type="text"
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white uppercase font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

