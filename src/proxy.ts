import { NextResponse, type NextRequest } from "next/server";
import { getAllLandingSlugs } from "@/lib/landing-pages";
import { getAllKeywordLandingSlugs } from "@/lib/keyword-landings";

/**
 * Guarantees a real 404 status for unknown top-level URLs. Streamed dynamic
 * responses would otherwise return 200 for the styled not-found page, which
 * search engines treat as a soft 404.
 */
const STATIC_TOP_LEVEL = new Set([
  "properties",
  "projects",
  "commercial",
  "blog",
  "about",
  "contact",
  "favorites",
  "list-property",
  "tools",
  "login",
  "account",
  "compare",
  "admin",
  "sitemap",
  "sitemap.xml",
  "sitemap-index.xml",
  "robots.txt",
  "manifest.webmanifest",
  "favicon.ico",
  "property-investment-in-pakistan",
  "keywords-for-pakistan",
]);

const KNOWN_PREFIXES = [
  "/properties",
  "/property",
  "/projects",
  "/blog",
  "/city",
  "/commercial",
  "/about",
  "/contact",
  "/tools",
  "/property-for-sale",
  "/_next",
  "/api",
  "/images",
  "/sitemaps",
];

const LANDING_SLUGS = new Set([...getAllLandingSlugs(), ...getAllKeywordLandingSlugs()]);

const NOT_FOUND_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex, follow"/>
<title>Page not found | Pak Property</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#061C33;color:#102A43;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.wrap{min-height:100vh;display:grid;place-items:center;padding:32px}
.card{width:100%;max-width:640px;background:#fff;border-radius:18px;padding:40px;box-shadow:0 30px 70px -28px rgba(6,28,51,.55)}
.eyebrow{font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#0d8a4c}
h1{margin:14px 0 0;font-size:30px;line-height:1.12;letter-spacing:-.025em;color:#061C33}
p{margin:16px 0 0;color:#4a6079;line-height:1.65;font-size:15px}
.row{display:flex;gap:12px;flex-wrap:wrap;margin-top:26px}
a.btn{display:inline-flex;align-items:center;gap:8px;padding:13px 20px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px}
a.primary{background:#16B364;color:#fff}
a.ghost{border:1px solid #E8EEF3;color:#061C33}
.credit{margin-top:26px;padding-top:18px;border-top:1px solid #E8EEF3;font-size:12px;color:#75899d}
.credit a{color:#0d8a4c}
</style></head><body><div class="wrap"><main class="card">
<p class="eyebrow">Error 404</p>
<h1>We couldn&rsquo;t find that page on Pak Property.</h1>
<p>The link may be broken or the listing may have been removed. Search the sample inventory, or start from one of the market pages below.</p>
<div class="row">
<a class="btn primary" href="/properties">Browse properties</a>
<a class="btn ghost" href="/property-for-sale-in-lahore">Property in Lahore</a>
<a class="btn ghost" href="/">Back to home</a>
</div>
<p class="credit">Pak Property &mdash; Pakistan Real Estate. A real-estate demo product developed by
<a href="https://wordbitxtech.com/" rel="noopener">WordbitX Software Company</a>.</p>
</main></div></body></html>`;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (KNOWN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);

  // Only single-segment top-level URLs are validated here; deeper paths are
  // resolved by their own routes and page-level notFound() handling.
  if (segments.length === 1) {
    const slug = segments[0];
    if (!STATIC_TOP_LEVEL.has(slug) && !LANDING_SLUGS.has(slug)) {
      return new NextResponse(NOT_FOUND_HTML, {
        status: 404,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "public, max-age=0, s-maxage=300",
          "x-robots-tag": "noindex, follow",
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|images|favicon.ico).*)"],
};
