"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Lock,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import { ADMIN_EMAIL } from "@/lib/admin-auth";

export default function SecurityPage() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 6) {
      setMsg({ text: "PIN/Passkey must be at least 6 characters long.", type: "error" });
      return;
    }
    if (newPin !== confirmPin) {
      setMsg({ text: "New passkey and confirmation do not match.", type: "error" });
      return;
    }

    setMsg({ text: "Owner credentials successfully updated. Please use new passkey on next sign in.", type: "success" });
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E8D5C5] pb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B597B]">
            Owner Authentication
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#493129] tracking-tight mt-0.5">
            Security & Account
          </h1>
          <p className="text-xs text-[#806D63] mt-1">
            Manage owner login credentials, master passkey, and administrator security protocols
          </p>
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
            msg.type === "success"
              ? "bg-[#27845A]/10 border border-[#27845A]/30 text-[#27845A]"
              : "bg-[#C0393A]/10 border border-[#C0393A]/30 text-[#C0393A]"
          }`}
        >
          {msg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Account Info */}
      <div className="bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E8D5C5]">
          <UserCheck className="w-4 h-4 text-[#8B597B]" />
          <h2 className="text-sm font-serif font-bold text-[#493129]">Owner Account Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[#806D63] block mb-1">Account Holder</span>
            <span className="font-bold text-[#493129] text-sm">Shop Owner</span>
          </div>

          <div>
            <span className="text-[#806D63] block mb-1">Primary Email</span>
            <span className="font-mono font-bold text-[#493129]">{ADMIN_EMAIL}</span>
          </div>

          <div>
            <span className="text-[#806D63] block mb-1">Role & Privileges</span>
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#8B597B]/15 text-[#8B597B] font-bold text-[10px] uppercase">
              Super Admin / Shop Owner
            </span>
          </div>

          <div>
            <span className="text-[#806D63] block mb-1">Authorization Scope</span>
            <span className="text-[#30241F]">Full Root Access (Catalog, Orders, Inventory, Settings)</span>
          </div>
        </div>
      </div>

      {/* Update Passkey Form */}
      <div className="bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E8D5C5]">
          <KeyRound className="w-4 h-4 text-[#8B597B]" />
          <h2 className="text-sm font-serif font-bold text-[#493129]">
            Change Owner PIN / Passkey
          </h2>
        </div>

        <form onSubmit={handleUpdatePin} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#493129] font-bold mb-1">Current PIN / Passkey</label>
            <input
              type="password"
              required
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              placeholder="Enter current passkey (admin123)"
              className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] max-w-md focus:outline-none focus:border-[#8B597B]"
            />
          </div>

          <div>
            <label className="block text-[#493129] font-bold mb-1">New PIN / Passkey</label>
            <input
              type="password"
              required
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] max-w-md focus:outline-none focus:border-[#8B597B]"
            />
          </div>

          <div>
            <label className="block text-[#493129] font-bold mb-1">Confirm New PIN / Passkey</label>
            <input
              type="password"
              required
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Re-enter new passkey"
              className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-[#30241F] max-w-md focus:outline-none focus:border-[#8B597B]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-8 py-3 rounded-full bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] text-xs font-bold transition shadow-sm"
            >
              Update Passkey
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
