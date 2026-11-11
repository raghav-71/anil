import { getServiceSupabase } from "@/lib/supabase/client";
import { Order, OrderItem } from "@/types";

/**
 * Persists an order and its items into Supabase PostgreSQL.
 * Safe to call; silently logs errors if Supabase is unreachable so checkout is never blocked.
 */
export async function syncOrderToSupabase(order: Order): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServiceSupabase();

    // 1. Upsert into orders table
    const { error: orderError } = await supabase.from("orders").upsert({
      id: order.id,
      order_number: order.orderNumber,
      customer_name: order.customerName,
      customer_email: order.customerEmail || null,
      customer_phone: order.customerPhone,
      shipping_address: order.shippingAddress,
      fulfillment_type: order.fulfillmentType || "delivery",
      subtotal: order.subtotal,
      tax_amount: order.taxAmount || 0,
      cgst_amount: Math.round(((order.taxAmount || 0) / 2) * 100) / 100,
      sgst_amount: Math.round(((order.taxAmount || 0) / 2) * 100) / 100,
      igst_amount: 0,
      shipping_fee: order.shippingFee || 0,
      discount_amount: order.discountAmount || 0,
      grand_total: order.grandTotal,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      status: order.status,
      tracking_number: order.trackingNumber || null,
      notes: order.notes || null,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
    });

    if (orderError) {
      console.error("[Supabase Orders] Failed to upsert order:", orderError.message);
      return { success: false, error: orderError.message };
    }

    // 2. Insert order items
    if (order.items && order.items.length > 0) {
      const itemsPayload = order.items.map((item) => ({
        order_id: order.id,
        variant_id: item.variantId,
        product_title: item.productName,
        product_name: item.productName,
        variant_name: item.variantDetails || "",
        variant_details: item.variantDetails || "",
        sku: item.sku || "SKU-ITEM",
        quantity: item.quantity,
        unit_price: item.unitPrice,
        tax_rate: item.taxRate || 18,
        tax_amount: item.taxAmount || 0,
        total_price: item.totalPrice,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsPayload);

      if (itemsError) {
        console.error("[Supabase Orders] Order items insert error:", itemsError.message);
      }
    }

    // 3. Update stock in product_variants and record inventory movements
    for (const item of order.items) {
      try {
        const { data: variant } = await supabase
          .from("product_variants")
          .select("stock_quantity")
          .eq("id", item.variantId)
          .single();

        if (variant) {
          const newStock = Math.max(0, (variant.stock_quantity || 0) - item.quantity);
          await supabase
            .from("product_variants")
            .update({ stock_quantity: newStock })
            .eq("id", item.variantId);

          await supabase.from("inventory_movements").insert({
            variant_id: item.variantId,
            movement_type: "sale",
            quantity: -item.quantity,
            reason: `Order #${order.orderNumber}`,
            reference_id: order.id,
            previous_stock: variant.stock_quantity,
            new_stock: newStock,
          });
        }
      } catch (stockErr) {
        console.warn("[Supabase Stock] Stock deduction warning:", stockErr);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Supabase Orders] Unexpected error syncing order:", err?.message || err);
    return { success: false, error: err?.message };
  }
}

/**
 * Updates an order status or tracking details in Supabase PostgreSQL.
 */
export async function syncOrderStatusToSupabase(
  orderId: string,
  updates: {
    status?: string;
    trackingNumber?: string;
    paymentStatus?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServiceSupabase();
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.status) payload.status = updates.status;
    if (updates.trackingNumber !== undefined) payload.tracking_number = updates.trackingNumber;
    if (updates.paymentStatus) payload.payment_status = updates.paymentStatus;

    const { error } = await supabase
      .from("orders")
      .update(payload)
      .or(`id.eq.${orderId},order_number.eq.${orderId}`);

    if (error) {
      console.error("[Supabase Orders] Failed to update order:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Supabase Orders] Unexpected error updating order status:", err);
    return { success: false, error: err?.message };
  }
}
