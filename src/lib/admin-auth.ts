import { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "anil_admin_session";
export const ADMIN_SESSION_SECRET = "anil_owner_valid_session";
export const ADMIN_PIN = "admin123";
export const ADMIN_EMAIL = "admin@anilcommunications.com";

/**
 * Verify whether an incoming API or SSR request has valid shop owner admin credentials.
 */
export function verifyAdminSession(req: NextRequest | Request): boolean {
  // 1. Check custom header for programmatic/CLI calls
  const authHeader = req.headers.get("authorization");
  if (authHeader && (authHeader === `Bearer ${ADMIN_SESSION_SECRET}` || authHeader === `Bearer ${ADMIN_PIN}`)) {
    return true;
  }

  const adminKey = req.headers.get("x-admin-key");
  if (adminKey && (adminKey === ADMIN_PIN || adminKey === ADMIN_SESSION_SECRET)) {
    return true;
  }

  // 2. Check cookies
  let cookieHeader: string | null = null;
  if ("cookies" in req && typeof (req as any).cookies?.get === "function") {
    const c = (req as any).cookies.get(ADMIN_SESSION_COOKIE);
    if (c?.value === ADMIN_SESSION_SECRET) return true;
  }

  cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((entry) => {
        const [k, ...v] = entry.split("=");
        return [k, v.join("=")];
      })
    );
    if (cookies[ADMIN_SESSION_COOKIE] === ADMIN_SESSION_SECRET) {
      return true;
    }
  }

  return false;
}
