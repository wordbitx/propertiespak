import { SITE } from "@/lib/constants";

export type SitemapEntry = {
  path: string;
  lastModified?: Date | string;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE.url}${path === "/" ? "" : path.startsWith("/") ? path : `/${path}`}`;
}

export function renderUrlSet(entries: SitemapEntry[]): string {
  const seen = new Set<string>();
  const rows = entries
    .filter((entry) => {
      const url = absoluteUrl(entry.path);
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    })
    .map((entry) => {
      const lastmod = entry.lastModified
        ? new Date(entry.lastModified).toISOString()
        : new Date().toISOString();
      return [
        "<url>",
        `<loc>${escapeXml(absoluteUrl(entry.path))}</loc>`,
        `<lastmod>${lastmod}</lastmod>`,
        entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : "",
        typeof entry.priority === "number" ? `<priority>${entry.priority.toFixed(1)}</priority>` : "",
        "</url>",
      ]
        .filter(Boolean)
        .join("");
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${rows}</urlset>`;
}

export function renderSitemapIndex(paths: string[]): string {
  const lastmod = new Date().toISOString();
  const rows = [...new Set(paths)]
    .map(
      (path) =>
        `<sitemap><loc>${escapeXml(absoluteUrl(path))}</loc><lastmod>${lastmod}</lastmod></sitemap>`,
    )
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${rows}</sitemapindex>`;
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
