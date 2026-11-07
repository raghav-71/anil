"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TrendingUp,
  Download,
  Calendar,
  FileSpreadsheet,
  DollarSign,
  PieChart,
  Percent,
} from "lucide-react";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-400">Computing financial ledger & tax audit...</div>;
  }

  const { summary, recentInvoices } = data;

  // Export Table Data to CSV
  const handleExportCSV = () => {
    const headers = ["Invoice #,Date,Customer,Phone,Payment Method,Subtotal,Discount,CGST,SGST,Grand Total\n"];
    const rows = recentInvoices.map(
      (i: any) =>
        `"${i.invoiceNumber}","${i.createdAt}","${i.customerName}","${i.customerPhone}","${i.paymentMethod}",${i.subtotal},${i.discountAmount},${i.cgstAmount},${i.sgstAmount},${i.grandTotal}\n`
    );
    const blob = new Blob([...headers, ...rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Anil_Communications_Sales_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Financial Intelligence</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
            Reports & GST Tax Accounting
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyze Gross Margins (COGS vs Revenue), Tax Collections, and Sales Volumes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV Ledger</span>
          </button>
        </div>
      </div>

      {/* Financial Health Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Total Billed Revenue</span>
          <div className="text-2xl font-black text-white">{formatCurrency(summary.totalRevenue)}</div>
          <p className="text-[11px] text-slate-500">POS Invoices + Web Orders</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Cost of Goods Sold (COGS)</span>
          <div className="text-2xl font-black text-slate-300">{formatCurrency(summary.cogs)}</div>
          <p className="text-[11px] text-slate-500">Recorded Supplier Purchase Cost</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Net Gross Profit</span>
          <div className="text-2xl font-black text-emerald-400">{formatCurrency(summary.grossProfit)}</div>
          <p className="text-[11px] text-emerald-400/80">Margin: {summary.profitMargin}%</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400">GST Collected (18%)</span>
          <div className="text-2xl font-black text-blue-400">
            {formatCurrency(Math.round(summary.totalRevenue * 0.1525))}
          </div>
          <p className="text-[11px] text-slate-500">CGST (9%) + SGST (9%)</p>
        </div>
      </div>

      {/* Tax Invoices Audit Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-white">Tax Invoice Audit Ledger</h3>
            <p className="text-xs text-slate-400 mt-0.5">Compliant with Indian GST Act & ITC verification</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Invoice #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Billed Customer</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3 text-right">CGST (9%)</th>
                <th className="py-3 px-3 text-right">SGST (9%)</th>
                <th className="py-3 px-3 text-right">Grand Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {recentInvoices.map((i: any) => (
                <tr key={i.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono font-bold text-blue-400">{i.invoiceNumber}</td>
                  <td className="py-3 px-3 text-slate-500">{formatDate(i.createdAt)}</td>
                  <td className="py-3 px-3 font-medium text-white">{i.customerName}</td>
                  <td className="py-3 px-3 uppercase text-[10px] font-bold text-slate-400">{i.paymentMethod}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">{formatCurrency(i.cgstAmount)}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">{formatCurrency(i.sgstAmount)}</td>
                  <td className="py-3 px-3 text-right font-bold text-white font-mono">{formatCurrency(i.grandTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

