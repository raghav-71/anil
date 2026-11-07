"use client";

import React, { useState, useEffect } from "react";
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
  const [printLayout, setPrintLayout] = useState<"thermal" | "a4">("thermal");

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
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Tax & Billing Records</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
            Finalized GST Invoices
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse sequential POS tax invoices, review ITC compliance, and reprint thermal slips or A4 bills
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Invoice # (e.g. AC-2026-00001), phone, customer..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
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
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Loading invoice ledger...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No matching invoices found in system records.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-blue-400">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-white block">{inv.customerName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{inv.customerPhone}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inv.invoiceType === "b2b"
                            ? "bg-purple-950 text-purple-300 border border-purple-800"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {inv.invoiceType}
                      </span>
                    </td>
                    <td className="py-3 px-3 uppercase text-[10px] font-bold text-slate-400">
                      {inv.paymentMethod}
                    </td>
                    <td className="py-3 px-3">{inv.items.length} items</td>
                    <td className="py-3 px-3 text-slate-400">{formatDate(inv.createdAt)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-white text-right">
                      {formatCurrency(inv.grandTotal)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handlePrint(inv)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-semibold inline-flex items-center gap-1.5 transition"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="no-print flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>Invoice View: {activeInvoice.invoiceNumber}</span>
              </div>
              <button onClick={() => setActiveInvoice(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Layout Toggle Pill */}
            <div className="no-print flex items-center justify-between bg-slate-800 p-2 rounded-2xl">
              <div className="flex gap-2 text-xs font-semibold">
                <button
                  onClick={() => setPrintLayout("thermal")}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    printLayout === "thermal" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  80mm / 58mm Thermal Slip
                </button>
                <button
                  onClick={() => setPrintLayout("a4")}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    printLayout === "a4" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Standard A4 GST Tax Invoice
                </button>
              </div>

              <button
                onClick={triggerPrint}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/30 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>

            {/* PRINT AREA PREVIEW */}
            <div className="print-area bg-white text-black p-6 rounded-2xl shadow-inner max-h-[500px] overflow-y-auto">
              {printLayout === "thermal" ? (
                /* 80mm / 58mm THERMAL RECEIPT LAYOUT */
                <div className="max-w-[320px] mx-auto font-mono text-[11px] leading-tight text-black space-y-2 text-center">
                  <div className="border-b border-dashed border-black pb-2 space-y-0.5">
                    <h2 className="text-sm font-black uppercase tracking-tight">ANIL COMMUNICATIONS</h2>
                    <p className="text-[10px]">Shop 14, MG Road, Bengaluru - 560001</p>
                    <p className="text-[10px]">Ph: +91 98765 43210 • GSTIN: 29AAAAA0000A1Z5</p>
                  </div>

                  <div className="text-left text-[10px] border-b border-dashed border-black pb-2 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Invoice: #{activeInvoice.invoiceNumber}</span>
                      <span>Date: {formatDate(activeInvoice.createdAt)}</span>
                    </div>
                    <div>Customer: {activeInvoice.customerName} ({activeInvoice.customerPhone})</div>
                    {activeInvoice.customerGstin && <div>Customer GSTIN: {activeInvoice.customerGstin}</div>}
                    <div>Cashier: {activeInvoice.cashierName}</div>
                  </div>

                  {/* Items Table */}
                  <table className="w-full text-left text-[10px] border-b border-dashed border-black pb-2">
                    <thead>
                      <tr className="border-b border-black font-bold">
                        <th className="py-1">Item</th>
                        <th className="text-center py-1">Qty</th>
                        <th className="text-right py-1">Price</th>
                        <th className="text-right py-1">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dotted divide-gray-300">
                      {activeInvoice.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-1 pr-1">{it.productName}</td>
                          <td className="text-center py-1">{it.quantity}</td>
                          <td className="text-right py-1">{formatCurrencyExact(it.unitPrice)}</td>
                          <td className="text-right py-1 font-bold">{formatCurrencyExact(it.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals & Tax breakdown */}
                  <div className="text-right text-[10px] space-y-0.5 border-b border-dashed border-black pb-2">
                    <div className="flex justify-between">
                      <span>Taxable Value:</span>
                      <span>{formatCurrencyExact(activeInvoice.items.reduce((acc, i) => acc + i.taxableValue, 0))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST (9%):</span>
                      <span>{formatCurrencyExact(activeInvoice.cgstAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST (9%):</span>
                      <span>{formatCurrencyExact(activeInvoice.sgstAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-black pt-1 border-t border-black">
                      <span>GRAND TOTAL:</span>
                      <span>{formatCurrencyExact(activeInvoice.grandTotal)}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span>Payment Method:</span>
                      <span className="uppercase font-bold">{activeInvoice.paymentMethod}</span>
                    </div>
                    {activeInvoice.paymentMethod === "cash" && (
                      <>
                        <div className="flex justify-between">
                          <span>Amount Tendered:</span>
                          <span>{formatCurrencyExact(activeInvoice.amountReceived)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Change Returned:</span>
                          <span>{formatCurrencyExact(activeInvoice.changeReturned)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="text-center text-[9px] pt-1 space-y-0.5">
                    <p className="font-bold">Goods once sold carry manufacturer warranty.</p>
                    <p>Thank you for shopping with Anil Communications!</p>
                  </div>
                </div>
              ) : (
                /* STANDARD A4 GST TAX INVOICE LAYOUT */
                <div className="p-4 space-y-4 text-xs font-sans text-black">
                  {/* Shop Info Header */}
                  <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">ANIL COMMUNICATIONS</h2>
                      <p className="text-xs text-slate-600">Shop No. 14, Main Electronics Market, MG Road, Bengaluru - 560001</p>
                      <p className="text-xs text-slate-600">Ph: +91 98765 43210 • Email: support@anilcommunications.com</p>
                      <p className="font-bold mt-1">GSTIN: 29AAAAA0000A1Z5</p>
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
                      <p className="text-slate-600">Cashier: {activeInvoice.cashierName}</p>
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
                      <span className="font-semibold text-slate-800">For Anil Communications</span>
                      <p className="text-[10px]">Authorized Signatory</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

