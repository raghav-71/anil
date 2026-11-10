import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_SECRET,
  ADMIN_EMAIL,
  ADMIN_PIN,
  verifyAdminSession,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, pin } = body;

    const emailMatch = !email || email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const passMatch = (password && password.trim() === ADMIN_PIN) || (pin && pin.trim() === ADMIN_PIN);

    if (emailMatch && passMatch) {
      const response = NextResponse.json({
        success: true,
        user: {
          id: "usr-admin-1",
          name: "Shop Owner",
          email: ADMIN_EMAIL,
          role: "super_admin",
        },
      });

      // Set HTTP-only admin session cookie
      response.cookies.set({
        name: ADMIN_SESSION_COOKIE,
        value: ADMIN_SESSION_SECRET,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { error: "Invalid admin credentials. Please provide valid owner email & PIN." },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Auth error" }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const isAuth = verifyAdminSession(req);
  if (isAuth) {
    return NextResponse.json({
      authenticated: true,
      user: {
        id: "usr-admin-1",
        name: "Shop Owner",
        email: ADMIN_EMAIL,
        role: "super_admin",
      },
    });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
