"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageCircle, ChevronDown, HelpCircle, Headphones } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Are all phones and accessories brand new with official brand warranty?",
    a: "Yes. Every smartphone, keypad phone, earbud, neckband, and headphone sold by ANIL COMMUNICATION & ZEROX is 100% brand new, authentic Indian retail edition in factory-sealed packaging. Each order carries an official GST tax invoice supporting full authorized manufacturer warranty across India.",
  },
  {
    q: "How does doorstep delivery operate and how fast is it?",
    a: "Orders placed before 4:00 PM are dispatched for express delivery. Local deliveries within Karnataka receive priority shipping. All other regions across India receive express air shipping (BlueDart / Delhivery) within 2-4 business days with real-time tracking.",
  },
  {
    q: "Can I claim GST input tax credit (ITC) for my business?",
    a: "Yes. During checkout, simply provide your 15-character GSTIN. We issue an official B2B Tax Invoice under HSN 85171300 with 18% GST (CGST 9% + SGST 9% or IGST 18%) allowing your business to claim 100% input tax credit.",
  },
  {
    q: "What is your return and replacement policy?",
    a: "We offer a 7-day doorstep replacement for any technical or transit-related defects verified by authorized brand diagnostics. Returns can be initiated with one click from your Customer Account or Order Tracking portal.",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    productOfInterest: "",
    query: "",
    isCallbackRequested: false,
  });
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          productOfInterest: form.productOfInterest,
          message: form.query,
          isCallbackRequested: form.isCallbackRequested,
          source: "contact_page",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message");
      }

      setTicketId(data.ticketNumber);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please connect via WhatsApp directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFEDDB]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B597B]">
            Customer Support & Assistance
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#493129]">
            We're Here to Help
          </h1>
          <p className="text-xs sm:text-sm text-[#806D63] font-sans leading-relaxed">
            Have questions about product specifications, pricing, order status, or bulk orders? Reach out to our customer care team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Store Details & Direct WhatsApp */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-8 rounded-3xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-sm space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B597B]">Retail Store Location</span>
              <div className="flex items-start gap-3 text-xs text-[#30241F] font-sans">
                <MapPin className="w-5 h-5 text-[#8B597B] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-serif font-bold text-base text-[#493129]">ANIL COMMUNICATION &amp; ZEROX</p>
                  <p className="mt-1 leading-relaxed">Near Canara Bank, Belagavi, Karnataka - 591103, India</p>
                  <p className="text-[#8B597B] mt-1 font-medium">Near Canara Bank</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-sm space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B597B]">Contact Numbers</span>
              <div className="space-y-3 text-xs font-sans">
                <div className="flex items-center gap-3 text-[#493129]">
                  <Phone className="w-4 h-4 text-[#8B597B] flex-shrink-0" />
                  <div>
                    <span className="font-bold font-mono">+91 9380124254</span>
                    <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-[#27845A]/10 text-[#27845A] font-bold border border-[#27845A]/30">WhatsApp</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[#806D63]">
                  <Phone className="w-4 h-4 text-[#8B597B] flex-shrink-0" />
                  <div>
                    <span className="font-mono text-[#493129]">+91 8884055867</span>
                    <span className="text-[10px] ml-2 text-[#806D63]">Telephone</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[#806D63]">
                  <Phone className="w-4 h-4 text-[#8B597B] flex-shrink-0" />
                  <div>
                    <span className="font-mono text-[#493129]">+91 9538865867</span>
                    <span className="text-[10px] ml-2 text-[#806D63]">Telephone</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-sm space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B597B]">Store & Support Hours</span>
              <div className="space-y-2 text-xs font-sans">
                <div className="flex justify-between text-[#806D63]">
                  <span>Monday through Saturday:</span>
                  <span className="font-bold text-[#493129]">10:00 AM – 09:30 PM</span>
                </div>
                <div className="flex justify-between text-[#806D63]">
                  <span>Sunday:</span>
                  <span className="font-bold text-[#493129]">11:00 AM – 08:00 PM</span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="p-8 rounded-3xl bg-[#FFDEC7]/60 border border-[#E8D5C5] shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#27845A]" />
                <span className="font-serif font-bold text-base text-[#493129]">Instant WhatsApp Support</span>
              </div>
              <p className="text-xs text-[#30241F] leading-relaxed font-sans">
                Need immediate answers? Chat with our customer support on WhatsApp for stock verification, order updates, or product queries.
              </p>
              <a
                href="https://wa.me/919380124254?text=Hello%20ANIL%20COMMUNICATION%20%26%20ZEROX,%20I%20have%20an%20inquiry%20regarding%20products%20on%20your%20website."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#27845A] text-white font-bold text-xs hover:bg-[#206f4c] transition shadow-xs"
              >
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Contact Support Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-12 rounded-3xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-sm space-y-6">
              <div className="border-b border-[#E8D5C5] pb-4">
                <h2 className="font-serif text-2xl text-[#493129]">Send Us a Message</h2>
                <p className="text-xs text-[#806D63] font-sans mt-0.5">
                  Our customer service team responds within 2 hours during store hours.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 rounded-3xl bg-[#FFDEC7] border border-[#E8D5C5] text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-[#8B597B] mx-auto" />
                  <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-white text-[#493129] border border-[#E8D5C5]">
                    Ticket ID: {ticketId}
                  </span>
                  <h3 className="font-serif text-2xl text-[#493129]">Enquiry Recorded Successfully</h3>
                  <p className="text-xs text-[#30241F] font-sans max-w-sm mx-auto leading-relaxed">
                    Thank you, <strong>{form.name}</strong>. Your enquiry has been received and saved. Our support team will reach you via <strong>{form.phone}</strong> shortly.
                  </p>

                  <div className="pt-3 border-t border-[#E8D5C5]">
                    <p className="text-[11px] text-[#806D63] mb-2">Need immediate assistance right away?</p>
                    <a
                      href={`https://wa.me/919380124254?text=${encodeURIComponent(
                        `Hello ANIL COMMUNICATION & ZEROX, I submitted enquiry Ticket ${ticketId} regarding "${form.productOfInterest || "Products"}". Name: ${form.name}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#27845A] text-white font-bold text-xs hover:bg-[#206f4c] transition shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Follow-up on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                  {error && (
                    <div className="p-3 bg-[#C0393A]/10 border border-[#C0393A]/30 text-[#C0393A] rounded-xl text-xs">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-[#493129] block mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full px-4 py-2.5 rounded-full bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
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
                        className="w-full px-4 py-2.5 rounded-full bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B] font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-[#493129] block mb-1">Product of Interest</label>
                      <input
                        type="text"
                        value={form.productOfInterest}
                        onChange={(e) => setForm({ ...form, productOfInterest: e.target.value })}
                        placeholder="e.g. Moto G37 Power or Earbuds"
                        className="w-full px-4 py-2.5 rounded-full bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-[#493129] block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="ramesh@example.com"
                        className="w-full px-4 py-2.5 rounded-full bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-[#493129] block mb-1">Your Message or Query *</label>
                    <textarea
                      rows={4}
                      required
                      value={form.query}
                      onChange={(e) => setForm({ ...form, query: e.target.value })}
                      placeholder="Ask about live store discounts, warranty, color variants, bulk pricing..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] focus:outline-none focus:border-[#8B597B] leading-relaxed"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isCallbackRequested}
                      onChange={(e) => setForm({ ...form, isCallbackRequested: e.target.checked })}
                      className="w-4 h-4 rounded text-[#8B597B] focus:ring-[#8B597B] border-[#E8D5C5] accent-[#8B597B]"
                    />
                    <span className="text-[11px] text-[#493129] font-medium">
                      Request a phone callback from our store team
                    </span>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-4 rounded-full bg-[#493129] hover:bg-[#8B597B] disabled:opacity-50 text-[#FFEDDB] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submitting ? "Sending..." : "Send Message to Support"}</span>
                    </button>

                    <a
                      href={`https://wa.me/919380124254?text=${encodeURIComponent(
                        `Hello ANIL COMMUNICATION & ZEROX, I want to inquire regarding ${form.productOfInterest || "products on your website"}. My name is ${form.name || "Customer"}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-4 px-6 rounded-full bg-[#27845A] hover:bg-[#206f4c] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs text-center"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>WhatsApp Directly</span>
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Customer FAQ Accordion */}
        <div className="mt-16 p-8 sm:p-12 rounded-3xl bg-[#FFFAF5] border border-[#E8D5C5] shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-[#E8D5C5] pb-4">
            <HelpCircle className="w-5 h-5 text-[#8B597B]" />
            <h2 className="font-serif text-2xl text-[#493129]">Frequently Asked Questions</h2>
          </div>

          <div className="divide-y divide-[#E8D5C5]">
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
                    <ChevronDown className={`w-4 h-4 text-[#8B597B] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <p className="text-xs sm:text-sm text-[#30241F] font-sans mt-2 leading-relaxed">
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
