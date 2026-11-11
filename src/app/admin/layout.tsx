"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Smartphone,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Store,
  ChevronRight,
  ExternalLink,
  FolderTree,
  Users,
  TrendingUp,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if on login or access-denied page
    if (pathname?.startsWith("/admin/login") || pathname?.startsWith("/admin/access-denied")) {
      setCheckingAuth(false);
      return;
    }

    // Verify session
    fetch("/api/admin/auth", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) {
          router.replace("/admin/login");
        } else {
          setCheckingAuth(false);
        }
      })
      .catch(() => {
        router.replace("/admin/login");
      });
  }, [pathname, router]);

  if (pathname?.startsWith("/admin/login") || pathname?.startsWith("/admin/access-denied")) {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#ffeedb] text-[#493129] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-3 border-[#8b597b] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-serif italic text-[#493129]/80">
            Verifying store administration credentials...
          </p>
        </div>
      </div>
    );
  }

  // Strictly Owner Administration Navigation Sections
  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Smartphone },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/inventory", label: "Inventory", icon: Package },
    { href: "/admin/sales", label: "Sales Analytics", icon: TrendingUp },
    { href: "/admin/invoices", label: "Invoices", icon: FileText },
    { href: "/admin/reports", label: "Reports & Tax", icon: FileSpreadsheet },
    { href: "/admin/settings", label: "Store Settings", icon: Settings },
    { href: "/admin/security", label: "Owner Security", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#FFEDDB] text-[#493129] flex flex-col md:flex-row antialiased">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#FFEDDB] border-b border-[#E8D5C5] sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#493129] text-[#FFEDDB] flex items-center justify-center font-bold">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif font-bold text-sm text-[#493129] block leading-tight">
              ANIL COMMUNICATION &amp; ZEROX
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8B597B]">
              Store Management
            </span>
          </div>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-[#493129] hover:bg-[#FFDEC7] rounded-full transition"
          aria-label="Toggle menu"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-[#FFEDDB] border-r border-[#E8D5C5] flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out shadow-sm ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 px-1 pt-1">
            <div className="w-10 h-10 rounded-full bg-[#493129] text-[#FFEDDB] flex items-center justify-center shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif font-bold text-base text-[#493129] block leading-tight">
                ANIL COMMUNICATION &amp; ZEROX
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8B597B]">
                Owner Administration
              </span>
            </div>
          </div>

          {/* Current User Pill */}
          <div className="p-3.5 rounded-2xl bg-[#FFFAF5] border border-[#E8D5C5]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#493129] truncate">
                {user?.name || "Shop Owner"}
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#8B597B]/15 text-[#8B597B]">
                Owner
              </span>
            </div>
            <p className="text-[11px] text-[#806D63] mt-0.5 truncate">
              {user?.email || "admin@anilcommunications.com"}
            </p>
          </div>

          {/* 6 Essential Navigation Sections */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin" || pathname === "/admin/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-semibold transition ${
                    isActive
                      ? "bg-[#493129] text-[#FFEDDB] shadow-sm"
                      : "text-[#493129] hover:bg-[#FFDEC7] hover:text-[#493129]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="pt-4 border-t border-[#E8D5C5] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-full text-xs font-medium text-[#493129] hover:bg-[#FFDEC7] transition"
          >
            <div className="flex items-center gap-2.5">
              <Store className="w-4 h-4" />
              <span>View Storefront</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </Link>

          <button
            onClick={async () => {
              try {
                await fetch("/api/admin/auth", { method: "DELETE" });
              } catch {
                // ignore
              }
              logout();
              router.push("/admin/login");
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs font-semibold text-[#C0393A] hover:bg-[#C0393A]/10 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 min-w-0 bg-[#FFEDDB] overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
