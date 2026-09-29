# Properties Pak — SEO & launch checklist

Domain: **https://propertiespak.com** (canonical apex host; `www` and the old
`property.wordbitxtech.com` 301 to it in production — see `next.config.ts`).

Everything in **Part 1** is already implemented in this repository. **Part 2** is
the work that must happen outside the codebase (Search Console, Google Business
Profile, content, backlinks) — that is where the ranking actually comes from.

---

## Part 1 — Already shipped in code

| Area | What is in place | Where |
| --- | --- | --- |
| Canonical host | Apex `propertiespak.com` is the canonical; `www`, `property.wordbitxtech.com` redirect with 301 (production only) | `next.config.ts` → `redirects()` |
| Canonical tags | Self-referencing `<link rel="canonical">` on every page, absolute and https | `src/lib/seo.ts` → `buildMetadata()` |
| Titles | Explicit, keyword-first titles; template `%s \| Properties Pak` | `src/app/layout.tsx`, page `metadata` exports |
| Meta description | Unique per page, written for click-through, 150–160 chars | every page's `buildMetadata({ description })` |
| Robots meta | Indexable pages `index, follow` + `max-image-preview:large`, `max-snippet:-1`; filtered listing URLs `noindex, follow` | `src/lib/seo.ts` → `listingRobots()` |
| robots.txt | Allows public pages and `/api/og`; blocks `/api/`, `/admin`, `/account`, `/login`, `/favorites`, `/compare`, filtered query patterns, aggressive SEO bots; lists both primary sitemaps; `host` directive | `src/app/robots.ts` |
| Sitemaps | `/sitemap-index.xml` → 10 topical sitemaps (properties, projects, blog, cities, societies + towns, dealers, pages, tools, keywords, Pakistan) + one per city; `/sitemap.xml` master; real `lastmod` from listing/post timestamps | `src/app/sitemap*.ts`, `src/app/sitemaps/**` |
| Dealer verification | Public dealer profiles at `/dealers`, admin-controlled blue tick (`/admin?tab=users`), verification surfaced on listing cards and property pages, `sitemaps/dealers.xml` | `src/app/dealers/**`, `src/app/api/admin/users/**` |
| Structured data | `RealEstateAgent` + `WebSite` (global), `CollectionPage` + `ItemList` (hubs), `RealEstateListing` with `Offer`/`LeaseOut` and `additionalProperty` (listings), `ApartmentComplex` (projects), `Article` (blog), `FAQPage` + `BreadcrumbList` (guides), `WebPage` (landing pages) | `src/lib/seo.ts`, wired per page |
| Social cards | Branded 1200×630 OG image generated per page from its own title (`/api/og?title=…`), plus the static hero card | `src/app/api/og/route.tsx`, `src/lib/images.ts` → `ogCard()` |
| Icons & PWA | SVG mark, 512px app icon, 180px Apple icon, 16/32/48 favicon, web manifest with shortcuts | `src/app/icon.svg`, `public/`, `src/app/manifest.ts` |
| Performance | `next/font` self-hosting (no render-blocking Google CSS), AVIF/WebP hero with `srcset` + `fetchpriority=high`, sized images, no image optimizer in the hot path | `src/app/layout.tsx`, `src/components/hero.tsx` |
| Security/quality headers | `X-Content-Type-Options`, `Referrer-Policy`, `X-DNS-Prefetch-Control`, `Permissions-Policy`; long cache for icons, short shared cache for sitemaps | `next.config.ts` → `headers()` |
| Internal linking | Intent landing pages, city hubs, society + town guides, dealer directory, keyword hub, popular searches, breadcrumbs on every deep page | `src/lib/landing-pages.ts`, `src/lib/keyword-landings.ts`, components |
| Search Console hooks | Verification meta tags read from env for Google, Bing, Yandex | `src/app/layout.tsx`, `.env.example` |

### Verify it yourself

```bash
curl -s https://propertiespak.com/robots.txt
curl -s https://propertiespak.com/sitemap-index.xml | head
curl -s https://propertiespak.com/ | grep -o '<link rel="canonical"[^>]*>'
curl -s "https://propertiespak.com/api/og?title=Houses%20for%20Sale%20in%20Lahore" -o card.png
```

Rich results: paste any listing, project or guide URL into
<https://search.google.com/test/rich-results> and confirm the expected types
(RealEstateListing, FAQPage, BreadcrumbList, Article…).

---

## Part 2 — Do these in week 1 (account level)

1. **DNS + host**
   - Point `propertiespak.com` and `www` at Vercel; set the apex as the primary
     domain so Vercel does not add its own redirect in the wrong direction.
   - Confirm HTTPS works on both, then enable HSTS in Vercel (Project → Settings
     → Domains → HTTPS).
2. **Google Search Console**
   - Add a **Domain property** for `propertiespak.com` (DNS TXT verification) —
     this covers `www`, `http` and any future subdomain in one go.
   - Submit `https://propertiespak.com/sitemap-index.xml`.
   - Set the international target to Pakistan (`en-PK`) and enable email alerts.
3. **Bing Webmaster Tools** — import the property from Search Console (one click),
   submit the same sitemap index.
