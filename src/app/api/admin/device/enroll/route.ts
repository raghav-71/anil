import { NextRequest, NextResponse } from "next/server";
import { deviceAuth } from "@/lib/device-auth";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { masterPasskey, deviceName, enrolledBy } = await req.json();

    const result = deviceAuth.enrollDevice({
      masterPasskey,
      deviceName: deviceName || "Shop Primary Computer",
      enrolledBy: enrolledBy || "Shop Owner",
      ipAddress: req.ip || "127.0.0.1",
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      token: result.token,
      device: result.device,
    });

    // Set secure cookie as well
    response.cookies.set("anil_trusted_device_token", result.token!, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

