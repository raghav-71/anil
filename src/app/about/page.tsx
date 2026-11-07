import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { Award, Shield, Sparkles, MapPin, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#ffeedb]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-[11px] uppercase font-bold tracking-[0.3em] text-[#8b597b]">
            The Maison Heritage
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#493129] leading-tight">
            Curating Extraordinary Technology Since 2014.
          </h1>
          <p className="text-sm sm:text-base text-[#493129]/80 font-sans leading-relaxed max-w-2xl mx-auto">
            Anil Communications was conceived with a solitary conviction: that modern communication instruments are the ultimate synthesis of design, material science, and human aspiration.
          </p>
        </section>

        {/* Narrative & Atelier Philosophy */}
        <section className="py-16 bg-[#fffaf5] border-y border-[#493129]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="p-8 rounded-3xl bg-[#ffeedb]/50 border border-[#493129]/10 space-y-4">
                <span className="text-3xl font-serif text-[#8b597b]">01</span>
                <h3 className="font-serif text-2xl text-[#493129]">Bespoke Sourcing</h3>
                <p className="text-xs text-[#493129]/75 leading-relaxed font-sans">
                  We maintain direct distributor relationships with Apple, Samsung, Sony, and OnePlus. Every unit is brand new, sealed, and official Indian retail stock.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-[#ffeedb]/50 border border-[#493129]/10 space-y-4">
                <span className="text-3xl font-serif text-[#8b597b]">02</span>
                <h3 className="font-serif text-2xl text-[#493129]">Tax Transparency</h3>
                <p className="text-xs text-[#493129]/75 leading-relaxed font-sans">
                  Every transaction generates a valid GST tax invoice. Whether you are an individual claiming personal warranty or a corporation claiming input tax credit, your compliance is absolute.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-[#ffeedb]/50 border border-[#493129]/10 space-y-4">
                <span className="text-3xl font-serif text-[#8b597b]">03</span>
                <h3 className="font-serif text-2xl text-[#493129]">Physical Concierge</h3>
                <p className="text-xs text-[#493129]/75 leading-relaxed font-sans">
                  Our flagship boutique on MG Road Bengaluru is staffed by career product specialists, ready to assist with device migration, trade-in valuations, and tactile demonstrations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Visit the Salon */}
        <section className="py-20 text-center space-y-6 max-w-2xl mx-auto px-4">
          <h2 className="font-serif text-3xl text-[#493129]">Experience The Boutique Salon</h2>
          <p className="text-xs text-[#493129]/70 leading-relaxed font-sans">
            Shop No. 14, Main Electronics Market, MG Road, Bengaluru - 560001 <br />
            Open Daily from 10:00 AM to 09:30 PM
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#efa3a0] hover:bg-[#e58e8b] text-[#493129] font-semibold text-xs rounded-full shadow-coral transition"
            >
              <span>Connect with Our Concierge</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

