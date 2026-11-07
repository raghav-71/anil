import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { deviceAuth } from "@/lib/device-auth";

export async function GET(req: NextRequest) {
  // Device verification for private invoice audit
  const deviceToken =
    req.headers.get("x-device-token") ||
    req.cookies.get("anil_trusted_device_token")?.value;

  const deviceCheck = deviceAuth.isDeviceAuthorized(deviceToken);
  if (!deviceCheck.authorized) {
    return NextResponse.json(
      { error: `Invoice Access Denied: ${deviceCheck.reason}` },
      { status: 403 }
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

