"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/types";
import { readPublicEnv } from "@/lib/supabase/env";

/**
 * Browser Supabase client. Used only by the login form, to call
 * `signInWithPassword` and let `@supabase/ssr` set the session cookies.
 *
 * It uses the publishable (anon) key, which is meant to ship to the browser.
 * All data access still happens server-side, under RLS.
 */
let browserClient: SupabaseClient<Database> | undefined;

export function getBrowserSupabase(): SupabaseClient<Database> {
  if (!browserClient) {
    const { url, key } = readPublicEnv();
    browserClient = createBrowserClient<Database>(url, key);
  }
  return browserClient;
}
