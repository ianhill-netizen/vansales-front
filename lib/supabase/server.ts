import { createClient } from "@supabase/supabase-js";

/** Returns a service-role Supabase client, or null if env vars are not set. */
export function createServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
