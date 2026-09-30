import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight, IconCheck, IconMail, IconPhone, IconShield } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { CtaSection } from "@/components/sections-editorial";
import { Section, SectionHeading } from "@/components/section";
import { SITE } from "@/lib/constants";
import { getCities, getPlatformStats } from "@/lib/queries";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { SitePicture } from "@/components/site-picture";
import { siteImages } from "@/lib/site-images";

export const metadata: Metadata = buildMetadata({
  title: "About Properties Pak — Pakistan Real Estate in Pakistan",
  description:
    "Properties Pak is a property marketplace for Pakistan built by WordbitX Software Company. Learn how we verify listings, structure search and support buyers, tenants and investors.",
  path: "/about",
  keywords: ["Properties Pak", "real estate platform Pakistan", "WordbitX Software Company", "property marketplace Pakistan"],
});

/** Live portals in the WordbitX group (listed on wordbitxtech.com). */
type Portal = { name: string; sector: string; domain: string; url: string; copy: string; current?: boolean };

const WORDBITX_PORTALS: Portal[] = [
  {
    name: "Properties Pak",
    sector: "Real estate",
    domain: "propertiespak.com",
    url: "/",
    copy: "Pakistan's property marketplace for sale, rent, new projects, commercial space and verified dealers.",
    current: true,
  },
  {
    name: "Motor & Automotive",
    sector: "Automotive",
    domain: "motor.wordbitxtech.com",
    url: "https://motor.wordbitxtech.com/",
    copy: "Vehicle listings, showroom-style layouts and enquiry-first design.",
  },
  {
    name: "Medicare",
    sector: "Healthcare",
    domain: "medicare.wordbitxtech.com",
    url: "https://medicare.wordbitxtech.com/",
    copy: "Healthcare services, appointment booking and professional medical presentation.",
  },
  {
    name: "Education",
    sector: "Education",
    domain: "education.wordbitxtech.com",
    url: "https://education.wordbitxtech.com/",
    copy: "Courses, programmes, admissions and education content.",
  },
  {
    name: "E-commerce",
    sector: "Retail & commerce",
    domain: "ecom.wordbitxtech.com",
    url: "https://ecom.wordbitxtech.com/",
    copy: "Product catalogues, categories and a checkout built to convert.",
  },
  {
    name: "Luxury Dining",
    sector: "Hospitality",
    domain: "luxury.wordbitxtech.com",
    url: "https://luxury.wordbitxtech.com/",
    copy: "Premium restaurant presentation with menus and reservations.",
  },
  {
    name: "Salon & Beauty",
    sector: "Beauty",
    domain: "saloon.wordbitxtech.com",
    url: "https://saloon.wordbitxtech.com/",
    copy: "Services, packages and appointment booking for salons.",
  },
];

const FAQS = [
  {
    question: "What is Properties Pak?",
    answer:
      "Properties Pak is Pakistan's property marketplace: live sale and rental listings, new developments, commercial space, map search, verified dealer profiles and investment calculators in one platform.",
  },
  {
    question: "Which cities does Properties Pak cover?",
    answer:
      "Properties Pak currently tracks Lahore, Islamabad, Karachi, Rawalpindi, Faisalabad, Multan, Gujranwala and Peshawar, with new societies added as inventory becomes available.",
  },
  {
    question: "Are these real, verified listings?",
    answer:
      "Listings are published by registered owners, dealers and the Properties Pak desk, and every submission is reviewed by our team before it goes live. That review covers owner contact, area, size and pricing consistency, and every listing page shows who published it. Buyers should still confirm title, dues, possession and the transfer procedure in writing before paying any token amount.",
  },
  {
    question: "Can I list my property on Properties Pak?",
    answer:
      "Yes. Submit your property through the List Your Property form. An advisor will review the details, guide you on pricing and arrange photography before the listing goes live.",
  },
  {
    question: "Does Properties Pak provide mortgages?",
    answer:
      "Properties Pak does not lend money. Our mortgage and affordability calculators provide estimates for planning, and our advisory desk can share the documentation banks typically require.",
  },
  {
    question: "Who builds and maintains the platform?",
    answer:
      "Properties Pak is developed and run by WordbitX Software Company. WordbitX runs a group of companies and live digital portals across real estate, automotive, healthcare, education, e-commerce, hospitality and beauty, alongside its software, SEO and marketing services.",
  },
];

