import { getServiceSupabase } from "@/lib/supabase/client";
import { db } from "@/lib/database/store";

export type WhatsAppEventType =
  | "order_created"
  | "payment_verified"
  | "enquiry_submitted"
  | "callback_requested"
  | "cancellation_requested"
  | "return_requested"
  | "low_stock_alert"
  | "test_message";

export interface WhatsAppNotificationPayload {
  eventType: WhatsAppEventType;
  dedupKey?: string;
  recipientNumber?: string; // Default: 919380124254
  title: string;
  details: Record<string, any>;
  templateName?: string;
}

export interface WhatsAppLogRecord {
  id: string;
  eventType: WhatsAppEventType;
  dedupKey?: string;
  recipientNumber: string;
  payload: any;
  status: "sent" | "failed" | "skipped_not_configured" | "duplicate_skipped";
  errorMessage?: string;
  messageId?: string;
  createdAt: string;
}

// In-memory fallback log for local development or when Supabase is in mock mode
const inMemoryLogs: WhatsAppLogRecord[] = [];

/**
 * Checks whether WhatsApp Business Cloud API environment secrets are configured.
 * Does NOT invent or assume credentials.
 */
export function getWhatsAppConfig() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || "";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
  const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "";
  const ownerNumber = process.env.WHATSAPP_OWNER_NUMBER || "919380124254";
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0";

  const isConfigured = Boolean(
    accessToken &&
    phoneNumberId &&
    !accessToken.includes("dummy") &&
    !accessToken.includes("your-access-token") &&
    !phoneNumberId.includes("your-phone")
  );

  return {
    accessToken,
    phoneNumberId,
    businessAccountId,
    ownerNumber,
    apiVersion,
    isConfigured,
  };
}

/**
 * Deduplication check to prevent duplicate messages for the same event
 */
function isDuplicate(dedupKey?: string): boolean {
  if (!dedupKey) return false;
  return inMemoryLogs.some(
    (l) => l.dedupKey === dedupKey && (l.status === "sent" || l.status === "skipped_not_configured")
  );
}

/**
 * Formats a clean, readable text notification for ANIL COMMUNICATION & ZEROX owner.
 */
function formatNotificationText(payload: WhatsAppNotificationPayload): string {
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  let body = `🔔 *ANIL COMMUNICATION & ZEROX ALERT*\n`;
  body += `*Event:* ${payload.title}\n`;
  body += `*Time:* ${timestamp}\n`;
  body += `--------------------------------\n`;

  for (const [key, value] of Object.entries(payload.details)) {
    if (value !== undefined && value !== null) {
      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
      body += `*${label}:* ${value}\n`;
    }
  }

  body += `--------------------------------\n`;
  body += `_ANIL COMMUNICATION & ZEROX E-Commerce Portal_`;
  return body;
}

/**
 * Main dispatcher: sends notification to owner via WhatsApp Cloud API.
 * Never throws an unhandled error so checkout or customer operations are never blocked.
 */
