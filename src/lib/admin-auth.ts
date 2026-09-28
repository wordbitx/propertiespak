import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "estatewx_admin";
const SECRET = process.env.SESSION_SECRET ?? "estatewx-dev-session-secret";

/** Single admin password. Set ADMIN_PASSWORD in production. */
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "estatewx2026";
export const IS_DEFAULT_ADMIN_PASSWORD = !process.env.ADMIN_PASSWORD;

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(`admin:${value}`).digest("hex").slice(0, 32);
}

export function verifyAdminPassword(password: string): boolean {
  const a = Buffer.from(password);
  const b = Buffer.from(ADMIN_PASSWORD);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function createAdminSession() {
  const token = `1.${sign("1")}`;
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const [rawId, signature] = token.split(".");
  if (rawId !== "1" || !signature) return false;
  return sign(rawId) === signature;
}
