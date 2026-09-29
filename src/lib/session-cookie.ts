import { headers } from "next/headers";
import { SITE } from "@/lib/constants";

/**
 * Session cookie attributes for the admin and visitor sessions.
 *
 * Sessions default to `SameSite=Lax`, which browsers silently drop when the app
 * is rendered inside a cross-site frame — for example the sandboxed live
 * preview (`https://<port>-<id>.e2b.app` embedded in the workspace) or a Vercel
 * preview URL. The password check still passes, the `Set-Cookie` response is
 * sent, but the cookie is never stored, so the very next request redirects back
 * to the sign-in page and the login looks broken.
 *
 * When the app is served from a host other than its own canonical domain we
 * therefore issue `SameSite=None; Secure` plus CHIPS (`Partitioned`) so the
 * session also survives in cross-site frames and under third-party cookie
 * restrictions. Plain HTTP development on localhost keeps `Lax`.
 */
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0", "host.docker.internal"]);

function hostnameOf(host: string): string {
  return host.replace(/:\d+$/, "").replace(/^\[|\]$/g, "").toLowerCase();
}

function isLocalHostname(hostname: string): boolean {
  if (LOCAL_HOSTNAMES.has(hostname) || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    return true;
  }
  return /^(10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname);
}

export type SessionCookieOptions = {
  httpOnly: true;
  path: "/";
  maxAge: number;
  sameSite: "lax" | "none";
  secure: boolean;
  partitioned?: boolean;
};

export async function sessionCookieOptions(maxAge: number): Promise<SessionCookieOptions> {
  const requestHeaders = await headers();
  const hostname = hostnameOf(requestHeaders.get("host") ?? "");
  const forwardedProto = (requestHeaders.get("x-forwarded-proto") ?? "").split(",")[0].trim().toLowerCase();
  const canonicalHostname = hostnameOf(new URL(SITE.url).host);

  const isCanonicalHost = hostname === canonicalHostname || hostname === `www.${canonicalHostname}`;
  const isLocal = isLocalHostname(hostname);
  // Preview/proxy hosts (and truly remote hosts in production) are served over TLS.
  const crossSiteFrame = !isCanonicalHost && !isLocal;
  const secure =
    crossSiteFrame || forwardedProto === "https" || process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    path: "/",
    maxAge,
    sameSite: crossSiteFrame ? "none" : "lax",
    secure,
    ...(crossSiteFrame ? { partitioned: true } : {}),
  };
}
