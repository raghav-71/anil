"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/types";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: CurrentUser | null;
  loginAs: (role: UserRole) => void;
  loginWithCredentials: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Preset demo accounts for quick role-switching and security testing
export const PRESET_ACCOUNTS: Record<UserRole, CurrentUser & { pin: string }> = {
  super_admin: {
    id: "usr-admin-1",
    name: "Anil Kumar (Owner)",
    email: "admin@anilcommunications.com",
    role: "super_admin",
    pin: "admin123",
  },
  manager: {
    id: "usr-mgr-1",
    name: "Vikrant Singh (Store Manager)",
    email: "manager@anilcommunications.com",
    role: "manager",
    pin: "manager123",
  },
  cashier: {
    id: "usr-csh-1",
    name: "Deepak Sharma (POS Cashier)",
    email: "cashier@anilcommunications.com",
    role: "cashier",
    pin: "cashier123",
  },
  customer: {
    id: "usr-cust-1",
    name: "Ramesh Sharma",
    email: "ramesh@example.com",
    role: "customer",
    pin: "customer123",
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("anil_staff_session");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default to super admin session for easy initial access
        setUser(PRESET_ACCOUNTS.super_admin);
        localStorage.setItem("anil_staff_session", JSON.stringify(PRESET_ACCOUNTS.super_admin));
      }
    } catch {
      // ignore
    }
  }, []);

  const loginAs = (role: UserRole) => {
    const acc = PRESET_ACCOUNTS[role];
    setUser(acc);
    localStorage.setItem("anil_staff_session", JSON.stringify(acc));
  };

  const loginWithCredentials = async (email: string, pass: string) => {
    const found = Object.values(PRESET_ACCOUNTS).find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.pin === pass.trim()
    );
    if (found) {
      setUser(found);
      localStorage.setItem("anil_staff_session", JSON.stringify(found));
      return { success: true };
    }
    return { success: false, error: "Invalid email or PIN. Try admin@anilcommunications.com / admin123" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("anil_staff_session");
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    if (user.role === "super_admin") return true; // Super admin has access to everything
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAs,
        loginWithCredentials,
        logout,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

