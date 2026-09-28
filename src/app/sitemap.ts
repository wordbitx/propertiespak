import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { getAllPostSlugs, getAllProjectSlugs, getAllPropertySlugs, getCities } from "@/lib/queries";
import { getAllLandingSlugs, getAllSocietySlugs } from "@/lib/landing-pages";
import { getAllKeywordLandingSlugs } from "@/lib/keyword-landings";

export const dynamic = "force-dynamic";

/** Only real, curated, indexable URLs. Filter and utility pages are excluded. */
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/properties", priority: 0.9, changeFrequency: "daily" },
  { path: "/properties/for-sale", priority: 0.9, changeFrequency: "daily" },
  { path: "/properties/for-rent", priority: 0.9, changeFrequency: "daily" },
  { path: "/properties/commercial", priority: 0.8, changeFrequency: "weekly" },
  { path: "/properties/new-projects", priority: 0.8, changeFrequency: "weekly" },
  { path: "/commercial", priority: 0.8, changeFrequency: "weekly" },
  { path: "/projects", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/keywords-for-pakistan", priority: 0.9, changeFrequency: "weekly" },
  { path: "/tools", priority: 0.7, changeFrequency: "monthly" },
  { path: "/tools/mortgage-calculator", priority: 0.7, changeFrequency: "monthly" },
  { path: "/tools/affordability-calculator", priority: 0.7, changeFrequency: "monthly" },
  { path: "/tools/rental-yield-calculator", priority: 0.7, changeFrequency: "monthly" },
  { path: "/tools/roi-calculator", priority: 0.7, changeFrequency: "monthly" },
  { path: "/tools/investment-calculator", priority: 0.7, changeFrequency: "monthly" },
  { path: "/tools/construction-cost-calculator", priority: 0.7, changeFrequency: "monthly" },
  { path: "/tools/property-tax-calculator", priority: 0.7, changeFrequency: "monthly" },
  { path: "/tools/rent-vs-buy-calculator", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/list-property", priority: 0.7, changeFrequency: "monthly" },
  { path: "/sitemap", priority: 0.8, changeFrequency: "daily" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const base: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE.url}${route.path === "/" ? "" : route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const landing: MetadataRoute.Sitemap = [
    ...getAllLandingSlugs(),
    ...getAllKeywordLandingSlugs(),
  ].map((slug) => ({
    url: `${SITE.url}/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const society: MetadataRoute.Sitemap = getAllSocietySlugs().map((slug) => ({
    url: `${SITE.url}/property-for-sale/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  try {
    const [properties, projects, posts, cities] = await Promise.all([
      getAllPropertySlugs(),
      getAllProjectSlugs(),
      getAllPostSlugs(),
      getCities(),
    ]);

    return [
      ...base,
      ...landing,
      ...society,
      ...cities.map((item) => ({
        url: `${SITE.url}/city/${item.slug}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
      ...properties.map((item) => ({
        url: `${SITE.url}/property/${item.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.75,
      })),
      ...projects.map((item) => ({
        url: `${SITE.url}/projects/${item.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...posts.map((item) => ({
        url: `${SITE.url}/blog/${item.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return [...base, ...landing, ...society];
  }
}
