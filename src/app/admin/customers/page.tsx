"use client";

import React, { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { UserCheck, Search, Plus, Phone, Mail, MapPin, Receipt, X } from "lucide-react";

export default function CustomersCRMPage() {
  const [customers, setCustomers] = useState<any[]>([
    {
      id: "cust-1",
      name: "Ramesh Sharma",
      phone: "9845012345",
      email: "ramesh.sharma@example.com",
      gstin: "29AABCS1429B1Z8",
      address: "Flat 402, Prestige Palms, Indiranagar, Bengaluru - 560038",
      totalOrders: 3,
      totalSpent: 182490,
      createdAt: "2026-01-15T10:00:00Z",
    },
    {
      id: "cust-2",
      name: "Pooja Reddy",
      phone: "9880098765",
      email: "pooja.reddy@example.com",
      address: "12/A, 4th Cross, Koramangala 5th Block, Bengaluru - 560034",
      totalOrders: 1,
      totalSpent: 64999,
      createdAt: "2026-02-02T14:30:00Z",
    },
    {
      id: "cust-3",
      name: "Vikram Mehta",
      phone: "9740055443",
      email: "vikram.m@techcorp.in",
      gstin: "29AABCV9988C1Z2",
      address: "TechCorp Solutions, Whitefield Main Rd, Bengaluru - 560066",
      totalOrders: 5,
      totalSpent: 420000,
      createdAt: "2026-01-08T11:20:00Z",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", gstin: "", address: "" });

  const filtered = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.gstin && c.gstin.toLowerCase().includes(q));
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;

    setCustomers([
      {
        ...form,
        id: `cust-${Date.now()}`,
        totalOrders: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
      },
      ...customers,
    ]);
    setShowModal(false);
    setForm({ name: "", phone: "", email: "", gstin: "", address: "" });
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Customer Relationship</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
            Customer Directory & CRM
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track customer purchase history, GST identification, and repeat customer loyalty
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, GSTIN..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Customer Name</th>
                <th className="py-3 px-3">Contact Details</th>
                <th className="py-3 px-3">GSTIN</th>
                <th className="py-3 px-3 text-center">Orders Count</th>
                <th className="py-3 px-3">Lifetime Spending</th>
                <th className="py-3 px-3">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <span className="font-bold text-white block">{c.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-xs">{c.address}</span>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className="text-white block">+91 {c.phone}</span>
                    <span className="text-[10px] text-slate-400 font-sans">{c.email || "N/A"}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] font-semibold text-blue-400">
                    {c.gstin || "B2C Consumer"}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-white">{c.totalOrders} Bills</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">{formatCurrency(c.totalSpent)}</td>
                  <td className="py-3 px-3 text-slate-500">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Add Customer</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">GSTIN (Optional)</label>
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

