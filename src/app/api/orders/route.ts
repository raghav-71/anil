import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { verifyAdminSession } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: "Unauthorized. Admin credentials required." }, { status: 401 });
  }

  try {
    let orders: any[] = [];
    try {
      const supabase = getServiceSupabase();
      const { data: dbOrders, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .order("created_at", { ascending: false });

      if (!error && dbOrders && dbOrders.length > 0) {
        orders = dbOrders.map((o: any) => ({
          id: o.id,
          orderNumber: o.order_number,
          userId: o.user_id,
          customerName: o.customer_name,
          customerEmail: o.customer_email,
          customerPhone: o.customer_phone,
          shippingAddress: o.shipping_address,
          items: (o.items || []).map((i: any) => ({
            id: i.id,
            productId: i.product_id,
            variantId: i.variant_id,
            productTitle: i.product_title,
            title: i.product_title,
            variantName: i.variant_name,
            sku: i.sku,
            quantity: i.quantity,
            unitPrice: Number(i.unit_price) || 0,
            price: Number(i.unit_price) || 0,
            totalPrice: Number(i.total_price) || 0,
          })),
          subtotal: Number(o.subtotal) || 0,
          shippingFee: Number(o.shipping_fee) || 0,
          discountAmount: Number(o.discount_amount) || 0,
          grandTotal: Number(o.grand_total) || 0,
          paymentMethod: o.payment_method,
          paymentStatus: o.payment_status,
          status: o.status,
          trackingNumber: o.tracking_number,
          createdAt: o.created_at,
          updatedAt: o.updated_at,
        }));
      } else {
        orders = db.getOrders();
      }
    } catch {
      orders = db.getOrders();
    }

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

    // Sync to Supabase PostgreSQL
    try {
      const supabase = getServiceSupabase();
      const sbUpdate: any = {};
      if (status) sbUpdate.status = status;
      if (trackingNumber) sbUpdate.tracking_number = trackingNumber;
      if (paymentStatus) sbUpdate.payment_status = paymentStatus;
      sbUpdate.updated_at = new Date().toISOString();
      await supabase.from("orders").update(sbUpdate).or(`id.eq.${orderId},order_number.eq.${orderId}`);
    } catch (sbErr) {
      console.warn("[Orders] Supabase update warning:", sbErr);
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
