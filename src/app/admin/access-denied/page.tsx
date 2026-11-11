"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-[#ffeedb] text-[#493129] flex items-center justify-center p-6 antialiased">
      <div className="max-w-md w-full bg-[#fffaf5] border border-rose-200 rounded-3xl p-8 shadow-md text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full inline-block">
            403 Forbidden
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#493129]">Owner Access Only</h1>
          <p className="text-xs text-[#493129]/80 leading-relaxed">
            The Anil Communications management console is strictly restricted to the pre-authorized business owner.
            Customer accounts do not possess administrative access privileges.
          </p>
        </div>

        <div className="pt-3 border-t border-[#493129]/10 flex flex-col gap-2">
          <Link
            href="/"
            className="w-full py-2.5 rounded-full bg-[#493129] hover:bg-[#38241e] text-[#ffeedb] text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>
          <Link
            href="/admin/login"
            className="w-full py-2.5 rounded-full border border-[#493129]/20 hover:bg-[#ffeedb] text-[#493129] text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Owner Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

