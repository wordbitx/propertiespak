import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Password hashing shared by visitor accounts and the account created when a
 * signed-out owner publishes a listing. Kept in its own module so seeds and
 * route handlers can use it without importing the cookie-aware session code.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

/** URL-safe profile slug with a short random suffix so names never collide. */
export function buildProfileSlug(name: string, suffix?: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const tail = suffix ?? randomBytes(3).toString("hex");
  return `${base || "member"}-${tail}`;
}
