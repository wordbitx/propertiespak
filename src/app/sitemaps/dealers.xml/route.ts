import { getAllDealerSlugs } from "@/lib/queries";
import { renderUrlSet, xmlResponse, type SitemapEntry } from "@/lib/sitemap-xml";
import { TOWNS } from "@/lib/towns";

export const dynamic = "force-dynamic";

/**
 * Public dealer profiles plus the town directory. Only accounts that actually
 * publish property have a profile, so every URL here has real content.
 */
export async function GET() {
  let dealerEntries: SitemapEntry[] = [];
  try {
    const dealers = await getAllDealerSlugs();
    dealerEntries = dealers
      .filter((dealer) => dealer.slug)
      .map((dealer) => ({
        path: `/dealers/${dealer.slug}`,
        lastModified: dealer.updatedAt instanceof Date ? dealer.updatedAt : new Date(),
        changeFrequency: "weekly" as const,
        priority: dealer.verified ? 0.8 : 0.6,
      }));
  } catch {
    dealerEntries = [];
  }

  const citySlugs = Array.from(new Set(TOWNS.map((town) => town.citySlug)));

  return xmlResponse(
    renderUrlSet([
      { path: "/dealers", changeFrequency: "daily", priority: 0.9 },
      ...dealerEntries,
      { path: "/towns", changeFrequency: "weekly", priority: 0.9 },
      ...citySlugs.map((city) => ({
        path: `/towns/${city}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ]),
  );
}
