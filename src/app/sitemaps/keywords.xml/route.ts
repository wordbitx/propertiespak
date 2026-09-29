import { getAllLandingSlugs, getAllSocietySlugs } from "@/lib/landing-pages";
import { getAllKeywordLandingSlugs } from "@/lib/keyword-landings";
import { getAllTownSlugs } from "@/lib/towns";
import { renderUrlSet, xmlResponse, type SitemapEntry } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";

export async function GET() {
  const entries: SitemapEntry[] = [
    { path: "/keywords-for-pakistan", changeFrequency: "weekly", priority: 0.9 },
    ...getAllLandingSlugs().map((slug) => ({
      path: `/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...getAllKeywordLandingSlugs().map((slug) => ({
      path: `/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...[...getAllSocietySlugs(), ...getAllTownSlugs()].map((slug) => ({
      path: `/property-for-sale/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
  return xmlResponse(renderUrlSet(entries));
}
