import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

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

const PHOTOS_DIR = "public/images/products/photos";

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

async function uploadAllImages() {
  console.log("=== BULK UPLOADING PRODUCT IMAGES TO SUPABASE STORAGE ===");
  const files = fs.readdirSync(PHOTOS_DIR);
  console.log(`Found ${files.length} images to upload.`);

  const urlMap = {};
  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    const fullPath = path.join(PHOTOS_DIR, file);
    if (!fs.statSync(fullPath).isFile()) continue;

    const fileBytes = fs.readFileSync(fullPath);
    const mimeType = getMimeType(file);
    const storagePath = `catalog/${file}`;

    const { data, error } = await sb.storage
      .from("product-images")
      .upload(storagePath, fileBytes, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error(`❌ Failed to upload ${file}:`, error.message);
      failCount++;
    } else {
      const { data: urlData } = sb.storage.from("product-images").getPublicUrl(storagePath);
      urlMap[file] = urlData.publicUrl;
      successCount++;
      process.stdout.write(`✅ [${successCount}/${files.length}] Uploaded: ${file}\n`);
    }
  }

  // Also upload SVGs as fallback
  const svgDir = "public/images/products";
  const svgFiles = fs.readdirSync(svgDir).filter((f) => f.endsWith(".svg"));
  console.log(`\nUploading ${svgFiles.length} SVG fallback images...`);
  for (const file of svgFiles) {
    const fullPath = path.join(svgDir, file);
    const fileBytes = fs.readFileSync(fullPath);
    const storagePath = `svg/${file}`;
    const { error } = await sb.storage
      .from("product-images")
      .upload(storagePath, fileBytes, {
        contentType: "image/svg+xml",
        upsert: true,
      });
    if (!error) {
      const { data: urlData } = sb.storage.from("product-images").getPublicUrl(storagePath);
      urlMap[`svg_${file}`] = urlData.publicUrl;
    }
  }

  // Save urlMap for database seeding
  fs.writeFileSync("src/lib/database/uploaded-image-urls.json", JSON.stringify(urlMap, null, 2));
  console.log(`\n🎉 Upload completed: ${successCount} photos uploaded, ${failCount} failed.`);
  console.log(`Saved public URL map to src/lib/database/uploaded-image-urls.json`);
}

uploadAllImages().catch((err) => {
  console.error("Upload process encountered error:", err);
  process.exit(1);
});

