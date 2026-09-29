import { getAllPropertySlugs } from "@/lib/queries";
import { renderUrlSet, xmlResponse } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";

export async function GET() {
  const properties = await getAllPropertySlugs();
  return xmlResponse(
    renderUrlSet(
      properties.map((property) => ({
        path: `/property/${property.slug}`,
        lastModified: property.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ),
  );
}
