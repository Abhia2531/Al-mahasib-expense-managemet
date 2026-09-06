import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { getServerSupabase } from "@/lib/supabase/server";

/**
 * Defence in depth. The proxy already blocks unauthenticated requests, but
 * every page, layout and Server Action also checks — so a route added later
 * without a proxy match still is not wide open, and RLS behind it returns
 * nothing anyway.
 *
 * The check uses `getClaims()`, which verifies the session JWT **locally**
 * with the project's public signing key (fetched once, then cached). For this
 * project's ES256 tokens that means no per-request network round-trip — the
 * old `getUser()` call to the auth server was ~500ms on every page render.
 */

export type SessionUser = { id: string; email: string | null };

/** The signed-in user, or null. Cached per request. */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return null;
  return {
    id: String(claims.sub),
    email: typeof claims.email === "string" ? claims.email : null,
  };
});

/** The signed-in user, or redirect to /login. Use this in pages/layouts. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * For Server Actions: throws instead of redirecting (a redirect mid-action
 * is swallowed as a form error). The action returns a normal failure state.
 */
export async function requireUserInAction(): Promise<SessionUser> {
  const user = await getUser();
  if (!user) throw new AuthRequiredError();
  return user;
}

export class AuthRequiredError extends Error {
  constructor() {
    super("Your session has expired. Reload the page and sign in again.");
    this.name = "AuthRequiredError";
  }
}
