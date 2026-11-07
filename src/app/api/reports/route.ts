import { NextResponse } from "next/server";
import { db } from "@/lib/database/store";

export async function GET() {
  const summary = db.getAnalyticsSummary();
  const invoices = db.getInvoices();
  const orders = db.getOrders();

  // Payment method breakdown
  const paymentMethodCount: Record<string, number> = {
    Cash: 0,
    UPI: 0,
    Card: 0,
    Razorpay: 0,
    COD: 0,
  };

  for (const inv of invoices) {
    const m = inv.paymentMethod.toUpperCase();
    if (m === "CASH") paymentMethodCount.Cash += inv.grandTotal;
    else if (m === "UPI") paymentMethodCount.UPI += inv.grandTotal;
    else if (m === "CARD") paymentMethodCount.Card += inv.grandTotal;
  }

  for (const ord of orders) {
    if (ord.paymentMethod === "razorpay") paymentMethodCount.Razorpay += ord.grandTotal;
    else if (ord.paymentMethod === "cod") paymentMethodCount.COD += ord.grandTotal;
  }

  const paymentData = Object.entries(paymentMethodCount)
    .filter(([_, val]) => val > 0)
    .map(([name, value]) => ({ name, value }));

  // Monthly trends (mocked realistic timeline)
  const monthlyRevenue = [
    { month: "Jun", revenue: 420000, profit: 62000 },
    { month: "Jul", revenue: 580000, profit: 89000 },
    { month: "Aug", revenue: 640000, profit: 98000 },
    { month: "Sep", revenue: 790000, profit: 125000 },
    { month: "Oct", revenue: 950000, profit: 158000 },
    { month: "Nov", revenue: summary.totalRevenue || 450000, profit: summary.grossProfit || 78000 },
  ];

  return NextResponse.json({
    summary,
    monthlyRevenue,
    paymentData,
    recentInvoices: invoices.slice(0, 10),
    recentOrders: orders.slice(0, 10),
  });
}