export default async function AboutPage() {
  const [stats, cities] = await Promise.all([getPlatformStats(), getCities()]);

  return (
    <>
      <PageHero
        eyebrow="About"
        title="A Smarter Way to Move Through Pakistan's Property Market"
        description="Properties Pak is a real-estate platform built around one idea: property decisions get better when information is structured, comparable and visible before you commit."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "About", href: "/about" },
        ]}
      />

      <Section tone="light">
        <div className="ui-container grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow text-forest-700">
              <span className="h-[1px] w-6 bg-current opacity-70" />
              Our approach
            </p>
            <h2 className="display-2 mt-4 text-navy-900">Standard-setting, not listing volume</h2>
            <p className="lede mt-4">
              Pakistan's property market moves on relationships — but the information behind a deal is often scattered
              across phone calls and screenshots. Properties Pak structures that information so a buyer can compare, filter and
              decide without travelling the city first.
            </p>
            <ul className="mt-7 space-y-4">
              {[
                {
                  title: "Verification first",
                  copy: "Listings carry their documentation status, dues position and a clear price basis.",
                },
                {
                  title: "Comparable presentation",
                  copy: "Consistent size, area and price formatting so two listings can be compared honestly.",
                },
                {
                  title: "Decision tools included",
                  copy: "Instalment, yield and affordability models sit beside the listing, not on a different site.",
                },
                {
                  title: "Local advisory",
                  copy: "Society-level knowledge from consultants working in each city, not a call centre.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-3.5 border-b border-soft pb-4">
                  <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-forest-600" />
                  <span>
                    <span className="block font-sans text-[0.9875rem] font-semibold text-navy-900">{item.title}</span>
                    <span className="mt-1 block text-[0.875rem] leading-relaxed text-ink-muted">{item.copy}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="relative overflow-hidden rounded-panel bg-navy-950 shadow-card ring-1 ring-navy-900/10">
              <SitePicture
                image={siteImages.aboutVilla}
                sizes="(min-width: 1024px) 560px, 100vw"
                className="h-[340px] w-full object-cover object-[50%_48%] lg:h-[520px]"
              />
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/40 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 right-6 rounded-panel border border-soft bg-white p-5 shadow-card">
              <p className="font-sans text-[1.6rem] font-bold leading-none text-navy-900">{stats.listings}+</p>
              <p className="mt-2 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Listings tracked
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="mist">
        <div className="ui-container">
          <SectionHeading
            eyebrow="Platform"
            title="What the platform covers today"
            description="A snapshot of inventory, projects and markets currently tracked on Properties Pak."
          />
          <dl className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Live listings", value: stats.listings, note: "Sale and rental inventory" },
              { label: "Checked listings", value: stats.verified, note: "Reviewed before publication" },
              { label: "New projects", value: stats.projects, note: "Active developments tracked" },
              { label: "Cities covered", value: cities.length, note: "Across four provinces" },
            ].map((item) => (
              <div key={item.label} className="rounded-panel border border-soft bg-white p-6">
                <dt className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">{item.label}</dt>
                <dd className="mt-3">
                  <span className="font-sans text-[2rem] font-bold leading-none text-navy-900">{item.value}</span>
                  <span className="mt-2 block text-[0.8125rem] text-ink-muted">{item.note}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-2">
            {cities.map((city) => (
              <Link key={city.slug} href={`/city/${city.slug}`} className="chip">
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="light" id="careers">
        <div className="ui-container grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="eyebrow text-forest-700">
              <span className="h-[1px] w-6 bg-current opacity-70" />
              Consultants & teams
            </p>
            <h2 className="display-2 mt-4 text-navy-900">Work with the Properties Pak desk</h2>
            <p className="lede mt-4">
              Our consultants work city by city with clients buying, renting, selling and leasing. If you advise property
              in Lahore, Islamabad, Karachi, Rawalpindi, Faisalabad or Multan, we would like to hear from you.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact?topic=partnership" className="btn btn-primary">
                Partner with us <IconArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/list-property" className="btn btn-outline">
                List a property
              </Link>
            </div>
          </div>
          <div className="rounded-panel border border-soft bg-mist p-6 lg:p-8">
            <h3 className="font-sans text-[1.05rem] font-semibold text-navy-900">Technology, company &amp; attribution</h3>
            <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-muted">
              {SITE.name} is the official real estate platform of Pakistan created &amp; developed by{" "}
              <a
                href={SITE.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="WordbitX Software Company"
                className="font-semibold text-navy-900 underline decoration-forest-500 hover:text-forest-700"
              >
                {SITE.company}
              </a>
              . WordbitX engineers modern PropTech platforms, real estate web portals, mobile applications, and enterprise digital solutions for clients in Pakistan, UAE, USA, and internationally.
            </p>
            <dl className="mt-6 space-y-3.5 text-[0.875rem]">
              <div className="flex items-start gap-2.5">
                <IconShield className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                <div>
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">Company</dt>
                  <dd className="mt-1">
                    <a
                      href={SITE.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-navy-900 hover:text-forest-700"
                    >
                      {SITE.company}
                    </a>
                    <span className="block text-ink-muted">wordbitxtech.com</span>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <IconPhone className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                <div>
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                    Pakistan · Sales &amp; support
                  </dt>
                  <dd className="mt-1">
                    <a href={`tel:${SITE.companyPhone.replace(/\s/g, "")}`} className="text-navy-900 hover:text-forest-700">
                      {SITE.companyPhone}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <IconPhone className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                <div>
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                    New York, USA · International enquiries
                  </dt>
                  <dd className="mt-1">
                    <a href={`tel:${SITE.companyPhoneUs.replace(/[^\d+]/g, "")}`} className="text-navy-900 hover:text-forest-700">
                      {SITE.companyPhoneUs}
                    </a>
                    <span className="mt-1 block text-[0.75rem] leading-relaxed text-ink-muted">
                      WordbitX&rsquo;s New York, USA line for company and software enquiries. It is also the
                      Properties Pak international desk for overseas buyers and Karachi listings.
                    </span>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <IconMail className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                <div>
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">Email</dt>
                  <dd className="mt-1">
                    <a href={`mailto:${SITE.companyEmail}`} className="text-navy-900 hover:text-forest-700">
                      {SITE.companyEmail}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <IconShield className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                <div>
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">Location</dt>
                  <dd className="mt-1 text-navy-900">
                    {SITE.companyAddress.city}, {SITE.companyAddress.country}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </Section>

      <Section tone="mist" id="wordbitx-group">
        <div className="ui-container">
          <SectionHeading
            eyebrow="The WordbitX group"
            title="Properties Pak is run by WordbitX"
            description="WordbitX Software Company builds and runs Properties Pak. It also runs a group of companies and live digital portals across real estate, automotive, healthcare, education, commerce and hospitality — the same team, standards and engineering behind every one of them."
            action={{ label: "Visit wordbitxtech.com", href: SITE.companyUrl }}
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {WORDBITX_PORTALS.map((portal) => (
              <li key={portal.domain}>
                <a
                  href={portal.url}
                  target={portal.current ? undefined : "_blank"}
                  rel={portal.current ? undefined : "noopener"}
                  className="group flex h-full flex-col rounded-panel border border-soft bg-white p-5 transition-shadow duration-300 hover:shadow-card"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-forest-700">{portal.sector}</span>
                    {portal.current ? (
                      <span className="rounded-full bg-forest-50 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-forest-700">You are here</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-ink-muted">
                        <span className="h-1.5 w-1.5 rounded-full bg-forest-500" /> Live
                      </span>
                    )}
                  </span>
                  <span className="mt-3 block font-sans text-[1.0625rem] font-semibold text-navy-900">{portal.name}</span>
                  <span className="mt-1.5 block flex-1 text-[0.8125rem] leading-relaxed text-ink-muted">{portal.copy}</span>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-navy-800 group-hover:text-forest-700">
                    {portal.domain}
                    <IconArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="light" id="transparency">
        <div className="ui-container">
          <div className="rounded-panel border border-soft bg-mist p-6 lg:p-8">
            <p className="eyebrow text-forest-700">
              <span className="h-[1px] w-6 bg-current opacity-70" />
              Data, verification &amp; transparency
            </p>
            <h2 className="display-3 mt-3 text-navy-900">What is verified, and what is an estimate</h2>
            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="font-sans text-[0.9375rem] font-semibold text-navy-900">Built and working</h3>
                <ul className="mt-3 space-y-2.5 text-[0.9rem] text-ink">
                  {[
                    "Search, filtering, sorting and pagination over the listings database",
                    "Map-based location browsing with price markers",
                    "Property comparison and the Properties Pak Score engine",
                    "Eight investment and cost calculators",
                    "Saved shortlists, accounts, enquiries and site-visit requests",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-sans text-[0.9375rem] font-semibold text-navy-900">Estimates and guidance</h3>
                <ul className="mt-3 space-y-2.5 text-[0.9rem] text-ink-muted">
                  {[
                    "Asking prices and price bands are published by the listing owner and can change without notice",
                    "Per-square-foot benchmarks and the Property Score are comparative indicators, not a valuation",
                    "Calculator outputs are planning estimates, not financial, legal or tax advice",
                    "Dealer verification confirms identity, agency and contact details — it is not a title guarantee",
                    "Always confirm title, dues, possession and the transfer procedure before paying a token",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-6 text-[0.8125rem] leading-relaxed text-ink-muted">
              Agencies and developers can publish their full inventory under one verified account. To onboard a team or
              discuss a co-branded deployment, contact {SITE.company} at{" "}
              <a href={`mailto:${SITE.companyEmail}`} className="font-semibold text-navy-900 hover:text-forest-700">
                {SITE.companyEmail}
              </a>
              .
            </p>
          </div>
        </div>
      </Section>

      <Section tone="mist" id="faqs">
        <div className="ui-container">
          <SectionHeading
            eyebrow="FAQs"
            title="Questions buyers ask before they start"
            description="Straight answers about coverage, verification and how Properties Pak works with buyers, sellers and landlords."
          />
          <div className="mt-9 grid gap-3.5 lg:grid-cols-2">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-panel border border-soft bg-white p-5 open:border-navy-100 open:shadow-soft"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-sans text-[1rem] font-semibold text-navy-900">
                  {faq.question}
                  <IconArrowRight className="h-4 w-4 shrink-0 rotate-90 text-forest-600 transition-transform group-open:-rotate-90" />
                </summary>
                <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      <CtaSection />
      <JsonLd data={faqJsonLd(FAQS)} />
    </>
  );
}
