import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { favorites, listingSubmissions, properties } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { validatePropertyPayload } from "@/lib/property-input";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ ok: false, error: "Invalid property id." }, { status: 400 });
  await ensureSeeded();
  const rows = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  if (!rows[0]) return NextResponse.json({ ok: false, error: "Property not found." }, { status: 404 });
  return NextResponse.json({ ok: true, property: rows[0] });
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ ok: false, error: "Invalid property id." }, { status: 400 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const validated = validatePropertyPayload(body);
    if (!validated.ok) return NextResponse.json({ ok: false, error: validated.error }, { status: 400 });

    await ensureSeeded();
    const updated = await db
      .update(properties)
      .set(validated.data)
      .where(eq(properties.id, id))
      .returning({ id: properties.id, slug: properties.slug });
    if (!updated[0]) return NextResponse.json({ ok: false, error: "Property not found." }, { status: 404 });
    return NextResponse.json({ ok: true, property: updated[0] });
  } catch (error) {
    console.error("admin update property failed", error);
    return NextResponse.json({ ok: false, error: "Could not update the property." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ ok: false, error: "Invalid property id." }, { status: 400 });

  try {
    await ensureSeeded();
    const deleted = await db.delete(properties).where(eq(properties.id, id)).returning({ id: properties.id });
    if (!deleted[0]) return NextResponse.json({ ok: false, error: "Property not found." }, { status: 404 });
    await db.delete(favorites).where(eq(favorites.propertyId, id));
    await db.update(listingSubmissions).set({ propertyId: null }).where(eq(listingSubmissions.propertyId, id));
    return NextResponse.json({ ok: true, deleted: id });
  } catch (error) {
    console.error("admin delete property failed", error);
    return NextResponse.json({ ok: false, error: "Could not delete the property." }, { status: 500 });
  }
}
