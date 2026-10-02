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
  if (!user) {
    return { ok: false, error: "Incorrect email or password." };
  }
  if (!user.passwordHash) {
    // The account exists but has no password, so it was created with Google.
    return {
      ok: false,
      error: "This account uses Google sign-in. Please continue with Google instead.",
    };
  }
  if (!verifyPassword(password, user.passwordHash)) {
    return { ok: false, error: "Incorrect email or password." };
  }
  await createSession(user.id);
  return { ok: true, userId: user.id };
}

/**
 * Finds the account behind a Google identity and signs it in.
 *
 * `users.email` is unique, so "find or create" has to decide what to do when
 * the mailbox is already taken:
 *
 *  - No account at all → create one. No password is stored, which is why
 *    `password_hash` is nullable.
 *  - An account already linked to this Google id → simply sign it in. This is
 *    the returning visitor path.
 *  - An account with this email but no Google link → link it, so the person's
 *    shortlist stays in one place instead of splitting across two accounts.
 *    Linking is only allowed when Google reports `email_verified`, because
 *    that is Google — not the person at the keyboard — confirming they own the
 *    mailbox. An unverified Google email is refused and the person is sent to
 *    the password form, which is the only other proof of ownership we accept.
 */
export async function signInWithGoogle(profile: {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
}): Promise<AuthResult> {
  await ensureSeeded();
  const email = profile.email.trim().toLowerCase();

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const existing = rows[0];

  if (existing) {
    if (existing.googleId && existing.googleId !== profile.sub) {
      // A different Google account already owns this Properties Pak account.
      return {
        ok: false,
        error: "This email is already linked to a different Google account. Please use that one to sign in.",
      };
    }
    if (existing.passwordHash && !profile.emailVerified) {
      return {
        ok: false,
        error: "Please sign in with your password first to link Google to this account.",
      };
    }

    await db
      .update(users)
      .set({
        googleId: profile.sub,
        // Fill in anything the account never had, without overwriting what the
        // owner may have already edited by hand.
        name: existing.name || profile.name,
        avatarUrl: existing.avatarUrl || profile.picture || "",
      })
      .where(eq(users.id, existing.id));
    await createSession(existing.id);
    return { ok: true, userId: existing.id };
  }

  const inserted = await db
    .insert(users)
    .values({
      name: profile.name,
      email,
      // No password: this account can only be opened with Google.
      passwordHash: null,
      googleId: profile.sub,
      slug: buildProfileSlug(profile.name),
      role: "member",
      avatarUrl: profile.picture ?? "",
    })
    .returning({ id: users.id });

  const userId = inserted[0]?.id;
  if (!userId) return { ok: false, error: "Could not sign you in with Google. Please try again." };
  await createSession(userId);
  return { ok: true, userId };
}
