"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Smartphone,
  LayoutDashboard,
  Layers,
  Package,
  TrendingUp,
  Truck,
  Users,
  Settings,
  LogOut,
  ShoppingBag,
  ShieldAlert,
  Menu,
  X,
  Lock,
  KeyRound,
  Laptop,
  CheckCircle2,
  UserCheck,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Device Authentication State
  const [deviceAuthorized, setDeviceAuthorized] = useState<boolean | null>(null);
  const [deviceChecking, setDeviceChecking] = useState(true);
  const [enrollPasskey, setEnrollPasskey] = useState("");
  const [enrollDeviceName, setEnrollDeviceName] = useState("Shop Primary Counter Station");
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Verify device on mount
  useEffect(() => {
    const checkDevice = async () => {
      try {
        const token =
          localStorage.getItem("anil_device_token") ||
          "tok_anil_shop_primary_pos_counter_2026_xyz982"; // Default pre-enrolled terminal

        const res = await fetch("/api/admin/device/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          localStorage.setItem("anil_device_token", token);
          setDeviceAuthorized(true);
        } else {
          setDeviceAuthorized(false);
        }
      } catch {
        setDeviceAuthorized(false);
      } finally {
        setDeviceChecking(false);
      }
    };

    checkDevice();
  }, []);

  const handleEnrollDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollError(null);
    setIsEnrolling(true);

    try {
      const res = await fetch("/api/admin/device/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masterPasskey: enrollPasskey,
          deviceName: enrollDeviceName,
          enrolledBy: user?.name || "Shop Owner",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Device enrollment failed.");
      }

      localStorage.setItem("anil_device_token", data.token);
      setDeviceAuthorized(true);
    } catch (err: any) {
      setEnrollError(err.message || "Failed to enroll device.");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // 1. Device Security Verification Gate
  if (deviceChecking) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Laptop className="w-10 h-10 text-blue-500 animate-pulse mx-auto" />
          <p className="text-xs">Verifying hardware cryptographic device token...</p>
        </div>
      </div>
    );
  }

  if (deviceAuthorized === false) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-900/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">RESTRICTED TERMINAL</h2>
            <p className="text-xs text-red-300 font-semibold uppercase tracking-wider">
              Device Not Authorized
            </p>
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              The Anil Communications POS & Management System can only be accessed on enrolled shop computers. Customers and unauthorized devices are strictly denied.
            </p>
          </div>

          {/* Owner Enrollment Form */}
          <form onSubmit={handleEnrollDevice} className="space-y-3 pt-3 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Owner Device Enrollment</span>
            </div>

            {enrollError && (
              <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-[11px]">
                {enrollError}
              </div>
            )}

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Terminal Device Name</label>
              <input
                type="text"
                required
                value={enrollDeviceName}
                onChange={(e) => setEnrollDeviceName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Owner Master Passkey</label>
              <input
                type="password"
                required
                placeholder="Enter master passkey (admin123)"
                value={enrollPasskey}
                onChange={(e) => setEnrollPasskey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isEnrolling}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs transition"
            >
              {isEnrolling ? "Enrolling Machine..." : "Authorize This Device"}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-400">
              Return to Public Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Staff User Authentication Gate
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-center">
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 max-w-md w-full space-y-4">
          <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Staff Authentication Required</h2>
          <p className="text-xs text-slate-400">
            Sign in with authorized staff credentials to continue to the private shop terminal.
          </p>
          <Link
            href="/admin/login"
            className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
          >
            Go to Staff Login
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin/dashboard", label: "Executive Dashboard", icon: LayoutDashboard, roles: ["super_admin", "manager"] },
    { href: "/admin/pos", label: "Supermarket POS Terminal", icon: Layers, roles: ["super_admin", "manager", "cashier"] },
    { href: "/admin/products", label: "Catalog & Products", icon: Smartphone, roles: ["super_admin", "manager"] },
    { href: "/admin/inventory", label: "Live Stock & Ledger", icon: Package, roles: ["super_admin", "manager"] },
    { href: "/admin/orders", label: "Web Orders Dispatcher", icon: ShoppingBag, roles: ["super_admin", "manager"] },
    { href: "/admin/purchases", label: "Supplier Purchases (PO)", icon: Truck, roles: ["super_admin", "manager"] },
    { href: "/admin/suppliers", label: "Suppliers Directory", icon: Users, roles: ["super_admin", "manager"] },
    { href: "/admin/customers", label: "Customer CRM", icon: UserCheck, roles: ["super_admin", "manager", "cashier"] },
    { href: "/admin/reports", label: "Financials & Tax", icon: TrendingUp, roles: ["super_admin", "manager"] },
    { href: "/admin/settings", label: "Store & Device Security", icon: Settings, roles: ["super_admin"] },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-blue-500" />
          <span className="font-bold text-sm">PRIVATE POS TERMINAL</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-slate-900/95 border-r border-slate-800/80 flex flex-col justify-between p-4 backdrop-blur-xl transition-transform duration-300 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight block text-white">ANIL COMMUNICATIONS</span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> TRUSTED DEVICE ENROLLED
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white truncate">{user.name}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  user.role === "super_admin"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : user.role === "manager"
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                {user.role.replace("_", " ")}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">{user.email}</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isAllowed = user.role === "super_admin" || item.roles.includes(user.role);
              if (!isAllowed) return null;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <button
            onClick={() => {
              logout();
              router.push("/admin/login");
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Terminal</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 bg-slate-950 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
