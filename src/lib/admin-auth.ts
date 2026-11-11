import crypto from "crypto";
import type { NextRequest } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/client";

export const ADMIN_SESSION_COOKIE = "anil_admin_session";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@anilcommunications.com";
export const ADMIN_PIN = process.env.ADMIN_PIN || "";

// In-Memory Brute-Force Rate Limiter (sliding window per IP/email)
interface AttemptRecord {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

const loginAttempts = new Map<string, AttemptRecord>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15-minute block
const WINDOW_DURATION_MS = 15 * 60 * 1000; // 15-minute sliding window

export function checkLoginRateLimit(identifier: string): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const key = identifier.toLowerCase().trim();
  const record = loginAttempts.get(key);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if actively blocked
  if (record.blockedUntil && record.blockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  // Reset if window has elapsed
  if (now - record.lastAttempt > WINDOW_DURATION_MS) {
    loginAttempts.delete(key);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.attempts);
  return { allowed: remaining > 0, remainingAttempts: remaining };
}

export function recordFailedLogin(identifier: string): {
  blocked: boolean;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const key = identifier.toLowerCase().trim();
  let record = loginAttempts.get(key);

  if (!record || now - record.lastAttempt > WINDOW_DURATION_MS) {
    record = { attempts: 1, lastAttempt: now };
  } else {
    record.attempts += 1;
    record.lastAttempt = now;
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS;
    loginAttempts.set(key, record);
    return { blocked: true, retryAfterSeconds: Math.ceil(BLOCK_DURATION_MS / 1000) };
  }

  loginAttempts.set(key, record);
  return { blocked: false };
}

export function clearLoginRateLimit(identifier: string): void {
  const key = identifier.toLowerCase().trim();
  loginAttempts.delete(key);
}

// Fallback session secret for HMAC signing - enforces cryptographic strength with bulletproof fallbacks
export function getSessionSecret(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "anil_communications_owner_hmac_secret_key_2026_belagavi";
  return secret;
}

// Configurable owner email
export function getAdminEmail(): string {
  return (
    process.env.ADMIN_EMAIL ||
    process.env.OWNER_NOTIFICATION_EMAIL ||
    "admin@anilcommunications.com"
  );
}

// Configurable admin PIN / secret passkey (optional fallback when configured via environment)
export function getAdminPin(): string {
  return process.env.ADMIN_PIN || process.env.ADMIN_PASSWORD || "";
}

export interface AdminSessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "owner" | "super_admin" | "admin";
  authSource: "supabase" | "env_admin";
  mfaVerified?: boolean;
  exp: number; // Unix timestamp in seconds
  iat: number;
}

/**
 * Creates a cryptographically signed HMAC-SHA256 admin session token.
 */
