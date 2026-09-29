import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { DealerCard } from "@/components/dealer-card";
import { PageHero } from "@/components/page-hero";
import { Section, SectionHeading } from "@/components/section";
import { BlueTick, UnverifiedChip } from "@/components/verified-badge";
import { getCities, getDealerCount, getDealers } from "@/lib/queries";
import { buildMetadata, breadcrumbJsonLd, collectionPageJsonLd, itemListJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Verified Property Dealers & Agencies in Pakistan | Properties Pak",
  description:
    "Browse verified property dealers and agencies on Properties Pak. Every blue-tick profile is an account whose identity and contact details were checked by our team and that has live property listings in Lahore, Islamabad, Karachi and other cities.",
  path: "/dealers",
  keywords: [
    "verified property dealers Pakistan",
    "property agents Lahore",
    "real estate agencies Islamabad",
    "property dealers Karachi",
    "plot dealers Pakistan",
    "blue tick property dealer",
  ],
});

export default async function DealersPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;
  const [allDealers, cities, dealerCount] = await Promise.all([
    getDealers({ city, limit: 48 }),
    getCities(),
    getDealerCount(),
  ]);

  const featuredDealers = allDealers.filter((dealer) => dealer.isVerified);
  const citiesWithDealers = new Set(allDealers.map((dealer) => dealer.citySlug));

  return (
    <>
      <JsonLd
        data={collectionPageJsonLd({
          name: "Verified property dealers and agencies",
          description:
            "Dealer directory on Properties Pak: verified agencies and individual sellers with published property listings.",
          path: "/dealers",
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Dealers", href: "/dealers" },
        ])}
      />
      {allDealers.length > 0 && (
        <JsonLd
          data={itemListJsonLd({
            name: "Verified dealers on Properties Pak",
            path: "/dealers",
            items: allDealers.slice(0, 24).map((dealer) => ({
              name: dealer.isVerified ? `${dealer.name} — verified dealer` : dealer.name,
              path: `/dealers/${dealer.slug}`,
            })),
          })}
        />
      )}

      <PageHero
        eyebrow="Dealer directory"
        title="Verified Property Dealers & Agencies"
        description={`${dealerCount} accounts on Properties Pak have published property. Profiles carrying the blue tick have had their identity, agency and phone number checked by our team.`}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Dealers", href: "/dealers" },
        ]}
      />

      <Section tone="light">
        <div className="ui-container">
          <SectionHeading
            eyebrow="How verification works"
            title="What the blue tick means on Properties Pak"
            description="The tick is not a paid badge and it is not automatic. It is switched on from the admin workspace after our team has confirmed the account behind the listings."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-panel border border-soft bg-white p-5 shadow-soft">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#1D9BF0]/10">
                <BlueTick className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-sans text-[0.9375rem] font-semibold text-navy-900">Identity &amp; contact confirmed</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-muted">
                We verify the name, agency and working phone number against the account before switching the tick on. The
                same number is used for the listing&rsquo;s calls and WhatsApp enquiries.
              </p>
            </div>
            <div className="rounded-panel border border-soft bg-white p-5 shadow-soft">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-mist">
                <UnverifiedChip className="scale-[0.85]" />
              </span>
              <h3 className="mt-4 font-sans text-[0.9375rem] font-semibold text-navy-900">Unverified accounts stay visible</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-muted">
                Any registered account that lists a property appears in this directory. Until our team verifies it, the
                profile is clearly marked as not verified rather than silently removed.
              </p>
            </div>
            <div className="rounded-panel border border-soft bg-white p-5 shadow-soft">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-forest-50 font-sans text-[0.75rem] font-bold text-forest-700">
                3
              </span>
              <h3 className="mt-4 font-sans text-[0.9375rem] font-semibold text-navy-900">List, then get verified</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-muted">
                <Link href="/list-property" className="font-semibold text-forest-700 hover:underline">
                  Publish a property
                </Link>{" "}
                with your account and our team reviews it. Approved listings and a confirmed phone number earn the blue tick
                from the admin side.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="mist">
        <div className="ui-container">
          <SectionHeading
            eyebrow="Browse"
            title={city ? `Dealers in ${cities.find((item) => item.slug === city)?.name ?? city}` : "Dealers across Pakistan"}
            description={`${featuredDealers.length} verified ${featuredDealers.length === 1 ? "profile" : "profiles"} shown first, followed by accounts still awaiting verification.`}
            action={{ label: `All ${dealerCount} dealers`, href: "/dealers" }}
          />
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/dealers" className={`chip ${!city ? "chip-active" : ""}`}>
              All cities
            </Link>
            {cities
              .filter((item) => citiesWithDealers.has(item.slug))
              .map((item) => (
                <Link key={item.slug} href={`/dealers?city=${item.slug}`} className={`chip ${city === item.slug ? "chip-active" : ""}`}>
                  {item.name}
                </Link>
              ))}
          </div>

          {allDealers.length === 0 ? (
            <div className="mt-10 rounded-panel border border-soft bg-white p-10 text-center">
              <h3 className="font-sans text-[1.1rem] font-semibold text-navy-900">No dealer profiles in this city yet</h3>
              <p className="mx-auto mt-2 max-w-xl text-[0.875rem] leading-relaxed text-ink-muted">
                Dealer profiles appear here as soon as an account publishes its first property. Register, submit a listing and
                your profile becomes part of this directory.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/list-property" className="btn btn-primary">
                  List your property
                </Link>
                <Link href="/login?mode=register" className="btn btn-outline">
                  Create an account
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid auto-rows-fr gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {allDealers.map((dealer) => (
                <DealerCard key={dealer.id} dealer={dealer} />
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section tone="light">
        <div className="ui-container">
          <div className="rounded-panel border border-soft bg-navy-950 p-7 text-white lg:p-10">
            <p className="eyebrow text-forest-400">
              <span className="h-px w-6 bg-current" /> For agencies
            </p>
            <h2 className="display-3 mt-3 text-white">Get your agency verified on Properties Pak</h2>
            <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-white/70">
              Publish your inventory under one account and your agency profile carries the blue tick across every listing,
              search result and enquiry. Verification is free — it depends on a confirmed contact number and a clean listing
              record, not on an advertising package.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/list-property" className="btn btn-green">
                Publish a listing
              </Link>
              <Link href="/contact" className="btn btn-ghost-light">
                Talk to {SITE.company}
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
