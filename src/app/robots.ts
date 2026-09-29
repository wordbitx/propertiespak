import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { getSitemapRegistry } from "@/lib/sitemap-registry";

/** Utility and user-specific areas that must never appear in search results. */
const DISALLOW = [
  "/api/",
  "/admin",
  "/account",
  "/login",
  "/favorites",
  "/compare",
  "/checkout",
  "/_next/",
  "/*?*sort=",
  "/*?*page=*",
  "/*?*minPrice=*",
  "/*?*maxPrice=*",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: ["/", "/api/og"], disallow: DISALLOW },
      // Image and video crawlers may index listing photography and hero art.
      { userAgent: ["Googlebot-Image", "Googlebot-Video", "Bingbot"], allow: "/", disallow: ["/api/", "/admin", "/account", "/login"] },
      // Aggressive SEO crawlers: keep the crawl budget for real search engines
      // and for AI answer engines (ChatGPT, Perplexity, Gemini), which are
      // allowed because they send discovery traffic.
      { userAgent: ["AhrefsBot", "SemrushBot", "MJ12bot", "DotBot", "PetalBot"], disallow: "/" },
    ],
    sitemap: getSitemapRegistry()
      .filter((entry) => entry.group === "primary")
      .map((entry) => `${SITE.url}${entry.path}`),
    host: SITE.url,
  };
}
