import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { IconArrowRight, IconSearch } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Section, SectionHeading } from "@/components/section";
import { SITE } from "@/lib/constants";
import { KEYWORD_GROUPS, getKeywordCount, getMatrixPageCount, getUniqueKeywordCount } from "@/lib/keyword-catalog";
import { getAllKeywordLandingSlugs } from "@/lib/keyword-landings";
import { buildMetadata, webPageJsonLd } from "@/lib/seo";

const TITLE = "Pakistan Real Estate Keywords | Property Search & Investment Topics | Properties Pak";
const DESCRIPTION =
  "Explore the property searches Properties Pak covers: property for sale and rent in Pakistan, houses, flats, apartments, plots, land, commercial property and area guides across Lahore, Islamabad, Karachi and every city we serve.";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/keywords-for-pakistan",
  keywords: [
    "Pakistan real estate keywords",
    "property search Pakistan",
    "property for sale Pakistan",
    "property for rent Pakistan",
    "land for sale Pakistan",
    "property investment Pakistan",
    "real estate search guide Pakistan",
  ],
});

/** The nine cornerstone pages, shown as cards above the full directory. */
const CORE_MAPPING = KEYWORD_GROUPS[0].links.slice(0, 9).map((link) => ({
  label: link.label,
  href: link.href,
  note: link.note ?? "Cornerstone page",
}));

