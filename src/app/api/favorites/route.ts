import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getFavoritePropertiesForUser, toggleFavorite, addFavorite } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  const items = await getFavoritePropertiesForUser(userId);
  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  try {
    const body = (await request.json()) as { propertyId?: number; merge?: number[] };
    if (Array.isArray(body.merge)) {
      for (const id of body.merge.slice(0, 200)) {
        if (Number.isFinite(id) && id > 0) await addFavorite(userId, id);
      }
      const items = await getFavoritePropertiesForUser(userId);
      return NextResponse.json({ ok: true, merged: body.merge.length, items });
    }
    if (!body.propertyId || !Number.isFinite(body.propertyId)) {
      return NextResponse.json({ ok: false, error: "propertyId is required" }, { status: 400 });
    }
    const saved = await toggleFavorite(userId, body.propertyId);
    return NextResponse.json({ ok: true, saved });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not update favourites" }, { status: 500 });
  }
}
