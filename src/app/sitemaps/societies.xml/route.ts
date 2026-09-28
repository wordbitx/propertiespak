import { getAllSocietySlugs } from "@/lib/landing-pages";
import { renderUrlSet, xmlResponse } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";

/** Society / area guide pages (DHA, Bahria Town, Gulberg, Clifton, …). */
export async function GET() {
  return xmlResponse(
    renderUrlSet(
      getAllSocietySlugs().map((slug) => ({
        path: `/property-for-sale/${slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.85,
      })),
    ),
  );
}
