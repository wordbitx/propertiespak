import type { NextRequest } from "next/server";
import { startGoogleSignIn } from "@/lib/google-oauth";

/**
 * Kicks off the Google handshake. Linked from the login page as
 * `/api/auth/google?returnTo=/account`; `returnTo` must be a site-relative path.
 *
 * Dynamic because it reads cookies and headers to build the redirect URI.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("returnTo") ?? "/account";
  return startGoogleSignIn(returnTo);
}
