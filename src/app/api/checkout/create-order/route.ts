import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, customerEmail, shippingAddress, items, paymentMethod } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Pre-flight check stock
    for (const item of items) {
      const v = db.getVariantById(item.variantId);
      if (!v) {
        return NextResponse.json({ error: "Product variant not found" }, { status: 400 });
      }
      if (v.variant.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${v.product.title} (${v.variant.color || ""} ${v.variant.storage || ""}). Only ${v.variant.stockQuantity} available.`,
          },
          { status: 400 }
        );
      }
    }

    if (paymentMethod === "cod") {
      // Process Cash on Delivery immediately
      const result = db.completeOnlineOrder({
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress,
        items,
        paymentMethod: "cod",
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        order: result.order,
      });
    }

    // For Razorpay online payments, calculate grand total and return credentials
    let subtotal = 0;
    for (const item of items) {
      const v = db.getVariantById(item.variantId)!;
      subtotal += v.variant.sellingPrice * item.quantity;
    }
    const settings = db.getShopSettings();
    const shippingFee = subtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingFee;
    const grandTotal = subtotal + shippingFee;

    // Simulated Razorpay Order ID for standard test integration
    const razorpayOrderId = `order_${Math.random().toString(36).substring(2, 12)}`;

    return NextResponse.json({
      success: true,
      requiresPayment: true,
      razorpayOrderId,
      amount: grandTotal * 100, // In Paise
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mobile_store_key",
      customerDetails: { customerName, customerPhone, customerEmail },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to initiate order" }, { status: 500 });
  }
}

