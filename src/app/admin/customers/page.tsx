"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, Phone, Mail, ShoppingBag, IndianRupee, ShieldCheck, RefreshCw } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  firstSeen: string;
  lastOrderDate: string;
  role: "customer";
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadCustomers = () => {
    setLoading(true);
    fetch("/api/orders", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const orders = data.orders || [];
        const customerMap = new Map<string, CustomerRecord>();

        // Build unique customer aggregation from genuine order records
        orders.forEach((o: any) => {
          const key = (o.customerPhone || o.customerEmail || o.customerName).toLowerCase().trim();
          if (!customerMap.has(key)) {
            customerMap.set(key, {
              id: `cust-${customerMap.size + 1}`,
              name: o.customerName || "Customer",
              email: o.customerEmail || "N/A",
              phone: o.customerPhone || "N/A",
              totalOrders: 1,
              totalSpent: o.grandTotal || 0,
              firstSeen: o.createdAt,
              lastOrderDate: o.createdAt,
              role: "customer",
            });
          } else {
            const existing = customerMap.get(key)!;
            existing.totalOrders += 1;
            existing.totalSpent += o.grandTotal || 0;
            if (new Date(o.createdAt) > new Date(existing.lastOrderDate)) {
              existing.lastOrderDate = o.createdAt;
            }
          }
        });

        setCustomers(Array.from(customerMap.values()));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8b597b]">
            <Users className="w-4 h-4" />
            <span>Customer Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#493129] tracking-tight mt-1">
            Registered &amp; Active Customers
          </h1>
          <p className="text-xs text-[#493129]/70 mt-0.5">
            Verified customer accounts, order history totals, and lifetime transaction value.
          </p>
        </div>

        <button
          onClick={loadCustomers}
          className="p-2.5 rounded-full bg-[#fffaf5] border border-[#493129]/10 hover:bg-[#ffeedb] text-[#493129] transition shadow-xs self-start sm:self-auto"
          title="Refresh customers"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#fffaf5] border border-[#493129]/10 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-[#8b597b] font-bold uppercase tracking-wider block">Total Customers</span>
          <p className="text-2xl font-serif font-bold text-[#493129] mt-1">{customers.length}</p>
        </div>
        <div className="bg-[#fffaf5] border border-[#493129]/10 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-[#8b597b] font-bold uppercase tracking-wider block">Customer Orders</span>
          <p className="text-2xl font-serif font-bold text-[#493129] mt-1">
            {customers.reduce((acc, c) => acc + c.totalOrders, 0)}
          </p>
        </div>
        <div className="bg-[#fffaf5] border border-[#493129]/10 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-[#8b597b] font-bold uppercase tracking-wider block">Total Customer Spend</span>
          <p className="text-2xl font-serif font-bold text-[#493129] mt-1">
            {formatCurrency(customers.reduce((acc, c) => acc + c.totalSpent, 0))}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#fffaf5] border border-[#493129]/10 rounded-2xl p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#493129]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, or email..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-[#ffeedb]/50 border border-[#493129]/10 text-xs text-[#493129] placeholder-[#493129]/40 focus:outline-none focus:ring-1 focus:ring-[#8b597b]"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-[#fffaf5] border border-[#493129]/10 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#493129]/60">Loading customer profiles...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#493129]/60">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#ffeedb]/60 border-b border-[#493129]/10 text-[#493129] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-center">Orders</th>
                  <th className="p-4 text-right">Lifetime Spend</th>
                  <th className="p-4">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#493129]/10">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#ffeedb]/30 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#8b597b]/10 text-[#8b597b] font-bold flex items-center justify-center text-xs">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#493129]">{c.name}</p>
                          <span className="text-[10px] text-[#493129]/50 font-mono">{c.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[#493129]/80">
                        <Phone className="w-3 h-3 text-[#8b597b]" />
                        <span>{c.phone}</span>
                      </div>
                      {c.email !== "N/A" && (
                        <div className="flex items-center gap-1.5 text-[#493129]/60 text-[11px]">
                          <Mail className="w-3 h-3 text-[#8b597b]" />
                          <span>{c.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#8b597b]/10 text-[#8b597b]">
                        Customer
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-[#493129]">
                      <span className="inline-flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3 text-[#8b597b]" />
                        {c.totalOrders}
                      </span>
                    </td>
                    <td className="p-4 text-right font-serif font-bold text-[#493129]">
                      {formatCurrency(c.totalSpent)}
                    </td>
                    <td className="p-4 text-[#493129]/70 text-[11px]">
                      {formatDate(c.lastOrderDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

