import { renderSitemapIndex, xmlResponse } from "@/lib/sitemap-xml";
import { getSitemapRegistry } from "@/lib/sitemap-registry";

export const dynamic = "force-dynamic";

export async function GET() {
  return xmlResponse(
    renderSitemapIndex(
      getSitemapRegistry()
        .filter((entry) => entry.path !== "/sitemap-index.xml")
        .map((entry) => entry.path),
    ),
  );
}
