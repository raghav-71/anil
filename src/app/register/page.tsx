"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { supabase } from "@/lib/supabase/client";
import { User, Mail, Phone, Lock, ArrowRight, Building, CheckCircle2, AlertCircle } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Basic validation
    if (!form.fullName.trim() || !form.email.trim() || !form.password) {
      setError("Please fill in all mandatory fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    const cleanPhone = form.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name: form.fullName.trim(),
            phone: cleanPhone,
            gstin: form.gstin.trim() || null,
            role: "customer",
          },
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/account` : undefined,
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      // Synchronize customer profile into Supabase PostgreSQL profiles table
      try {
        await fetch("/api/auth/sync-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authUserId: data?.user?.id,
            email: form.email.trim(),
            fullName: form.fullName.trim(),
            phone: cleanPhone,
          }),
        });
      } catch (syncErr) {
        console.warn("Profile sync warning:", syncErr);
      }

      if (data?.session) {
        // Immediate session created (auto-confirm enabled)
        router.push("/account");
      } else if (data?.user) {
        // Confirmation email sent
        setSuccessMessage(
          "Account created successfully! If email verification is enabled on your account, please check your inbox to confirm your email before signing in."
        );
      } else {
        router.push("/account");
      }
    } catch (err: any) {
      // If Supabase has network or config issue, provide clear user-friendly guidance
      setError(err.message || "Failed to create account. Please check your credentials.");
    } finally {
      setLoading(false);
    }
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
            <h1 className="font-serif text-3xl text-[#493129]">Register Account</h1>
            <p className="text-xs text-[#493129]/70 font-sans">
              Create an account for expedited checkout, tracking, and warranty history.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Registration Initiated</span>
              </div>
              <p className="leading-relaxed">{successMessage}</p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-block px-4 py-1.5 rounded-full bg-emerald-700 text-[#ffeedb] text-[11px] font-semibold hover:bg-emerald-800 transition"
                >
                  Proceed to Sign In
                </Link>
              </div>
            </div>
          )}

          {!successMessage && (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="font-semibold text-[#493129] block mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#493129]/40" />
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Your full name"
                    className="w-full pl-9 pr-3 py-2.5 rounded-full bg-[#ffeedb]/60 border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#493129] block mb-1">Mobile Phone (10 Digits) *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#493129]/40" />
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="9845012345"
                    className="w-full pl-9 pr-3 py-2.5 rounded-full bg-[#ffeedb]/60 border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#493129] block mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#493129]/40" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="ramesh@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-full bg-[#ffeedb]/60 border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#493129] block mb-1">GSTIN (Optional for Tax Invoice)</label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#493129]/40" />
                  <input
                    type="text"
                    value={form.gstin}
                    onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                    placeholder="29AAAAA0000A1Z5"
                    className="w-full pl-9 pr-3 py-2.5 rounded-full bg-[#ffeedb]/60 border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b] uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#493129] block mb-1">Choose Password (Min. 6 Characters) *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#493129]/40" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-full bg-[#ffeedb]/60 border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-[#493129] hover:bg-[#35221b] text-[#ffeedb] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition mt-2 disabled:opacity-50"
              >
                <span>{loading ? "Creating Account..." : "Complete Registration"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

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
