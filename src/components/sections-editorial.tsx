import { ResilientImage } from "@/components/resilient-image";
import Link from "next/link";
import {
  IconArrowRight,
  IconCalculator,
  IconChart,
  IconCheck,
  IconCompass,
  IconLayers,
  IconShield,
} from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/section";
import type { Testimonial } from "@/db/schema";
import { investmentImage } from "@/lib/images";
import { siteImages } from "@/lib/site-images";
import { SitePicture } from "@/components/site-picture";

const BENEFITS = [
  {
    icon: IconShield,
    title: "Property Discovery",
    copy: "Explore a curated catalogue with structured prices, sizes and locations, so your shortlist starts clean.",
  },
  {
    icon: IconCompass,
    title: "Smart search & filters",
    copy: "Filter by city, society, property type, budget, size and bedrooms — then sort by price, area or tenant demand.",
  },
  {
    icon: IconLayers,
    title: "Location intelligence",
    copy: "Compare neighbourhoods on the map and understand distance to schools, offices, hospitals and main arteries.",
  },
  {
    icon: IconCalculator,
    title: "Investment tools",
    copy: "Model mortgage instalments, rental yield and affordability before you commit capital or sign an agreement.",
  },
];

export function WhyEstateWx({ listings, cities }: { listings: number; cities: number }) {
  return (
    <Section tone="light" id="why">
      <div className="ui-container">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <Reveal>
            <p className="eyebrow text-forest-700">
              <span className="h-[1px] w-6 bg-current opacity-70" />
              Why Properties Pak
            </p>
            <h2 className="display-2 mt-4 text-navy-900">Real Estate, Made Smarter.</h2>
            <p className="lede mt-4">
              Properties Pak brings structure to a market that runs on scattered listings and phone calls. One platform, one
              set of standards, one clear decision path.
            </p>

            <div className="mt-9 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {BENEFITS.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div key={benefit.title} className="flex gap-3.5">
                    <span className="mt-0.5 shrink-0 text-forest-600">
                      <Icon className="h-[1.35rem] w-[1.35rem]" />
                    </span>
                    <div>
                      <h3 className="font-sans text-[0.9875rem] font-semibold text-navy-900">{benefit.title}</h3>
                      <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-muted">{benefit.copy}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-4 border-t border-soft pt-7">
              <div>
                <p className="font-sans text-[1.5rem] font-bold leading-none text-navy-900">{listings}+</p>
                <p className="mt-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  Live Listings
                </p>
              </div>
              <div>
                <p className="font-sans text-[1.5rem] font-bold leading-none text-navy-900">{cities}</p>
                <p className="mt-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  Cities tracked
                </p>
              </div>
              <div>
                <p className="font-sans text-[1.5rem] font-bold leading-none text-navy-900">4</p>
                <p className="mt-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  Decision tools
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="relative">
            <div className="relative overflow-hidden rounded-panel bg-navy-950 shadow-card ring-1 ring-navy-900/10">
              <SitePicture
                image={siteImages.smarterLiving}
                sizes="(min-width: 1024px) 600px, 100vw"
                className="h-[380px] w-full object-cover object-[50%_62%] lg:h-[540px]"
              />
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/45 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-6 left-6 right-6 rounded-panel border border-white/15 bg-navy-950/88 p-5 text-white backdrop-blur-sm">
              <p className="eyebrow text-forest-400">Property Information Standards</p>
              <ul className="mt-3 space-y-2 text-[0.8125rem]">
                {["Clear property information", "Descriptive property photography", "Indicative pricing and property details"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-white/80">
                    <IconCheck className="h-4 w-4 text-forest-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

export function InvestmentSection({
  snapshot,
}: {
  snapshot: { projects: number; commercial: number; cities: number; rentals: number };
}) {
  const points = [
    { title: "High-potential locations", copy: "Areas where infrastructure delivery and demand are moving together." },
    { title: "New developments", copy: "Launch pricing, payment plans and handover timelines side by side." },
    { title: "Commercial opportunities", copy: "Income-producing office, retail and warehouse assets." },
    { title: "Rental opportunities", copy: "Units and areas with strong tenant-demand signals." },
  ];

  return (
    <Section tone="dark" className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(760px 420px at 8% 0%, rgba(16,164,86,0.22), transparent 60%), radial-gradient(700px 420px at 92% 100%, rgba(19,80,127,0.55), transparent 62%)",
        }}
      />
      <div className="ui-container relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow text-forest-400">
              <span className="h-[1px] w-6 bg-current opacity-70" />
              Investor desk
            </p>
            <h2 className="display-2 mt-4 text-white">Invest With More Confidence.</h2>
            <p className="lede mt-4 text-white/70">
              Property decisions get better when the numbers are visible. Use Properties Pak to compare locations, understand
              entry and rental economics, and judge a development on evidence rather than optimism.
            </p>

            <ul className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {points.map((point) => (
                <li key={point.title} className="flex gap-3.5">
                  <span className="mt-0.5 shrink-0 text-forest-400">
                    <IconChart className="h-[1.3rem] w-[1.3rem]" />
                  </span>
                  <span>
                    <span className="block font-sans text-[0.95rem] font-semibold text-white">{point.title}</span>
                    <span className="mt-1 block text-[0.8125rem] leading-relaxed text-white/60">{point.copy}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/property-investment-in-pakistan" className="btn btn-green">
                Read the Investment Guide
                <IconArrowRight className="h-[1.05rem] w-[1.05rem]" />
              </Link>
              <Link href="/tools" className="btn btn-ghost-light">
                Open all 8 tools
              </Link>
            </div>

            <p className="mt-6 text-[0.75rem] leading-relaxed text-white/45">
              Tools provide estimates for planning only. They are not investment advice and do not guarantee returns.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-panel border border-white/12 bg-white/[0.04] p-6 backdrop-blur-sm lg:p-7">
              <p className="eyebrow text-forest-400">Platform snapshot</p>
              <dl className="mt-5 divide-y divide-white/10">
                {[
                  { label: "New developments tracked", value: snapshot.projects, href: "/projects" },
                  { label: "Commercial listings", value: snapshot.commercial, href: "/commercial" },
                  { label: "Rental listings", value: snapshot.rentals, href: "/properties/for-rent" },
                  { label: "Cities covered", value: snapshot.cities, href: "/properties" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4 py-4">
                    <dt className="text-[0.875rem] text-white/65">{row.label}</dt>
                    <dd className="flex items-center gap-3">
                      <span className="font-sans text-[1.35rem] font-bold leading-none text-white">{row.value}</span>
                      <Link
                        href={row.href}
                        aria-label={`View ${row.label}`}
                        className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-forest-500 hover:text-white"
                      >
                        <IconArrowRight className="h-4 w-4" />
                      </Link>
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 rounded-xl bg-forest-600/15 p-4">
                <p className="text-[0.8125rem] leading-relaxed text-white/80">
                  Want a specific area analysed? Our advisory desk prepares short area notes on request — including
                  pricing bands, tenant profiles and supply pipeline.
                </p>
                <Link
                  href="/contact?topic=advisory"
                  className="mt-3 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-forest-400 hover:text-forest-500"
                >
                  Request an area note <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  return (
    <Section tone="mist">
      <div className="ui-container">
        <div className="max-w-2xl">
          <p className="eyebrow text-forest-700">
            <span className="h-[1px] w-6 bg-current opacity-70" />
            Buyer scenarios
          </p>
          <h2 className="display-2 mt-4 text-navy-900">How different buyers would use Properties Pak</h2>
          <p className="lede mt-4">
            Composite scenarios that show how the platform&rsquo;s search, comparison and calculator
            tools support different property decisions in Pakistan.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-soft bg-white px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            <IconShield className="h-3.5 w-3.5 text-forest-600" /> Scenario example — not a client testimonial
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.slice(0, 3).map((item, index) => (
            <Reveal key={item.name} delay={index * 60}>
              <article className="flex h-full flex-col rounded-panel border border-soft bg-white p-6 shadow-soft">
                <p>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-forest-50 px-2.5 py-1 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-forest-700">
                    <IconCompass className="h-3.5 w-3.5" /> Buyer scenario
                  </span>
                </p>
                <h3 className="mt-4 font-sans text-[1.0625rem] font-semibold leading-snug text-navy-900">
                  {item.role}
                </h3>
                <p className="mt-1 text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-ink-muted">
                  {item.city} · Scenario {item.sortOrder}
                </p>
                <p className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-ink">{item.quote}</p>
                <p className="mt-5 border-t border-soft pt-4 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Persona example — not a client testimonial
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function CtaSection() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-900 py-14 sm:py-16 lg:py-20" aria-labelledby="closing-cta-heading" data-testid="closing-cta">
      <ResilientImage src={investmentImage.src} alt="" width={1440} height={810} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/90 to-navy-900/70" />
      <div className="ui-container relative z-10">
        <div className="grid min-w-0 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0 max-w-2xl">
            <p className="eyebrow text-forest-400">Make your next move</p>
            <h2 id="closing-cta-heading" className="display-2 mt-4 text-white">Find the Right Property. Make the Smarter Move.</h2>
            <p className="mt-4 text-base leading-7 text-white/70">Explore properties, compare opportunities and make more informed real-estate decisions across Pakistan.</p>
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link href="/properties" className="btn btn-green min-h-12">Explore Properties <IconArrowRight className="h-4 w-4 shrink-0" /></Link>
            <Link href="/properties?featured=1" className="btn btn-ghost-light min-h-12">Start Your Search</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
