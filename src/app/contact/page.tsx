import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight, IconMail, IconMap, IconPhone, IconWhatsApp } from "@/components/icons";
import { LeadForm } from "@/components/lead-form";
import { PageHero } from "@/components/page-hero";
import { Section, SectionHeading } from "@/components/section";
import { SITE } from "@/lib/constants";
import { getAgents } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact Pak Property — Property Advisory in Pakistan",
  description:
    "Talk to the Pak Property property desk in Lahore, Islamabad, Karachi and Multan. Call +92 325 1888841 or send your requirement for matched listings and site visits.",
  path: "/contact",
  keywords: ["property dealers Lahore", "real estate contact Pakistan", "Pak Property contact"],
});

export default async function ContactPage() {
  const agents = await getAgents();

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to a Property Advisor Who Knows the Society"
        description="Share your requirement — city, budget, timeline — and the right desk will respond with matched options, including off-market files where available."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Contact", href: "/contact" },
        ]}
      />

      <Section tone="light">
        <div className="ui-container grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="font-sans text-[1.35rem] font-bold text-navy-900">Direct lines</h2>
            <dl className="mt-6 space-y-5">
              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy-800 text-white">
                  <IconPhone className="h-[1.05rem] w-[1.05rem]" />
                </span>
                <div>
                  <dt className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">Call or WhatsApp</dt>
                  <dd className="mt-1">
                    <a
                      href={`tel:${SITE.companyPhone.replace(/\s/g, "")}`}
                      className="font-sans text-[1rem] font-semibold text-navy-900 hover:text-forest-700"
                    >
                      {SITE.companyPhone}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy-800 text-white">
                  <IconMail className="h-[1.05rem] w-[1.05rem]" />
                </span>
                <div>
                  <dt className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">Email</dt>
                  <dd className="mt-1">
                    <a href={`mailto:${SITE.companyEmail}`} className="font-sans text-[1rem] font-semibold text-navy-900 hover:text-forest-700">
                      {SITE.companyEmail}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy-800 text-white">
                  <IconMap className="h-[1.05rem] w-[1.05rem]" />
                </span>
                <div>
                  <dt className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">Desks</dt>
                  <dd className="mt-1 text-[0.9375rem] text-navy-900">
                    Lahore · Islamabad · Karachi · Multan
                    <span className="mt-1 block text-[0.8125rem] text-ink-muted">
                      Viewings arranged by appointment across all covered cities.
                    </span>
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-8 rounded-panel border border-soft bg-mist p-6">
              <p className="font-sans text-[1rem] font-semibold text-navy-900">Response times</p>
              <ul className="mt-3 space-y-2 text-[0.875rem] text-ink-muted">
                <li>Sales enquiries: within one working day</li>
                <li>Rental viewings: same or next day where possible</li>
                <li>Commercial requirements: matched shortlist in 2–3 days</li>
              </ul>
              <a
                href={`https://wa.me/${SITE.companyPhone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-green mt-5"
              >
                <IconWhatsApp className="h-4 w-4" /> Message on WhatsApp
              </a>
            </div>

            <div className="mt-10">
              <h3 className="font-sans text-[1.1rem] font-semibold text-navy-900">City desks</h3>
              <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                {agents.map((agent) => (
                  <div key={agent.slug} className="rounded-panel border border-soft bg-white p-4">
                    <p className="font-sans text-[0.9375rem] font-semibold text-navy-900">{agent.name}</p>
                    <p className="mt-0.5 text-[0.8125rem] text-ink-muted">{agent.title}</p>
                    <p className="mt-2 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-forest-700">
                      {agent.cityName}
                    </p>
                    <a
                      href={`tel:${agent.phone.replace(/\s/g, "")}`}
                      className="mt-3 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-navy-900 hover:text-forest-700"
                    >
                      <IconPhone className="h-3.5 w-3.5" /> {agent.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <LeadForm
              variant="contact"
              heading="Send your requirement"
              description="Tell us what you are looking for and how soon you plan to move. The more detail you share, the sharper the shortlist."
              source="contact-page"
            />
            <div className="mt-6 rounded-panel border border-soft bg-mist p-6">
              <p className="font-sans text-[0.9875rem] font-semibold text-navy-900">Prefer to browse first?</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/properties" className="btn btn-primary">
                  Browse listings <IconArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/tools/mortgage-calculator" className="btn btn-outline">
                  Mortgage calculator
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="light">
        <div className="ui-container">
          <div className="rounded-panel border border-soft bg-mist p-6 lg:p-8">
            <p className="eyebrow text-forest-700">
              <span className="h-[1px] w-6 bg-current opacity-70" />
              WordbitX · the company behind Pak Property
            </p>
            <h2 className="display-3 mt-3 text-navy-900">Platform, software &amp; partnership enquiries</h2>
            <p className="lede mt-4 max-w-3xl">
              {SITE.name} is the official real estate platform demo developed by{" "}
              <a
                href={SITE.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="WordbitX Software Company"
                className="font-semibold text-navy-900 underline decoration-forest-500 hover:text-forest-700"
              >
                {SITE.company}
              </a>
              {" "}— Pakistan &amp; International Digital Solutions. For real estate platform licensing, custom PropTech marketplace engineering, mobile apps, or enterprise technology partnerships, contact WordbitX directly.
            </p>
            <dl className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Pakistan · Sales & support", value: SITE.companyPhone, note: "Company enquiries, Pakistan market" },
                { label: "USA / International", value: SITE.companyPhoneUs, note: "WordbitX international contact number" },
                { label: "Email", value: SITE.companyEmail, note: "Platform, licensing and partnerships" },
                { label: "Website", value: "wordbitxtech.com", note: "Company profile and services" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-soft bg-white p-4">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">{item.label}</p>
                  <p className="mt-2 font-sans text-[0.9375rem] font-semibold text-navy-900">{item.value}</p>
                  <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-muted">{item.note}</p>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.8125rem] text-ink-muted">
              <span>
                Office: {SITE.companyAddress.street}, {SITE.companyAddress.city}, {SITE.companyAddress.country}
              </span>
              <a
                href={SITE.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-forest-700 hover:text-forest-600"
              >
                Visit wordbitxtech.com <IconArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <p className="mt-5 text-[0.75rem] leading-relaxed text-ink-muted">
              Property enquiries for Pakistan are handled by the Pak Property desk using the Pakistan number above. The USA
              number is an international WordbitX business line and is not a property office.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="mist">
        <div className="ui-container">
          <SectionHeading
            eyebrow="Before you buy"
            title="Three things to prepare"
            description="Having these ready speeds up verification and shortlists considerably."
          />
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {[
              { title: "Budget & funding", copy: "Total budget, down payment available and whether you plan to finance." },
              { title: "Timeline", copy: "When you want possession — this decides whether we show ready or off-plan options." },
              { title: "Must-haves", copy: "Bedrooms, parking, schools nearby, security, or documentation requirements." },
            ].map((item) => (
              <div key={item.title} className="rounded-panel border border-soft bg-white p-6">
                <h3 className="font-sans text-[1rem] font-semibold text-navy-900">{item.title}</h3>
                <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-muted">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
