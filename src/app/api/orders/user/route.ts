import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const email = searchParams.get("email");
    const orderNumber = searchParams.get("orderNumber") || searchParams.get("orderId");

    // Strictly enforce customer identifier: never expose other customers' private data
    if (!phone && !email && !orderNumber) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const cleanPhone = phone ? phone.replace(/\D/g, "") : "";
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const cleanOrderNumber = orderNumber ? orderNumber.trim().toLowerCase() : "";

    const allOrders = db.getOrders();
    const filtered = allOrders.filter((o) => {
      // 1. Direct Order Number lookup
      if (cleanOrderNumber) {
        const matchesNumber =
          o.orderNumber.toLowerCase() === cleanOrderNumber ||
          o.id.toLowerCase() === cleanOrderNumber;

        // If phone or email is also passed, verify ownership
        if (matchesNumber) {
          if (cleanPhone && cleanPhone.length >= 10 && !o.customerPhone.includes(cleanPhone)) {
            return false;
          }
          if (cleanEmail && o.customerEmail.toLowerCase() !== cleanEmail) {
            return false;
          }
          return true;
        }
      }

      // 2. Customer Phone & Email lookup
      const matchPhone =
        cleanPhone && cleanPhone.length >= 10 && o.customerPhone.includes(cleanPhone);
      const matchEmail =
        cleanEmail && o.customerEmail.toLowerCase() === cleanEmail;

      return Boolean(matchPhone || matchEmail);
    });

    return NextResponse.json({ success: true, orders: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch orders" }, { status: 500 });
  }
}
