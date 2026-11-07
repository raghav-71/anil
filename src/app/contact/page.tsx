"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageCircle, ChevronDown, HelpCircle } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Are the smartphones factory-sealed with official manufacturer warranty?",
    a: "Every handset curated by Anil Communications is 100% brand new, Indian retail edition with untouched factory seals. Each consignment carries a genuine GST tax invoice enabling 1-year pan-India authorized brand service center warranty (Apple Care, Samsung Service, OnePlus Care).",
  },
  {
    q: "How does same-day Bengaluru concierge delivery operate?",
    a: "Orders placed before 4:00 PM for Bengaluru PIN codes (560001 through 560100) are hand-dispatched via our private boutique courier within 3-6 hours. You receive direct phone coordinates of your delivery associate.",
  },
  {
    q: "Can I claim GST input tax credit for my business?",
    a: "Yes. During checkout or in-store POS billing, simply provide your 15-character GSTIN. We issue an official B2B Tax Invoice under HSN 85171300 with 18% GST (CGST 9% + SGST 9% or IGST 18%) allowing your business to claim 100% input tax credit.",
  },
  {
    q: "What is your return and replacement policy?",
    a: "We offer a 7-day doorstep replacement for any technical or transit-related defects verified by authorized brand diagnostics. Returns can be initiated with one click from your Customer Account or Consignment Tracking portal.",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", query: "" });
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `TCK-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(id);
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ffeedb]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
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
          {/* Boutique Details & Direct WhatsApp */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-8 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b597b]">Boutique Location</span>
              <div className="flex items-start gap-3 text-xs text-[#493129]/80 font-sans">
                <MapPin className="w-5 h-5 text-[#8b597b] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-serif font-bold text-base text-[#493129]">Flagship Salon Bengaluru</p>
                  <p className="mt-1 leading-relaxed">Shop No. 14, Main Electronics Market, MG Road, Bengaluru, Karnataka - 560001</p>
                  <p className="text-[#8b597b] mt-1 font-medium">Adjacent to Trinity Metro Station Exit B</p>
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

            {/* Direct WhatsApp Callout */}
            <div className="p-8 rounded-3xl bg-[#ffeedb] border border-[#493129]/15 shadow-subtle space-y-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-700" />
                <span className="font-serif font-bold text-base text-[#493129]">Instant WhatsApp Concierge</span>
              </div>
              <p className="text-xs text-[#493129]/80 leading-relaxed font-sans">
                Prefer messaging? Speak directly with our in-store client representative for real-time stock confirmations, device photos, or reserved pickup.
              </p>
              <a
                href="https://wa.me/919876543210?text=Hello%20Anil%20Communications,%20I%20would%20like%20to%20inquire%20about%20a%20smartphone%20procurement."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white font-bold text-xs hover:bg-[#20ba59] transition shadow-xs"
              >
                <span>Launch WhatsApp Chat</span>
              </a>
            </div>
          </div>

          {/* Consultation Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-12 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle space-y-6">
              <div className="border-b border-[#493129]/10 pb-4">
                <h2 className="font-serif text-2xl text-[#493129]">Direct Consultation Request</h2>
                <p className="text-xs text-[#493129]/70 font-sans mt-0.5">
                  Our specialists respond within two hours during salon operating times.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 rounded-3xl bg-[#ffdec7]/60 border border-[#ffdec7] text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[#8b597b] mx-auto" />
                  <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-white text-[#493129]">
                    Ticket ID: {ticketId}
                  </span>
                  <h3 className="font-serif text-xl text-[#493129]">Inquiry Successfully Recorded</h3>
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
                        placeholder="e.g. Ramesh Sharma"
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
                    <span>Transmit Message to Boutique</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Amazon-Level FAQ Accordion */}
        <div className="mt-16 p-8 sm:p-12 rounded-3xl bg-[#fffaf5] border border-[#493129]/10 shadow-subtle space-y-6">
          <div className="flex items-center gap-2 border-b border-[#493129]/10 pb-4">
            <HelpCircle className="w-5 h-5 text-[#8b597b]" />
            <h2 className="font-serif text-2xl text-[#493129]">Frequently Inquired Protocols</h2>
          </div>

          <div className="divide-y divide-[#493129]/10">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left font-serif text-base text-[#493129] font-bold"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#8b597b] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <p className="text-xs sm:text-sm text-[#493129]/80 font-sans mt-2 leading-relaxed">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
