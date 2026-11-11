import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { getServiceSupabase } from "@/lib/supabase/client";

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

    // 1. Live Query from Supabase PostgreSQL
    try {
      const supabase = getServiceSupabase();
      let query = supabase.from("orders").select("*, items:order_items(*)");

      if (cleanOrderNumber) {
        query = query.or(`order_number.ilike.%${cleanOrderNumber}%,id.ilike.%${cleanOrderNumber}%`);
      } else if (cleanPhone && cleanEmail) {
        query = query.or(`customer_phone.ilike.%${cleanPhone}%,customer_email.ilike.${cleanEmail}`);
      } else if (cleanPhone) {
        query = query.ilike("customer_phone", `%${cleanPhone}%`);
      } else if (cleanEmail) {
        query = query.ilike("customer_email", cleanEmail);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        const formatted = data.map((o: any) => ({
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
            variantDetails: it.variant_name || it.variant_details || "",
            quantity: it.quantity,
            unitPrice: Number(it.unit_price || it.price || 0),
            taxRate: Number(it.tax_rate || 18),
            taxAmount: Number(it.tax_amount || 0),
            totalPrice: Number(it.total_price || it.total || 0),
          })),
        }));
        return NextResponse.json({ success: true, orders: formatted });
      }
    } catch (supaErr) {
      console.warn("[Orders User API] Supabase query fallback triggered:", supaErr);
    }

    // 2. Fallback to Local Store
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
