import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const email = searchParams.get("email");

    const allOrders = db.getOrders();

    if (!phone && !email) {
      // Return top recent customer orders
      return NextResponse.json({ success: true, orders: allOrders.slice(0, 10) });
    }

    const filtered = allOrders.filter(
      (o) =>
        (phone && o.customerPhone.includes(phone.replace(/\D/g, ""))) ||
        (email && o.customerEmail.toLowerCase() === email.toLowerCase())
    );

    return NextResponse.json({ success: true, orders: filtered.length > 0 ? filtered : allOrders.slice(0, 5) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch orders" }, { status: 500 });
  }
}

