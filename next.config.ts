import type { NextConfig } from "next";

/** Canonical production host. Everything else 301s here in production. */
const CANONICAL_HOST = "propertiespak.com";

const nextConfig: NextConfig = {
  // Lets the sandboxed live preview (proxied under *.e2b.app) load dev assets.
  allowedDevOrigins: ["*.e2b.app", "localhost", "127.0.0.1"],
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "tile.openstreetmap.org" },
    ],
  },
  async redirects() {
    // On non-production hosts (the sandbox preview, Vercel preview URLs) the
    // host is already correct, so only path redirects run there.
    const hostRedirects: { source: string; has: { type: "host"; value: string }[]; destination: string; permanent: boolean }[] = [];
    if (process.env.NODE_ENV === "production") {
      for (const host of ["www.propertiespak.com", "property.wordbitxtech.com", "www.property.wordbitxtech.com"]) {
        hostRedirects.push({
          source: "/:path*",
          has: [{ type: "host", value: host }],
          destination: `https://${CANONICAL_HOST}/:path*`,
          permanent: true,
        });
      }
    }
    return [
      ...hostRedirects,
      // Weekly market index was renamed; keep the old URL working.
      { source: "/property-index", destination: "/properties", permanent: true },
      // Long-standing URL shape: /sitemap.xml/* nested files were never public.
      { source: "/sitemap_index.xml", destination: "/sitemap-index.xml", permanent: true },
      { source: "/index.xml", destination: "/sitemap-index.xml", permanent: true },
      { source: "/feed", destination: "/blog", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
      {
        // Preview hosts (Arena sandbox, Vercel previews) must never be indexed —
        // the canonical host is propertiespak.com, and preview copies of pages
        // would otherwise compete with it in search results.
        source: "/:path*",
        has: [{ type: "host", value: "(.*\\.e2b\\.app|.*\\.vercel\\.app|property\\.wordbitxtech\\.com|www\\.property\\.wordbitxtech\\.com)" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        // Crawlers re-check sitemaps often; a short shared cache keeps them fast.
        source: "/:path(sitemap.xml|sitemap-index.xml|sitemaps/:file*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400" }],
      },
      {
        source: "/:path(robots.txt)",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400" }],
      },
      {
        source: "/:path(icon.svg|icon.png|apple-icon.png|favicon.ico|manifest.webmanifest)",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, immutable" }],
      },
    ];
  },
};

export default nextConfig;
