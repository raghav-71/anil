"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { Mail, Lock, ArrowRight, User } from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
              Client Access
            </span>
            <h1 className="font-serif text-3xl text-[#493129]">Customer Sign In</h1>
            <p className="text-xs text-[#493129]/70 font-sans">
              Access your order history, delivery addresses, and GST invoices.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div>
              <label className="font-semibold text-[#493129] block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#493129]/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full pl-8 pr-3 py-2.5 rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#493129] block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#493129]/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-8 pr-3 py-2.5 rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#efa3a0] hover:bg-[#e58e8b] text-[#493129] font-bold text-xs flex items-center justify-center gap-2 shadow-coral transition"
            >
              <span>{loading ? "Authorizing..." : "Sign In to Client Account"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-[#493129]/70">
            <span>New client? </span>
            <Link href="/register" className="text-[#8b597b] font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

