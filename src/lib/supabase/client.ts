import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rznnaukzdytgrhzfezqb.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6bm5hdWt6ZHl0Z3JoemZlenFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyOTQ3NDIsImV4cCI6MjEwOTg3MDc0Mn0.JdoG-YYKajSPczU3HQVO9BTCtwRPo8ypr3cOcMoWMQk";
const defaultServiceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6bm5hdWt6ZHl0Z3JoemZlenFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDI5NDc0MiwiZXhwIjoyMTA5ODcwNzQyfQ.XEVMaZ7-UpH2GmjUvIDSk-EnXJxUBqkbrtHiaoR9Brw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getServiceSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || defaultServiceRoleKey;
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

