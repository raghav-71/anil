"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const whatsappUrl =
    "https://wa.me/919876543210?text=" +
    encodeURIComponent(
      "Hello Anil Communications, I am inquiring from your online boutique regarding flagship smartphones & genuine accessories."
    );

  return (
    <aside aria-label="Customer Support Concierge" className="fixed bottom-6 right-6 z-40">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Direct WhatsApp Concierge"
        className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#25D366] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-sans text-xs font-bold"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline-block tracking-wide">WhatsApp Concierge</span>
      </a>
    </aside>
  );
}

