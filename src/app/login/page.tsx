"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { supabase } from "@/lib/supabase/client";
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password Recovery State
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotFeedback, setForgotFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      // Sync customer profile into PostgreSQL
      if (data?.user) {
        try {
          await fetch("/api/auth/sync-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              authUserId: data.user.id,
              email: data.user.email,
              fullName: data.user.user_metadata?.full_name || data.user.email?.split("@")[0],
              phone: data.user.user_metadata?.phone || "",
            }),
          });
        } catch (syncErr) {
          console.warn("Profile sync warning:", syncErr);
        }
      }

      if (data?.session) {
        router.push("/account");
      } else {
        router.push("/orders");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotFeedback(null);
    setForgotLoading(true);

    try {
      const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/account?tab=security` : undefined;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: redirectUrl,
      });

      if (resetError) throw new Error(resetError.message);

      setForgotFeedback("Password recovery link sent! Please check your email inbox to reset your password.");
    } catch (err: any) {
      setForgotFeedback(err.message || "Failed to initiate password reset.");
    } finally {
      setForgotLoading(false);
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
            <h1 className="font-serif text-3xl text-[#493129]">Customer Sign In</h1>
            <p className="text-xs text-[#493129]/70 font-sans">
              Access your order history, delivery addresses, and GST tax invoices.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!showForgot ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="font-semibold text-[#493129] block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#493129]/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-full bg-[#ffeedb]/60 border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[#493129]">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgot(true);
                    }}
                    className="text-[11px] text-[#8b597b] hover:text-[#493129] font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#493129]/40" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-full bg-[#ffeedb]/60 border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-[#493129] hover:bg-[#35221b] text-[#ffeedb] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
              >
                <span>{loading ? "Authenticating..." : "Sign In to Client Account"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 text-xs font-sans">
              <div className="p-3 bg-[#ffeedb]/50 border border-[#493129]/10 rounded-2xl">
                <div className="flex items-center gap-2 font-bold text-[#493129] mb-1">
                  <KeyRound className="w-4 h-4 text-[#8b597b]" />
                  <span>Password Recovery</span>
                </div>
                <p className="text-[11px] text-[#806D63] leading-relaxed">
                  Enter your registered email address. We will send a secure password reset link to your inbox.
                </p>
              </div>

              {forgotFeedback && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{forgotFeedback}</span>
                </div>
              )}

              <div>
                <label className="font-semibold text-[#493129] block mb-1">Your Registered Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#493129]/40" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="ramesh@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-full bg-[#ffeedb]/60 border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-2.5 rounded-full bg-[#493129] hover:bg-[#35221b] text-[#ffeedb] font-bold text-xs transition disabled:opacity-50"
                >
                  {forgotLoading ? "Sending Link..." : "Send Reset Link"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="px-4 py-2.5 rounded-full bg-[#ffeedb] hover:bg-[#ffdec7] text-[#493129] font-semibold text-xs transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

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
