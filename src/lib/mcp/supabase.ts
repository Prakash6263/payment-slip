import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Anon-scoped client for MCP tools. This app's public tables already allow
// anon CRUD, so no admin key is used — a public MCP call is bounded by RLS
// exactly like the app itself.
export function getMcpSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase env not configured");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}