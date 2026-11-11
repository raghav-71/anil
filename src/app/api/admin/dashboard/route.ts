import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { verifyAdminSession } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let orders: any[] = [];
  let productsCount = 0;
  let isFromSupabase = false;

  // 1. Attempt live calculation from Supabase PostgreSQL
  try {
    const supabase = getServiceSupabase();
    const { data: dbOrders, error: oErr } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .order("created_at", { ascending: false });

    const { count: dbProductsCount, error: pErr } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (!oErr && dbOrders && dbOrders.length > 0) {
      orders = dbOrders.map((o: any) => ({
        id: o.id,
        orderNumber: o.order_number,
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        customerEmail: o.customer_email || "",
        shippingAddress: o.shipping_address || {},
        fulfillmentType: o.fulfillment_type || "delivery",
        subtotal: Number(o.subtotal || 0),
        discountAmount: Number(o.discount_amount || 0),
        shippingFee: Number(o.shipping_fee || 0),
        taxAmount: Number(o.tax_amount || 0),
        grandTotal: Number(o.grand_total || 0),
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        status: o.status,
        trackingNumber: o.tracking_number,
        notes: o.notes,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        items: (o.items || []).map((it: any) => ({
          id: it.id,
          variantId: it.variant_id,
          productName: it.product_title || it.product_name,
          variantDetails: it.variant_name || "",
          quantity: it.quantity,
          unitPrice: Number(it.price || 0),
          taxRate: 18,
          taxAmount: 0,
          totalPrice: Number(it.total || 0),
        })),
      }));
      productsCount = dbProductsCount || db.getProducts().length;
      isFromSupabase = true;
    }
  } catch (err) {
    console.warn("[Admin Dashboard API] Supabase query fallback triggered:", err);
  }

  // 2. Fallback to Local Store if Supabase not yet migrated
  if (!isFromSupabase) {
    orders = db.getOrders();
    productsCount = db.getProducts().length;
  }

  // Calculate live analytics summary from orders
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid" || o.status === "delivered")
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const pendingOrders = orders.filter((o) =>
    ["pending", "confirmed", "processing", "packed"].includes(o.status)
  ).length;

  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

  const summary = {
    totalRevenue,
    totalOrders: orders.length,
    pendingOrders,
    deliveredOrders,
    totalProducts: productsCount,
  };

  // Genuine recent orders (sorted newest first)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  // Group genuine orders by month for revenue chart
  const monthsMap = new Map<string, { revenue: number; profit: number }>();
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
    const pm = (o.paymentMethod || "").toLowerCase();
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
      totalProducts: productsCount,
      dataSource: isFromSupabase ? "supabase" : "local_fallback",
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
