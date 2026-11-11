import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { dispatchWhatsAppNotification } from "@/lib/whatsapp";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, action, reason, customerPhone, customerEmail } = body;

    if (!orderId || !action) {
      return NextResponse.json({ error: "Order ID and action are required" }, { status: 400 });
    }

    const order = db.getOrders().find((o) => o.id === orderId || o.orderNumber === orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Authorization verification: must be admin OR verified customer of this order
    const isAdmin = verifyAdminSession(req);
    if (!isAdmin) {
      const cleanReqPhone = customerPhone ? String(customerPhone).replace(/\D/g, "") : "";
      const cleanOrderPhone = order.customerPhone ? String(order.customerPhone).replace(/\D/g, "") : "";
      const matchesPhone =
        cleanReqPhone.length >= 10 &&
        cleanOrderPhone.length >= 10 &&
        (cleanOrderPhone.includes(cleanReqPhone) || cleanReqPhone.includes(cleanOrderPhone));

      const cleanReqEmail = customerEmail ? String(customerEmail).trim().toLowerCase() : "";
      const cleanOrderEmail = order.customerEmail ? String(order.customerEmail).trim().toLowerCase() : "";
      const matchesEmail = cleanReqEmail && cleanOrderEmail && cleanReqEmail === cleanOrderEmail;

      if (!matchesPhone && !matchesEmail) {
        return NextResponse.json(
          { error: "Unauthorized: You do not have permission to modify this consignment." },
          { status: 403 }
        );
      }
    }

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

