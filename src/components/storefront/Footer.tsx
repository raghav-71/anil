import React from "react";
import Link from "next/link";
import { MapPin, Phone, ShieldCheck, Clock, Award, MessageCircle } from "lucide-react";
import { BUSINESS } from "@/lib/business-config";

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
              <h4 className="text-xs font-semibold text-[#ffeedb] uppercase tracking-wider">Retail Storefront</h4>
              <p className="text-[11px] text-[#ffdec7]/70">In-person assistance at our {BUSINESS.address.line2} store</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 space-y-4">
          <span className="font-serif text-2xl font-normal text-[#ffeedb] block tracking-tight">
            {BUSINESS.name}
          </span>
          <p className="text-xs leading-relaxed text-[#ffdec7]/80 max-w-sm">
            Your trusted store for genuine smartphones, keypad phones, earbuds, neckbands, and headphones with 100% official brand warranty. Also offering mobile repairing, colour printing &amp; lamination services.
          </p>
        </div>

        {/* Collections */}
        <div>
          <h4 className="text-xs font-semibold text-[#FFEDDB] uppercase tracking-[0.2em] mb-4">Categories</h4>
          <ul className="space-y-2.5 text-xs text-[#FFDEC7]">
            <li><Link href="/shop" className="text-[#EFA3A0] hover:text-[#FFFFFF] transition-colors">All Products</Link></li>
            <li><Link href="/shop?category=Smartphones" className="text-[#EFA3A0] hover:text-[#FFFFFF] transition-colors">Smartphones</Link></li>
            <li><Link href="/shop?category=Keypad+Phones" className="text-[#EFA3A0] hover:text-[#FFFFFF] transition-colors">Keypad Phones</Link></li>
            <li><Link href="/shop?category=Earbuds" className="text-[#EFA3A0] hover:text-[#FFFFFF] transition-colors">Wireless Earbuds</Link></li>
            <li><Link href="/shop?category=Neckbands" className="text-[#EFA3A0] hover:text-[#FFFFFF] transition-colors">Neckbands</Link></li>
            <li><Link href="/shop?category=Headphones" className="text-[#EFA3A0] hover:text-[#FFFFFF] transition-colors">Headphones</Link></li>
          </ul>
        </div>

        {/* Client Services */}
        <div>
          <h4 className="text-xs font-semibold text-[#FFEDDB] uppercase tracking-[0.2em] mb-4">Customer Support</h4>
          <ul className="space-y-2.5 text-xs text-[#FFDEC7]">
            <li><Link href="/orders" className="text-[#EFA3A0] hover:text-[#FFFFFF] transition-colors">Track Your Order</Link></li>
            <li><Link href="/contact" className="text-[#EFA3A0] hover:text-[#FFFFFF] transition-colors">Contact &amp; Support</Link></li>
            <li><Link href="/account" className="text-[#EFA3A0] hover:text-[#FFFFFF] transition-colors">Customer Account</Link></li>
          </ul>
        </div>

        {/* Store Location */}
        <div>
          <h4 className="text-xs font-semibold text-[#FFEDDB] uppercase tracking-[0.2em] mb-4">Store Location</h4>
          <div className="space-y-3 text-xs text-[#FFDEC7]">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-3.5 h-3.5 text-[#EFA3A0] flex-shrink-0 mt-0.5" />
              <address className="not-italic leading-relaxed">
                Bagalkot Main Road, Pant Nagar,<br />
                Near Canara Bank,<br />
                591103, Karnataka, India.
              </address>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-3.5 h-3.5 text-[#EFA3A0] flex-shrink-0" />
              <div className="font-mono space-y-0.5">
                <div>+91 9380124254 <span className="text-[10px] text-[#FFEDDB] uppercase">(WhatsApp)</span></div>
                <div className="text-[11px] text-[#FFDEC7]/80">+91 8884055867 • +91 9538865867</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 pt-1">
              <MessageCircle className="w-3.5 h-3.5 text-[#EFA3A0] flex-shrink-0" />
              <a
                href="https://wa.me/919380124254"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#EFA3A0] hover:text-[#FFFFFF] font-semibold transition-colors"
              >
                Chat on WhatsApp (+91 9380124254)
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-[#ffdec7]/10 py-6 text-center text-[11px] text-[#ffdec7]/50 font-serif">
        <p>{BUSINESS.copyright()}</p>
      </div>
    </footer>
  );
}
