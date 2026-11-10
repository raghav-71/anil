import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const email = searchParams.get("email");

    // Strictly enforce customer identifier: never expose other customers' private data
    if (!phone && !email) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const cleanPhone = phone ? phone.replace(/\D/g, "") : "";
    const cleanEmail = email ? email.trim().toLowerCase() : "";

    // Require at least a 10-digit phone or valid email format to prevent brute-force guessing
    if (cleanPhone && cleanPhone.length < 10 && !cleanEmail) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const allOrders = db.getOrders();
    const filtered = allOrders.filter((o) => {
      const matchPhone = cleanPhone && cleanPhone.length >= 10 && o.customerPhone.includes(cleanPhone);
      const matchEmail = cleanEmail && o.customerEmail.toLowerCase() === cleanEmail;
      return Boolean(matchPhone || matchEmail);
    });

    return NextResponse.json({ success: true, orders: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch orders" }, { status: 500 });
  }
}

