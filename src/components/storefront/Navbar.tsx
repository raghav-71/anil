"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import {
  ShoppingBag,
  Menu,
  X,
  User,
  Package,
  Heart,
  Scale,
} from "lucide-react";
import { SearchAutocomplete } from "./SearchAutocomplete";

export function Navbar() {
  const { totalItems, setIsCartOpen, wishlist, compareList } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#ffeedb]/95 backdrop-blur-md border-b border-[#493129]/10 transition-all">
      {/* Editorial Announcement Banner */}
      <div className="bg-[#493129] text-[#ffeedb] text-[11px] py-1.5 px-4 text-center font-medium tracking-wide">
        <span>Bespoke Flagships & Acoustic Accoutrements • Free Insured Shipping on Orders Over ₹999 • 100% Genuine Indian GST Warranty</span>
      </div>

      {/* Main Editorial Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
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
          <nav className="hidden xl:flex items-center gap-7 text-sm font-medium text-[#493129]">
            <Link href="/shop" className="hover:text-[#8b597b] transition">
              The Collection
            </Link>
            <Link href="/catalog" className="hover:text-[#8b597b] transition">
              Catalogue
            </Link>
            <Link href="/mobiles" className="hover:text-[#8b597b] transition">
              Smartphones
            </Link>
            <Link href="/accessories" className="hover:text-[#8b597b] transition">
              Accessories
            </Link>
            <Link href="/about" className="hover:text-[#8b597b] transition">
              The Maison
            </Link>
            <Link href="/contact" className="hover:text-[#8b597b] transition">
              Concierge
            </Link>
          </nav>

          {/* Live Autocomplete Search Input */}
          <div className="hidden md:block flex-1 max-w-xs lg:max-w-sm mx-2">
            <SearchAutocomplete />
          </div>

          {/* Action Links: Compare, Wishlist, Orders, Account, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Compare Tool */}
            <Link
              href="/compare"
              className="relative p-2 rounded-full hover:bg-[#ffdec7]/50 text-[#493129] transition hidden sm:inline-flex"
              title="Compare Devices"
            >
              <Scale className="w-4 h-4" />
              {compareList.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#8b597b] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {compareList.length}
                </span>
              )}
            </Link>

            {/* Wishlist */}
            <Link
              href="/account?tab=wishlist"
              className="relative p-2 rounded-full hover:bg-[#ffdec7]/50 text-[#493129] transition hidden sm:inline-flex"
              title="Saved Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#efa3a0] text-[#493129] text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Track Orders Link */}
            <Link
              href="/orders"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-[#8b597b] hover:text-[#493129] transition px-3 py-1.5 rounded-full hover:bg-[#ffdec7]/40"
              title="Track Orders"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Orders</span>
            </Link>

            {/* Customer Account */}
            <Link
              href="/account"
              className="p-2 rounded-full hover:bg-[#ffdec7]/50 text-[#493129] transition"
              title="My Account"
            >
              <User className="w-4 h-4" />
            </Link>

            {/* Cart Trigger with Soft Coral Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-[#ffdec7]/50 text-[#493129] transition"
              aria-label="View Shopping Bag"
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
              className="xl:hidden p-2 rounded-full text-[#493129]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#493129]/10 bg-[#fffaf5] px-6 py-6 space-y-4">
          <div className="w-full">
            <SearchAutocomplete />
          </div>
          <div className="flex flex-col space-y-3 font-serif text-base text-[#493129]">
            <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[#493129]/10">
              The Full Collection
            </Link>
            <Link href="/catalog" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[#493129]/10">
              Product Catalogue
            </Link>
            <Link href="/mobiles" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[#493129]/10">
              Flagship Smartphones
            </Link>
            <Link href="/accessories" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[#493129]/10">
              Adapters & Acoustic Gear
            </Link>
            <Link href="/compare" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[#493129]/10 font-sans text-xs flex items-center justify-between">
              <span>Compare Devices</span>
              {compareList.length > 0 && <span className="bg-[#8b597b] text-white px-2 py-0.5 rounded-full text-[10px]">{compareList.length}</span>}
            </Link>
            <Link href="/account?tab=wishlist" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[#493129]/10 font-sans text-xs flex items-center justify-between">
              <span>My Wishlist</span>
              {wishlist.length > 0 && <span className="bg-[#efa3a0] text-[#493129] px-2 py-0.5 rounded-full text-[10px]">{wishlist.length}</span>}
            </Link>
            <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[#493129]/10 font-sans text-xs font-semibold text-[#8b597b]">
              Track Your Orders
            </Link>
            <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[#493129]/10 font-sans text-xs">
              Account & Saved Addresses
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
