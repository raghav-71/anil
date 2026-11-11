import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { verifyAdminSession } from "@/lib/admin-auth";
import { getWhatsAppConfig } from "@/lib/whatsapp";
import { getEmailConfig, sendTestEmailNotification } from "@/lib/email";
import { getServiceSupabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
  }

  try {
    let settings = db.getShopSettings();

    // Query Supabase PostgreSQL
    try {
      const supabase = getServiceSupabase();
      const { data: dbSettings } = await supabase.from("shop_settings").select("*").eq("id", "primary").maybeSingle();
      if (dbSettings) {
        settings = {
          ...settings,
          storeName: dbSettings.store_name || settings.storeName,
          tagline: dbSettings.tagline || settings.tagline,
          phone: dbSettings.phone || settings.phone,
          email: dbSettings.email || settings.email,
          address: dbSettings.address || settings.address,
          gstin: dbSettings.gstin || settings.gstin,
          invoicePrefix: dbSettings.invoice_prefix || settings.invoicePrefix,
          codEnabled: dbSettings.cod_enabled !== undefined ? dbSettings.cod_enabled : settings.codEnabled,
          freeShippingThreshold: Number(dbSettings.free_shipping_threshold) || settings.freeShippingThreshold,
          standardShippingFee: Number(dbSettings.standard_shipping_fee) || settings.standardShippingFee,
          ownerWhatsAppNumber: dbSettings.owner_whatsapp_number || settings.ownerWhatsAppNumber,
        };
      }
    } catch {
      // fallback
    }
    const waConfig = getWhatsAppConfig();
    const emailConfig = getEmailConfig();

    return NextResponse.json({
      success: true,
      settings,
      status: {
        whatsapp: {
          isConfigured: waConfig.isConfigured,
          ownerNumber: settings.ownerWhatsAppNumber || waConfig.ownerNumber,
          hasAccessToken: Boolean(waConfig.accessToken && !waConfig.accessToken.includes("dummy")),
          hasPhoneNumberId: Boolean(waConfig.phoneNumberId && !waConfig.phoneNumberId.includes("your-phone")),
          apiVersion: waConfig.apiVersion,
          statusLabel: waConfig.isConfigured
            ? "Connected & Operational"
            : "Setup Pending (Meta Cloud API credentials required)",
        },
        email: {
          isConfigured: emailConfig.isConfigured,
          ownerEmail: settings.ownerNotificationEmail || emailConfig.ownerEmail,
          hasResendKey: Boolean(emailConfig.resendApiKey && !emailConfig.resendApiKey.includes("dummy")),
          hasSmtp: Boolean(emailConfig.smtpHost && emailConfig.smtpUser),
          statusLabel: emailConfig.isConfigured
            ? "Connected & Operational"
            : "Setup Pending (Set RESEND_API_KEY or SMTP credentials in .env.local)",
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (body.action === "test_email") {
      const targetEmail = body.email || db.getShopSettings().ownerNotificationEmail;
      const res = await sendTestEmailNotification(targetEmail);
      return NextResponse.json(res);
    }

    const updated = db.updateShopSettings(body.settings || body);

    // Sync to Supabase PostgreSQL
    try {
      const supabase = getServiceSupabase();
      await supabase.from("shop_settings").upsert({
        id: "primary",
        store_name: updated.storeName,
        tagline: updated.tagline,
        phone: updated.phone,
        email: updated.email,
        address: updated.address,
        gstin: updated.gstin,
        invoice_prefix: updated.invoicePrefix,
        cod_enabled: updated.codEnabled,
        free_shipping_threshold: updated.freeShippingThreshold,
        standard_shipping_fee: updated.standardShippingFee,
        owner_whatsapp_number: updated.ownerWhatsAppNumber,
        updated_at: new Date().toISOString(),
      });
    } catch (sbErr) {
      console.warn("[Settings] Supabase sync warning:", sbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Store & notification settings saved permanently.",
      settings: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save settings" }, { status: 500 });
  }
}

