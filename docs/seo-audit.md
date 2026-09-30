# Properties Pak — SEO Audit & Search Console Guide

Date: 2026-09-30 · Scope: indexing readiness, sitemaps, Search Console onboarding, and the path to ranking for Pakistan real-estate head terms ("properties", "real estate").

---

## 1. Verdict

The platform is **technically ready for indexing today**. Every core system Google expects is already shipped in the codebase and was verified live during this audit. What remains is account-level work (Search Console, Bing, GBP) and off-site authority building — code cannot rank a site alone.

## 2. Verified live (this audit)

| Check | Result |
| --- | --- |
| `robots.txt` | ✅ Public pages allowed; `/api`, `/admin`, `/account`, `/login`, favourites/compare and filtered (`sort`/`page`/price) URLs disallowed; aggressive SEO bots blocked; both primary sitemaps listed |
| Sitemap index | ✅ `/sitemap-index.xml` lists 19 child sitemaps (master + 11 topical + 8 city files) with fresh `lastmod` |
| Master sitemap | ✅ `/sitemap.xml` — **659 URLs** (all listing, city, society, town, dealer, project, blog, tool, landing pages) |
| Per-city sitemaps | ✅ `/sitemaps/city/{city}.xml` (Lahore, Islamabad, Karachi, Rawalpindi, Faisalabad, Multan, Gujranwala, Peshawar) |
| Canonical tags | ✅ Self-referencing absolute canonical on every page (`https://propertiespak.com`) |
| Host canonicalisation | ✅ `www` and legacy hosts 301 → apex in production (`next.config.ts`) |
| Titles / meta | ✅ Keyword-first titles, unique descriptions, `en-PK` locale |
| Structured data | ✅ `RealEstateAgent` + `WebSite` + `SearchAction` (sitewide), `RealEstateListing` + `Offer` + `BreadcrumbList` (listings), plus City/ItemList/FAQPage on hubs and guides |
| Social/OG cards | ✅ Generated 1200×630 card per page (`/api/og`), allowed in robots |
| Verification hooks | ✅ `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` / `NEXT_PUBLIC_BING_SITE_VERIFICATION` / `NEXT_PUBLIC_YANDEX_SITE_VERIFICATION` render `<meta name="google-site-verification">` etc. from env — no code change needed |
| Filtered URLs | ✅ `noindex, follow` on filtered listing views (no thin duplicates) |
| **Preview hosts (fixed in this audit)** | ⚠️ → ✅ Sandbox/Vercel-preview/legacy hosts now send `X-Robots-Tag: noindex, nofollow` so copies can never compete with the canonical domain |

## 3. Submit to Google Search Console

**One URL to paste in Search Console → Sitemaps:**

```
https://propertiespak.com/sitemap-index.xml
```

That single index reference covers all 19 files (listings, cities, societies, dealers, projects, blog, tools, keywords, pages). Submitting the master `https://propertiespak.com/sitemap.xml` as well is harmless but optional.

### Step-by-step (recommended: Domain property)

1. Search Console → **Add property → Domain** → enter `propertiespak.com`.
2. Google shows a **TXT record** — add it at your DNS provider (Cloudflare/Namecheap/GoDaddy): host `@`, type `TXT`, value `google-site-verification=…`. Verify. *This covers www, http→https and every subdomain in one shot.*
3. **Sitemaps → enter `/sitemap-index.xml` → Submit.** "Success" with N discovered URLs is expected within days.
4. Settings → **International targeting**: Pakistan. Enable **email alerts**.
5. **URL Inspection** (top bar) → paste `https://propertiespak.com/` → **Request indexing**. Repeat for `/properties`, one city hub, and 3–5 strong listings to seed discovery.
6. Alternative if DNS is inconvenient: **URL prefix** property → HTML tag → copy the `content="…"` token → set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<token>` in Vercel env vars → redeploy → Verify.
7. **Bing Webmaster Tools**: import from Search Console (one click), submit the same index.
8. After launch, check weekly: Pages (indexed count), Sitemaps (errors), Core Web Vitals, and use **URL Inspection → Request indexing** for every new listing batch.

## 4. Ranking plan: "properties" & "real estate" (Pakistan)

Reality check: Zameen and OLX own these head terms with ~15 years of authority and millions of backlinks. Nobody outranks them for the bare word in week one. The winning pattern is a **ladder** — own the specific queries first, then climb.

**Rung 1 — Win now (weeks 1–8): long-tail + brand.**
Already engineered for this: `houses for sale in DHA Phase 5 Lahore`, `5 marla house for sale Gulberg`, society/town pages, city hubs, calculators. Keep publishing real inventory (each listing is a unique indexed page — the sitemap already carries them) and request indexing on new batches.

**Rung 2 — Months 2–6: modifiers.**
`property for sale in Lahore` / `real estate portal Pakistan` / `plots for sale in Islamabad`. Winning these needs: fresh listings daily (supply), the blog publishing 2–3 market pieces weekly (area price reports, society guides, legal/how-to), and dealer profiles earning their own links.

**Rung 3 — Months 6–18: head terms.**
`properties`, `real estate Pakistan`, `property portal`. These move on **domain authority**, which is earned off-site:
- **Google Business Profile** (Lahore HQ) — map-pack visibility for "real estate" near-me queries.
- **Backlinks**: PSEB/Chamber memberships, Press Release (launch coverage), partnerships with builders/societies (project pages linking back), Pakistani directories (actually used ones), guest pieces in property media (Zameen blog comments won't help — real coverage will).
- **E-E-A-T**: author pages for the research desk, cited market stats, About/Contact completeness (already shipped).
- **Signals that compound**: weekly blog cadence, price-data pages people cite, working rich results (RealEstateListing/FAQ already validated).

**Cadence after launch:** daily — new listings; weekly — 2–3 blog posts + GSC review; monthly — backlink push + content refresh of top pages.

## 5. What was changed in code during this audit

| Change | File |
| --- | --- |
| Preview/legacy hosts now serve `X-Robots-Tag: noindex, nofollow` (duplicate-content protection) | `next.config.ts` |
| This audit document | `docs/seo-audit.md` |

No other code changes were required — everything else was already in place and passed live verification.
