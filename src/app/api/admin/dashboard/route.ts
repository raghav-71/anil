import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { verifyAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = db.getAnalyticsSummary();
  const orders = db.getOrders();
  const products = db.getProducts();

  // Genuine recent orders (sorted newest first)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  // Group genuine orders by month for revenue chart
  const monthsMap = new Map<string, { revenue: number; profit: number }>();
  // Seed past 6 months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mName = d.toLocaleString("default", { month: "short" });
    monthsMap.set(mName, { revenue: 0, profit: 0 });
  }

  for (const o of orders) {
    if (o.paymentStatus === "paid" || o.status === "delivered") {
      const d = new Date(o.createdAt);
      const mName = d.toLocaleString("default", { month: "short" });
      if (monthsMap.has(mName)) {
        const entry = monthsMap.get(mName)!;
        entry.revenue += o.grandTotal;
        // Estimate 18% gross margin for orders if COGS not explicitly tracked
        entry.profit += Math.round(o.grandTotal * 0.18);
      }
    }
  }

  const monthlyRevenue = Array.from(monthsMap.entries()).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    profit: data.profit,
  }));

  // Payment method breakdown from real orders
  const pMethods: Record<string, number> = {
    Razorpay: 0,
    "UPI / QR": 0,
    "Cash on Delivery": 0,
  };

  for (const o of orders) {
    const pm = o.paymentMethod.toLowerCase();
    if (pm.includes("razorpay") || pm.includes("card") || pm.includes("online")) {
      pMethods.Razorpay += o.grandTotal;
    } else if (pm.includes("upi")) {
      pMethods["UPI / QR"] += o.grandTotal;
    } else {
      pMethods["Cash on Delivery"] += o.grandTotal;
    }
  }

  const paymentData = Object.entries(pMethods).map(([name, value]) => ({ name, value }));

  return NextResponse.json(
    {
      summary,
      monthlyRevenue,
      paymentData,
      recentOrders,
      totalProducts: products.length,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
