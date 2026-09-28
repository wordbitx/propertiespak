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
import { photo } from "@/lib/images";

export const metadata: Metadata = buildMetadata({
  title: "About Pak Property — Pakistan Real Estate in Pakistan",
  description:
    "Pak Property is a property marketplace for Pakistan built by WordbitX Software Company. Learn how we verify listings, structure search and support buyers, tenants and investors.",
  path: "/about",
  keywords: ["Pak Property", "real estate platform Pakistan", "WordbitX Software Company", "property marketplace Pakistan"],
});

const FAQS = [
  {
    question: "What is Pak Property?",
    answer:
      "Pak Property is a premium property marketplace demo for Pakistan. It brings sample sale and rental listings, new developments, commercial spaces, map search and investment calculators into one platform.",
  },
  {
    question: "Which cities does Pak Property cover?",
    answer:
      "Pak Property currently tracks Lahore, Islamabad, Karachi, Rawalpindi, Faisalabad, Multan, Gujranwala and Peshawar, with new societies added as inventory becomes available.",
  },
  {
    question: "Are these real, verified listings?",
    answer:
      "No \u2014 all inventory on this demo website is illustrative sample content created to showcase the platform. In a production deployment for a licensed agency, listings would be reviewed for documentation status, dues clearance and accuracy of size, price and location before publication.",
  },
  {
    question: "Can I list my property on Pak Property?",
    answer:
      "Yes. Submit your property through the List Your Property form. An advisor will review the details, guide you on pricing and arrange photography before the listing goes live.",
  },
  {
    question: "Does Pak Property provide mortgages?",
    answer:
      "Pak Property does not lend money. Our mortgage and affordability calculators provide estimates for planning, and our advisory desk can share the documentation banks typically require.",
  },
  {
    question: "Who builds and maintains the platform?",
    answer:
      "Pak Property is a real-estate product developed by WordbitX Software Company, which also builds marketplaces, property technology and enterprise software.",
  },
];

export default async function AboutPage() {
  const [stats, cities] = await Promise.all([getPlatformStats(), getCities()]);

  return (
    <>
      <PageHero
        eyebrow="About"
        title="A Smarter Way to Move Through Pakistan's Property Market"
        description="Pak Property is a real-estate platform built around one idea: property decisions get better when information is structured, comparable and visible before you commit."
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
              across phone calls and screenshots. Pak Property structures that information so a buyer can compare, filter and
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
            <div className="overflow-hidden rounded-panel bg-soft">
              <img
                src={photo(8135496, 1200, 1400)}
                alt="Premium open-plan interior representing Pak Property listing standards"
                width={1200}
                height={1400}
                loading="lazy"
                decoding="async"
                className="h-[340px] w-full object-cover lg:h-[520px]"
              />
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
            description="A snapshot of inventory, projects and markets currently tracked on Pak Property."
          />
          <dl className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Demo Listings", value: stats.listings, note: "Sample sale and rental inventory" },
              { label: "Sample properties", value: stats.verified, note: "Illustrative demo data" },
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
            <h2 className="display-2 mt-4 text-navy-900">Work with the Pak Property desk</h2>
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
              {SITE.name} is the official real estate platform demo created &amp; developed by{" "}
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
                    USA / International enquiries
                  </dt>
                  <dd className="mt-1">
                    <a href={`tel:${SITE.companyPhoneUs.replace(/[^\d+]/g, "")}`} className="text-navy-900 hover:text-forest-700">
                      {SITE.companyPhoneUs}
                    </a>
                    <span className="mt-1 block text-[0.75rem] leading-relaxed text-ink-muted">
                      WordbitX&rsquo;s international contact number (New York, USA) for company and software enquiries — not
                      an Pak Property property office.
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
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">Office</dt>
                  <dd className="mt-1 text-navy-900">
                    {SITE.companyAddress.street}, {SITE.companyAddress.city}, {SITE.companyAddress.country}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </Section>

      <Section tone="light" id="demo">
        <div className="ui-container">
          <div className="rounded-panel border border-soft bg-mist p-6 lg:p-8">
            <p className="eyebrow text-forest-700">
              <span className="h-[1px] w-6 bg-current opacity-70" />
              Demo &amp; data transparency
            </p>
            <h2 className="display-3 mt-3 text-navy-900">What is real, and what is demonstration content</h2>
            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="font-sans text-[0.9375rem] font-semibold text-navy-900">Built and working</h3>
                <ul className="mt-3 space-y-2.5 text-[0.9rem] text-ink">
                  {[
                    "Search, filtering, sorting and pagination over the listings database",
                    "Map-based location browsing with price markers",
                    "Property comparison and the Pak Property Property Score engine",
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
                <h3 className="font-sans text-[0.9375rem] font-semibold text-navy-900">Illustrative sample content</h3>
                <ul className="mt-3 space-y-2.5 text-[0.9rem] text-ink-muted">
                  {[
                    "Listings, prices and areas are sample data, not live agency inventory",
                    "Price bands and per-square-foot benchmarks are demo reference values",
                    "The Property Score is an illustrative demo rating, not a valuation",
                    "User scenarios shown on the homepage are composite examples, not client testimonials",
                    "Calculators provide estimates for planning, not financial or tax advice",
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
              Pak Property is a demonstration product. To run this platform on a licensed agency's own verified inventory,
              contact {SITE.company} at{" "}
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
            description="Straight answers about coverage, verification and how Pak Property works with buyers, sellers and landlords."
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
