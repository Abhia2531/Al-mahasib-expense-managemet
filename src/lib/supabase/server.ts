import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/types";
import { readPublicEnv } from "@/lib/supabase/env";

/**
 * Request-scoped Supabase client for Server Components, Server Actions and
 * Route Handlers.
 *
 * It carries the signed-in user's session (from the auth cookies), so every
 * query runs **as that user** and Row Level Security decides what they can
 * touch. There is no service-role key anywhere in this app — access control
 * lives in the database (supabase/auth-policies.sql), not only in app code.
 *
 * `server-only` makes importing this from a Client Component a build error.
 */
export async function getServerSupabase(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();
  const { url, key } = readPublicEnv();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Server Components cannot write cookies; the middleware refreshes the
        // session instead. Swallow the error there, honour it in Actions.
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          /* called from a Server Component render — safe to ignore */
        }
      },
    },
  });
}
