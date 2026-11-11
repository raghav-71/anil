import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Load .env.local
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

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
console.log("=== SUPABASE DEEP AUDIT ===");
console.log("URL:", url);

const sb = createClient(url, key, { auth: { persistSession: false } });

async function runAudit() {
  // 1. Table audit
  const tables = [
    "products", "product_variants", "categories", "brands", "orders",
    "order_items", "inventory_movements", "customers", "profiles",
    "roles", "reviews", "coupons", "addresses", "settings", "shop_settings",
    "whatsapp_settings", "payment_records", "devices"
  ];

  console.log("\n--- REMOTE DATABASE TABLES ---");
  for (const t of tables) {
    try {
      const { data, error, count } = await sb.from(t).select("*", { count: "exact" }).limit(1);
      if (error) {
        console.log(`❌ Table '${t}': ${error.message} (Code: ${error.code})`);
      } else {
        console.log(`✅ Table '${t}': EXISTS (Count: ${count}, Sample: ${data.length > 0 ? "Has Data" : "Empty"})`);
      }
    } catch (e) {
      console.log(`⚠️ Table '${t}': EXCEPTION (${e.message})`);
    }
  }

  // 2. Storage Buckets
  console.log("\n--- STORAGE BUCKETS ---");
  try {
    const { data: buckets, error: bErr } = await sb.storage.listBuckets();
    if (bErr) {
      console.log("Storage buckets error:", bErr.message);
    } else {
      console.log("Buckets found:", buckets.map((b) => ({ name: b.name, id: b.id, public: b.public })));
      for (const b of buckets) {
        const { data: files, error: fErr } = await sb.storage.from(b.name).list("", { limit: 100 });
        console.log(`Bucket '${b.name}': ${files ? files.length : 0} items found`);
        if (files && files.length > 0) {
          console.log(`  Sample files:`, files.slice(0, 5).map((f) => f.name));
        }
      }
    }
  } catch (e) {
    console.log("Storage check exception:", e.message);
  }

  // 3. Auth Users
  console.log("\n--- AUTH USERS ---");
  try {
    const { data: users, error: uErr } = await sb.auth.admin.listUsers();
    if (uErr) {
      console.log("Users error:", uErr.message);
    } else {
      console.log(`Total Auth users: ${users.users.length}`);
      for (const u of users.users) {
        console.log(`- ${u.email} (ID: ${u.id}, Role: ${u.app_metadata?.role || "none"})`);
      }
    }
  } catch (e) {
    console.log("Auth check exception:", e.message);
  }

  // 4. Local Database Store Audit
  console.log("\n--- LOCAL JSON DATA AUDIT ---");
  try {
    const catalogRaw = fs.readFileSync("src/lib/database/imported-catalog.json", "utf8");
    const catalog = JSON.parse(catalogRaw);
    console.log(`Local Catalog Products: ${catalog.length}`);
    const variantsCount = catalog.reduce((acc, p) => acc + (p.variants?.length || 0), 0);
    console.log(`Local Catalog Variants: ${variantsCount}`);
    const imagesCount = catalog.reduce((acc, p) => acc + (p.images?.length || 0), 0);
    console.log(`Local Catalog Total Image References: ${imagesCount}`);
  } catch (e) {
    console.log("Local catalog read error:", e.message);
  }

  try {
    if (fs.existsSync("src/lib/database/orders.json")) {
      const orders = JSON.parse(fs.readFileSync("src/lib/database/orders.json", "utf8"));
      console.log(`Local Orders: ${orders.length}`);
      for (const o of orders) {
        console.log(`  - #${o.orderNumber || o.id}: ${o.customerName} (₹${o.grandTotal}, ${o.status})`);
      }
    } else {
      console.log("Local orders.json: Not found");
    }
  } catch (e) {
    console.log("Local orders read error:", e.message);
  }

  try {
    if (fs.existsSync("src/lib/database/settings.json")) {
      const settings = JSON.parse(fs.readFileSync("src/lib/database/settings.json", "utf8"));
      console.log("Local Shop Settings:", Object.keys(settings).length, "keys found. Store Name:", settings.storeName);
    }
  } catch (e) {
    console.log("Local settings read error:", e.message);
  }
}

runAudit();

