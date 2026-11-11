import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { deviceAuth } from "@/lib/device-auth";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const isAdmin = verifyAdminSession(req);

  // Fallback to device verification for private invoice audit
  const deviceToken =
    req.headers.get("x-device-token") ||
    req.cookies.get("anil_trusted_device_token")?.value;

  const deviceCheck = deviceToken ? deviceAuth.isDeviceAuthorized(deviceToken) : { authorized: false, reason: "No device token" };

  if (!isAdmin && !deviceCheck.authorized) {
    return NextResponse.json(
      { error: "Invoice Access Denied: Unauthorized admin session or trusted device required." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase();

  let invoices = db.getInvoices();

  if (q) {
    invoices = invoices.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.customerPhone.includes(q) ||
        (inv.customerGstin && inv.customerGstin.toLowerCase().includes(q))
    );
  }

  return NextResponse.json({ invoices });
}

