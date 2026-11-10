import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { verifyAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: "Unauthorized. Admin credentials required." }, { status: 401 });
  }

  try {
    const orders = db.getOrders();
    return NextResponse.json(
      { success: true, orders },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: "Unauthorized. Admin credentials required." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { orderId, status, trackingNumber, paymentStatus, paymentSettledRef } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = db.getOrderByIdOrNumber(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (status) {
      db.updateOrderStatus(orderId, status, trackingNumber);
    }

    if (paymentStatus === "paid") {
      db.markOrderPaymentPaid(orderId, paymentSettledRef || "Collected by Shop Admin");
    } else if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      order.updatedAt = new Date().toISOString();
      db.saveOrdersToDisk();
    }

    return NextResponse.json(
      { success: true, message: `Order #${order.orderNumber} updated successfully`, order },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update order" }, { status: 500 });
  }
}
