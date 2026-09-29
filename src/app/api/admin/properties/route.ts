import { NextResponse } from "next/server";
import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { properties } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { slugify, validatePropertyPayload } from "@/lib/property-input";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  await ensureSeeded();
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const where = q
    ? or(ilike(properties.title, `%${q}%`), ilike(properties.locationArea, `%${q}%`), ilike(properties.cityName, `%${q}%`), ilike(properties.slug, `%${q}%`))
    : undefined;

  const [items, totalRows] = await Promise.all([
    db.select().from(properties).where(where).orderBy(desc(properties.createdAt)).limit(200),
    db.select({ total: sql<number>`cast(count(*) as int)` }).from(properties).where(where),
  ]);
  return NextResponse.json({ ok: true, items, total: totalRows[0]?.total ?? items.length });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const validated = validatePropertyPayload(body);
    if (!validated.ok) return NextResponse.json({ ok: false, error: validated.error }, { status: 400 });

    await ensureSeeded();
    const base = slugify(`${validated.data.title} ${validated.data.locationArea} ${validated.data.cityName}`);
    let slug = base;
    for (let attempt = 2; attempt < 50; attempt += 1) {
      const clash = await db.select({ id: properties.id }).from(properties).where(eq(properties.slug, slug)).limit(1);
      if (clash.length === 0) break;
      slug = `${base}-${attempt}`;
    }

    const inserted = await db
      .insert(properties)
      .values({ ...validated.data, slug, views: 0 })
      .returning({ id: properties.id, slug: properties.slug });
    return NextResponse.json({ ok: true, property: inserted[0] });
  } catch (error) {
    console.error("admin create property failed", error);
    return NextResponse.json({ ok: false, error: "Could not create the property." }, { status: 500 });
  }
}
