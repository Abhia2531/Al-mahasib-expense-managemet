import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { getServerSupabase } from "@/lib/supabase/server";

/**
 * Defence in depth. The middleware already blocks unauthenticated requests,
 * but every page, layout and Server Action also calls one of these — so a
 * route added later without a middleware match is still not wide open. And
 * RLS behind them means even a missed check returns nothing.
 */

/** The signed-in user, or null. Cached per request. */
export const getUser = cache(async (): Promise<User | null> => {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
});

/** The signed-in user, or redirect to /login. Use this in pages/layouts. */
export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * For Server Actions: throws instead of redirecting (a redirect mid-action
 * is swallowed as a form error). The action returns a normal failure state.
 */
export async function requireUserInAction(): Promise<User> {
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
