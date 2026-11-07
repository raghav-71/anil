"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  User,
  Package,
} from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const { totalItems, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#ffeedb]/90 backdrop-blur-md border-b border-[#493129]/10 transition-all">
      {/* Editorial Announcement Banner */}
      <div className="bg-[#493129] text-[#ffeedb] text-[11px] py-2 px-4 text-center font-medium tracking-wide">
        <span>Bespoke Flagships & Acoustic Accoutrements • Complimentary Insured Shipping on Orders Over ₹999</span>
      </div>

      {/* Main Editorial Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo - Editorial Serif */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#493129] block leading-none">
                Anil Communications
              </span>
              <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[#8b597b] font-medium block mt-1">
                Luxury Mobile Retailer • Est. 2014
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#493129]">
            <Link href="/shop" className="hover:text-[#8b597b] transition">
              The Collection
            </Link>
            <Link href="/mobiles" className="hover:text-[#8b597b] transition">
              Flagship Mobiles
            </Link>
            <Link href="/accessories" className="hover:text-[#8b597b] transition">
              Accessories
            </Link>
            <Link href="/about" className="hover:text-[#8b597b] transition">
              The Maison
            </Link>
            <Link href="/contact" className="hover:text-[#8b597b] transition">
              Concierge & Store
            </Link>
          </nav>

          {/* Search, Account, Orders & Cart */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="hidden md:flex relative w-48 lg:w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..."
                className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[#fffaf5] border border-[#493129]/15 text-xs text-[#493129] placeholder-[#493129]/40 focus:outline-none focus:border-[#8b597b] focus:ring-1 focus:ring-[#8b597b]"
              />
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#493129]/40 pointer-events-none" />
            </form>

            {/* Track Orders Link */}
            <Link
              href="/orders"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#8b597b] hover:text-[#493129] transition px-3 py-1.5 rounded-full hover:bg-[#ffdec7]/40"
              title="Track Orders"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Orders</span>
            </Link>

            {/* Customer Account */}
            <Link
              href="/login"
              className="p-2 rounded-full hover:bg-[#ffdec7]/40 text-[#493129] transition"
              title="Customer Sign In"
            >
              <User className="w-4 h-4" />
            </Link>

            {/* Cart Trigger with Soft Coral Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-[#ffdec7]/40 text-[#493129] transition"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#efa3a0] text-[#493129] text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-[#493129]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#493129]/10 bg-[#fffaf5] px-6 py-6 space-y-4">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#493129]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog..."
              className="w-full pl-9 pr-3 py-2 rounded-full bg-[#ffeedb] border border-[#493129]/20 text-xs text-[#493129]"
            />
          </form>
          <div className="flex flex-col space-y-3 font-serif text-base text-[#493129]">
            <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[#493129]/10">
              The Full Collection
            </Link>
            <Link href="/mobiles" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[#493129]/10">
              Flagship Smartphones
            </Link>
            <Link href="/accessories" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[#493129]/10">
              Adapters & Acoustic Gear
            </Link>
            <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[#493129]/10 font-sans text-xs font-semibold text-[#8b597b]">
              Track Your Order
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[#493129]/10 font-sans text-xs">
              The Maison Story
            </Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="py-2 font-sans text-xs">
              Concierge & Flagship Store
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
