import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = match[2] || "";
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[match[1]] = val.trim();
  }
}

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function checkRpc() {
  // Test if an exec_sql or similar rpc exists
  const rpcs = ["exec_sql", "execute_sql", "run_sql", "query"];
  for (const r of rpcs) {
    const { data, error } = await sb.rpc(r, { sql: "SELECT 1;" });
    console.log(`RPC '${r}':`, error ? error.message : "EXISTS!");
  }
}

checkRpc();

