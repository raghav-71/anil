"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/types";

export interface CurrentUser {
  id: string;
  name: string;
  fullName?: string;
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

export const OWNER_ACCOUNT: CurrentUser = {
  id: "usr-owner-primary",
  name: "Shop Owner",
  email: "admin@anilcommunications.com",
  role: "owner",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    // Check server-side session cookie on mount
    fetch("/api/admin/auth", { cache: "no-store" })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const loginAs = (_role: UserRole) => {
    // Prohibit client-side role elevation
    console.warn("[Auth] Client-side role elevation prohibited. Server authentication required.");
  };

  const loginWithCredentials = async (email: string, pass: string) => {
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || "Authentication failed." };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to reach authentication server." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } catch {
      // ignore
    }
    setUser(null);
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    if (user.role === "owner") return true;
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
