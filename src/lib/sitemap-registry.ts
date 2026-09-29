import { CITY_MARKETS } from "@/lib/landing-pages";

export type SitemapDescriptor = { path: string; label: string; group: "primary" | "topic" | "city" };

/** Every sitemap file the platform publishes — single source for the index, robots and directory. */
export function getSitemapRegistry(): SitemapDescriptor[] {
  return [
    { path: "/sitemap-index.xml", label: "Sitemap index (submit this first)", group: "primary" },
    { path: "/sitemap.xml", label: "Complete master sitemap", group: "primary" },
    { path: "/sitemaps/pages.xml", label: "Core pages, tools & city hubs", group: "topic" },
    { path: "/sitemaps/pakistan.xml", label: "Pakistan-wide & intent landing pages", group: "topic" },
    { path: "/sitemaps/keywords.xml", label: "Keyword hub, city & society landings", group: "topic" },
    { path: "/sitemaps/cities.xml", label: "City hubs + sale/rent landings", group: "topic" },
    { path: "/sitemaps/societies.xml", label: "Society & area guides", group: "topic" },
    { path: "/sitemaps/properties.xml", label: "Individual property listings", group: "topic" },
    { path: "/sitemaps/projects.xml", label: "New housing projects", group: "topic" },
    { path: "/sitemaps/blog.xml", label: "Blog & property guides", group: "topic" },
    { path: "/sitemaps/tools.xml", label: "Investment calculators", group: "topic" },
    ...CITY_MARKETS.map((city) => ({
      path: `/sitemaps/city/${city.slug}.xml`,
      label: `${city.name} — all pages & listings`,
      group: "city" as const,
    })),
  ];
}
