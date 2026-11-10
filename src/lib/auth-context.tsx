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
  id: "usr-admin-1",
  name: "Shop Owner",
  email: "admin@anilcommunications.com",
  role: "super_admin",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    // Check server-side session cookie first
    fetch("/api/admin/auth")
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setUser(data.user);
          localStorage.setItem("anil_staff_session", JSON.stringify(data.user));
        } else {
          // If server session invalid, check if we had a stored session to verify or clear
          const stored = localStorage.getItem("anil_staff_session");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              // Only keep if server validated; otherwise clear
              setUser(null);
              localStorage.removeItem("anil_staff_session");
            } catch {
              localStorage.removeItem("anil_staff_session");
            }
          }
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const loginAs = (role: UserRole) => {
    if (role === "super_admin") {
      setUser(OWNER_ACCOUNT);
      localStorage.setItem("anil_staff_session", JSON.stringify(OWNER_ACCOUNT));
    }
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
        localStorage.setItem("anil_staff_session", JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error || "Invalid owner email or PIN." };
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
    localStorage.removeItem("anil_staff_session");
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    if (user.role === "super_admin") return true;
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
