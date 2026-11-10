-- Migration: WhatsApp Notifications, Customer Enquiries, and Settings
-- Anil Communications (+91 9380124254)

-- 1. WhatsApp Settings Table
CREATE TABLE IF NOT EXISTS whatsapp_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  owner_phone TEXT NOT NULL DEFAULT '919380124254',
  is_coexistence_connected BOOLEAN DEFAULT FALSE,
  notify_on_order BOOLEAN DEFAULT TRUE,
  notify_on_payment BOOLEAN DEFAULT TRUE,
  notify_on_enquiry BOOLEAN DEFAULT TRUE,
  notify_on_callback BOOLEAN DEFAULT TRUE,
  notify_on_cancellation BOOLEAN DEFAULT TRUE,
  notify_on_return BOOLEAN DEFAULT TRUE,
  notify_on_low_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings row if not exists
INSERT INTO whatsapp_settings (id, owner_phone, is_coexistence_connected)
VALUES ('primary', '919380124254', FALSE)
ON CONFLICT (id) DO NOTHING;

-- 2. Customer Enquiries Table
CREATE TABLE IF NOT EXISTS customer_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  product_of_interest TEXT,
  message TEXT NOT NULL,
  source TEXT DEFAULT 'website_contact',
  is_callback_requested BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved', 'spam')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_enquiries_phone ON customer_enquiries (phone);
CREATE INDEX IF NOT EXISTS idx_customer_enquiries_status ON customer_enquiries (status);

-- 3. WhatsApp Notification Logs Table
CREATE TABLE IF NOT EXISTS whatsapp_notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'order_created',
    'payment_verified',
    'enquiry_submitted',
    'callback_requested',
    'cancellation_requested',
    'return_requested',
    'low_stock_alert',
    'test_message'
  )),
  dedup_key TEXT UNIQUE,
  recipient_number TEXT NOT NULL DEFAULT '919380124254',
  template_name TEXT,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'sent',
    'failed',
    'skipped_not_configured',
    'duplicate_skipped'
  )),
  attempt_count INT DEFAULT 0,
  error_message TEXT,
  whatsapp_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_event ON whatsapp_notification_logs (event_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_status ON whatsapp_notification_logs (status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_dedup ON whatsapp_notification_logs (dedup_key);

