/**
 * Reads the two **public** Supabase values. Both are safe in the browser
 * bundle by design:
 *
 *   NEXT_PUBLIC_SUPABASE_URL              - the project URL
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  - the anon/publishable key
 *
 * There is deliberately no secret / service-role key. All access is gated by
 * Supabase Auth + Row Level Security.
 *
 * `NEXT_PUBLIC_` vars are inlined at build time, so this works in Server and
 * Client Components alike. The fallbacks accept the older `ANON_KEY` name and
 * the non-prefixed names (handy for scripts / tests).
 */
export function readPublicEnv(): { url: string; key: string } {
  const url = pick(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_URL,
  );
  const key = pick(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.SUPABASE_PUBLISHABLE_KEY,
  );

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env (see .env.example), " +
        "then restart the dev server.",
    );
  }
  return { url, key };
}

export function isPublicEnvConfigured(): boolean {
  try {
    readPublicEnv();
    return true;
  } catch {
    return false;
  }
}

/** First non-empty value, trimmed (CRLF-safe for Windows .env files). */
function pick(...values: Array<string | undefined>): string {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}