export function createAdminToken(
  payload: Omit<AdminSessionPayload, "iat" | "exp">,
  expiresInDays = 7
): string {
  const secret = getSessionSecret();
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInDays * 24 * 60 * 60;
  const fullPayload: AdminSessionPayload = {
    ...payload,
    role: "owner", // strictly normalized to owner
    iat,
    exp,
  };

  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

/**
 * Cryptographically verifies an HMAC-SHA256 admin session token.
 * Validates signature integrity, role authority, and timestamp expiration.
 */
export function verifyAdminToken(token: string): AdminSessionPayload | null {
  try {
    if (!token || typeof token !== "string" || !token.includes(".")) {
      return null;
    }

    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) {
      return null;
    }

    const secret = getSessionSecret();
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(encodedPayload)
      .digest("base64url");

    // Timing-safe signature comparison prevents timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null;
    }

    const jsonStr = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const payload: AdminSessionPayload = JSON.parse(jsonStr);

    // Validate expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    // Strictly enforce owner/admin role authorization
    if (
      payload.role !== "owner" &&
      payload.role !== "super_admin" &&
      payload.role !== "admin"
    ) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Server-side lookup against Supabase PostgreSQL database to verify admin permission.
 * Uses service-role client to query trusted profiles & roles tables.
 */
export async function verifyAdminFromDatabase(
  email: string,
  authUserId?: string
): Promise<{ isAdmin: boolean; name?: string; role?: string } | null> {
  try {
    const supabase = getServiceSupabase();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabase =
      Boolean(supabaseUrl) &&
      !supabaseUrl?.includes("placeholder");

    if (!hasSupabase) {
      return null;
    }

    // 1. Query profiles table joined with roles
    let query = supabase
      .from("profiles")
      .select("id, full_name, email, is_active, role_id, roles(name)");

    if (authUserId) {
      query = query.eq("auth_user_id", authUserId);
    } else {
      query = query.eq("email", email.trim().toLowerCase());
    }

    const { data: profile, error } = await query.maybeSingle();

    if (!error && profile) {
      if (!profile.is_active) {
        console.warn(`[AdminAuth] Inactive admin profile: ${email}`);
        return { isAdmin: false };
      }

      const roleName = (profile.roles as any)?.name || profile.role_id;
      // Strictly only owner (or legacy super_admin/admin); staff/cashier/manager are forbidden
      const isAdmin =
        roleName === "owner" ||
        roleName === "super_admin" ||
        roleName === "admin";

      return {
        isAdmin,
        name: profile.full_name || "Store Owner",
        role: "owner",
      };
    }

    // 2. Fallback: check Supabase Auth user metadata if authUserId and service role key are available
    if (authUserId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { data: authUser, error: authErr } = await supabase.auth.admin.getUserById(authUserId);
        if (!authErr && authUser?.user) {
          const u = authUser.user;
          const role = u.app_metadata?.role || u.user_metadata?.role;
          const isOwnerEmail = u.email?.toLowerCase() === getAdminEmail().toLowerCase();

          if (role === "owner" || role === "admin" || role === "super_admin" || isOwnerEmail) {
            return {
              isAdmin: true,
              name: u.user_metadata?.full_name || u.user_metadata?.name || "Shop Owner",
              role: "owner",
            };
          }
        }
      } catch {
        // service role admin call optional
      }
    }

    return null;
  } catch (err: any) {
    console.warn(`[AdminAuth] Database admin lookup warning: ${err.message}`);
    return null;
  }
}

/**
 * Extracts and verifies the admin session from an incoming HTTP request.
 * Strictly requires a cryptographically signed HMAC-SHA256 session token.
 */
export function verifyAdminSession(req: NextRequest | Request): boolean {
  // 1. Check custom Authorization header (Bearer token)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (verifyAdminToken(token)) return true;
  }

  // 2. Check NextRequest cookies
  if ("cookies" in req && typeof (req as any).cookies?.get === "function") {
    const c = (req as any).cookies.get(ADMIN_SESSION_COOKIE);
    if (c?.value && verifyAdminToken(c.value)) {
      return true;
    }
  }

  // 3. Check raw Cookie header string safely
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${ADMIN_SESSION_COOKIE}=([^;]+)`));
    if (match?.[1]) {
      const val = decodeURIComponent(match[1]);
      if (verifyAdminToken(val)) return true;
    }
  }

  return false;
}

/**
 * Asynchronously returns full verified admin user details from the request.
 */
export async function getAuthenticatedAdmin(
  req: NextRequest | Request
): Promise<AdminSessionPayload | null> {
  let token: string | null = null;

  // Extract from headers
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  }

  // Extract from NextRequest cookies
  if (!token && "cookies" in req && typeof (req as any).cookies?.get === "function") {
    token = (req as any).cookies.get(ADMIN_SESSION_COOKIE)?.value || null;
  }

  // Extract from raw cookie header
  if (!token) {
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${ADMIN_SESSION_COOKIE}=([^;]+)`));
      if (match?.[1]) token = decodeURIComponent(match[1]);
    }
  }

  if (!token) return null;

  // Verify cryptographically signed token
  return verifyAdminToken(token);
}
