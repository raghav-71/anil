"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { User, Mail, Phone, Lock, ArrowRight, Building } from "lucide-react";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    gstin: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/orders");
    }, 600);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ffeedb]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 py-16">
        <div className="max-w-md w-full bg-[#fffaf5] border border-[#493129]/10 rounded-3xl p-8 sm:p-10 shadow-subtle space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8b597b]">
              New Patron
            </span>
            <h1 className="font-serif text-3xl text-[#493129]">Register Account</h1>
            <p className="text-xs text-[#493129]/70 font-sans">
              Create an account for expedited checkout and warranty history.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-sans">
            <div>
              <label className="font-semibold text-[#493129] block mb-1">Full Legal Name *</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#493129]/40" />
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Ramesh Sharma"
                  className="w-full pl-8 pr-3 py-2.5 rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#493129] block mb-1">Phone Number (10 Digits) *</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#493129]/40" />
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="9845012345"
                  className="w-full pl-8 pr-3 py-2.5 rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#493129] block mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#493129]/40" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="ramesh@example.com"
                  className="w-full pl-8 pr-3 py-2.5 rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#493129] block mb-1">GSTIN (Optional for B2B Invoice)</label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#493129]/40" />
                <input
                  type="text"
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                  placeholder="29AAAAA0000A1Z5"
                  className="w-full pl-8 pr-3 py-2.5 rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b] uppercase font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#493129] block mb-1">Choose Password *</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#493129]/40" />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-8 pr-3 py-2.5 rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#efa3a0] hover:bg-[#e58e8b] text-[#493129] font-bold text-xs flex items-center justify-center gap-2 shadow-coral transition mt-2"
            >
              <span>{loading ? "Registering Client..." : "Complete Registration"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-[#493129]/70">
            <span>Already have an account? </span>
            <Link href="/login" className="text-[#8b597b] font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