4. **Google Business Profile** — create the Lahore listing, category
   *Real Estate Agency*, add the website, phone, hours, photos and a weekly post.
   Public pages show the city only (`Lahore, Pakistan`) — never publish the
   detailed office address. Reviews on the profile are a strong local ranking signal.
5. **Analytics** — add GA4 or a privacy-friendly alternative, link it to Search
   Console, and set goals on: enquiry form submit, phone tap, WhatsApp tap.
6. **Brand properties** — publish the Facebook, Instagram, LinkedIn, YouTube and X
   profiles and paste their URLs into `SITE.social` in `src/lib/constants.ts`
   (they are already wired into `sameAs` structured data and the footer).
   WordbitX company profiles live in `SITE.companySocial` (same file): the footer
   renders a "Follow WordbitX" row for every platform that has a URL, and the
   same list feeds the parent Organization `sameAs`. Platforms are omitted when
   the value is empty, so a missing account never renders as a dead link.

## Part 3 — Content plan (this is what wins rankings)

The strongest pages are the ones already generated; keep feeding them:

| Intent | Page pattern | Example keywords |
| --- | --- | --- |
| Buy, national | `/property-for-sale-in-pakistan` | property for sale in Pakistan, buy house Pakistan |
| Buy, city | `/houses-for-sale-in-lahore`, `/apartments-for-sale-in-islamabad` | houses for sale in Lahore, flats in Islamabad |
| Rent, city | `/property-for-rent-in-lahore`, `/property-for-rent-in-karachi` | house for rent Lahore, apartment rent Karachi |
| Society guide | `/property-for-sale/dha-lahore`, `/property-for-sale/bahria-town-karachi` | DHA Lahore property prices, Bahria Town Karachi plots |
| Commercial | `/commercial-property-in-islamabad`, `/commercial` | commercial property Islamabad, office space rent Lahore |
| City hub | `/city/lahore` → `/city/peshawar` | property in Lahore, real estate Lahore |
| Tools | `/tools/mortgage-calculator` … | home loan calculator Pakistan, rental yield Karachi |
| Guides | `/blog/*` | how to buy a house in Pakistan, transfer process, DHA balloting |

Guidelines:

- **One primary keyword per URL.** Never create two pages targeting the same
  phrase; extend the existing page instead (societies get their own page).
- **Publish 4–8 guides a month** answering real buyer questions (price trends per
  society, transfer/registry fees, overseas Pakistani buying process, comparison
  posts: "DHA vs Bahria", "Lahore vs Islamabad investment").
- **Internal links:** every new guide links to its city hub, one society guide and
  one tool page; every listing links back to its city and society page.
- **Annual refresh:** update price bands and 2026/2027 figures each year and keep
  the same URL (update `lastmod` automatically — done).
- **E-E-A-T:** keep every listing tied to a named publisher — the account, dealer
  or desk behind it — and verify dealer accounts in the admin workspace so the
  blue tick stays meaningful. Add author bios with credentials to blog posts.
  Anonymous inventory ranks poorly in the real estate vertical, where trust
  matters most.

## Part 4 — Off-page / authority (months 1–6)

- Link from `wordbitxtech.com` (already referenced in structured data) plus a
  portfolio/case-study page: a relevant, contextual first backlink.
- Local citations with identical NAP: Google Business Profile, Bing Places,
  Apple Maps, Facebook, LinkedIn, Pakistan business directories (Yellow Pages
  Pakistan, BusinessList.pk), Pakistan real-estate associations.
- Digital PR: monthly data story built from your own inventory (e.g. "average
  asking price per marla in DHA Lahore, Q1 2027") — genuinely linkable.
- Social/video: short property walkthroughs on YouTube (indexable pages) and
  Reels/TikTok; embed nothing, just link.
- Guest posts on Pakistani business/property blogs, 2–3 per quarter, pointing at
  city hubs rather than the homepage.
- Avoid paid link networks and mass guest posting — penalties outlast the gains.

## Part 5 — Monitoring (weekly → monthly)

| Cadence | Task |
| --- | --- |
| Weekly | Search Console → Pages report: fix coverage errors (crawled–not-indexed, soft 404, duplicate canonical). Check Core Web Vitals. |
| Weekly | Rank tracking for the top 20 keywords (GSC average position is enough at the start). |
| Monthly | Sitemap health: `curl -s …/sitemap-index.xml` returns 200 and every child returns 200. |
| Monthly | 404 log review: add 301s to `next.config.ts` `redirects()` for any URL with inbound links. |
| Monthly | Content refresh: update the two lowest-CTR pages in GSC. |
| Quarterly | Backlink audit (Ahrefs free tier / GSC links report), disavow only obvious spam. |

## Realistic expectations

A brand-new domain typically needs **3–6 months** before city-level keywords
("houses for sale in Lahore") enter the top 20, and 9–12 months to compete for
the head terms that Zameen/OLX dominate. What moves the needle fastest in this
vertical, in order:

1. Real inventory + fresh listings (daily `lastmod` already signals this).
2. Unique city/society pages with genuine local price data.
3. Google Business Profile reviews and local citations.
4. Fast pages (this site already ships ~1s LCP on desktop; keep it that way).
5. Backlinks from relevant Pakistani sites.

Do not expect Google to index a page just because it is in the sitemap — the
first crawl typically happens within days, ranking takes months.
