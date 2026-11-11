import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { authUserId, email, fullName, phone } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // 1. Fetch customer role ID
    const { data: roleData } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "customer")
      .single();

    const customerRoleId = roleData?.id || null;

    // 2. Upsert customer profile
    const profilePayload: Record<string, any> = {
      email: email.trim().toLowerCase(),
      full_name: fullName?.trim() || email.split("@")[0],
      phone: phone ? String(phone).replace(/\D/g, "") : null,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    if (authUserId) {
      profilePayload.auth_user_id = authUserId;
    }
    if (customerRoleId) {
      profilePayload.role_id = customerRoleId;
    }

    const { data, error } = await supabase
      .from("profiles")
      .upsert(profilePayload, { onConflict: "email" })
      .select()
      .single();

    if (error) {
      console.error("[Profile Sync Error]:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (err: any) {
    console.error("[Profile Sync Unexpected Error]:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Failed to synchronize profile" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const authUserId = searchParams.get("authUserId");

    if (!email && !authUserId) {
      return NextResponse.json({ error: "Identifier required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    let query = supabase.from("profiles").select("*, role:roles(name)");

    if (authUserId) {
      query = query.eq("auth_user_id", authUserId);
    } else if (email) {
      query = query.eq("email", email.trim().toLowerCase());
    }

    const { data, error } = await query.single();
    if (error || !data) {
      return NextResponse.json({ success: false, profile: null });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

