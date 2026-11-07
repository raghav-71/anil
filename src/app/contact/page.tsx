"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", query: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ffeedb]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8b597b]">
            Personal Concierge Desk
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#493129]">
            Connect with Our Specialists
          </h1>
          <p className="text-xs sm:text-sm text-[#493129]/75 font-sans leading-relaxed">
            Visit our flagship boutique salon on MG Road Bengaluru for in-person evaluations, trade-in appraisals, or private consultations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Boutique Details */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-8 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b597b]">Boutique Location</span>
              <div className="flex items-start gap-3 text-xs text-[#493129]/80 font-sans">
                <MapPin className="w-5 h-5 text-[#8b597b] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-serif font-bold text-base text-[#493129]">Flagship Salon Bengaluru</p>
                  <p className="mt-1 leading-relaxed">Shop No. 14, Main Electronics Market, MG Road, Bengaluru, Karnataka - 560001</p>
                  <p className="text-[#8b597b] mt-1 font-medium">Adjacent to Metro Station Exit B</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b597b]">Salon Hours</span>
              <div className="space-y-2 text-xs font-sans">
                <div className="flex justify-between text-[#493129]/80">
                  <span>Monday through Saturday:</span>
                  <span className="font-bold text-[#493129]">10:00 AM – 09:30 PM</span>
                </div>
                <div className="flex justify-between text-[#493129]/80">
                  <span>Sunday:</span>
                  <span className="font-bold text-[#493129]">11:00 AM – 08:00 PM</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b597b]">Direct Inquiries</span>
              <div className="space-y-3 text-xs text-[#493129]/80 font-sans">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#8b597b]" />
                  <span className="font-bold font-mono">+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#8b597b]" />
                  <span>concierge@anilcommunications.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-12 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle space-y-6">
              <div className="border-b border-[#493129]/10 pb-4">
                <h2 className="font-serif text-2xl text-[#493129]">Direct Consultation Request</h2>
                <p className="text-xs text-[#493129]/70 font-sans mt-0.5">Our specialists respond within two hours during salon operating times.</p>
              </div>

              {submitted ? (
                <div className="p-8 rounded-3xl bg-[#ffdec7]/60 border border-[#ffdec7] text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[#8b597b] mx-auto" />
                  <h3 className="font-serif text-xl text-[#493129]">Inquiry Recorded</h3>
                  <p className="text-xs text-[#493129]/80 font-sans max-w-sm mx-auto leading-relaxed">
                    Thank you, {form.name}. A senior client consultant will reach out via {form.phone} shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-[#493129] block mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Ramesh Sharma"
                        className="w-full px-4 py-2.5 rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-[#493129] block mb-1">Mobile Contact *</label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91 98450 12345"
                        className="w-full px-4 py-2.5 rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b] font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-[#493129] block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="ramesh@example.com"
                      className="w-full px-4 py-2.5 rounded-full bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#493129] block mb-1">Inquiry / Procurement Specifications *</label>
                    <textarea
                      rows={4}
                      required
                      value={form.query}
                      onChange={(e) => setForm({ ...form, query: e.target.value })}
                      placeholder="Detail the device, edition, trade-in device, or corporate procurement query..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#ffeedb] border border-[#493129]/15 text-[#493129] focus:outline-none focus:border-[#8b597b] leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-full bg-[#efa3a0] hover:bg-[#e58e8b] text-[#493129] font-bold text-xs flex items-center justify-center gap-2 shadow-coral transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>Transmit Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
