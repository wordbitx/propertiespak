import { NextResponse, type NextRequest } from "next/server";
import { completeGoogleSignIn, resolveOrigin } from "@/lib/google-oauth";
import { signInWithGoogle } from "@/lib/auth";

/**
 * Where Google sends the user back. Verifies the state token and the id_token,
 * finds or creates the matching account, and writes the same session cookie a
 * password sign-in writes — so the rest of the app needs no changes.
 */
export const dynamic = "force-dynamic";

/** Bounce back to the login page with a message the existing form already renders. */
function fail(origin: string, reason: string): NextResponse {
  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(reason)}`, origin), 303);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  // From the Host header, not `nextUrl.origin`: the latter reports the address
  // the server is bound to (0.0.0.0 in dev) and is not routable in a browser.
  const origin = await resolveOrigin();

  const error = params.get("error");
  if (error) {
    // `access_denied` is what Google sends when the user backs out of consent.
    const reason =
      error === "access_denied"
        ? "Google sign-in was cancelled."
        : "Google sign-in failed. Please try again.";
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(reason)}`, origin), 303);
  }

  const code = params.get("code");
  const state = params.get("state");
  if (!code || !state) {
    return fail(origin, "Google sign-in was incomplete. Please try again.");
  }

  const result = await completeGoogleSignIn(code, state);
  if (!result.ok) {
    return fail(origin, result.error);
  }

  const session = await signInWithGoogle(result.profile);
  if (!session.ok) {
    return fail(origin, session.error);
  }
  return NextResponse.redirect(new URL(result.returnTo, origin), 303);
}
