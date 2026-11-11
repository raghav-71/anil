"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Smartphone, Lock, Mail, ArrowRight, KeyRound } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginWithCredentials } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await loginWithCredentials(email, password);
    setLoading(false);

    if (res.success) {
      window.location.href = "/admin";
    } else {
      setError(res.error || "Authentication failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#ffeedb] text-[#493129] flex items-center justify-center p-4 antialiased">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-[#493129] text-[#ffeedb] flex items-center justify-center mx-auto shadow-md">
            <Smartphone className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#493129] tracking-tight">
            ANIL COMMUNICATION &amp; ZEROX
          </h1>
          <p className="text-xs text-[#8b597b] font-semibold uppercase tracking-wider">
            Owner Store Management Terminal
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#fffaf5] border border-[#493129]/10 rounded-3xl p-7 sm:p-8 shadow-md space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8b597b] pb-3 border-b border-[#493129]/10">
            <Lock className="w-3.5 h-3.5" />
            <span>Store Administrator Sign In</span>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-[#493129] block mb-1">Owner Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#493129]/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@anilcommunications.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#ffeedb]/50 border border-[#493129]/15 text-[#493129] placeholder-[#493129]/40 focus:outline-none focus:ring-1 focus:ring-[#8b597b]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#493129] block mb-1">Security PIN / Passkey</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#493129]/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#ffeedb]/50 border border-[#493129]/15 text-[#493129] placeholder-[#493129]/40 focus:outline-none focus:ring-1 focus:ring-[#8b597b]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#493129] hover:bg-[#35221b] disabled:opacity-50 text-[#ffeedb] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <span>{loading ? "Verifying..." : "Sign In to Admin"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link
              href="/"
              className="text-xs text-[#8b597b] hover:text-[#493129] font-medium underline"
            >
              Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
