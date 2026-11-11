import { createClient } from "@supabase/supabase-js";
import fs from "fs";

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

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function checkAndCreateBucket() {
  console.log("Checking storage buckets...");
  const { data: buckets, error: listErr } = await sb.storage.listBuckets();
  if (listErr) {
    console.error("List buckets error:", listErr);
    return;
  }
  console.log("Current buckets:", buckets);

  const exists = buckets.some((b) => b.name === "product-images");
  if (!exists) {
    console.log("Creating 'product-images' public bucket...");
    const { data: createData, error: createErr } = await sb.storage.createBucket("product-images", {
      public: true,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"],
      fileSizeLimit: 10485760, // 10MB
    });
    if (createErr) {
      console.error("Failed to create bucket:", createErr);
    } else {
      console.log("Bucket created successfully:", createData);
    }
  } else {
    console.log("'product-images' bucket already exists!");
  }
}

checkAndCreateBucket();

