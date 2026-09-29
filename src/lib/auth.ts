import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { users, type User } from "@/db/schema";
import { buildProfileSlug, hashPassword, verifyPassword } from "@/lib/password";
import { sessionCookieOptions } from "@/lib/session-cookie";

const COOKIE_NAME = "estatewx_session";
const SECRET = process.env.SESSION_SECRET ?? "estatewx-dev-session-secret";

export { hashPassword, verifyPassword };

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("hex").slice(0, 32);
}

export async function createSession(userId: number) {
  const token = `${userId}.${sign(String(userId))}`;
  const store = await cookies();
  store.set(COOKIE_NAME, token, await sessionCookieOptions(60 * 60 * 24 * 30));
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSessionUserId(): Promise<number | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [rawId, signature] = token.split(".");
  if (!rawId || !signature) return null;
  if (sign(rawId) !== signature) return null;
  const id = Number(rawId);
  return Number.isFinite(id) ? id : null;
}

export async function getSessionUser(): Promise<User | null> {
  const id = await getSessionUserId();
  if (!id) return null;
  await ensureSeeded();
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

export type AuthResult = { ok: true; userId: number } | { ok: false; error: string };

export async function registerUser(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
  citySlug?: string;
  cityName?: string;
  agency?: string;
}): Promise<AuthResult> {
  await ensureSeeded();
  const email = input.email.trim().toLowerCase();
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) return { ok: false, error: "An account with this email already exists. Please sign in." };
  if (input.password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
  const name = input.name.trim() || "Properties Pak Member";
  const inserted = await db
    .insert(users)
    .values({
      name,
      email,
      phone: input.phone.trim(),
      passwordHash: hashPassword(input.password),
      slug: buildProfileSlug(name),
      role: "member",
      citySlug: input.citySlug ?? "",
      cityName: input.cityName ?? "",
      agency: input.agency ?? "",
      whatsapp: input.phone.trim(),
    })
    .returning({ id: users.id });
  const userId = inserted[0]?.id;
  if (!userId) return { ok: false, error: "Could not create your account. Please try again." };
  await createSession(userId);
  return { ok: true, userId };
}

export async function loginUser(emailInput: string, password: string): Promise<AuthResult> {
  await ensureSeeded();
  const email = emailInput.trim().toLowerCase();
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { ok: false, error: "Incorrect email or password." };
  }
  await createSession(user.id);
  return { ok: true, userId: user.id };
}
