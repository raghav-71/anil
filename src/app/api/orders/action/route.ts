import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { dispatchWhatsAppNotification } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, action, reason } = body;

    if (!orderId || !action) {
      return NextResponse.json({ error: "Order ID and action are required" }, { status: 400 });
    }

    const order = db.getOrders().find((o) => o.id === orderId || o.orderNumber === orderId);

    if (action === "cancel") {
      const res = db.cancelOrder(orderId, reason || "Cancelled by client");
      if (!res.success) {
        return NextResponse.json({ error: res.message }, { status: 400 });
      }

      // Dispatch owner notification
      dispatchWhatsAppNotification({
        eventType: "cancellation_requested",
        dedupKey: `cancel_${order?.orderNumber || orderId}`,
        title: "Order Cancellation Requested",
        details: {
          orderNumber: order?.orderNumber || orderId,
          customer: order?.customerName || "Customer",
          phone: order?.customerPhone || "N/A",
          reason: reason || "Customer requested cancellation",
          orderTotal: order ? `₹${order.grandTotal.toLocaleString("en-IN")}` : "N/A",
        },
      }).catch((e) => console.error("WhatsApp cancel notification failed:", e));

      return NextResponse.json({ success: true, message: res.message });
    }

    if (action === "return") {
      const res = db.requestReturn(orderId, reason || "Customer return request");
      if (!res.success) {
        return NextResponse.json({ error: res.message }, { status: 400 });
      }

      // Dispatch owner notification
      dispatchWhatsAppNotification({
        eventType: "return_requested",
        dedupKey: `return_${order?.orderNumber || orderId}`,
        title: "Return / Replacement Requested",
        details: {
          orderNumber: order?.orderNumber || orderId,
          customer: order?.customerName || "Customer",
          phone: order?.customerPhone || "N/A",
          reason: reason || "Return / replacement requested",
          orderTotal: order ? `₹${order.grandTotal.toLocaleString("en-IN")}` : "N/A",
        },
      }).catch((e) => console.error("WhatsApp return notification failed:", e));

      return NextResponse.json({ success: true, message: res.message });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process order action" }, { status: 500 });
  }
}

