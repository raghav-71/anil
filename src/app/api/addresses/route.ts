import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { getServiceSupabase } from "@/lib/supabase/client";

export async function GET() {
  try {
    try {
      const supabase = getServiceSupabase();
      const { data: dbAddrs, error } = await supabase.from("addresses").select("*").order("created_at", { ascending: false });
      if (!error && dbAddrs && dbAddrs.length > 0) {
        return NextResponse.json({
          success: true,
          addresses: dbAddrs.map((a: any) => ({
            id: a.id,
            name: a.name,
            phone: a.phone,
            street: a.street,
            city: a.city,
            state: a.state,
            pincode: a.pincode,
            landmark: a.landmark,
            type: a.type,
            isDefault: a.is_default,
          })),
        });
      }
    } catch {}

    const addresses = db.getUserAddresses();
    return NextResponse.json({ success: true, addresses });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, street, city, state, pincode, landmark, type, isDefault } = body;

    if (!name || !phone || !street || !city || !state || !pincode) {
      return NextResponse.json({ error: "Please complete all mandatory address fields" }, { status: 400 });
    }

    const newAddress = db.addUserAddress({
      name,
      phone,
      street,
      city,
      state,
      pincode,
      landmark: landmark || "",
      type: type || "home",
      isDefault: Boolean(isDefault),
    });

    // Sync to Supabase PostgreSQL
    try {
      const supabase = getServiceSupabase();
      await supabase.from("addresses").insert([
        {
          id: newAddress.id,
          name: newAddress.name,
          phone: newAddress.phone,
          street: newAddress.street,
          city: newAddress.city,
          state: newAddress.state,
          pincode: newAddress.pincode,
          landmark: newAddress.landmark,
          type: newAddress.type,
          is_default: newAddress.isDefault,
        },
      ]);
    } catch (sbErr) {
      console.warn("[Addresses] Supabase insert warning:", sbErr);
    }

    return NextResponse.json({ success: true, address: newAddress });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save address" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Address ID required" }, { status: 400 });

    try {
      const supabase = getServiceSupabase();
      await supabase.from("addresses").delete().eq("id", id);
    } catch {}

    const success = db.deleteUserAddress(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete address" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "Address ID required" }, { status: 400 });
    const success = db.setDefaultUserAddress(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to set default" }, { status: 500 });
  }
}

