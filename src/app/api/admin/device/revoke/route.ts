import { NextRequest, NextResponse } from "next/server";
import { deviceAuth } from "@/lib/device-auth";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { deviceId } = await req.json();
    if (!deviceId) return NextResponse.json({ error: "Device ID required" }, { status: 400 });

    const ok = deviceAuth.revokeDevice(deviceId);
    if (!ok) return NextResponse.json({ error: "Device not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Device revoked successfully." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

