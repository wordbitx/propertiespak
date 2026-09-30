import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { favorites, listingSubmissions, properties } from "@/db/schema";
import { getSessionUserId } from "@/lib/auth";
import { invalidateCatalog } from "@/lib/cache";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: PRIVATE_HEADERS });
}

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

/**
 * Owner-side listing control. Every handler proves ownership through the signed
 * session — `listed_by_user_id` only — so a listing whose published email
 * happens to match someone else's address can never be touched from here.
 */
async function ownedListing(id: number, userId: number) {
  const rows = await db
    .select({
      id: properties.id,
      slug: properties.slug,
      published: properties.published,
      listedByUserId: properties.listedByUserId,
    })
    .from(properties)
    .where(eq(properties.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return { error: "Listing not found." as const, status: 404 };
  if (row.listedByUserId !== userId) {
    return { error: "This listing belongs to another account." as const, status: 403 };
  }
  return { row };
}

/** Hide or restore a listing the signed-in owner published. */
export async function PATCH(request: Request, { params }: Params) {
  const userId = await getSessionUserId();
  if (!userId) return json({ ok: false, error: "Please sign in to manage your listings." }, 401);

  const id = parseId((await params).id);
  if (!id) return json({ ok: false, error: "Invalid listing reference." }, 400);

  try {
    const body = (await request.json()) as { action?: unknown };
    const action = body.action === "unpublish" ? "unpublish" : body.action === "publish" ? "publish" : null;
    if (!action) return json({ ok: false, error: "Action must be publish or unpublish." }, 400);

    await ensureSeeded();
    const owned = await ownedListing(id, userId);
    if ("error" in owned) return json({ ok: false, error: owned.error }, owned.status);

    const [updated] = await db
      .update(properties)
      .set({ published: action === "publish" })
      .where(and(eq(properties.id, id), eq(properties.listedByUserId, userId)))
      .returning({ id: properties.id, slug: properties.slug, published: properties.published });

    invalidateCatalog();
    return json({ ok: true, listing: updated });
  } catch (error) {
    console.error("owner listing visibility update failed", error);
    return json({ ok: false, error: "Could not update this listing. Please try again." }, 500);
  }
}

/** Permanently remove a listing the signed-in owner published. */
export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getSessionUserId();
  if (!userId) return json({ ok: false, error: "Please sign in to manage your listings." }, 401);

  const id = parseId((await params).id);
  if (!id) return json({ ok: false, error: "Invalid listing reference." }, 400);

  try {
    await ensureSeeded();
    const owned = await ownedListing(id, userId);
    if ("error" in owned) return json({ ok: false, error: owned.error }, owned.status);

    const deleted = await db
      .delete(properties)
      .where(and(eq(properties.id, id), eq(properties.listedByUserId, userId)))
      .returning({ id: properties.id });
    if (!deleted[0]) return json({ ok: false, error: "Listing not found." }, 404);

    // Shortlists and the approval record must not point at a row that is gone.
    await db.delete(favorites).where(eq(favorites.propertyId, id));
    await db.update(listingSubmissions).set({ propertyId: null }).where(eq(listingSubmissions.propertyId, id));

    invalidateCatalog();
    return json({ ok: true, deleted: deleted[0].id });
  } catch (error) {
    console.error("owner listing delete failed", error);
    return json({ ok: false, error: "Could not delete this listing. Please try again." }, 500);
  }
}
