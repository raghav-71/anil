import { NextRequest, NextResponse } from "next/server";
import { deviceAuth } from "@/lib/device-auth";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    const result = deviceAuth.isDeviceAuthorized(token);

    if (!result.authorized) {
      deviceAuth.logAttempt({
        deviceToken: token || "NONE",
        ipAddress: req.ip || "127.0.0.1",
        success: false,
        reason: result.reason,
      });
      return NextResponse.json({ authorized: false, reason: result.reason }, { status: 403 });
    }

    return NextResponse.json({ authorized: true, device: result.device });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    devices: deviceAuth.getTrustedDevices(),
    logs: deviceAuth.getAccessLogs(),
  });
}

