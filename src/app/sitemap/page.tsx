import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight, IconShield, IconLayers } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { Section, SectionHeading } from "@/components/section";
import { SITE } from "@/lib/constants";
import { getAllLandingSlugs, getAllSocietySlugs, SOCIETY_BY_SLUG, CITY_MARKETS } from "@/lib/landing-pages";
import { getAllKeywordLandingSlugs } from "@/lib/keyword-landings";
import { getSitemapRegistry } from "@/lib/sitemap-registry";
import { getAllPropertySlugs, getAllProjectSlugs, getAllPostSlugs } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "HTML Sitemap — Pak Property Pakistan Real Estate Directory",
  description:
    "Complete index of all property listings, city markets, society guides, commercial real estate, new housing projects and property investment tools on Pak Property.",
  path: "/sitemap",
});

export const dynamic = "force-dynamic";

export default async function HtmlSitemapPage() {
  const [properties, projects, posts] = await Promise.all([
    getAllPropertySlugs(),
    getAllProjectSlugs(),
    getAllPostSlugs(),
  ]);

  const landingSlugs = [...getAllLandingSlugs(), ...getAllKeywordLandingSlugs()];
  const societySlugs = getAllSocietySlugs();

  return (
    <>
      <PageHero
        eyebrow="Directory Index"
        title="Pak Property Sitemap & Property Directory"
        description="Browse all canonical, indexable pages across Pakistan's property markets: cities, societies, property types, projects, guides and tools."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Sitemap", href: "/sitemap" },
        ]}
      />

      <Section tone="light">
        <div className="ui-container">
          <section className="mb-12 rounded-panel border border-soft bg-mist p-6 lg:p-8">
            <p className="eyebrow text-forest-700">
              <span className="h-px w-6 bg-current" /> SEO Resources
            </p>
            <h2 className="display-3 mt-3 text-navy-900">Pakistan Property Search Directory</h2>
            <p className="mt-3 max-w-3xl text-[0.875rem] leading-relaxed text-ink-muted">
              Start with a broad Pakistan market, then narrow by city, property type, size or society. Every link below
              points to a canonical page with useful content and relevant sample inventory.
            </p>
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-soft bg-white p-4">
                <h3 className="font-sans text-[0.875rem] font-bold text-navy-900">SEO Resources</h3>
                <Link href="/keywords-for-pakistan" className="mt-3 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-forest-700 hover:underline">
                  Pakistan Real Estate Keywords <IconArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="rounded-xl border border-soft bg-white p-4">
                <h3 className="font-sans text-[0.875rem] font-bold text-navy-900">Pakistan Property</h3>
                <ul className="mt-3 space-y-2 text-[0.8125rem]">
                  <li><Link href="/property-for-sale-in-pakistan" className="hover:text-forest-700">Property for Sale in Pakistan</Link></li>
                  <li><Link href="/property-for-rent-in-pakistan" className="hover:text-forest-700">Property for Rent in Pakistan</Link></li>
                  <li><Link href="/property-investment-in-pakistan" className="hover:text-forest-700">Property Investment in Pakistan</Link></li>
                </ul>
              </div>
              <div className="rounded-xl border border-soft bg-white p-4">
                <h3 className="font-sans text-[0.875rem] font-bold text-navy-900">Lahore</h3>
                <ul className="mt-3 space-y-2 text-[0.8125rem]">
                  <li><Link href="/houses-for-sale-in-lahore" className="hover:text-forest-700">Houses for Sale in Lahore</Link></li>
                  <li><Link href="/apartments-for-sale-in-lahore" className="hover:text-forest-700">Apartments for Sale in Lahore</Link></li>
                  <li><Link href="/plots-for-sale-in-lahore" className="hover:text-forest-700">Plots for Sale in Lahore</Link></li>
                  <li><Link href="/commercial-property-in-lahore" className="hover:text-forest-700">Commercial Property in Lahore</Link></li>
                </ul>
              </div>
              <div className="rounded-xl border border-soft bg-white p-4">
                <h3 className="font-sans text-[0.875rem] font-bold text-navy-900">Lahore Locations</h3>
                <ul className="mt-3 space-y-2 text-[0.8125rem]">
                  <li><Link href="/property-for-sale/dha-lahore" className="hover:text-forest-700">Property for Sale in DHA Lahore</Link></li>
                  <li><Link href="/property-for-sale/bahria-town-lahore" className="hover:text-forest-700">Property for Sale in Bahria Town Lahore</Link></li>
                </ul>
              </div>
            </div>
          </section>

          <div className="grid gap-12 lg:grid-cols-3">
            {/* Column 1: Main & City Markets */}
            <div>
              <h2 className="font-sans text-[1.125rem] font-bold text-navy-900 flex items-center gap-2">
                <IconShield className="h-5 w-5 text-forest-600" /> City Property Markets
              </h2>
              <ul className="mt-4 space-y-2 text-[0.875rem]">
                {CITY_MARKETS.map((city) => (
                  <li key={city.slug}>
                    <Link
                      href={`/city/${city.slug}`}
                      className="font-medium text-navy-800 hover:text-forest-700"
                    >
                      Property in {city.name}
                    </Link>
                    <div className="ml-3 flex gap-2 text-[0.75rem] text-ink-muted">
                      <Link href={`/property-for-sale-in-${city.slug}`} className="hover:underline">
                        For Sale
                      </Link>
                      <span>·</span>
                      <Link href={`/property-for-rent-in-${city.slug}`} className="hover:underline">
                        For Rent
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>

              <h2 className="mt-8 font-sans text-[1.125rem] font-bold text-navy-900">
                Core Marketplace Sections
              </h2>
              <ul className="mt-4 space-y-2 text-[0.875rem]">
                <li><Link href="/" className="hover:text-forest-700">Home</Link></li>
                <li><Link href="/properties" className="hover:text-forest-700">All Properties</Link></li>
                <li><Link href="/properties/for-sale" className="hover:text-forest-700">Properties For Sale</Link></li>
                <li><Link href="/properties/for-rent" className="hover:text-forest-700">Properties For Rent</Link></li>
                <li><Link href="/commercial" className="hover:text-forest-700">Commercial Real Estate</Link></li>
                <li><Link href="/projects" className="hover:text-forest-700">New Housing Projects</Link></li>
                <li><Link href="/compare" className="hover:text-forest-700">Property Comparison Tool</Link></li>
                <li><Link href="/list-property" className="hover:text-forest-700">List Your Property</Link></li>
                <li><Link href="/about" className="hover:text-forest-700">About Pak Property</Link></li>
                <li><Link href="/contact" className="hover:text-forest-700">Contact Us</Link></li>
              </ul>
            </div>

            {/* Column 2: Societies & Locations */}
            <div>
              <h2 className="font-sans text-[1.125rem] font-bold text-navy-900 flex items-center gap-2">
                <IconLayers className="h-5 w-5 text-forest-600" /> Society &amp; Area Guides
              </h2>
              <ul className="mt-4 space-y-2 text-[0.875rem]">
                {societySlugs.map((slug) => {
                  const s = SOCIETY_BY_SLUG.get(slug);
                  return (
                    <li key={slug}>
                      <Link
                        href={`/property-for-sale/${slug}`}
                        className="font-medium text-navy-800 hover:text-forest-700"
                      >
                        {s ? s.name : slug}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <h2 className="mt-8 font-sans text-[1.125rem] font-bold text-navy-900">
                Specialized Market Landings
              </h2>
              <ul className="mt-4 space-y-2 text-[0.875rem]">
                {landingSlugs
                  .filter((s) => !s.startsWith("property-for-sale-in") && !s.startsWith("property-for-rent-in"))
                  .map((slug) => (
                    <li key={slug}>
                      <Link href={`/${slug}`} className="hover:text-forest-700">
                        {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Column 3: Tools, Insights & Projects */}
            <div>
              <h2 className="font-sans text-[1.125rem] font-bold text-navy-900">
                Property Investment Tools
              </h2>
              <ul className="mt-4 space-y-2 text-[0.875rem]">
                <li><Link href="/tools" className="font-semibold text-forest-700">All 8 Calculators Hub</Link></li>
                <li><Link href="/tools/mortgage-calculator" className="hover:text-forest-700">Mortgage Calculator</Link></li>
                <li><Link href="/tools/affordability-calculator" className="hover:text-forest-700">Affordability Calculator</Link></li>
                <li><Link href="/tools/rental-yield-calculator" className="hover:text-forest-700">Rental Yield Calculator</Link></li>
                <li><Link href="/tools/roi-calculator" className="hover:text-forest-700">ROI Calculator</Link></li>
                <li><Link href="/tools/investment-calculator" className="hover:text-forest-700">Investment Projection</Link></li>
                <li><Link href="/tools/construction-cost-calculator" className="hover:text-forest-700">Construction Cost Calculator</Link></li>
                <li><Link href="/tools/property-tax-calculator" className="hover:text-forest-700">Property Tax Calculator</Link></li>
                <li><Link href="/tools/rent-vs-buy-calculator" className="hover:text-forest-700">Rent vs Buy Calculator</Link></li>
              </ul>

              <h2 className="mt-8 font-sans text-[1.125rem] font-bold text-navy-900">
                Property Insights &amp; Guides ({posts.length})
              </h2>
              <ul className="mt-4 space-y-2 text-[0.875rem]">
                {posts.map((post) => (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`} className="hover:text-forest-700 line-clamp-1">
                      {post.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Link>
                  </li>
                ))}
              </ul>

              <h2 className="mt-8 font-sans text-[1.125rem] font-bold text-navy-900">
                Featured Housing Projects
              </h2>
              <ul className="mt-4 space-y-2 text-[0.875rem]">
                {projects.map((proj) => (
                  <li key={proj.slug}>
                    <Link href={`/projects/${proj.slug}`} className="hover:text-forest-700">
                      {proj.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-14 rounded-panel border border-soft bg-mist p-6 text-center">
            <p className="text-[0.9375rem] font-semibold text-navy-900">
              Looking for Search Console XML Sitemap?
            </p>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">
              Submit the sitemap index in Google Search Console and Bing Webmaster Tools. The master and focused sitemaps
              remain available for individual submission when you want to inspect a specific content group.
            </p>
            <div className="mt-5 grid gap-2 text-left sm:grid-cols-2 lg:grid-cols-3">
              {getSitemapRegistry().map((item) => (
                <a
                  key={item.path}
                  href={`${SITE.url}${item.path}`}
                  className={`rounded-xl border px-4 py-3 hover:border-navy-800 ${item.group === "primary" ? "border-forest-500/50 bg-forest-50" : "border-soft bg-white"}`}
                >
                  <span className="block text-[0.75rem] font-semibold text-navy-900">{item.label}</span>
                  <span className="mt-1 block break-all font-mono text-[0.6875rem] text-forest-700">
                    {SITE.url}{item.path}
                  </span>
                </a>
              ))}
            </div>
            <p className="mt-4 text-left text-[0.75rem] leading-relaxed text-ink-muted">
              robots.txt: <span className="font-mono text-forest-700">{SITE.url}/robots.txt</span> · Every property, city,
              society, keyword and guide page is also reachable from the master sitemap; the focused files simply let
              Search Console report coverage per content group.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
