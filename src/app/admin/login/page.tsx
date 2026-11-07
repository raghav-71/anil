"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, PRESET_ACCOUNTS } from "@/lib/auth-context";
import { UserRole } from "@/types";
import { Smartphone, Lock, Mail, ShieldCheck, ArrowRight, UserCheck, KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginWithCredentials, loginAs } = useAuth();

  const [email, setEmail] = useState("admin@anilcommunications.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await loginWithCredentials(email, password);
    setLoading(false);

    if (res.success) {
      router.push("/admin/dashboard");
    } else {
      setError(res.error || "Authentication failed.");
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    loginAs(role);
    if (role === "cashier") {
      router.push("/admin/pos");
    } else {
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20">
            <Smartphone className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">ANIL COMMUNICATIONS</h1>
          <p className="text-xs text-slate-400">Shop Management & Supermarket POS Billing Terminal</p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 pb-2 border-b border-slate-800">
            <Lock className="w-3.5 h-3.5" />
            <span>Staff Authentication Required</span>
          </div>

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Staff Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@anilcommunications.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Security PIN / Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Terminal"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Role Login for instant testing */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Quick Role Switcher (Preconfigured)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("super_admin")}
                className="p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/60 text-purple-200 text-[11px] font-semibold text-center transition"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("manager")}
                className="p-2 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/60 text-blue-200 text-[11px] font-semibold text-center transition"
              >
                Store Mgr
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("cashier")}
                className="p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-200 text-[11px] font-semibold text-center transition"
              >
                POS Cashier
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500">
          <p>Protected by Role-Based Access Control (RBAC) & Server Session Verification</p>
        </div>
      </div>
    </div>
  );
}

