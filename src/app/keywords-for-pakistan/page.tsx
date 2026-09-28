import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  IconArrowRight,
  IconBuilding,
  IconChart,
  IconCompass,
  IconKey,
  IconLayers,
  IconMap,
  IconSearch,
} from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Section, SectionHeading } from "@/components/section";
import { SITE } from "@/lib/constants";
import { buildMetadata, webPageJsonLd } from "@/lib/seo";

const TITLE = "Pakistan Real Estate Keywords | Property Search & Investment Topics | Pak Property";
const DESCRIPTION =
  "Explore popular Pakistan real estate searches including property for sale, property for rent, houses, apartments, plots, commercial property and property investment opportunities.";

type KeywordLink = {
  label: string;
  href: string;
  note?: string;
};

type KeywordGroup = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  links: KeywordLink[];
};

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/keywords-for-pakistan",
  keywords: [
    "Pakistan real estate keywords",
    "property search Pakistan",
    "property for sale Pakistan",
    "property for rent Pakistan",
    "property investment Pakistan",
    "real estate search guide Pakistan",
  ],
});

const CORE_MAPPING: KeywordLink[] = [
  { label: "Property for Sale", href: "/property-for-sale-in-pakistan", note: "Houses, apartments, plots and commercial property across Pakistan" },
  { label: "Property for Rent", href: "/property-for-rent-in-pakistan", note: "Residential and commercial rentals across major cities" },
  { label: "Property Investment in Pakistan", href: "/property-investment-in-pakistan", note: "Markets, yield, risks, documentation and investment tools" },
  { label: "Houses for Sale in Lahore", href: "/houses-for-sale-in-lahore", note: "Family homes and villas across Lahore" },
  { label: "Apartments for Sale in Lahore", href: "/apartments-for-sale-in-lahore", note: "Flats, penthouses and new developments" },
  { label: "Plots for Sale in Lahore", href: "/plots-for-sale-in-lahore", note: "Possession plots and documented files" },
  { label: "Commercial Property in Lahore", href: "/commercial-property-in-lahore", note: "Offices, shops and commercial buildings" },
  { label: "House for Sale in DHA Lahore", href: "/property-for-sale/dha-lahore", note: "DHA Lahore market and society guide" },
  { label: "House for Sale in Bahria Town Lahore", href: "/property-for-sale/bahria-town-lahore", note: "Bahria Town Lahore property guide" },
];

const PAKISTAN: KeywordLink[] = [
  { label: "Property for Sale in Pakistan", href: "/property-for-sale-in-pakistan" },
  { label: "Property for Rent in Pakistan", href: "/property-for-rent-in-pakistan" },
  { label: "Houses for Sale in Pakistan", href: "/houses-for-sale-in-pakistan" },
  { label: "Apartments for Sale in Pakistan", href: "/apartments-for-sale-in-pakistan" },
  { label: "Plots for Sale in Pakistan", href: "/plots-for-sale-in-pakistan" },
  { label: "Commercial Property in Pakistan", href: "/commercial-property-in-pakistan" },
  { label: "Real Estate Investment in Pakistan", href: "/property-investment-in-pakistan" },
  { label: "New Property Projects in Pakistan", href: "/new-property-projects-in-pakistan" },
];

const LAHORE: KeywordLink[] = [
  { label: "Property for Sale in Lahore", href: "/property-for-sale-in-lahore" },
  { label: "Property for Rent in Lahore", href: "/property-for-rent-in-lahore" },
  { label: "Houses for Sale in Lahore", href: "/houses-for-sale-in-lahore" },
  { label: "Houses for Rent in Lahore", href: "/houses-for-rent-in-lahore" },
  { label: "Apartments for Sale in Lahore", href: "/apartments-for-sale-in-lahore" },
  { label: "Apartments for Rent in Lahore", href: "/apartments-for-rent-in-lahore" },
  { label: "Plots for Sale in Lahore", href: "/plots-for-sale-in-lahore" },
  { label: "Commercial Property in Lahore", href: "/commercial-property-in-lahore" },
  { label: "Property Investment in Lahore", href: "/property-investment-in-lahore" },
  { label: "5 Marla House for Sale in Lahore", href: "/5-marla-house-for-sale-in-lahore" },
  { label: "10 Marla House for Sale in Lahore", href: "/10-marla-house-for-sale-in-lahore" },
  { label: "1 Kanal House for Sale in Lahore", href: "/1-kanal-house-for-sale-in-lahore" },
];

