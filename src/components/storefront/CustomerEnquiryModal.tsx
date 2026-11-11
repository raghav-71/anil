"use client";

import React, { useState } from "react";
import { MessageCircle, Send, CheckCircle2, X, PhoneCall, Smartphone } from "lucide-react";

interface CustomerEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProduct?: string;
}

export function CustomerEnquiryModal({
  isOpen,
  onClose,
  defaultProduct = "",
}: CustomerEnquiryModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [productOfInterest, setProductOfInterest] = useState(defaultProduct);
  const [message, setMessage] = useState("");
  const [isCallback, setIsCallback] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          productOfInterest: productOfInterest || defaultProduct || "General Inquiry",
          message,
          isCallbackRequested: isCallback,
          source: defaultProduct ? "product_detail_modal" : "storefront_enquiry_modal",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry");
      }

      setSubmittedTicket(data.ticketNumber);
    } catch (err: any) {
      setError(err.message || "Failed to submit enquiry. Please try WhatsApp directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const directWhatsAppUrl = `https://wa.me/919380124254?text=${encodeURIComponent(
    `Hello ANIL COMMUNICATION & ZEROX, I am inquiring regarding "${productOfInterest || defaultProduct || "your products"}". Name: ${name || "Customer"}. Message: ${message || "Please share availability and current store pricing."}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-[#493129]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Modal"
          className="absolute top-5 right-5 p-2 rounded-full text-[#806D63] hover:text-[#493129] hover:bg-[#FFEDDB] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedTicket ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#27845A]/15 text-[#27845A] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B597B] px-3 py-1 bg-[#FFDEC7] rounded-full">
                Ticket ID: {submittedTicket}
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#493129] pt-2">Enquiry Successfully Recorded</h3>
              <p className="text-xs text-[#806D63] font-sans leading-relaxed max-w-sm mx-auto">
                Thank you, <strong>{name}</strong>! Your enquiry has been routed to our Belagavi store team. We will call you on <strong>{phone}</strong> shortly.
              </p>
            </div>

            {/* Direct WhatsApp Callout Alternative */}
            <div className="p-4 rounded-2xl bg-[#FFEDDB] border border-[#E8D5C5] text-left space-y-2 mt-4">
              <p className="text-xs font-bold text-[#493129]">Prefer faster updates?</p>
              <p className="text-[11px] text-[#806D63] leading-relaxed">
                Connect directly with our sales desk on WhatsApp with your enquiry prefilled:
              </p>
              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#27845A] hover:bg-[#1f6b49] text-white text-xs font-bold transition shadow-xs w-full justify-center"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Continue on WhatsApp (+91 9380124254)</span>
              </a>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-full bg-[#493129] text-[#FFEDDB] text-xs font-semibold hover:bg-[#8B597B] transition shadow-xs"
            >
              Close Window
            </button>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-center gap-2 text-[#8B597B] text-xs font-bold uppercase tracking-wider mb-1">
                <Smartphone className="w-4 h-4" />
                <span>Customer Enquiry & Callback</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#493129]">
                {defaultProduct ? `Enquire about ${defaultProduct}` : "Contact Sales Specialist"}
              </h2>
              <p className="text-xs text-[#806D63] font-sans mt-1">
                Fill out the form below or chat directly with us on WhatsApp.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-[#FFEDDB] border border-[#C0393A]/30 text-[#C0393A] rounded-xl text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="font-bold text-[#493129] block mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Kulkarni"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] placeholder-[#806D63]/60 focus:outline-none focus:border-[#8B597B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#493129] block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] placeholder-[#806D63]/60 focus:outline-none focus:border-[#8B597B] font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#493129] block mb-1">Product of Interest</label>
                  <input
                    type="text"
                    value={productOfInterest}
                    onChange={(e) => setProductOfInterest(e.target.value)}
                    placeholder="e.g. Realme 16 Pro 5G"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] placeholder-[#806D63]/60 focus:outline-none focus:border-[#8B597B]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#493129] block mb-1">Your Message or Query *</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about live store discounts, variant availability, warranty, or delivery timeframe..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] placeholder-[#806D63]/60 focus:outline-none focus:border-[#8B597B] leading-relaxed"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isCallback}
                  onChange={(e) => setIsCallback(e.target.checked)}
                  className="w-4 h-4 rounded text-[#8B597B] focus:ring-[#8B597B] border-[#E8D5C5]"
                />
                <span className="text-[11px] text-[#493129] font-medium flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-[#8B597B]" />
                  Please call me back during business hours
                </span>
              </label>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3.5 px-6 rounded-full bg-[#493129] hover:bg-[#8B597B] disabled:opacity-50 text-[#FFEDDB] font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? "Submitting Enquiry..." : "Submit Enquiry"}</span>
                </button>

                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3.5 px-6 rounded-full bg-[#27845A] hover:bg-[#1f6b49] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs text-center"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>WhatsApp Instead</span>
                </a>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