function KeywordList({ links }: { links: { label: string; href: string; note?: string }[] }) {
  return (
    <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      {links.map((link) => (
        <li key={`${link.label}-${link.href}`}>
          <Link
            href={link.href}
            className="group flex h-full items-center justify-between gap-3 rounded-xl border border-soft bg-white px-3.5 py-2.5 transition-all hover:-translate-y-0.5 hover:border-navy-100 hover:shadow-card"
          >
            <span className="block font-sans text-[0.8125rem] font-semibold leading-snug text-navy-900 group-hover:text-forest-700">
              {link.label}
            </span>
            <IconArrowRight className="h-3.5 w-3.5 shrink-0 text-forest-600 transition-transform group-hover:translate-x-1" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function PakistanKeywordHubPage() {
  const total = getKeywordCount();
  const unique = getUniqueKeywordCount();
  const matrixPages = getMatrixPageCount();
  const keywordPages = getAllKeywordLandingSlugs().length;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy-950 pb-16 pt-28 lg:pb-20 lg:pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(820px 420px at 10% -12%, rgba(16,164,86,0.24), transparent 62%), radial-gradient(760px 420px at 90% 6%, rgba(19,80,127,0.5), transparent 62%)",
          }}
        />
        <div className="ui-container relative z-10">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Properties", href: "/properties" },
              { name: "Pakistan Real Estate Keywords", href: "/keywords-for-pakistan" },
            ]}
          />
          <p className="eyebrow mt-7 text-forest-400">
            <IconSearch className="h-3.5 w-3.5" /> Search Intent Resource
          </p>
          <h1 className="display-2 mt-4 max-w-4xl text-white ew-fade-up">
            Pakistan Real Estate Keywords &amp; Property Search Guide
          </h1>
          <p className="lede mt-5 max-w-3xl text-white/75">
            Every property search Properties Pak answers in one directory: {unique.toLocaleString()} search phrases mapped to{" "}
            {keywordPages.toLocaleString()} live keyword pages, plus area guides, city hubs and calculators across Pakistan — houses,
            flats, apartments, plots, land and commercial property in Lahore, Islamabad, Karachi, Rawalpindi, Faisalabad, Multan,
            Gujranwala and Peshawar.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { value: unique.toLocaleString(), label: "Search phrases covered" },
              { value: total.toLocaleString(), label: "Keyword listings in this directory" },
              { value: matrixPages.toLocaleString(), label: "City × property-type pages" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-panel border border-white/12 bg-white/[0.06] px-5 py-4">
                <p className="font-sans text-[1.5rem] font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-[0.8125rem] text-white/65">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {KEYWORD_GROUPS.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-2 text-[0.8125rem] font-semibold text-white/75 transition-colors hover:border-forest-500 hover:text-white"
              >
                {group.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      <Section tone="light">
        <div className="ui-container">
          <SectionHeading
            eyebrow="Start here"
            title="Core property search paths"
            description="These cornerstone pages connect broad Pakistan property searches to the most relevant city, property-type, society and investment resources."
          />
          <div className="mt-8 grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
            {CORE_MAPPING.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="group flex h-full items-start justify-between gap-4 rounded-panel border border-soft bg-white p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-navy-100 hover:shadow-card"
              >
                <span>
                  <span className="font-sans text-[0.9875rem] font-semibold text-navy-900 group-hover:text-forest-700">
                    {link.label}
                  </span>
                  <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-ink-muted">{link.note}</span>
                  <span className="mt-3 block font-mono text-[0.6875rem] text-ink-muted">{link.href}</span>
                </span>
                <IconArrowRight className="mt-1 h-4 w-4 shrink-0 text-forest-600 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="mist">
        <div className="ui-container space-y-5">
          <SectionHeading
            eyebrow="Full keyword directory"
            title="Every search term we publish a page for"
            description="Grouped by search intent. Each link opens a Pakistan property page that already exists — a curated hub, a city × property-type page, an area guide, a calculator or a filtered search view. No hidden keyword tags: this is the same directory crawlers and visitors use."
          />
          {KEYWORD_GROUPS.map((group) => (
            <section
              key={group.id}
              id={group.id}
              className="scroll-mt-28 rounded-panel border border-soft bg-white p-5 shadow-soft sm:p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-sans text-[1.15rem] font-bold text-navy-900">{group.title}</h2>
                <span className="font-mono text-[0.75rem] text-ink-muted">{group.links.length} searches</span>
              </div>
              <p className="mt-2 max-w-3xl text-[0.875rem] leading-relaxed text-ink-muted">{group.description}</p>
              <KeywordList links={group.links} />
            </section>
          ))}
        </div>
      </Section>

      <Section tone="light">
        <div className="ui-container grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <div>
            <p className="eyebrow text-forest-700">
              <span className="h-px w-6 bg-current" /> How to use Properties Pak search pages
            </p>
            <h2 className="display-3 mt-3 text-navy-900">Move from broad research to a useful shortlist</h2>
            <div className="mt-5 space-y-4 text-[0.9375rem] leading-relaxed text-ink-muted">
              <p>
                Start with a transaction goal — buy, rent or invest — then select the city that matches your work, family
                or business requirements. City pages provide local context, while society pages narrow the decision to
                infrastructure, access and micro-location.
              </p>
              <p>
                Next, filter by property type, price range, bedrooms and area. Add two or three listings to the
                comparison tool to line up price per square foot, amenities and Properties Pak property signals.
              </p>
              <p>
                For investment research, use the rental-yield, ROI, mortgage, tax and affordability calculators alongside
                the documentation and market guides. No tool predicts or guarantees future returns.
              </p>
            </div>
          </div>
          <div className="rounded-panel border border-soft bg-mist p-6">
            <h2 className="font-sans text-[1.05rem] font-semibold text-navy-900">Continue into market resources</h2>
            <ul className="mt-4 space-y-3">
              {[
                { label: "Browse all properties", href: "/properties" },
                { label: "Explore new property projects", href: "/projects" },
                { label: "Open commercial property hub", href: "/commercial" },
                { label: "Use all property calculators", href: "/tools" },
                { label: "Read Pakistan property insights", href: "/blog" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-soft bg-white px-4 py-3 font-sans text-[0.875rem] font-semibold text-navy-900 hover:border-navy-800"
                  >
                    {link.label}
                    <IconArrowRight className="h-4 w-4 text-forest-600 transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[0.75rem] leading-relaxed text-ink-muted">
              Properties Pak is the official real-estate platform by{" "}
              <a href={SITE.companyUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-forest-700 hover:underline">
                WordbitX Software Company
              </a>
              . Market figures are indicative and updated regularly.
            </p>
          </div>
        </div>
      </Section>

      <JsonLd
        data={webPageJsonLd({
          name: TITLE,
          description: DESCRIPTION,
          path: "/keywords-for-pakistan",
          about: KEYWORD_GROUPS.map((group) => group.title),
        })}
      />
    </>
  );
}
