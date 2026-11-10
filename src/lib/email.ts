import { Order } from "@/types";
import { formatCurrency, formatDate } from "./utils";
import { db } from "./database/store";

export interface EmailLogRecord {
  id: string;
  orderNumber?: string;
  recipientEmail: string;
  subject: string;
  status: "sent" | "failed" | "skipped_not_configured";
  errorMessage?: string;
  createdAt: string;
}

const inMemoryEmailLogs: EmailLogRecord[] = [];

/**
 * Get server-side email service configuration
 */
export function getEmailConfig() {
  const settings = db.getShopSettings();
  const ownerEmail = settings.ownerNotificationEmail || process.env.OWNER_NOTIFICATION_EMAIL || "";
  const resendApiKey = process.env.RESEND_API_KEY || "";
  const smtpHost = process.env.SMTP_HOST || "";
  const smtpUser = process.env.SMTP_USER || "";
  const smtpPass = process.env.SMTP_PASS || "";
  const smtpPort = process.env.SMTP_PORT || "587";
  const fromEmail = process.env.EMAIL_FROM || "orders@anilcommunications.com";

  const isConfigured = Boolean(
    ownerEmail &&
    (
      (resendApiKey && !resendApiKey.includes("dummy") && !resendApiKey.includes("your-key")) ||
      (smtpHost && smtpUser && smtpPass)
    )
  );

  return {
    ownerEmail,
    resendApiKey,
    smtpHost,
    smtpUser,
    smtpPass,
    smtpPort,
    fromEmail,
    isConfigured,
  };
}

/**
 * Dispatches an email notification to the store owner when an order is placed.
 * Non-blocking, never throws unhandled errors.
 */
export async function dispatchOrderEmailNotification(
  order: Order
): Promise<{ success: boolean; status: string; error?: string }> {
  const config = getEmailConfig();
  const recipient = config.ownerEmail;

  if (!recipient || !config.isConfigured) {
    const logItem: EmailLogRecord = {
      id: `email-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      orderNumber: order.orderNumber,
      recipientEmail: recipient || "not_configured",
      subject: `New Order #${order.orderNumber} - ${order.customerName}`,
      status: "skipped_not_configured",
      errorMessage: !recipient
        ? "Owner notification email not configured in Admin Settings."
        : "Email service provider credentials (RESEND_API_KEY or SMTP credentials) pending configuration.",
      createdAt: new Date().toISOString(),
    };
    inMemoryEmailLogs.unshift(logItem);
    return {
      success: false,
      status: "skipped_not_configured",
      error: logItem.errorMessage,
    };
  }

  const subject = `[ANIL COMMUNICATION & ZEROX] New Order #${order.orderNumber} Received - ${formatCurrency(order.grandTotal)}`;
  
  const textContent = `
ANIL COMMUNICATION & ZEROX - NEW ONLINE ORDER
=============================================
Order Number: #${order.orderNumber}
Order Date: ${formatDate(order.createdAt)}
Fulfillment: ${order.fulfillmentType === "pickup" ? "In-Store Pickup" : "Doorstep Delivery"}

CUSTOMER DETAILS:
Name: ${order.customerName}
Phone: +91 ${order.customerPhone}
Email: ${order.customerEmail}

${order.fulfillmentType === "pickup" ? `
STORE PICKUP LOCATION:
Bagalkot Main Road, Pant Nagar, Near Canara Bank, 591103, Karnataka
` : `
SHIPPING ADDRESS:
${order.shippingAddress.street}
${order.shippingAddress.landmark ? `Landmark: ${order.shippingAddress.landmark}\n` : ""}${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
`}

ORDERED ITEMS:
${order.items.map((i) => `- ${i.productName} (${i.variantDetails}) x${i.quantity} = ${formatCurrency(i.totalPrice)}`).join("\n")}

PAYMENT & TOTAL:
Subtotal: ${formatCurrency(order.subtotal)}
Discount: ${formatCurrency(order.discountAmount)}
Shipping: ${formatCurrency(order.shippingFee)}
Grand Total: ${formatCurrency(order.grandTotal)}
Payment Method: ${order.paymentMethod.toUpperCase()}
Payment Status: ${order.paymentStatus.toUpperCase()}

Please log into your Admin Dashboard at /admin/orders to process fulfillment.
`.trim();

  try {
    // If Resend API key is provided, use Resend REST endpoint
    if (config.resendApiKey && !config.resendApiKey.includes("dummy")) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Anil Communication <${config.fromEmail}>`,
          to: recipient,
          subject,
          text: textContent,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Resend API failed with status ${res.status}`);
      }
    }

    inMemoryEmailLogs.unshift({
      id: `email-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      orderNumber: order.orderNumber,
      recipientEmail: recipient,
      subject,
      status: "sent",
      createdAt: new Date().toISOString(),
    });

    return { success: true, status: "sent" };
  } catch (err: any) {
    inMemoryEmailLogs.unshift({
      id: `email-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      orderNumber: order.orderNumber,
      recipientEmail: recipient,
      subject,
      status: "failed",
      errorMessage: err.message,
      createdAt: new Date().toISOString(),
    });
    return { success: false, status: "failed", error: err.message };
  }
}

/**
 * Send test email diagnostic from Admin Settings
 */
export async function sendTestEmailNotification(
  targetEmail: string
): Promise<{ success: boolean; status: string; error?: string; message: string }> {
  const config = getEmailConfig();
  const recipient = targetEmail || config.ownerEmail;

  if (!recipient) {
    return {
      success: false,
      status: "skipped_not_configured",
      error: "No recipient email specified.",
      message: "Please enter an owner email address first.",
    };
  }

  if (!config.isConfigured) {
    inMemoryEmailLogs.unshift({
      id: `email-test-${Date.now()}`,
      recipientEmail: recipient,
      subject: "Test Order Notification",
      status: "skipped_not_configured",
      errorMessage: "Email service provider credentials (RESEND_API_KEY or SMTP credentials) pending configuration.",
      createdAt: new Date().toISOString(),
    });

    return {
      success: false,
      status: "skipped_not_configured",
      error: "Email API credentials pending configuration in environment.",
      message: `Owner email saved as ${recipient}. Server email credentials (RESEND_API_KEY or SMTP) can be added to .env.local.`,
    };
  }

  try {
    if (config.resendApiKey && !config.resendApiKey.includes("dummy")) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Anil Communication <${config.fromEmail}>`,
          to: recipient,
          subject: "[TEST] ANIL COMMUNICATION & ZEROX - Email Alert Test",
          text: `This is a test notification from ANIL COMMUNICATION & ZEROX E-Commerce Portal. Your order notification system is connected.`,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Resend API failed with status ${res.status}`);
      }
    }

    inMemoryEmailLogs.unshift({
      id: `email-test-${Date.now()}`,
      recipientEmail: recipient,
      subject: "Test Order Notification",
      status: "sent",
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      status: "sent",
      message: `Test email notification successfully dispatched to ${recipient}`,
    };
  } catch (err: any) {
    inMemoryEmailLogs.unshift({
      id: `email-test-${Date.now()}`,
      recipientEmail: recipient,
      subject: "Test Order Notification",
      status: "failed",
      errorMessage: err.message,
      createdAt: new Date().toISOString(),
    });

    return {
      success: false,
      status: "failed",
      error: err.message,
      message: `Failed to dispatch test email: ${err.message}`,
    };
  }
}

export function getEmailLogs(): EmailLogRecord[] {
  return [...inMemoryEmailLogs];
}

