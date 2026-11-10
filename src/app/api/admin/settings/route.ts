import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { verifyAdminSession } from "@/lib/admin-auth";
import { getWhatsAppConfig } from "@/lib/whatsapp";
import { getEmailConfig, sendTestEmailNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
  }

  try {
    const settings = db.getShopSettings();
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
    return NextResponse.json({
      success: true,
      message: "Store & notification settings saved permanently.",
      settings: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save settings" }, { status: 500 });
  }
}

