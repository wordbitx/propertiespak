import { getAllKeywordLandingSlugs } from "@/lib/keyword-landings";
import { renderUrlSet, xmlResponse } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";

/** Pakistan-wide, property-type and investment intent landing pages plus the keyword hub. */
export async function GET() {
  return xmlResponse(
    renderUrlSet([
      { path: "/keywords-for-pakistan", changeFrequency: "weekly", priority: 0.9 },
      { path: "/property-investment-in-pakistan", changeFrequency: "monthly", priority: 0.9 },
      ...getAllKeywordLandingSlugs().map((slug) => ({
        path: `/${slug}`,
        changeFrequency: "weekly" as const,
        priority: slug.includes("pakistan") ? 0.9 : 0.85,
      })),
    ]),
  );
}