const ISLAMABAD: KeywordLink[] = [
  { label: "Property for Sale in Islamabad", href: "/property-for-sale-in-islamabad" },
  { label: "Property for Rent in Islamabad", href: "/property-for-rent-in-islamabad" },
  { label: "Houses for Sale in Islamabad", href: "/houses-for-sale-in-islamabad" },
  { label: "Apartments for Sale in Islamabad", href: "/apartments-for-sale-in-islamabad" },
  { label: "Plots for Sale in Islamabad", href: "/plots-for-sale-in-islamabad" },
  { label: "Commercial Property in Islamabad", href: "/commercial-property-in-islamabad" },
  { label: "Property Investment in Islamabad", href: "/property-investment-in-islamabad" },
];

const KARACHI: KeywordLink[] = [
  { label: "Property for Sale in Karachi", href: "/property-for-sale-in-karachi" },
  { label: "Property for Rent in Karachi", href: "/property-for-rent-in-karachi" },
  { label: "Houses for Sale in Karachi", href: "/houses-for-sale-in-karachi" },
  { label: "Apartments for Sale in Karachi", href: "/apartments-for-sale-in-karachi" },
  { label: "Plots for Sale in Karachi", href: "/plots-for-sale-in-karachi" },
  { label: "Commercial Property in Karachi", href: "/commercial-property-in-karachi" },
  { label: "Property Investment in Karachi", href: "/property-investment-in-karachi" },
];

const LOCATIONS: KeywordLink[] = [
  { label: "Property for Sale in DHA Lahore", href: "/property-for-sale/dha-lahore" },
  { label: "Property for Sale in DHA Phase 5 Lahore", href: "/property-for-sale/dha-phase-5-lahore" },
  { label: "Property for Sale in DHA Phase 6 Lahore", href: "/property-for-sale/dha-phase-6-lahore" },
  { label: "Property for Sale in Bahria Town Lahore", href: "/property-for-sale/bahria-town-lahore" },
  { label: "Property for Sale in Johar Town Lahore", href: "/property-for-sale/johar-town-lahore" },
  { label: "Property for Sale in Gulberg Lahore", href: "/property-for-sale/gulberg-lahore" },
  { label: "Property for Sale in Model Town Lahore", href: "/property-for-sale/model-town-lahore" },
  { label: "Property for Sale in DHA Islamabad", href: "/property-for-sale/dha-islamabad" },
  { label: "Property for Sale in Blue Area Islamabad", href: "/property-for-sale/blue-area-islamabad" },
  { label: "Property for Sale in Bahria Town Islamabad", href: "/property-for-sale/bahria-town-islamabad" },
  { label: "Property for Sale in DHA Karachi", href: "/property-for-sale/dha-karachi" },
  { label: "Property for Sale in Clifton Karachi", href: "/property-for-sale/clifton-karachi" },
  { label: "Property for Sale in DHA Multan", href: "/property-for-sale/dha-multan" },
];

const TRANSACTION: KeywordLink[] = [
  { label: "Property for Sale", href: "/property-for-sale-in-pakistan" },
  { label: "Property for Rent", href: "/property-for-rent-in-pakistan" },
  { label: "Houses for Sale", href: "/houses-for-sale-in-pakistan" },
  { label: "Apartments for Sale", href: "/apartments-for-sale-in-pakistan" },
  { label: "Plots for Sale", href: "/plots-for-sale-in-pakistan" },
  { label: "Commercial Property", href: "/commercial-property-in-pakistan" },
];

const INVESTMENT: KeywordLink[] = [
  { label: "Property Investment", href: "/property-investment-in-pakistan" },
  { label: "Real Estate Investment", href: "/property-investment-in-pakistan" },
  { label: "Rental Yield", href: "/tools/rental-yield-calculator" },
  { label: "Property ROI", href: "/tools/roi-calculator" },
  { label: "Investment Property", href: "/property-for-sale-in-pakistan" },
  { label: "Best Areas for Property Investment", href: "/blog/best-areas-to-buy-property-in-lahore" },
  { label: "Property Investment in Lahore", href: "/property-investment-in-lahore" },
  { label: "Property Investment in Islamabad", href: "/property-investment-in-islamabad" },
  { label: "Property Investment in Karachi", href: "/property-investment-in-karachi" },
];

