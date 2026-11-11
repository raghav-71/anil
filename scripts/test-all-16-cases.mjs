/**
 * COMPREHENSIVE 16-POINT OWNER-ONLY ADMIN SYSTEM TEST SUITE
 * Anil Communication & Zerox
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import http from "http";

// Parse .env.local
const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = match[2] || "";
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[match[1]] = val.trim();
  }
}

const BASE_URL = "http://127.0.0.1:3000";
const OWNER_EMAIL = env.ADMIN_EMAIL || "admin@anilcommunications.com";
const OWNER_PIN = env.ADMIN_PIN || "AnilOwner@2026!Sec";

const results = [];

function record(id, title, passed, details = "") {
  results.push({ id, title, passed, details });
  const status = passed ? "✅ PASS" : "❌ FAIL";
  console.log(`[${status}] Case ${id}: ${title}`);
  if (details) console.log(`       └─ ${details}`);
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { ...(options.headers || {}) };
  if (options.body && typeof options.body === "object" && !(options.body instanceof String)) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    data = await res.text();
  }

  return {
    status: res.status,
    headers: res.headers,
    cookies: res.headers.get("set-cookie"),
    data,
  };
}

async function runTests() {
  console.log("=================================================================");
  console.log("   ANIL COMMUNICATIONS: OWNER-ONLY SECURITY & ACCESS TEST SUITE  ");
  console.log("=================================================================\n");

  let adminSessionCookie = "";

  // TEST 1: Public Storefront is Accessible & Products Load
  try {
    const res = await request("/api/products");
    const count = res.data?.products?.length || 0;
    record(1, "Public storefront products accessible", res.status === 200 && count > 0, `Returned ${count} catalog products`);
  } catch (err) {
    record(1, "Public storefront products accessible", false, err.message);
  }

  // TEST 2: Unauthenticated Request to /api/orders Rejected
  try {
    const res = await request("/api/orders");
    record(2, "Unauthenticated GET /api/orders rejected (401)", res.status === 401, `Status: ${res.status}`);
  } catch (err) {
    record(2, "Unauthenticated GET /api/orders rejected", false, err.message);
  }

  // TEST 3: Unauthenticated Request to /api/inventory Rejected
  try {
    const res = await request("/api/inventory");
    record(3, "Unauthenticated GET /api/inventory rejected (401)", res.status === 401, `Status: ${res.status}`);
  } catch (err) {
    record(3, "Unauthenticated GET /api/inventory rejected", false, err.message);
  }

  // TEST 4: Unauthenticated Request to /api/invoices Rejected
  try {
    const res = await request("/api/invoices");
    record(4, "Unauthenticated GET /api/invoices rejected (401/403)", res.status === 401 || res.status === 403, `Status: ${res.status}`);
  } catch (err) {
    record(4, "Unauthenticated GET /api/invoices rejected", false, err.message);
  }

  // TEST 5: Unauthenticated Request to /api/admin/settings Rejected
  try {
    const res = await request("/api/admin/settings");
    record(5, "Unauthenticated GET /api/admin/settings rejected (401)", res.status === 401, `Status: ${res.status}`);
  } catch (err) {
    record(5, "Unauthenticated GET /api/admin/settings rejected", false, err.message);
  }

  // TEST 6: Unauthenticated Request to /api/admin/whatsapp Rejected
  try {
    const res = await request("/api/admin/whatsapp");
    record(6, "Unauthenticated GET /api/admin/whatsapp rejected (401)", res.status === 401, `Status: ${res.status}`);
  } catch (err) {
    record(6, "Unauthenticated GET /api/admin/whatsapp rejected", false, err.message);
  }

  // TEST 7: Unauthenticated Request to /api/admin/device/verify GET Rejected
  try {
    const res = await request("/api/admin/device/verify");
    record(7, "Unauthenticated GET /api/admin/device/verify rejected (401)", res.status === 401, `Status: ${res.status}`);
  } catch (err) {
    record(7, "Unauthenticated GET /api/admin/device/verify rejected", false, err.message);
  }

  // TEST 8: Unauthenticated Product Creation Rejected
  try {
    const res = await request("/api/products", {
      method: "POST",
      body: { title: "Malicious Fake Product", basePrice: 100 },
    });
    record(8, "Unauthenticated POST /api/products rejected (401)", res.status === 401, `Status: ${res.status}`);
  } catch (err) {
    record(8, "Unauthenticated POST /api/products rejected", false, err.message);
  }

  // TEST 9: Forged / Fake Session Cookie Rejected
  try {
    const fakeToken = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoib3duZXIifQ.fake_signature";
    const res = await request("/api/admin/dashboard", {
      headers: { Cookie: `anil_admin_session=${fakeToken}` },
    });
    record(9, "Forged HMAC session cookie rejected (401)", res.status === 401, `Status: ${res.status}`);
  } catch (err) {
    record(9, "Forged HMAC session cookie rejected", false, err.message);
  }

  // TEST 10: Legacy PIN 'admin123' Rejected (Removed default credentials)
  try {
    const res = await request("/api/admin/auth", {
      method: "POST",
      body: { email: OWNER_EMAIL, password: "admin123" },
    });
    record(10, "Legacy default password 'admin123' strictly rejected", res.status === 401 || res.data?.success === false, `Result: ${res.data?.error || "Rejected"}`);
  } catch (err) {
    record(10, "Legacy default password rejected", false, err.message);
  }

  // TEST 11: Owner Authentication with Valid Credentials
  try {
    const res = await request("/api/admin/auth", {
      method: "POST",
      body: { email: OWNER_EMAIL, password: OWNER_PIN },
    });

    const setCookie = res.cookies || "";
    const match = setCookie.match(/anil_admin_session=([^;]+)/);
    if (match) {
      adminSessionCookie = `anil_admin_session=${match[1]}`;
    }

    record(11, "Owner authentication succeeds with secure credentials", res.status === 200 && res.data?.success === true && Boolean(adminSessionCookie), `Assigned role: ${res.data?.user?.role}, Cookie issued: ${Boolean(adminSessionCookie)}`);
  } catch (err) {
    record(11, "Owner authentication succeeds", false, err.message);
  }

  // TEST 12: Active Session Verification with Cookie
  try {
    const res = await request("/api/admin/auth", {
      headers: { Cookie: adminSessionCookie },
    });
    record(12, "Server verifies active admin session cookie", res.status === 200 && res.data?.authenticated === true && res.data?.user?.role === "owner", `User: ${res.data?.user?.email} (${res.data?.user?.role})`);
  } catch (err) {
    record(12, "Server verifies active admin session cookie", false, err.message);
  }

  // TEST 13: Authorized Owner Can Access Admin Dashboard API
  try {
    const res = await request("/api/admin/dashboard", {
      headers: { Cookie: adminSessionCookie },
    });
    record(13, "Authorized owner accesses /api/admin/dashboard", res.status === 200 && Boolean(res.data?.totalProducts !== undefined || res.data?.metrics !== undefined || res.data?.products !== undefined), `Status: ${res.status}`);
  } catch (err) {
    record(13, "Authorized owner accesses /api/admin/dashboard", false, err.message);
  }

  // TEST 14: Authorized Owner Can Access Inventory & Orders
  try {
    const resInv = await request("/api/inventory", {
      headers: { Cookie: adminSessionCookie },
    });
    const resOrders = await request("/api/orders", {
      headers: { Cookie: adminSessionCookie },
    });
    record(14, "Authorized owner accesses /api/inventory and /api/orders", resInv.status === 200 && resOrders.status === 200, `Inventory items: ${resInv.data?.inventoryList?.length || 0}, Orders: ${resOrders.data?.orders?.length || 0}`);
  } catch (err) {
    record(14, "Authorized owner accesses inventory & orders", false, err.message);
  }

  // TEST 15: Brute-Force Rate Limiting Triggers on Multiple Failures
  try {
    let blocked = false;
    const testIdentifier = "brute_force_test_user@example.com";
    for (let i = 0; i < 6; i++) {
      const res = await request("/api/admin/auth", {
        method: "POST",
        body: { email: testIdentifier, password: "wrong_password_attempt" },
      });
      if (res.status === 429) {
        blocked = true;
        break;
      }
    }
    record(15, "Brute-force protection limits failed login attempts (HTTP 429)", blocked, "Triggered HTTP 429 rate limit successfully");
  } catch (err) {
    record(15, "Brute-force protection limits failed attempts", false, err.message);
  }

  // TEST 16: Owner Logout Revokes Session Cookie
  try {
    const res = await request("/api/admin/auth", {
      method: "DELETE",
      headers: { Cookie: adminSessionCookie },
    });
    const setCookie = res.cookies || "";
    const expired = setCookie.includes("Max-Age=0") || setCookie.includes("expires=");
    record(16, "Owner logout clears session cookie", res.status === 200 && expired, "Cookie set to expire / Max-Age=0");
  } catch (err) {
    record(16, "Owner logout clears session cookie", false, err.message);
  }

  console.log("\n=================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`TEST RESULTS: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

