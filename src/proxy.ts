import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

/**
 * Next 16 "proxy" (formerly middleware). Runs before every matched route:
 * refreshes the Supabase session cookies and redirects signed-out users to
 * /login. See src/lib/supabase/proxy.ts.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Everything except Next internals and static assets. /login is matched too
  // (so a signed-in user is bounced off it); updateSession() decides what is
  // public.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
