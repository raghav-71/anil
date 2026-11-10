"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";

export function WhatsAppButton() {
  const pathname = usePathname();
  const [showTooltip, setShowTooltip] = useState(false);
  const [productTitle, setProductTitle] = useState<string | null>(null);

  // Do not show floating button on admin dashboard
  if (pathname.startsWith("/admin")) {
    return null;
  }

  // Detect product title from document or url if on a product page
  useEffect(() => {
    if (pathname.startsWith("/product/")) {
      const heading = document.querySelector("h1");
      if (heading && heading.textContent) {
        setProductTitle(heading.textContent.trim());
      }
    } else {
      setProductTitle(null);
    }
  }, [pathname]);

  const defaultMessage = productTitle
    ? `Hello ANIL COMMUNICATION & ZEROX, I have an enquiry regarding "${productTitle}" on your website: ${typeof window !== "undefined" ? window.location.href : ""}. Please share price & availability.`
    : "Hello ANIL COMMUNICATION & ZEROX, I have an enquiry regarding mobile phones and accessories on your website.";

  const whatsappUrl = `https://wa.me/919380124254?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <aside
      aria-label="Direct WhatsApp Customer Support"
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
    >
      {/* Tooltip Badge for desktop/first impression */}
      {showTooltip && (
        <div className="relative mb-1 bg-white text-[#493129] px-4 py-2.5 rounded-2xl shadow-xl border border-[#493129]/10 text-xs font-sans max-w-[240px] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={() => setShowTooltip(false)}
            aria-label="Close tooltip"
            className="absolute top-1.5 right-1.5 p-1 text-[#493129]/40 hover:text-[#493129]"
          >
            <X className="w-3 h-3" />
          </button>
          <p className="font-bold text-[#493129] text-[11px]">Chat with ANIL COMMUNICATION &amp; ZEROX</p>
          <p className="text-[10px] text-[#493129]/70 mt-0.5">
            +91 9380124254 • Fast replies on product queries, stock & orders
          </p>
        </div>
      )}

      {/* Main Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp +91 9380124254"
        onMouseEnter={() => setShowTooltip(true)}
        className="group flex items-center gap-2.5 px-4 sm:px-5 py-3 sm:py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-300 font-sans text-xs font-bold"
      >
        <div className="relative flex items-center justify-center">
          <MessageCircle className="w-5 h-5 fill-current" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping opacity-75" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full border border-emerald-600" />
        </div>
        <span className="hidden sm:inline-block tracking-wide">WhatsApp Support</span>
        <span className="sm:hidden tracking-wide text-[11px]">Chat</span>
      </a>
    </aside>
  );
}
