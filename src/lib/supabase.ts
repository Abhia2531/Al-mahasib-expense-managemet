import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/types";

/**
 * Server-side Supabase client.
 *
 * This module imports `server-only`, so importing it from a Client Component
 * is a build error. That is the guardrail that keeps the secret key out of the
 * browser bundle: every read and write in this app goes through a Server
 * Component or a Server Action.
 *
 * The secret key bypasses Row Level Security. RLS is enabled on all tables
 * with no policies granted to `anon`, so the publishable key alone can read
 * nothing — see supabase/schema.sql.
 */

let client: SupabaseClient<Database> | null = null;

function readEnv(...names: string[]): string {
  for (const name of names) {
    const raw = process.env[name];
    // Values pasted into .env on Windows can carry a trailing \r from CRLF
    // line endings, which silently breaks the Authorization header.
    if (typeof raw === "string" && raw.trim()) return raw.trim();
  }
  return "";
}

/**
 * The URL is not secret, so the standard Supabase `NEXT_PUBLIC_SUPABASE_URL`
 * name is accepted as a fallback — that convention is easy to reach for and
 * renaming to it should not break the app.
 *
 * The secret key has NO such fallback on purpose: a `NEXT_PUBLIC_` name would
 * inline it into the browser bundle, so that spelling must simply not work.
 */
function readSupabaseUrl(): string {
  return readEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabase(): SupabaseClient<Database> {
  if (client) return client;

  const url = readSupabaseUrl();
  const secretKey = readEnv("SUPABASE_SECRET_KEY");

  if (!url || !secretKey) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY " +
        "in .env (see .env.example), then restart the dev server. " +
        "Note: SUPABASE_SECRET_KEY must not be renamed with a NEXT_PUBLIC_ prefix.",
    );
  }

  client = createClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "al-mahasib-finance" } },
  });

  return client;
}

/** True when both required environment variables are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(readSupabaseUrl() && readEnv("SUPABASE_SECRET_KEY"));
}
