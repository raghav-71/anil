import { NextRequest, NextResponse } from "next/server";
import { AVAILABLE_COUPONS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, cartSubtotal } = body;

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const clean = code.trim().toUpperCase();
    const coupon = AVAILABLE_COUPONS.find((c) => c.code === clean);

    if (!coupon) {
      return NextResponse.json({ valid: false, message: `Promo code '${code}' is invalid or has expired.` }, { status: 400 });
    }

    const subtotal = Number(cartSubtotal) || 0;
    if (subtotal < coupon.minOrderValue) {
      return NextResponse.json(
        {
          valid: false,
          message: `Code '${coupon.code}' requires a minimum bag value of ₹${coupon.minOrderValue.toLocaleString("en-IN")}.`,
        },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      const raw = Math.round((subtotal * coupon.discountValue) / 100);
      discount = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
    } else {
      discount = coupon.discountValue;
    }

    return NextResponse.json({
      valid: true,
      coupon,
      discountAmount: discount,
      message: `Coupon '${coupon.code}' applied! You save ₹${discount.toLocaleString("en-IN")}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to validate coupon" }, { status: 500 });
  }
}

