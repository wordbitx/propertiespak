import { randomBytes, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { SITE } from "@/lib/constants";
import { sessionCookieOptions } from "@/lib/session-cookie";

/**
 * Google sign-in, built on plain OAuth 2.0 / OpenID Connect.
 *
 * The app already runs its own session (an HMAC-signed cookie written by
 * `createSession` in `src/lib/auth.ts`), so this module deliberately does not
 * pull in an OAuth framework. It only does the two things a provider handshake
 * needs: send the user to Google with a CSRF token, then swap the code that
 * comes back for a verified identity. Signing the resulting user in is left to
 * `signInWithGoogle` in `src/lib/auth.ts`, so everything downstream — the
 * shortlist, saved searches, the account dashboard — works unchanged.
 *
 * Flow
 *   1. `GET /api/auth/google`            → builds the Google URL and redirects.
 *   2. Google shows consent, then returns to `/api/auth/google/callback`.
 *   3. `GET /api/auth/google/callback`   → checks the state, exchanges the code
 *                                          for tokens, reads the id_token, and
 *                                          hands the profile to the session.
 */

const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

/** Cookie that ties the redirect to the callback so a CSRF attempt can't ride along. */
const STATE_COOKIE = "estatewx_google_state";
/** Ten minutes is plenty for a consent screen, and short enough to limit replay. */
const STATE_MAX_AGE = 600;

export type GoogleProfile = {
  /** Google's stable subject id — the only value we match an account on. */
  sub: string;
  email: string;
  /** Google confirms it, not the user, controls this mailbox. */
  emailVerified: boolean;
  name: string;
  picture?: string;
};

function base64Url(buffer: Buffer): string {
  return buffer.toString("base64url");
}

function clientId(): string {
  return process.env.GOOGLE_CLIENT_ID ?? "";
}

function clientSecret(): string {
  return process.env.GOOGLE_CLIENT_SECRET ?? "";
}

/** True once both credentials are configured, so the UI can hide the button. */
export function isGoogleSignInConfigured(): boolean {
  return Boolean(clientId() && clientSecret());
}

/**
 * Absolute origin for this deployment, read from the request headers rather
 * than from `nextUrl.origin`, which reports the address the server is bound to
 * (`0.0.0.0` in dev) and is not routable from a browser. `x-forwarded-host`
 * takes precedence because that is what Vercel and other proxies set.
 */
export async function resolveOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
  const proto =
    requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (process.env.NODE_ENV === "production" ? "https" : "http");
  return host ? `${proto}://${host}` : SITE.url;
}

/**
 * Absolute URL Google must send the user back to. `GOOGLE_REDIRECT_URI`
 * overrides the derived value when a single fixed origin must be used (Google
 * only accepts pre-registered URIs anyway).
 */
async function redirectUri(): Promise<string> {
  const configured = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (configured) return configured;
  return new URL("/api/auth/google/callback", await resolveOrigin()).toString();
}

function authorizeUrl(redirectUriValue: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUriValue,
    response_type: "code",
    scope: "openid email profile",
    // Ask Google to render the chooser every time, so a shared computer does
    // not silently reuse the previous person's session.
    prompt: "select_account",
    state,
  });
  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

/**
 * Starts the handshake: remembers the state token and redirects to Google.
 * Called from `GET /api/auth/google`.
 */
export async function startGoogleSignIn(returnTo?: string): Promise<Response> {
  if (!isGoogleSignInConfigured()) {
    return new Response("Google sign-in is not configured.", { status: 503 });
  }
  const state = base64Url(randomBytes(32));
  const options = await sessionCookieOptions(STATE_MAX_AGE);
  const store = await cookies();
  // `SameSite` mirrors the session cookie: `None` + `Partitioned` on preview
  // hosts so the cookie survives coming back from a cross-site redirect.
  store.set(STATE_COOKIE, state, { ...options, httpOnly: true });

  // Where to land after a successful sign-in. Kept in the cookie rather than
  // the URL so a third party cannot bounce the user to an external site.
  if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
    store.set("estatewx_google_return", returnTo, { ...options, httpOnly: true });
  }
  return Response.redirect(authorizeUrl(await redirectUri(), state), 302);
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** Reads and clears the one-shot state cookie. */
async function consumeStateCookie(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(STATE_COOKIE)?.value ?? null;
  if (value) store.delete(STATE_COOKIE);
  return value;
}

async function consumeReturnTo(): Promise<string> {
  const store = await cookies();
  const value = store.get("estatewx_google_return")?.value ?? "/account";
  store.delete("estatewx_google_return");
  return value.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

/** Decodes the payload of a JWT without verifying it — the signature is checked by Google itself. */
function decodeJwtPayload(token: string): Record<string, unknown> {
  const [, payload] = token.split(".");
  if (!payload) throw new Error("Malformed id_token.");
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
}

/**
 * Exchanges the authorisation code for a verified profile.
 *
 * The id_token is signed by Google and fetched straight from Google's token
 * endpoint over TLS, so it is trusted without local key handling. `iss`,
 * `aud` and `exp` are checked because a token minted for a different client or
 * a different issuer must never be able to open a session here.
 */
export async function completeGoogleSignIn(
  code: string,
  state: string,
): Promise<{ ok: true; profile: GoogleProfile; returnTo: string } | { ok: false; error: string }> {
  const expectedState = await consumeStateCookie();
  if (!expectedState || !safeEqual(expectedState, state)) {
    return { ok: false, error: "Sign-in session expired. Please try again." };
  }

  const body = new URLSearchParams({
    code,
    client_id: clientId(),
    client_secret: clientSecret(),
    redirect_uri: await redirectUri(),
    grant_type: "authorization_code",
  });

  let response: Response;
  try {
    response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
    });
  } catch {
    // A DNS or TLS failure must read as "try again", not as a crash.
    return { ok: false, error: "Could not reach Google. Please try again." };
  }
  if (!response.ok) {
    return { ok: false, error: "Google could not verify the sign-in. Please try again." };
  }

  const token = (await response.json()) as { id_token?: string };
  if (!token.id_token) {
    return { ok: false, error: "Google did not return an identity. Please try again." };
  }

  const claims = decodeJwtPayload(token.id_token);
  const now = Math.floor(Date.now() / 1000);
  if (typeof claims.exp === "number" && claims.exp < now) {
    return { ok: false, error: "Sign-in session expired. Please try again." };
  }
  if (claims.iss !== "https://accounts.google.com" && claims.iss !== "accounts.google.com") {
    return { ok: false, error: "Unexpected sign-in provider. Please try again." };
  }
  if (claims.aud !== clientId()) {
    return { ok: false, error: "Sign-in was not issued for this site. Please try again." };
  }

  const sub = typeof claims.sub === "string" ? claims.sub : "";
  const email = typeof claims.email === "string" ? claims.email.toLowerCase() : "";
  if (!sub || !email) {
    return { ok: false, error: "Google did not share an email address." };
  }

  return {
    ok: true,
    profile: {
      sub,
      email,
      emailVerified: claims.email_verified === true || claims.email_verified === "true",
      name: typeof claims.name === "string" && claims.name.trim() ? claims.name.trim() : email,
      picture: typeof claims.picture === "string" ? claims.picture : undefined,
    },
    returnTo: await consumeReturnTo(),
  };
}
