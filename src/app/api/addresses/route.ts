import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";

export async function GET() {
  try {
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

