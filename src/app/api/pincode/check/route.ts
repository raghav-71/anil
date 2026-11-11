import { NextRequest, NextResponse } from "next/server";

interface PincodeDetail {
  city: string;
  state: string;
  deliveryDays: string;
  isCodAvailable: boolean;
  courier: string;
}

const PINCODE_DATABASE: Record<string, PincodeDetail> = {
  // Local Belagavi area
  "591103": { city: "Belagavi", state: "Karnataka", deliveryDays: "Same Day / Walk-in Pickup", isCodAvailable: true, courier: "Store Pickup / Local Delivery" },
  // Nearby Karnataka
  "560001": { city: "Bengaluru", state: "Karnataka", deliveryDays: "1-2 Business Days", isCodAvailable: true, courier: "BlueDart Air Express" },
  "560025": { city: "Bengaluru", state: "Karnataka", deliveryDays: "1-2 Business Days", isCodAvailable: true, courier: "BlueDart Air Express" },
  "560034": { city: "Bengaluru", state: "Karnataka", deliveryDays: "1-2 Business Days", isCodAvailable: true, courier: "BlueDart Air Express" },
  "560038": { city: "Bengaluru", state: "Karnataka", deliveryDays: "1-2 Business Days", isCodAvailable: true, courier: "BlueDart Air Express" },
  "560095": { city: "Bengaluru", state: "Karnataka", deliveryDays: "1-2 Business Days", isCodAvailable: true, courier: "BlueDart Air Express" },
  // Delhi NCR
  "110001": { city: "New Delhi", state: "Delhi", deliveryDays: "2 Business Days", isCodAvailable: true, courier: "BlueDart Air Express" },
  "122002": { city: "Gurugram", state: "Haryana", deliveryDays: "2 Business Days", isCodAvailable: true, courier: "BlueDart Air Express" },
  // Mumbai
  "400001": { city: "Mumbai", state: "Maharashtra", deliveryDays: "1-2 Business Days", isCodAvailable: true, courier: "BlueDart Air Express" },
  // Hyderabad
  "500001": { city: "Hyderabad", state: "Telangana", deliveryDays: "1-2 Business Days", isCodAvailable: true, courier: "Delhivery Surface Express" },
  // Chennai
  "600001": { city: "Chennai", state: "Tamil Nadu", deliveryDays: "1-2 Business Days", isCodAvailable: true, courier: "Delhivery Surface Express" },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim() || "";

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ valid: false, error: "Please enter a valid 6-digit Indian PIN code." }, { status: 400 });
    }

    const matched = PINCODE_DATABASE[code];
    if (matched) {
      return NextResponse.json({
        valid: true,
        pincode: code,
        ...matched,
      });
    }

    // Default pan-India dispatch
    const firstDigit = code.charAt(0);
    let state = "India";
    if (firstDigit === "5") state = "Karnataka / South Region";
    else if (firstDigit === "4") state = "Maharashtra / Goa";
    else if (firstDigit === "1") state = "Delhi / Punjab / Haryana";
    else if (firstDigit === "6") state = "Tamil Nadu / Kerala";
    else if (firstDigit === "7") state = "West Bengal / North East";
    else if (firstDigit === "8") state = "Bihar / Jharkhand";
    else if (firstDigit === "3") state = "Gujarat / Rajasthan";

    return NextResponse.json({
      valid: true,
      pincode: code,
      city: "Serviceable Area",
      state,
      deliveryDays: "2-4 Business Days",
      isCodAvailable: true,
      courier: "BlueDart Insured Courier",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to check PIN code" }, { status: 500 });
  }
}

