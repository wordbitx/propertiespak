import { getCities } from "@/lib/queries";
import { renderUrlSet, xmlResponse, type SitemapEntry } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";

const CORE_PAGES = [
  "/",
  "/properties",
  "/properties/for-sale",
  "/properties/for-rent",
  "/properties/commercial",
  "/properties/new-projects",
  "/commercial",
  "/projects",
  "/blog",
  "/tools",
  "/tools/mortgage-calculator",
  "/tools/affordability-calculator",
  "/tools/rental-yield-calculator",
  "/tools/roi-calculator",
  "/tools/investment-calculator",
  "/tools/construction-cost-calculator",
  "/tools/property-tax-calculator",
  "/tools/rent-vs-buy-calculator",
  "/about",
  "/contact",
  "/list-property",
  "/sitemap",
];

export async function GET() {
  const cities = await getCities();
  const entries: SitemapEntry[] = [
    ...CORE_PAGES.map((path) => ({
      path,
      changeFrequency: path === "/" || path.startsWith("/properties") ? ("daily" as const) : ("weekly" as const),
      priority: path === "/" ? 1 : path.startsWith("/properties") ? 0.9 : 0.7,
    })),
    ...cities.map((city) => ({
      path: `/city/${city.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
  return xmlResponse(renderUrlSet(entries));
}
