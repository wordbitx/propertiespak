import { getAllSocietySlugs } from "@/lib/landing-pages";
import { getAllTownSlugs } from "@/lib/towns";
import { renderUrlSet, xmlResponse } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";

/** Society and town guide pages (DHA, Bahria Town, Lake City, Gulberg, …). */
export async function GET() {
  return xmlResponse(
    renderUrlSet(
      [...getAllSocietySlugs(), ...getAllTownSlugs()].map((slug) => ({
        path: `/property-for-sale/${slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.85,
      })),
    ),
  );
}
