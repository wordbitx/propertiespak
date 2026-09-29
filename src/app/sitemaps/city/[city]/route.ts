import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { properties } from "@/db/schema";
import { CITY_BY_SLUG, SOCIETIES } from "@/lib/landing-pages";
import { getAllKeywordLandingSlugs } from "@/lib/keyword-landings";
import { renderUrlSet, xmlResponse, type SitemapEntry } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";

/** Per-city sitemap: /sitemaps/city/lahore.xml — everything Search Console needs for one market. */
export async function GET(_request: Request, { params }: { params: Promise<{ city: string }> }) {
  const { city: raw } = await params;
  const slug = raw.replace(/\.xml$/i, "").toLowerCase();
  if (!CITY_BY_SLUG.has(slug)) return NextResponse.json({ error: "Unknown city" }, { status: 404 });

  await ensureSeeded();
  const rows = await db.select({ slug: properties.slug }).from(properties).where(eq(properties.citySlug, slug));

  const entries: SitemapEntry[] = [
    { path: `/city/${slug}`, changeFrequency: "daily", priority: 0.9 },
    { path: `/property-for-sale-in-${slug}`, changeFrequency: "weekly", priority: 0.9 },
    { path: `/property-for-rent-in-${slug}`, changeFrequency: "weekly", priority: 0.85 },
    ...getAllKeywordLandingSlugs()
      .filter((item) => item.endsWith(`-in-${slug}`))
      .map((item) => ({ path: `/${item}`, changeFrequency: "weekly" as const, priority: 0.85 })),
    ...SOCIETIES.filter((society) => society.citySlug === slug).map((society) => ({
      path: `/property-for-sale/${society.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...rows.map((row) => ({ path: `/property/${row.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];

  return xmlResponse(renderUrlSet(entries));
}
