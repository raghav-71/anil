// Supabase Edge Function: send-whatsapp-notification
// Sends transactional notifications via Meta WhatsApp Business Cloud API (WhatsApp Coexistence)
// Recipient: Anil Communications Owner (+91 9380124254)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  eventType: string;
  recipientNumber?: string;
  templateName?: string;
  languageCode?: string;
  components?: any[];
  fallbackText?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const ownerNumber = Deno.env.get("WHATSAPP_OWNER_NUMBER") || "919380124254";
    const apiVersion = Deno.env.get("WHATSAPP_API_VERSION") || "v21.0";

    if (!accessToken || !phoneNumberId) {
      return new Response(
        JSON.stringify({
          success: false,
          status: "skipped_not_configured",
          message: "WhatsApp Business Cloud API credentials not configured in Supabase secrets.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const body: NotificationPayload = await req.json();
    const recipient = body.recipientNumber || ownerNumber;

    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

    // Construct Meta WhatsApp Cloud API body
    let requestPayload: any;

    if (body.templateName) {
      requestPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "template",
        template: {
          name: body.templateName,
          language: { code: body.languageCode || "en" },
          components: body.components || [],
        },
      };
    } else {
      // Freeform text message (applicable within 24hr service window or Coexistence session)
      requestPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "text",
        text: {
          preview_url: false,
          body: body.fallbackText || `Anil Communications Notification: ${body.eventType}`,
        },
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          status: "failed",
          error: data.error?.message || "WhatsApp Cloud API request failed",
          details: data,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: "sent",
        messageId: data.messages?.[0]?.id,
        data,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        status: "failed",
        error: err.message || "Internal server error in WhatsApp Edge Function",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

