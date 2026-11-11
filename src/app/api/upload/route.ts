import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getServiceSupabase } from "@/lib/supabase/client";
import { verifyAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export async function POST(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json(
      { error: "Unauthorized. Owner credentials required for asset upload." },
      { status: 401 }
    );
  }
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    const fileList: File[] = [];
    if (singleFile && singleFile instanceof File) {
      fileList.push(singleFile);
    }
    for (const f of files) {
      if (f instanceof File && !fileList.includes(f)) {
        fileList.push(f);
      }
    }

    if (fileList.length === 0) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];
    const supabase = getServiceSupabase();
    const hasSupabase =
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

    for (const file of fileList) {
      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
        return NextResponse.json(
          { error: `Invalid file type "${file.type}". Only JPEG, PNG, and WebP are allowed.` },
          { status: 400 }
        );
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB)` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name) || (file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg");
      const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
      const uniqueName = `products/${baseName}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;

      let uploadedSuccessfully = false;

      // 1. Try Supabase Storage first (Ideal for AWS Amplify / serverless hosting)
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.storage
            .from("products")
            .upload(uniqueName, buffer, {
              contentType: file.type,
              upsert: true,
            });

          if (!error && data) {
            const { data: publicUrlData } = supabase.storage
              .from("products")
              .getPublicUrl(uniqueName);

            if (publicUrlData?.publicUrl) {
              uploadedUrls.push(publicUrlData.publicUrl);
              uploadedSuccessfully = true;
            }
          }
        } catch (supabaseErr) {
          console.warn("[Upload] Supabase Storage upload attempt skipped/failed, using fallback:", supabaseErr);
        }
      }

      // 2. Local filesystem fallback (Development and container environments)
      if (!uploadedSuccessfully) {
        try {
          const uploadsDir = path.join(process.cwd(), "public", "uploads");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          const localFileName = path.basename(uniqueName);
          const localPath = path.join(uploadsDir, localFileName);
          fs.writeFileSync(localPath, buffer);
          uploadedUrls.push(`/uploads/${localFileName}`);
          uploadedSuccessfully = true;
        } catch (fsErr) {
          // 3. Fallback for serverless environments where public filesystem is read-only
          const base64Data = buffer.toString("base64");
          uploadedUrls.push(`data:${file.type};base64,${base64Data}`);
          uploadedSuccessfully = true;
        }
      }
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0],
      urls: uploadedUrls,
      count: uploadedUrls.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Image upload failed" }, { status: 500 });
  }
}