const PROPERTY_TYPES: KeywordLink[] = [
  { label: "Houses", href: "/houses-for-sale-in-pakistan" },
  { label: "Apartments", href: "/apartments-for-sale-in-pakistan" },
  { label: "Plots", href: "/plots-for-sale-in-pakistan" },
  { label: "Villas", href: "/houses-for-sale-in-pakistan" },
  { label: "Commercial", href: "/commercial-property-in-pakistan" },
  { label: "Offices", href: "/commercial-property-in-pakistan" },
  { label: "Shops", href: "/commercial-property-in-pakistan" },
  { label: "Warehouses", href: "/commercial-property-in-pakistan" },
];

const CITY_INTENT: KeywordLink[] = [
  { label: "Lahore", href: "/city/lahore" },
  { label: "Islamabad", href: "/city/islamabad" },
  { label: "Karachi", href: "/city/karachi" },
  { label: "Rawalpindi", href: "/city/rawalpindi" },
  { label: "Faisalabad", href: "/city/faisalabad" },
  { label: "Multan", href: "/city/multan" },
  { label: "Gujranwala", href: "/city/gujranwala" },
  { label: "Peshawar", href: "/city/peshawar" },
];

const SOCIETY_INTENT: KeywordLink[] = [
  { label: "DHA", href: "/property-for-sale/dha-lahore" },
  { label: "Bahria Town", href: "/property-for-sale/bahria-town-lahore" },
  { label: "Gulberg", href: "/property-for-sale/gulberg-lahore" },
  { label: "Johar Town", href: "/property-for-sale/johar-town-lahore" },
  { label: "Model Town", href: "/property-for-sale/model-town-lahore" },
  { label: "Clifton", href: "/property-for-sale/clifton-karachi" },
  { label: "Blue Area", href: "/property-for-sale/blue-area-islamabad" },
  { label: "DHA Multan", href: "/property-for-sale/dha-multan" },
];

const GROUPS: KeywordGroup[] = [
  {
    title: "Transaction Intent",
    description: "Start with whether you want to buy, rent or research a specific property format.",
    icon: IconKey,
    links: TRANSACTION,
  },
  {
    title: "Investment Intent",
    description: "Move from broad market research into yield, ROI and city investment guides.",
    icon: IconChart,
    links: INVESTMENT,
  },
  {
    title: "Property Type Intent",
    description: "Browse the national directory by the kind of space or asset you need.",
    icon: IconBuilding,
    links: PROPERTY_TYPES,
  },
  {
    title: "Location Intent",
    description: "Explore inventory and market context city by city across Pakistan.",
    icon: IconMap,
    links: CITY_INTENT,
  },
  {
    title: "Society / Area Intent",
    description: "Go directly to Pak Property society and micro-location guides.",
    icon: IconCompass,
    links: SOCIETY_INTENT,
  },
];

