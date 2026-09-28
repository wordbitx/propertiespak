import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight, IconCheck, IconShield, IconPin, IconLayers } from "@/components/icons";
import { ListingForm } from "@/components/listing-form";
import { PageHero } from "@/components/page-hero";
import { Section, SectionHeading } from "@/components/section";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = buildMetadata({
  title: "List Your Property in Pakistan — Free Listing Review",
  description:
    "List your house, apartment, plot, office or shop on Pak Property. Free listing review, pricing guidance and photography support for owners and landlords in Pakistan.",
  path: "/list-property",
  keywords: ["list property Pakistan", "sell house Lahore", "rent out property Pakistan", "property listing Pakistan"],
});

const STEPS = [
  {
    icon: IconLayers,
    step: "1",
    title: "Submit Details & Photos",
    copy: "Size, location, asking price, features and original photos — 5 minutes is all it takes.",
  },
  {
    icon: IconPin,
    step: "2",
    title: "Pin on Satellite Map",
    copy: "Type sector, block or phase to drop an exact pin on our high-resolution society satellite map.",
  },
  {
    icon: IconShield,
    step: "3",
    title: "Admin Review & Verify",
    copy: "Our verification team reviews your property details, dues and location before approving.",
  },
  {
    icon: IconCheck,
    step: "4",
    title: "Published Live to Buyers",
    copy: "Your property goes live with full map, photos and direct WhatsApp / call links straight to you.",
  },
];

export default function ListPropertyPage() {
  return (
    <>
      <PageHero
        eyebrow="For owners & landlords"
        title="List Your Property With Pak Property"
        description="Reach thousands of active buyers and corporate tenants with accurate pricing, exact satellite map pinning, and direct WhatsApp enquiries."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "List Your Property", href: "/list-property" },
        ]}
      >
        <div className="flex flex-wrap gap-3">
          <a href="#submit" className="btn btn-green">
            Start listing <IconArrowRight className="h-4 w-4" />
          </a>
          <a href={`tel:${SITE.companyPhone.replace(/\s/g, "")}`} className="btn btn-ghost-light">
            Call {SITE.companyPhone}
          </a>
        </div>
      </PageHero>

      {/* Spacious Listing Section */}
      <Section tone="light">
        <div className="ui-container">
          {/* 4-Step Process Cards */}
          <div className="mb-10">
            <p className="eyebrow text-forest-700">
              <span className="h-[1px] w-6 bg-current opacity-70" />
              Listing Process
            </p>
            <h2 className="display-3 mt-2 text-navy-900">How listing on Pak Property works</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="flex flex-col justify-between rounded-xl border border-soft bg-mist/60 p-5 shadow-soft transition-all hover:bg-white hover:shadow-card"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-navy-800 text-white">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="font-sans text-xs font-bold uppercase tracking-wider text-forest-700">
                          Step {step.step}
                        </span>
                      </div>
                      <h3 className="mt-4 font-sans text-[1rem] font-bold text-navy-900">{step.title}</h3>
                      <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-muted">{step.copy}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Large, Prominent, Full-Width Listing Form */}
          <div id="submit" className="mx-auto w-full max-w-5xl">
            <ListingForm />
          </div>

          {/* Guidance Below Form */}
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
            <div className="rounded-panel border border-soft bg-mist p-6">
              <h3 className="font-sans text-[1rem] font-bold text-navy-900">What we ask you to have ready</h3>
              <ul className="mt-4 space-y-2.5 text-[0.875rem] text-ink">
                {[
                  "Copy of the title, allotment or transfer letter",
                  "Latest dues statement or possession certificate",
                  "Exact plot number, block, sector and front road width",
                  "Clear, original photos of the property for fastest approval",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-panel border border-soft bg-mist p-6">
              <h3 className="font-sans text-[1rem] font-bold text-navy-900">Need pricing or yield guidance?</h3>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-muted">
                Not sure what asking price or rental yield makes sense for your society? Use our tools or speak to our advisory desk before setting your price.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link href="/tools/rental-yield-calculator" className="btn btn-outline text-xs">
                  Rental Yield Calculator
                </Link>
                <Link href="/tools/property-tax-calculator" className="btn btn-outline text-xs">
                  Property Tax Calculator
                </Link>
                <Link href="/contact" className="btn btn-outline text-xs">
                  Consult Advisor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="mist">
        <div className="ui-container">
          <SectionHeading
            eyebrow="For developers"
            title="Launching a project or housing scheme?"
            description="We onboard developers with unit-wise inventory, payment plans and handover schedules, and track progress updates on the project page."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact?topic=projects" className="btn btn-primary">
              Talk to the projects desk <IconArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/projects" className="btn btn-outline">
              See tracked projects
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
