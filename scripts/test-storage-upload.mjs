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

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testUpload() {
  const fileBytes = fs.readFileSync("public/images/products/photos/moto-g37-power.png");
  const { data, error } = await sb.storage
    .from("product-images")
    .upload("catalog/moto-g37-power.png", fileBytes, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    console.error("Upload error:", error);
  } else {
    const { data: urlData } = sb.storage.from("product-images").getPublicUrl("catalog/moto-g37-power.png");
    console.log("Upload SUCCESS!");
    console.log("Public URL:", urlData.publicUrl);
  }
}

testUpload();