function KeywordList({ links }: { links: KeywordLink[] }) {
  return (
    <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
      {links.map((link) => (
        <li key={`${link.label}-${link.href}`}>
          <Link
            href={link.href}
            className="group flex h-full items-start justify-between gap-3 rounded-xl border border-soft bg-white px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:border-navy-100 hover:shadow-card"
          >
            <span className="min-w-0">
              <span className="block font-sans text-[0.875rem] font-semibold leading-snug text-navy-900 group-hover:text-forest-700">
                {link.label}
              </span>
              {link.note && <span className="mt-1 block text-[0.75rem] leading-relaxed text-ink-muted">{link.note}</span>}
            </span>
            <IconArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-forest-600 transition-transform group-hover:translate-x-1" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function DirectorySection({
  id,
  title,
  description,
  links,
}: {
  id: string;
  title: string;
  description: string;
  links: KeywordLink[];
}) {
  return (
    <section id={id} className="rounded-panel border border-soft bg-mist/60 p-5 sm:p-6">
      <h2 className="font-sans text-[1.15rem] font-bold text-navy-900">{title}</h2>
      <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-muted">{description}</p>
      <KeywordList links={links} />
    </section>
  );
}

export default function PakistanKeywordHubPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy-950 pb-16 pt-28 lg:pb-20 lg:pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(820px 420px at 10% -12%, rgba(22,179,100,0.24), transparent 62%), radial-gradient(760px 420px at 90% 6%, rgba(19,80,127,0.5), transparent 62%)",
          }}
        />
        <div className="ui-container relative z-10">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "SEO Resources", href: "/sitemap" },
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
            Explore popular property searches across Pakistan and discover the Pak Property pages, guides and market
            resources that match each search intent.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              { label: "Pakistan", href: "#pakistan" },
              { label: "Lahore", href: "#lahore" },
              { label: "Islamabad", href: "#islamabad" },
              { label: "Karachi", href: "#karachi" },
              { label: "Locations", href: "#locations" },
              { label: "Search intent", href: "#search-intent" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-2 text-[0.8125rem] font-semibold text-white/75 transition-colors hover:border-forest-500 hover:text-white"
              >
                {item.label}
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
        <div className="ui-container grid gap-5 lg:grid-cols-2">
          <DirectorySection
            id="pakistan"
            title="Pakistan Property"
            description="National entry points covering sale, rent, residential property, commercial assets, projects and investment research."
            links={PAKISTAN}
          />
          <DirectorySection
            id="lahore"
            title="Lahore Property Searches"
            description="High-intent Lahore searches mapped to dedicated city, type, size and investment pages."
            links={LAHORE}
          />
          <DirectorySection
            id="islamabad"
            title="Islamabad Property Searches"
            description="Capital property pages for sale, rent, houses, apartments, plots, commercial and investment intent."
            links={ISLAMABAD}
          />
          <DirectorySection
            id="karachi"
            title="Karachi Property Searches"
            description="Karachi residential, plot, rental, commercial and investment pages with relevant sample inventory."
            links={KARACHI}
          />
        </div>
      </Section>

      <Section tone="light" id="locations">
        <div className="ui-container">
          <SectionHeading
            eyebrow="Micro-location intent"
            title="Popular Property Locations"
            description="Society and area pages help buyers move from a broad city search to the location-level context that actually affects access, price, documentation and demand."
          />
          <div className="mt-8">
            <KeywordList links={LOCATIONS} />
          </div>
        </div>
      </Section>

      <Section tone="mist" id="search-intent">
        <div className="ui-container">
          <SectionHeading
            eyebrow="Search intent"
            title="Find the right Pak Property resource for your question"
            description="Search intent describes what a visitor is trying to accomplish. Use transaction, investment, property-type, city or society paths rather than opening an unrelated page."
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {GROUPS.map((group) => {
              const Icon = group.icon;
              return (
                <article key={group.title} className="rounded-panel border border-soft bg-white p-5 shadow-soft">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-navy-800 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="mt-4 font-sans text-[1.05rem] font-semibold text-navy-900">{group.title}</h2>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-muted">{group.description}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {group.links.map((link) => (
                      <li key={`${group.title}-${link.label}`}>
                        <Link href={link.href} className="chip">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </Section>

      <Section tone="light">
        <div className="ui-container grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <div>
            <p className="eyebrow text-forest-700">
              <span className="h-px w-6 bg-current" /> How to use Pak Property search pages
            </p>
            <h2 className="display-3 mt-3 text-navy-900">Move from broad research to a useful shortlist</h2>
            <div className="mt-5 space-y-4 text-[0.9375rem] leading-relaxed text-ink-muted">
              <p>
                Start with a transaction goal—buy, rent or invest—then select the city that matches your work, family or
                business requirements. City pages provide local context, while society pages narrow the decision to
                infrastructure, access and micro-location.
              </p>
              <p>
                Next, filter by property type, price range, bedrooms and area. Add two or three sample listings to the
                comparison tool to line up price per square foot, amenities and illustrative Pak Property property signals.
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
                { label: "Browse all sample properties", href: "/properties" },
                { label: "Explore new property projects", href: "/projects" },
                { label: "Open commercial property hub", href: "/commercial" },
                { label: "Use all property calculators", href: "/tools" },
                { label: "Read Pakistan property insights", href: "/blog" },
                { label: "View complete HTML sitemap", href: "/sitemap" },
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
              Pak Property is an official real-estate platform demonstration by{" "}
              <a href={SITE.companyUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-forest-700 hover:underline">
                WordbitX Software Company
              </a>
              . Inventory and market figures are illustrative.
            </p>
          </div>
        </div>
      </Section>

      <JsonLd
        data={webPageJsonLd({
          name: TITLE,
          description: DESCRIPTION,
          path: "/keywords-for-pakistan",
          about: [
            "Pakistan real estate",
            "Property for sale in Pakistan",
            "Property for rent in Pakistan",
            "Property investment in Pakistan",
            "Pakistan property search intent",
          ],
        })}
      />
    </>
  );
}
