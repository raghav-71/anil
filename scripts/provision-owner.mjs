/**
 * SECURE SERVER-SIDE OWNER PROVISIONING SCRIPT
 * Provisions or updates the store owner's administrative account in Supabase Auth.
 * Usage: node scripts/provision-owner.mjs [owner_email] [owner_password]
 */

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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const ownerEmail = process.argv[2] || env.ADMIN_EMAIL || "admin@anilcommunications.com";
const ownerPassword = process.argv[3] || env.ADMIN_PASSWORD || env.ADMIN_PIN;

console.log("=== ANIL COMMUNICATIONS: OWNER ACCOUNT PROVISIONING ===");
console.log(`Target Owner Email: ${ownerEmail}`);

if (!supabaseUrl || !serviceKey) {
  console.error("ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

if (!ownerPassword || ownerPassword.length < 6) {
  console.error("ERROR: Please specify a secure owner password (minimum 6 characters) as argument or ADMIN_PASSWORD in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

async function provisionOwner() {
  try {
    // 1. Check if user already exists in Supabase Auth
    const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr) {
      throw new Error(`Failed to list users: ${listErr.message}`);
    }

    const existingUser = usersData.users.find(
      (u) => u.email?.toLowerCase() === ownerEmail.toLowerCase()
    );

    let authUserId;

    if (existingUser) {
      console.log(`Found existing user (ID: ${existingUser.id}). Updating password and owner role...`);
      const { data: updateData, error: updateErr } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password: ownerPassword,
          email_confirm: true,
          user_metadata: {
            ...existingUser.user_metadata,
            full_name: existingUser.user_metadata?.full_name || "Anil Communications Owner",
            role: "owner",
          },
          app_metadata: {
            ...existingUser.app_metadata,
            role: "owner",
          },
        }
      );

      if (updateErr) throw updateErr;
      authUserId = existingUser.id;
      console.log("Successfully updated owner credentials and metadata in Supabase Auth.");
    } else {
      console.log("User does not exist. Creating new owner user in Supabase Auth...");
      const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
        email: ownerEmail,
        password: ownerPassword,
        email_confirm: true,
        user_metadata: {
          full_name: "Anil Communications Owner",
          role: "owner",
        },
        app_metadata: {
          role: "owner",
        },
      });

      if (createErr) throw createErr;
      authUserId = createData.user.id;
      console.log(`Successfully created owner account (ID: ${authUserId}).`);
    }

    // 2. Sync to profiles table if profiles table exists
    try {
      const { data: profileCheck } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_user_id", authUserId)
        .maybeSingle();

      if (profileCheck) {
        await supabase
          .from("profiles")
          .update({ is_active: true })
          .eq("auth_user_id", authUserId);
        console.log("Updated active status in profiles table.");
      }
    } catch {
      // profiles table might not be migrated yet
    }

    console.log("\nPROVISIONING COMPLETE!");
    console.log(`Owner Login: /admin/login`);
    console.log(`Owner Email: ${ownerEmail}`);
    console.log("Password: [SECURELY CONFIGURED]");
  } catch (err) {
    console.error("Provisioning failed:", err.message);
    process.exit(1);
  }
}

provisionOwner();