export async function dispatchWhatsAppNotification(
  payload: WhatsAppNotificationPayload
): Promise<{ success: boolean; status: string; messageId?: string; error?: string }> {
  const config = getWhatsAppConfig();
  const recipient = payload.recipientNumber || config.ownerNumber;
  const dedupKey = payload.dedupKey;

  // 1. Deduplication Protection
  if (isDuplicate(dedupKey)) {
    const logItem: WhatsAppLogRecord = {
      id: `wa-dup-${Date.now()}`,
      eventType: payload.eventType,
      dedupKey,
      recipientNumber: recipient,
      payload: payload.details,
      status: "duplicate_skipped",
      createdAt: new Date().toISOString(),
    };
    inMemoryLogs.unshift(logItem);
    return { success: true, status: "duplicate_skipped" };
  }

  const logId = `wa-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // 2. If credentials are not yet configured in environment
  if (!config.isConfigured) {
    const logItem: WhatsAppLogRecord = {
      id: logId,
      eventType: payload.eventType,
      dedupKey,
      recipientNumber: recipient,
      payload: payload.details,
      status: "skipped_not_configured",
      errorMessage: "WhatsApp Business Cloud API secrets (WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID) pending setup.",
      createdAt: new Date().toISOString(),
    };
    inMemoryLogs.unshift(logItem);

    // Save to Supabase if accessible
    try {
      const supabase = getServiceSupabase();
      await supabase.from("whatsapp_notification_logs").insert([
        {
          event_type: payload.eventType,
          dedup_key: dedupKey,
          recipient_number: recipient,
          template_name: payload.templateName || null,
          payload: payload.details,
          status: "skipped_not_configured",
          error_message: logItem.errorMessage,
        },
      ]);
    } catch {
      // Supabase is optional in local development
    }

    return {
      success: false,
      status: "skipped_not_configured",
      error: "WhatsApp Cloud API credentials not configured yet. Logged as pending.",
    };
  }

  // 3. Real Meta WhatsApp Business Cloud API Call
  const messageBody = formatNotificationText(payload);
  const endpoint = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;

  try {
    let response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "text",
        text: { preview_url: false, body: messageBody },
      }),
    });

    let resData = await response.json();

    // Safe Retry Once for transient 5xx server errors
    if (!response.ok && response.status >= 500) {
      await new Promise((r) => setTimeout(r, 1000));
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipient,
          type: "text",
          text: { preview_url: false, body: messageBody },
        }),
      });
      resData = await response.json();
    }

    if (!response.ok) {
      const errMsg = resData.error?.message || `WhatsApp API error ${response.status}`;
      const logItem: WhatsAppLogRecord = {
        id: logId,
        eventType: payload.eventType,
        dedupKey,
        recipientNumber: recipient,
        payload: payload.details,
        status: "failed",
        errorMessage: errMsg,
        createdAt: new Date().toISOString(),
      };
      inMemoryLogs.unshift(logItem);
      return { success: false, status: "failed", error: errMsg };
    }

    const messageId = resData.messages?.[0]?.id;
    const logItem: WhatsAppLogRecord = {
      id: logId,
      eventType: payload.eventType,
      dedupKey,
      recipientNumber: recipient,
      payload: payload.details,
      status: "sent",
      messageId,
      createdAt: new Date().toISOString(),
    };
    inMemoryLogs.unshift(logItem);

    // Record in Supabase
    try {
      const supabase = getServiceSupabase();
      await supabase.from("whatsapp_notification_logs").insert([
        {
          event_type: payload.eventType,
          dedup_key: dedupKey,
          recipient_number: recipient,
          template_name: payload.templateName || null,
          payload: payload.details,
          status: "sent",
          whatsapp_message_id: messageId,
        },
      ]);
    } catch {
      // Supabase is optional
    }

    return { success: true, status: "sent", messageId };
  } catch (err: any) {
    const logItem: WhatsAppLogRecord = {
      id: logId,
      eventType: payload.eventType,
      dedupKey,
      recipientNumber: recipient,
      payload: payload.details,
      status: "failed",
      errorMessage: err.message || "Network error sending WhatsApp message",
      createdAt: new Date().toISOString(),
    };
    inMemoryLogs.unshift(logItem);
    return { success: false, status: "failed", error: err.message };
  }
}

/**
 * Retrieve recent notification logs (combining Supabase and in-memory).
 */
export async function getWhatsAppNotificationLogs(): Promise<WhatsAppLogRecord[]> {
  try {
    const supabase = getServiceSupabase();
    const { data } = await supabase
      .from("whatsapp_notification_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        eventType: d.event_type,
        dedupKey: d.dedup_key,
        recipientNumber: d.recipient_number,
        payload: d.payload,
        status: d.status,
        errorMessage: d.error_message,
        messageId: d.whatsapp_message_id,
        createdAt: d.created_at,
      }));
    }
  } catch {
    // Return in-memory logs
  }

  return [...inMemoryLogs];
}

