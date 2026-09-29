import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { updateDealerProfile, type DealerProfileInput } from "@/lib/queries";
import { invalidateCatalog } from "@/lib/cache";

export const dynamic = "force-dynamic";

type TextField = Exclude<keyof DealerProfileInput, "markComplete" | "requestVerification">;

const LIMITS: Partial<Record<TextField, number>> = {
  name: 120,
  whatsapp: 32,
  bio: 600,
  experience: 160,
  areas: 300,
  avatarUrl: 500,
  agency: 160,
  designation: 120,
  officeAddress: 300,
  companyPhone: 32,
  companyWebsite: 300,
  companyLogo: 500,
  verificationNote: 600,
};

function optionalUrl(value: string) {
  if (!value) return true;
  return /^https?:\/\//i.test(value) || value.startsWith("/");
}

/**
 * Saves the signed-in account's professional profile — the dashboard form and
 * the first-login setup popup both post here. `{ markComplete: true }` records
 * the profile as finished; `{ requestVerification: true }` puts the account in
 * the admin verification queue.
 */
export async function PATCH(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const input: DealerProfileInput = {};
  for (const [key, limit] of Object.entries(LIMITS) as [TextField, number][]) {
    const value = body[key];
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed.length > limit) {
      return NextResponse.json({ ok: false, error: `${key} is too long (max ${limit} characters).` }, { status: 400 });
    }
    input[key] = trimmed;
  }

  if (typeof input.companyWebsite === "string" && input.companyWebsite && !optionalUrl(input.companyWebsite)) {
    return NextResponse.json(
      { ok: false, error: "Enter the company website as a full URL, for example https://example.com." },
      { status: 400 },
    );
  }
  if (typeof input.name === "string" && input.name.length < 2) {
    return NextResponse.json({ ok: false, error: "Please enter your full name." }, { status: 400 });
  }
  if (input.markComplete && !(input.name && input.name.length >= 2)) {
    return NextResponse.json({ ok: false, error: "A name is required to complete the profile." }, { status: 400 });
  }

  input.markComplete = body.markComplete === true;
  input.requestVerification = body.requestVerification === true;

  try {
    const user = await updateDealerProfile(userId, input);
    if (user) invalidateCatalog();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
    }
    return NextResponse.json({
      ok: true,
      profile: {
        id: user.id,
        name: user.name,
        slug: user.slug,
        role: user.role,
        isVerified: user.isVerified,
        profileCompletedAt: user.profileCompletedAt,
        verificationRequestedAt: user.verificationRequestedAt,
      },
    });
  } catch (error) {
    console.error("profile update failed", error);
    return NextResponse.json({ ok: false, error: "Could not save your profile. Please try again." }, { status: 500 });
  }
}
