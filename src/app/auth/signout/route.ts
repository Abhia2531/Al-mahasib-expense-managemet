import { NextResponse, type NextRequest } from "next/server";

import { getServerSupabase } from "@/lib/supabase/server";

/**
 * POST /auth/signout — ends the session and returns to /login.
 *
 * POST-only and same-origin only, so a cross-site page cannot force a
 * sign-out (and GET prefetch cannot trigger it either).
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return new NextResponse("Bad origin", { status: 403 });
  }

  const supabase = await getServerSupabase();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
