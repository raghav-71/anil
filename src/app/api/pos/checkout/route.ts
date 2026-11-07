import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { deviceAuth } from "@/lib/device-auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Strict Server-Side Device Verification
    const deviceToken =
      req.headers.get("x-device-token") ||
      req.cookies.get("anil_trusted_device_token")?.value;

    const deviceCheck = deviceAuth.isDeviceAuthorized(deviceToken);
    if (!deviceCheck.authorized) {
      deviceAuth.logAttempt({
        deviceToken: deviceToken || "NONE",
        ipAddress: req.ip || "127.0.0.1",
        success: false,
        reason: "Unauthorized device attempted POS checkout",
      });
      return NextResponse.json(
        { error: `POS Terminal Access Denied: ${deviceCheck.reason}` },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      items,
      customerName,
      customerPhone,
      customerGstin,
      paymentMethod,
      amountReceived,
      cashierName,
      isInterstate,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const result = db.completePosSale({
      items,
      customerName: customerName || "Walk-in Customer",
      customerPhone: customerPhone || "N/A",
      customerGstin,
      paymentMethod: paymentMethod || "cash",
      amountReceived: Number(amountReceived) || 0,
      cashierName: cashierName || "Anil Kumar (Admin)",
      isInterstate: Boolean(isInterstate),
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      invoice: result.invoice,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process POS checkout" }, { status: 500 });
  }
}
