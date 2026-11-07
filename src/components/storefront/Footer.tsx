import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, ShieldCheck, Clock, Award } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#493129] text-[#ffdec7] border-t border-[#493129]">
      {/* Brand Guarantees Strip */}
      <div className="border-b border-[#ffdec7]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#35221b]/40 border border-[#ffdec7]/10">
            <div className="w-10 h-10 rounded-full bg-[#8b597b]/30 text-[#efa3a0] flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#ffeedb] uppercase tracking-wider">Official Partner</h4>
              <p className="text-[11px] text-[#ffdec7]/70">Authorized Indian distributor for premier brands</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#35221b]/40 border border-[#ffdec7]/10">
            <div className="w-10 h-10 rounded-full bg-[#8b597b]/30 text-[#efa3a0] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#ffeedb] uppercase tracking-wider">Verified Warranty</h4>
              <p className="text-[11px] text-[#ffdec7]/70">100% factory sealed devices with genuine manufacturer cover</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#35221b]/40 border border-[#ffdec7]/10">
            <div className="w-10 h-10 rounded-full bg-[#8b597b]/30 text-[#efa3a0] flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#ffeedb] uppercase tracking-wider">White-Glove Dispatch</h4>
              <p className="text-[11px] text-[#ffdec7]/70">Insured express logistics with live milestone tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#35221b]/40 border border-[#ffdec7]/10">
            <div className="w-10 h-10 rounded-full bg-[#8b597b]/30 text-[#efa3a0] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#ffeedb] uppercase tracking-wider">Flagship Experience</h4>
              <p className="text-[11px] text-[#ffdec7]/70">In-person consultations at our boutique salon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 space-y-4">
          <span className="font-serif text-2xl font-normal text-[#ffeedb] block tracking-tight">
            Anil Communications
          </span>
          <p className="text-xs leading-relaxed text-[#ffdec7]/80 max-w-sm">
            Curators of extraordinary mobile engineering and acoustic accoutrements. Sourcing the world&apos;s finest titanium smartphones, GaN power units, and studio-grade audio hardware.
          </p>
          <div className="pt-2 text-[11px] text-[#ffdec7]/60 space-y-1 font-mono">
            <p>GSTIN: 29AAAAA0000A1Z5</p>
            <p>Boutique Registration: BLR-KA-2014-9982</p>
          </div>
        </div>

        {/* Collections */}
        <div>
          <h4 className="text-xs font-semibold text-[#ffeedb] uppercase tracking-[0.2em] mb-4">The Collections</h4>
          <ul className="space-y-2.5 text-xs text-[#ffdec7]/80">
            <li><Link href="/shop" className="hover:text-[#efa3a0] transition">Complete Catalog</Link></li>
            <li><Link href="/mobiles" className="hover:text-[#efa3a0] transition">Flagship Smartphones</Link></li>
            <li><Link href="/accessories" className="hover:text-[#efa3a0] transition">GaN Fast Chargers</Link></li>
            <li><Link href="/accessories" className="hover:text-[#efa3a0] transition">Acoustic Audio & TWS</Link></li>
            <li><Link href="/accessories" className="hover:text-[#efa3a0] transition">Cases & Armored Glass</Link></li>
          </ul>
        </div>

        {/* Client Services */}
        <div>
          <h4 className="text-xs font-semibold text-[#ffeedb] uppercase tracking-[0.2em] mb-4">Client Services</h4>
          <ul className="space-y-2.5 text-xs text-[#ffdec7]/80">
            <li><Link href="/orders" className="hover:text-[#efa3a0] transition">Track Your Consignment</Link></li>
            <li><Link href="/about" className="hover:text-[#efa3a0] transition">The Maison Heritage</Link></li>
            <li><Link href="/contact" className="hover:text-[#efa3a0] transition">Concierge Desk</Link></li>
            <li><Link href="/login" className="hover:text-[#efa3a0] transition">Customer Portal</Link></li>
          </ul>
        </div>

        {/* Boutique Location */}
        <div>
          <h4 className="text-xs font-semibold text-[#ffeedb] uppercase tracking-[0.2em] mb-4">Visit The Salon</h4>
          <ul className="space-y-3 text-xs text-[#ffdec7]/80">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-3.5 h-3.5 text-[#efa3a0] flex-shrink-0 mt-0.5" />
              <span>Shop No. 14, Main Electronics Market, MG Road, Bengaluru, Karnataka - 560001</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-3.5 h-3.5 text-[#efa3a0] flex-shrink-0" />
              <span className="font-mono">+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-3.5 h-3.5 text-[#efa3a0] flex-shrink-0" />
              <span>concierge@anilcommunications.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-[#ffdec7]/10 py-6 text-center text-[11px] text-[#ffdec7]/50 font-serif">
        <p>© 2026 Anil Communications. Sunset Editorial Retail Experience. All rights reserved.</p>
      </div>
    </footer>
  );
}
