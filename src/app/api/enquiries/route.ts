import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/client";
import { dispatchWhatsAppNotification } from "@/lib/whatsapp";

interface EnquiryRecord {
  id: string;
  ticketNumber: string;
  name: string;
  phone: string;
  email?: string;
  productOfInterest?: string;
  message: string;
  source: string;
  isCallbackRequested: boolean;
  status: "new" | "contacted" | "resolved";
  createdAt: string;
}

// In-memory fallback for enquiries
const inMemoryEnquiries: EnquiryRecord[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      phone,
      email,
      productOfInterest,
      message,
      source = "website_enquiry",
      isCallbackRequested = false,
    } = body;

    if (!name?.trim() || !phone?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Customer name, phone number, and message are required." },
        { status: 400 }
      );
    }

    const ticketNumber = `TCK-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const record: EnquiryRecord = {
      id: `enq-${Date.now()}`,
      ticketNumber,
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      productOfInterest: productOfInterest?.trim(),
      message: message.trim(),
      source,
      isCallbackRequested: Boolean(isCallbackRequested),
      status: "new",
      createdAt: now,
    };

    inMemoryEnquiries.unshift(record);

    // Save to Supabase
    try {
      const supabase = getServiceSupabase();
      await supabase.from("customer_enquiries").insert([
        {
          ticket_number: ticketNumber,
          name: record.name,
          phone: record.phone,
          email: record.email || null,
          product_of_interest: record.productOfInterest || null,
          message: record.message,
          source: record.source,
          is_callback_requested: record.isCallbackRequested,
          status: "new",
        },
      ]);
    } catch (dbErr) {
      console.warn("Supabase enquiry insert skipped/failed:", dbErr);
    }

    // Trigger WhatsApp notification to shop owner
    const eventType = isCallbackRequested ? "callback_requested" : "enquiry_submitted";
    dispatchWhatsAppNotification({
      eventType,
      dedupKey: `enq_${ticketNumber}`,
      title: isCallbackRequested ? "Customer Callback Requested" : "New Customer Product Enquiry",
      details: {
        ticketNumber,
        customerName: record.name,
        contactNumber: record.phone,
        productOfInterest: record.productOfInterest || "General Enquiry",
        message: record.message,
        email: record.email || "Not provided",
        urgency: isCallbackRequested ? "High (Callback Requested)" : "Normal",
      },
    }).catch((e) => console.error("WhatsApp enquiry alert failed:", e));

    return NextResponse.json({
      success: true,
      ticketNumber,
      message: "Enquiry recorded successfully. Our team will contact you shortly.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to submit enquiry" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    const { data } = await supabase
      .from("customer_enquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data && data.length > 0) {
      return NextResponse.json({ enquiries: data });
    }
  } catch {
    // fallback
  }

  return NextResponse.json({ enquiries: inMemoryEnquiries });
}

