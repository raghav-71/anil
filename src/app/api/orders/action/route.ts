import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, action, reason } = body;

    if (!orderId || !action) {
      return NextResponse.json({ error: "Order ID and action are required" }, { status: 400 });
    }

    if (action === "cancel") {
      const res = db.cancelOrder(orderId, reason || "Cancelled by client");
      if (!res.success) {
        return NextResponse.json({ error: res.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: res.message });
    }

    if (action === "return") {
      const res = db.requestReturn(orderId, reason || "Customer return request");
      if (!res.success) {
        return NextResponse.json({ error: res.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: res.message });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process order action" }, { status: 500 });
  }
}

