import { NextResponse } from "next/server";
import { and, eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { listingSubmissions } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: PRIVATE_HEADERS });
}

/**
 * Cancel a listing submission from the owner dashboard.
 *
 * A submission still in the review queue (or sent back by an admin) belongs to
 * the person who sent it and can be withdrawn. A submission that already
 * produced a live listing is kept as an approval record — the owner removes the
 * published listing itself instead, so the audit trail stays intact.
 */
export async function DELETE(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return json({ ok: false, error: "Please sign in to manage your submissions." }, 401);

  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id < 1) return json({ ok: false, error: "Invalid submission reference." }, 400);

  try {
    await ensureSeeded();
    const rows = await db
      .select({ id: listingSubmissions.id, status: listingSubmissions.status, propertyId: listingSubmissions.propertyId })
      .from(listingSubmissions)
      .where(
        and(
          eq(listingSubmissions.id, id),
          or(
            eq(listingSubmissions.userId, user.id),
            sql`lower(${listingSubmissions.email}) = lower(${user.email})`,
          ),
        ),
      )
      .limit(1);

    const submission = rows[0];
    if (!submission) return json({ ok: false, error: "Submission not found on this account." }, 404);
    if (submission.status === "approved" && submission.propertyId) {
      return json(
        { ok: false, error: "This submission is already live. Remove the published listing instead." },
        409,
      );
    }

    await db.delete(listingSubmissions).where(eq(listingSubmissions.id, submission.id));
    return json({ ok: true, deleted: submission.id });
  } catch (error) {
    console.error("owner submission delete failed", error);
    return json({ ok: false, error: "Could not remove this submission. Please try again." }, 500);
  }
}
