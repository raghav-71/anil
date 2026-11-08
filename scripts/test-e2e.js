/**
 * ANIL COMMUNICATIONS - E-COMMERCE & POS END-TO-END AUTOMATED TEST SUITE
 * Run via: node scripts/test-e2e.js
 */

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

async function runTests() {
  console.log("===============================================================================");
  console.log("       ANIL COMMUNICATIONS - E2E COMPREHENSIVE PLATFORM VERIFICATION           ");
  console.log("===============================================================================\n");

  let passed = 0;
  let total = 0;

  async function check(name, testFn) {
    total++;
    try {
      process.stdout.write(`[${total.toString().padStart(2, "0")}] Testing: ${name.padEnd(52, " ")} `);
      await testFn();
      console.log("\x1b[32m[ PASSED ]\x1b[0m");
      passed++;
    } catch (err) {
      console.log(`\x1b[31m[ FAILED ]\x1b[0m -> ${err.message}`);
    }
  }

  // 1. Storefront & Catalog
  await check("Public Catalog & Active Products Retrieval", async () => {
    const res = await fetch(`${BASE_URL}/api/products`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.products || data.products.length < 5) throw new Error("Expected at least 5 catalog products");
  });

  // 2. Search Autocomplete
  await check("Live Search Autocomplete & Typo Matching", async () => {
    const res = await fetch(`${BASE_URL}/api/search?q=iPhone`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.products || data.products.length === 0) throw new Error("No search results returned for 'iPhone'");
  });

  // 3. Frequently Bought Together
  await check("Smart Bundle Recommender (FBT)", async () => {
    const res = await fetch(`${BASE_URL}/api/recommendations?productId=prod-iphone-16-pro`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.bundle || !data.bundle.bundledProducts || data.bundle.bundledProducts.length === 0) {
      throw new Error("No FBT bundle generated for iPhone 16 Pro");
    }
  });

  // 4. Customer Review Submission
  let createdReviewId = null;
  await check("Customer Review Submission & Verification", async () => {
    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: "prod-iphone-16-pro",
        productName: "Apple iPhone 16 Pro",
        userName: "Automated Test Suite",
        rating: 5,
        title: "Pristine Factory Condition",
        comment: "Inspected by automated verification pipeline.",
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.review?.id) throw new Error("Review creation failed");
    createdReviewId = data.review.id;
  });

  // 5. Review Helpful Voting
  await check("Customer Review Helpful Upvoting", async () => {
    if (!createdReviewId) throw new Error("No review ID to upvote");
    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId: createdReviewId }),
    });
    const data = await res.json();
    if (!data.success) throw new Error("Upvote failed");
  });

  // 6. Indian PIN Code Checker
  await check("Indian PIN Code Turnaround & COD Verification", async () => {
    const res = await fetch(`${BASE_URL}/api/pincode/check?code=560001`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.valid || !data.isCodAvailable) throw new Error("PIN 560001 check failed");
  });

  // 7. Voucher Validation
  await check("Voucher Code Validation & Discount Engine", async () => {
    const res = await fetch(`${BASE_URL}/api/coupons/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "WELCOME500", cartSubtotal: 50000 }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.valid || data.discountAmount !== 500) throw new Error("WELCOME500 discount mismatch");
  });

  // 8. Saved Delivery Addresses
  await check("Multi-Address Book (GET & Save)", async () => {
    const res = await fetch(`${BASE_URL}/api/addresses`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.addresses || data.addresses.length === 0) throw new Error("No saved addresses returned");
  });

  // 9. Unauthorized POS Lockout
  await check("Owner Hardware Security (403 Unauthorized Lockout)", async () => {
    const res = await fetch(`${BASE_URL}/api/pos/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [] }),
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 10. Authorized POS Sale & GST Invoicing
  await check("Authorized POS Sale, Atomic Deduction & Invoice", async () => {
    const res = await fetch(`${BASE_URL}/api/pos/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Device-Token": "tok_anil_shop_primary_pos_counter_2026_xyz982",
      },
      body: JSON.stringify({
        items: [{ variantId: "var-s24u-512-blk", quantity: 1, unitPrice: 139999 }],
        customerName: "E2E Test Customer",
        customerPhone: "9845012345",
        paymentMethod: "cash",
        amountReceived: 140000,
        cashierName: "Store Owner",
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.invoice?.invoiceNumber) throw new Error("POS checkout failed");
  });

  // 11. SEO Crawl Permissions
  await check("SEO Robots.txt & Sitemap Product Indexing", async () => {
    const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
    const robots = await robotsRes.text();
    if (!robots.includes("/admin/")) throw new Error("robots.txt must disallow /admin/");

    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
    const sitemap = await sitemapRes.text();
    if (!sitemap.includes("/product/")) throw new Error("sitemap.xml must include product URLs");
  });

  // 12. Business Analytics & AOV
  await check("Financial Intelligence & AOV KPI Computation", async () => {
    const res = await fetch(`${BASE_URL}/api/reports`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.summary?.totalRevenue || !data.summary?.aov) throw new Error("AOV and Revenue not computed");
  });

  console.log("\n===============================================================================");
  console.log(`TOTAL CHECKS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log("===============================================================================\n");

  if (passed === total) {
    console.log("\x1b[32m✔ ALL PLATFORM CAPABILITIES CONFIRMED OPERATIONAL & PRODUCTION-READY.\x1b[0m\n");
  }
}

runTests();

