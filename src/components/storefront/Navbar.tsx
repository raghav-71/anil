"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import {
  ShoppingBag,
  Menu,
  X,
  User,
  Package,
  Heart,
} from "lucide-react";
import { SearchAutocomplete } from "./SearchAutocomplete";

export function Navbar() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen, wishlist } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/shop", label: "The Collection" },
    { href: "/catalog", label: "Catalogue" },
    { href: "/mobiles", label: "Smartphones" },
    { href: "/accessories", label: "Accessories" },
    { href: "/contact", label: "Help & Support" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFEDDB]/95 backdrop-blur-md border-b border-[#E8D5C5] transition-all">
      {/* Editorial Announcement Banner */}
      <div className="bg-[#493129] text-[#FFEDDB] text-[11px] py-1.5 px-4 text-center font-medium tracking-wide">
        <span>Bespoke Flagships &amp; Acoustic Accoutrements • Free Insured Shipping on Orders Over ₹999 • 100% Genuine Indian GST Warranty</span>
      </div>

      {/* Main Editorial Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          {/* Brand Logo - Editorial Serif */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div>
              <span className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-[#493129] block leading-none">
                ANIL COMMUNICATION &amp; ZEROX
              </span>
              <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[#8B597B] font-medium block mt-1">
                Mobile Phones &amp; Accessories • Pant Nagar
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-7 text-sm font-medium text-[#493129]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-1 transition ${
                    isActive
                      ? "text-[#8B597B] font-semibold border-b-2 border-[#8B597B]"
                      : "text-[#493129] hover:text-[#8B597B]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Live Autocomplete Search Input */}
          <div className="hidden md:block flex-1 max-w-xs lg:max-w-sm mx-2">
            <SearchAutocomplete />
          </div>

          {/* Action Links: Wishlist, Orders, Account, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist */}
            <Link
              href="/account?tab=wishlist"
              className="relative p-2 rounded-full hover:bg-[#FFDEC7] text-[#493129] transition hidden sm:inline-flex"
              title="Saved Wishlist"
            >
              <Heart className="w-4 h-4 text-[#493129]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EFA3A0] text-[#493129] text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Track Orders Link */}
            <Link
              href="/orders"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-[#8B597B] hover:text-[#493129] transition px-3 py-1.5 rounded-full hover:bg-[#FFDEC7]"
              title="Track Orders"
            >
              <Package className="w-3.5 h-3.5 text-[#8B597B]" />
              <span>Orders</span>
            </Link>

            {/* Customer Account */}
            <Link
              href="/account"
              className="p-2 rounded-full hover:bg-[#FFDEC7] text-[#493129] transition"
              title="My Account"
            >
              <User className="w-4 h-4 text-[#493129]" />
            </Link>

            {/* Cart Trigger with Soft Coral Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-[#FFDEC7] text-[#493129] transition"
              aria-label="View Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 text-[#493129]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EFA3A0] text-[#493129] text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-full text-[#493129] hover:bg-[#FFDEC7] transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#493129]" /> : <Menu className="w-5 h-5 text-[#493129]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#E8D5C5] bg-[#FFEDDB] px-6 py-6 space-y-4">
          <div className="w-full">
            <SearchAutocomplete />
          </div>
          <div className="flex flex-col space-y-3 font-serif text-base text-[#493129]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 border-b border-[#E8D5C5] flex items-center justify-between transition ${
                    isActive ? "text-[#8B597B] font-bold" : "text-[#493129] hover:text-[#8B597B]"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-[#8B597B]" />}
                </Link>
              );
            })}
            <Link href="/account?tab=wishlist" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[#E8D5C5] font-sans text-xs flex items-center justify-between text-[#493129] hover:text-[#8B597B]">
              <span>My Wishlist</span>
              {wishlist.length > 0 && <span className="bg-[#EFA3A0] text-[#493129] px-2 py-0.5 rounded-full text-[10px] font-bold">{wishlist.length}</span>}
            </Link>
            <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[#E8D5C5] font-sans text-xs font-semibold text-[#8B597B] hover:text-[#493129]">
              Track Your Orders
            </Link>
            <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[#E8D5C5] font-sans text-xs text-[#493129] hover:text-[#8B597B]">
              Account &amp; Saved Addresses
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
