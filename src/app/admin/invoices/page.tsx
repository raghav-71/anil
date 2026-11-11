"use client";

import React, { useState, useEffect } from "react";

export const dynamic = "force-dynamic";
import { formatCurrency, formatCurrencyExact, formatDate } from "@/lib/utils";
import { numberToWordsIndian } from "@/lib/invoice-generator";
import { Invoice } from "@/types";
import {
  FileText,
  Search,
  Printer,
  Calendar,
  X,
  CreditCard,
  User,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  const loadInvoices = () => {
    setLoading(true);
    const deviceToken =
      typeof window !== "undefined"
        ? localStorage.getItem("anil_device_token") || "tok_anil_shop_primary_pos_counter_2026_xyz982"
        : "";

    fetch(`/api/invoices${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`, {
      headers: { "X-Device-Token": deviceToken },
    })
      .then((res) => res.json())
      .then((data) => {
        setInvoices(data.invoices || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadInvoices();
  }, [searchQuery]);

  const handlePrint = (inv: Invoice) => {
    setActiveInvoice(inv);
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B597B]">Tax & Billing Records</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#493129] tracking-tight mt-0.5">
            Customer GST Tax Invoices
          </h1>
          <p className="text-xs text-[#806D63] mt-1">
            Browse sequential e-commerce tax invoices, review ITC compliance, and print official A4 tax invoices
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="no-print bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#806D63]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Invoice # (e.g. AC-2026-00001), phone, customer..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#E8D5C5] text-xs text-[#30241F] placeholder-[#806D63]/60 focus:outline-none focus:border-[#8B597B]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-[#8B597B] border-b border-[#E8D5C5]">
              <tr>
                <th className="py-3 px-3">Invoice Number</th>
                <th className="py-3 px-3">Billed Customer</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3">Items Count</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3 text-right">Grand Total</th>
                <th className="py-3 px-3 text-right">Reprint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D5C5] text-[#30241F]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#806D63]">
                    Loading invoice ledger...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#806D63]">
                    No matching invoices found in system records.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F5E8DC]/50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-[#493129]">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#493129] block">{inv.customerName}</span>
                      <span className="text-[10px] text-[#806D63] font-mono">{inv.customerPhone}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inv.invoiceType === "b2b"
                            ? "bg-[#FFDEC7] text-[#493129] border border-[#E8D5C5]"
                            : "bg-[#F5E8DC] text-[#493129]"
                        }`}
                      >
                        {inv.invoiceType}
                      </span>
                    </td>
                    <td className="py-3 px-3 uppercase text-[10px] font-bold text-[#806D63]">
                      {inv.paymentMethod}
                    </td>
                    <td className="py-3 px-3">{inv.items.length} items</td>
                    <td className="py-3 px-3 text-[#806D63]">{formatDate(inv.createdAt)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#493129] text-right">
                      {formatCurrency(inv.grandTotal)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handlePrint(inv)}
                        className="px-3 py-1.5 rounded-lg bg-[#FFDEC7] hover:bg-[#efa3a0] text-[#493129] text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Bill</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT MODAL DIALOG */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 bg-[#493129]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFAF5] border border-[#E8D5C5] rounded-3xl max-w-2xl w-full p-6 space-y-4 my-8 shadow-2xl">
            <div className="no-print flex items-center justify-between pb-3 border-b border-[#E8D5C5]">
              <div className="flex items-center gap-2 text-[#493129] font-bold text-sm">
                <FileText className="w-5 h-5 text-[#8B597B]" />
                <span>Invoice View: {activeInvoice.invoiceNumber}</span>
              </div>
              <button onClick={() => setActiveInvoice(null)} className="text-[#806D63] hover:text-[#493129]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Print Actions Bar */}
            <div className="no-print flex items-center justify-between bg-[#F5E8DC] border border-[#E8D5C5] p-3 rounded-2xl">
              <span className="text-xs font-semibold text-[#493129]">
                Official A4 GST Tax Invoice (Recipient Copy)
              </span>

              <button
                onClick={triggerPrint}
                className="px-4 py-2 bg-[#493129] hover:bg-[#8B597B] text-[#FFEDDB] text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
            </div>

            {/* PRINT AREA PREVIEW - STANDARD A4 GST TAX INVOICE */}
            <div className="print-area bg-white text-black p-6 rounded-2xl shadow-inner max-h-[500px] overflow-y-auto">
              <div className="p-4 space-y-4 text-xs font-sans text-black">
                {/* Shop Info Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">ANIL COMMUNICATION &amp; ZEROX</h2>
                    <p className="text-xs text-slate-600">Near Canara Bank, Belagavi, Karnataka - 591103</p>
                    <p className="text-xs text-slate-600">Ph: +91 9380124254 • Alt: +91 8095908042</p>
                    <p className="font-bold mt-1">GSTIN: 29CQWPK2582Q1ZC</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded">
                      TAX INVOICE
                    </span>
                    <p className="text-sm font-bold font-mono mt-2">Invoice #: {activeInvoice.invoiceNumber}</p>
                    <p className="text-xs text-slate-500">Date: {formatDate(activeInvoice.createdAt)}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Billed To (Customer):</span>
                    <p className="font-bold text-slate-900">{activeInvoice.customerName}</p>
                    <p className="text-slate-600">Phone: {activeInvoice.customerPhone}</p>
                    {activeInvoice.customerGstin && <p className="font-bold">GSTIN: {activeInvoice.customerGstin}</p>}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Transaction Details:</span>
                    <p className="font-bold uppercase text-slate-900">Payment: {activeInvoice.paymentMethod}</p>
                    <p className="text-slate-600">Dispatch: Authorized Online Order</p>
                  </div>
                </div>

                {/* A4 Items Table */}
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                    <tr>
                      <th className="p-2 border-r border-slate-300">Item Description</th>
                      <th className="p-2 border-r border-slate-300 text-center">HSN</th>
                      <th className="p-2 border-r border-slate-300 text-center">Qty</th>
                      <th className="p-2 border-r border-slate-300 text-right">Rate</th>
                      <th className="p-2 border-r border-slate-300 text-right">Taxable</th>
                      <th className="p-2 border-r border-slate-300 text-right">CGST (9%)</th>
                      <th className="p-2 border-r border-slate-300 text-right">SGST (9%)</th>
                      <th className="p-2 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activeInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border-r border-slate-200 font-medium">{item.productName}</td>
                        <td className="p-2 border-r border-slate-200 text-center font-mono">{item.hsnCode}</td>
                        <td className="p-2 border-r border-slate-200 text-center font-bold">{item.quantity}</td>
                        <td className="p-2 border-r border-slate-200 text-right">{formatCurrencyExact(item.unitPrice)}</td>
                        <td className="p-2 border-r border-slate-200 text-right">{formatCurrencyExact(item.taxableValue)}</td>
                        <td className="p-2 border-r border-slate-200 text-right">{formatCurrencyExact(item.cgstAmount)}</td>
                        <td className="p-2 border-r border-slate-200 text-right">{formatCurrencyExact(item.sgstAmount)}</td>
                        <td className="p-2 text-right font-bold">{formatCurrencyExact(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Summary Footer */}
                <div className="flex justify-between items-start pt-2">
                  <div className="max-w-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Amount in Words:</span>
                    <p className="text-xs font-semibold italic text-slate-800">
                      {numberToWordsIndian(activeInvoice.grandTotal)}
                    </p>
                  </div>

                  <div className="w-64 space-y-1 text-right text-xs">
                    <div className="flex justify-between">
                      <span>Total CGST:</span>
                      <span>{formatCurrencyExact(activeInvoice.cgstAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total SGST:</span>
                      <span>{formatCurrencyExact(activeInvoice.sgstAmount)}</span>
                    </div>
                    <div className="flex justify-between text-base font-black border-t-2 border-slate-800 pt-1">
                      <span>GRAND TOTAL:</span>
                      <span>{formatCurrencyExact(activeInvoice.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Terms & Authorized Signature */}
                <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-500">
                  <div>
                    <p className="font-bold text-slate-800">Terms & Conditions:</p>
                    <p>1. Warranty claims subject to manufacturer terms.</p>
                    <p>2. Physical damage or liquid spills not covered under standard warranty.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-40 border-b border-slate-400 mb-1" />
                    <span className="font-semibold text-slate-800">For ANIL COMMUNICATION &amp; ZEROX</span>
                    <p className="text-[10px]">Authorized Signatory</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
