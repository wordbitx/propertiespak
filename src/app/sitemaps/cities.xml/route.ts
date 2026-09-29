import { getCities } from "@/lib/queries";
import { CITY_MARKETS } from "@/lib/landing-pages";
import { renderUrlSet, xmlResponse, type SitemapEntry } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";

/** City hubs plus every city-level sale / rent landing page. */
export async function GET() {
  const cities = await getCities();
  const slugs = new Set<string>([...cities.map((city) => city.slug), ...CITY_MARKETS.map((city) => city.slug)]);
  const entries: SitemapEntry[] = [];
  for (const slug of slugs) {
    entries.push({ path: `/city/${slug}`, changeFrequency: "daily", priority: 0.85 });
    entries.push({ path: `/property-for-sale-in-${slug}`, changeFrequency: "weekly", priority: 0.9 });
    entries.push({ path: `/property-for-rent-in-${slug}`, changeFrequency: "weekly", priority: 0.85 });
  }
  return xmlResponse(renderUrlSet(entries));
}
