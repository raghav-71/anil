import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  ADMIN_SESSION_COOKIE,
  getAdminEmail,
  getAdminPin,
  createAdminToken,
  getAuthenticatedAdmin,
  verifyAdminFromDatabase,
  checkLoginRateLimit,
  recordFailedLogin,
  clearLoginRateLimit,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

/**
 * POST /api/admin/auth
 * Authenticates store owner via Supabase Auth or secure server-side owner credentials.
 * Enforces brute-force protection, database-backed role verification, and issues an HTTP-only signed session cookie.
 */
export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const { email, password, pin, otp } = body || {};

    const providedEmail = typeof email === "string" ? email.trim() : "";
    const providedPass =
      typeof password === "string"
        ? password.trim()
        : typeof pin === "string"
        ? pin.trim()
        : "";

    const rateKey = `${clientIp}_${providedEmail || "unknown"}`;

    // 1. Check Brute-Force Rate Limiting
    const rateCheck = checkLoginRateLimit(rateKey);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Terminal locked for security. Please try again in ${rateCheck.retryAfterSeconds} seconds.`,
          retryAfter: rateCheck.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.retryAfterSeconds || 900),
          },
        }
      );
    }

    if (!providedPass && !pin) {
      return NextResponse.json(
        { error: "Password or security PIN is required." },
        { status: 400 }
      );
    }

    let authSuccess = false;
    let adminPayload = {
      userId: "usr-owner-primary",
      email: getAdminEmail(),
      name: "Shop Owner",
      role: "owner" as const,
      authSource: "env_admin" as "supabase" | "env_admin",
      mfaVerified: false,
    };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasSupabaseConfig =
      Boolean(supabaseUrl) &&
      Boolean(supabaseAnonKey) &&
      !supabaseUrl?.includes("placeholder");

    // 2. ATTEMPT SUPABASE AUTH VERIFICATION (If email provided and Supabase is configured)
    if (providedEmail && hasSupabaseConfig) {
      try {
        const authClient = createClient(supabaseUrl!, supabaseAnonKey!, {
          auth: { persistSession: false },
        });

        const { data: authData, error: authErr } = await authClient.auth.signInWithPassword({
          email: providedEmail,
          password: providedPass,
        });

        if (!authErr && authData?.user) {
          const user = authData.user;
          // Verify admin permission against trusted database record
          const dbCheck = await verifyAdminFromDatabase(user.email || providedEmail, user.id);

          const isConfiguredOwner =
            user.email?.toLowerCase() === getAdminEmail().toLowerCase();

          if (dbCheck?.isAdmin || isConfiguredOwner) {
            authSuccess = true;
            adminPayload = {
              userId: user.id,
              email: user.email || providedEmail,
              name: dbCheck?.name || user.user_metadata?.full_name || "Shop Owner",
              role: "owner",
              authSource: "supabase",
              mfaVerified: Boolean(otp),
            };
            console.log(
              `[AdminAuth] Verified Supabase admin login for: ${providedEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3")}`
            );
          } else {
            console.warn(
              `[AdminAuth] Access denied for non-admin user: ${providedEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3")}`
            );
            recordFailedLogin(rateKey);
            return NextResponse.json(
              { error: "Access denied. This account does not possess store administration privileges." },
              { status: 403 }
            );
          }
        }
      } catch (sbErr: any) {
        console.warn("[AdminAuth] Supabase auth check error:", sbErr.message);
      }
    }

    // 3. SERVER-SIDE OWNER CREDENTIAL VERIFICATION (Configured strictly via environment variables)
    if (!authSuccess) {
      const configuredEmail = getAdminEmail().toLowerCase();
      const configuredPin = getAdminPin();

      // Only allow if configuredPin is non-empty (never allow empty string or default)
      if (configuredPin && configuredPin.length >= 6) {
        const emailMatches =
          !providedEmail ||
          providedEmail.toLowerCase() === configuredEmail ||
          providedEmail.toLowerCase() === "admin";

        const passMatches = providedPass === configuredPin;

        if (emailMatches && passMatches) {
          authSuccess = true;
          adminPayload = {
            userId: "usr-owner-primary",
            email: configuredEmail,
            name: "Shop Owner",
            role: "owner",
            authSource: "env_admin",
            mfaVerified: Boolean(otp),
          };
          console.log("[AdminAuth] Verified server-side owner credentials via environment passkey");
        }
      }
    }

    // 4. HANDLE AUTHENTICATION FAILURE
    if (!authSuccess) {
      const failRecord = recordFailedLogin(rateKey);
      if (failRecord.blocked) {
        return NextResponse.json(
          {
            error: `Too many failed attempts. Account locked for ${failRecord.retryAfterSeconds} seconds.`,
            retryAfter: failRecord.retryAfterSeconds,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(failRecord.retryAfterSeconds || 900),
            },
          }
        );
      }

      return NextResponse.json(
        { error: "Invalid admin credentials. Please provide valid owner email & password." },
        { status: 401 }
      );
    }

    // 5. SUCCESS: Clear rate-limit history
    clearLoginRateLimit(rateKey);

    // 6. Generate cryptographically signed HMAC-SHA256 session token
    const token = createAdminToken(adminPayload, 7);

    const response = NextResponse.json({
      success: true,
      message: "Owner authenticated successfully",
      user: {
        id: adminPayload.userId,
        name: adminPayload.name,
        email: adminPayload.email,
        role: "owner",
      },
    });

    // 7. Attach Secure, HttpOnly, SameSite=Lax Session Cookie
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error("[AdminAuth] Unexpected login error:", err.message || "Unknown");
    return NextResponse.json(
      { error: "Authentication service encountered an unexpected error." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/auth
 * Verifies active admin session server-side.
 */
export async function GET(req: NextRequest) {
  try {
    const adminUser = await getAuthenticatedAdmin(req);

    if (adminUser) {
      return NextResponse.json(
        {
          authenticated: true,
          user: {
            id: adminUser.userId,
            name: adminUser.name,
            email: adminUser.email,
            role: "owner",
          },
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    return NextResponse.json(
      { authenticated: false, error: "Session expired or invalid" },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("[AdminAuth] Session verification error:", err.message || "Unknown");
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

/**
 * DELETE /api/admin/auth
 * Logs out admin by revoking the session cookie.
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
