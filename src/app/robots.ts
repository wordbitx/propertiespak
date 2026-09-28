import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { getSitemapRegistry } from "@/lib/sitemap-registry";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/account", "/admin", "/login", "/favorites", "/compare"],
      },
    ],
    sitemap: getSitemapRegistry()
      .filter((entry) => entry.group === "primary")
      .map((entry) => `${SITE.url}${entry.path}`),
    host: SITE.url,
  };
}
