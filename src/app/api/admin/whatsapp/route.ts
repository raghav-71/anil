import { NextRequest, NextResponse } from "next/server";
import {
  getWhatsAppConfig,
  getWhatsAppNotificationLogs,
  dispatchWhatsAppNotification,
} from "@/lib/whatsapp";
import { getServiceSupabase } from "@/lib/supabase/client";

// In-memory preferences fallback
let notificationPreferences = {
  notifyOnOrder: true,
  notifyOnPayment: true,
  notifyOnEnquiry: true,
  notifyOnCallback: true,
  notifyOnCancellation: true,
  notifyOnReturn: true,
  notifyOnLowStock: true,
};

export async function GET(req: NextRequest) {
  try {
    const config = getWhatsAppConfig();
    const logs = await getWhatsAppNotificationLogs();

    return NextResponse.json({
      success: true,
      status: {
        isConfigured: config.isConfigured,
        connectedNumber: config.ownerNumber,
        apiVersion: config.apiVersion,
        hasAccessToken: Boolean(config.accessToken && !config.accessToken.includes("dummy")),
        hasPhoneNumberId: Boolean(config.phoneNumberId && !config.phoneNumberId.includes("your-phone")),
        hasBusinessAccountId: Boolean(config.businessAccountId),
        coexistenceStatus: config.isConfigured
          ? "Configured with Cloud API"
          : "Coexistence Setup Pending (API credentials required)",
      },
      preferences: notificationPreferences,
      logs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load WhatsApp settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, preferences } = body;

    if (action === "update_preferences" && preferences) {
      notificationPreferences = { ...notificationPreferences, ...preferences };

      try {
        const supabase = getServiceSupabase();
        await supabase
          .from("whatsapp_settings")
          .upsert([
            {
              id: "primary",
              owner_phone: "919380124254",
              notify_on_order: notificationPreferences.notifyOnOrder,
              notify_on_payment: notificationPreferences.notifyOnPayment,
              notify_on_enquiry: notificationPreferences.notifyOnEnquiry,
              notify_on_callback: notificationPreferences.notifyOnCallback,
              notify_on_cancellation: notificationPreferences.notifyOnCancellation,
              notify_on_return: notificationPreferences.notifyOnReturn,
              notify_on_low_stock: notificationPreferences.notifyOnLowStock,
              updated_at: new Date().toISOString(),
            },
          ]);
      } catch {
        // in-memory fallback
      }

      return NextResponse.json({
        success: true,
        message: "WhatsApp notification preferences updated successfully",
        preferences: notificationPreferences,
      });
    }

    if (action === "test_notification") {
      const config = getWhatsAppConfig();

      const result = await dispatchWhatsAppNotification({
        eventType: "test_message",
        dedupKey: `test_${Date.now()}`,
        title: "System Diagnostic & Verification Test",
        details: {
          recipient: config.ownerNumber,
          testTimestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          statusCheck: "Operational Dispatch Verification",
          system: "ANIL COMMUNICATION & ZEROX E-Commerce Architecture",
          coexistenceMode: "WhatsApp Coexistence Enabled",
        },
      });

      return NextResponse.json({
        success: result.success,
        status: result.status,
        messageId: result.messageId,
        error: result.error,
        isConfigured: config.isConfigured,
        message: result.success
          ? `Test notification sent successfully to +${config.ownerNumber}`
          : result.status === "skipped_not_configured"
          ? "WhatsApp Cloud API credentials not yet configured in environment. The test notification was recorded in notification logs."
          : `Failed to dispatch test notification: ${result.error}`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process request" },
      { status: 500 }
    );
  }
}

