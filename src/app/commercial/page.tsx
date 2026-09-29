import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight, IconBuilding, IconCheck, IconMap } from "@/components/icons";
import { MapView, type MapProperty } from "@/components/map-view";
import { PageHero } from "@/components/page-hero";
import { PropertyCard } from "@/components/property-card";
import { Reveal } from "@/components/reveal";
import { CtaSection } from "@/components/sections-editorial";
import { Section, SectionHeading } from "@/components/section";
import { LeadForm } from "@/components/lead-form";
import { formatPrice } from "@/lib/format";
import { getCities, getMapProperties, searchProperties } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { photo } from "@/lib/images";

export const metadata: Metadata = buildMetadata({
  title: "Commercial Property in Pakistan — Offices, Shops & Warehouses",
  description:
    "Commercial property in Pakistan: office floors on Blue Area and Gulberg, retail units in Karachi and Lahore, income-ready buildings and warehouses near Port Qasim.",
  path: "/commercial",
  keywords: [
    "commercial property Pakistan",
    "office space for rent Islamabad",
    "shop for rent Lahore",
    "warehouse for rent Karachi",
  ],
});

const ASSET_CLASSES = [
  {
    title: "Office spaces",
    copy: "Fitted floors and managed suites with backup power, lift redundancy and secure parking.",
    href: "/properties/commercial?type=Office",
  },
  {
    title: "Retail shops",
    copy: "Boulevard and market frontage units with clear signage rights and loading access.",
    href: "/properties/commercial?type=Shop",
  },
  {
    title: "Commercial buildings",
    copy: "Multi-floor income assets, often tenanted, on established business corridors.",
    href: "/properties/commercial?type=Commercial+Building",
  },
  {
    title: "Warehouses",
    copy: "Clear-span logistics facilities with container access and yard space.",
    href: "/properties/commercial?type=Warehouse",
  },
];

export default async function CommercialPage() {
  const [listings, rentals, cities, mapRows] = await Promise.all([
    searchProperties({ category: "commercial", pageSize: 6, sort: "popular" }),
    searchProperties({ category: "commercial", purpose: "rent", pageSize: 3, sort: "price-asc" }),
    getCities(),
    getMapProperties({ category: "commercial" }, 12),
  ]);

  const mapProperties: MapProperty[] = mapRows.map((property) => ({
    id: property.id,
    slug: property.slug,
    title: property.title,
    cityName: property.cityName,
    locationArea: property.locationArea,
    price: property.price,
    priceUnit: property.priceUnit,
    lat: property.lat,
    lng: property.lng,
    coverImage: property.coverImage,
    propertyType: property.propertyType,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaValue: property.areaValue,
    areaUnit: property.areaUnit,
    citySlug: property.citySlug,
  }));

  return (
    <>
      <PageHero
        eyebrow="Commercial property"
        title="Spaces Built for Business"
        description="Offices, retail, commercial buildings and warehousing — compared on frontage, footfall, parking, building services and lease terms rather than headline rent alone."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Commercial", href: "/commercial" },
        ]}
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/properties/commercial" className="btn btn-green">
            Explore Commercial Properties <IconArrowRight className="h-[1.05rem] w-[1.05rem]" />
          </Link>
          <Link href="/contact?topic=commercial" className="btn btn-ghost-light">
            Submit a requirement
          </Link>
        </div>
      </PageHero>

      <Section tone="light">
        <div className="ui-container">
          <SectionHeading
            eyebrow="Asset classes"
            title="Four commercial categories we cover"
            description="Each asset type is judged on the metrics that decide whether a tenant stays for three years or one."
          />
          <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {ASSET_CLASSES.map((asset, index) => (
              <Reveal key={asset.title} delay={index * 50}>
                <Link
                  href={asset.href}
                  className="group flex h-full flex-col rounded-panel border border-soft bg-white p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-navy-100 hover:shadow-card"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-navy-800 text-white">
                    <IconBuilding className="h-5 w-5" />
                  </span>
                  <span className="mt-4 font-sans text-[1rem] font-semibold text-navy-900">{asset.title}</span>
                  <span className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-ink-muted">{asset.copy}</span>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-forest-700">
                    View listings <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="mist">
        <div className="ui-container">
          <SectionHeading
            eyebrow="Commercial inventory"
            title="Selected commercial listings"
            description="Income-ready assets and workspaces currently available across our tracked cities."
            action={{ label: "All commercial listings", href: "/properties/commercial" }}
          />
          <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {listings.items.map((property, index) => (
              <Reveal key={property.id} delay={index * 50}>
                <PropertyCard property={property} />
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="light">
        <div className="ui-container grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <div>
            <p className="eyebrow text-forest-700">
              <span className="h-[1px] w-6 bg-current opacity-70" />
              Rule of thumb
            </p>
            <h2 className="display-2 mt-4 text-navy-900">How we evaluate a commercial unit</h2>
            <ul className="mt-6 space-y-4">
              {[
                { title: "Footfall & frontage", copy: "Ground floor visibility, corner exposure and pedestrian flow decide retail rent." },
                { title: "Building services", copy: "Backup power, HVAC, lift redundancy and fire compliance decide office rent." },
                { title: "Access & loading", copy: "Parking bays and service lanes matter as much as the rate per square foot." },
                { title: "Lease structure", copy: "Lease length, escalation terms and fit-out responsibility shape net yield." },
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

            {rentals.items.length > 0 && (
              <div className="mt-8 rounded-panel border border-soft bg-mist p-6">
                <p className="flex items-center gap-2 font-sans text-[0.9375rem] font-semibold text-navy-900">
                  <IconMap className="h-4 w-4 text-forest-600" /> Entry-level commercial rentals
                </p>
                <ul className="mt-4 space-y-3">
                  {rentals.items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-4 text-[0.875rem]">
                      <Link href={`/property/${item.slug}`} className="min-w-0 truncate font-medium text-navy-900 hover:text-forest-700">
                        {item.title} — {item.locationArea}
                      </Link>
                      <span className="shrink-0 font-semibold text-forest-700">{formatPrice(item.price, item.priceUnit)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-panel bg-soft">
            <img
              src={photo(18468708, 1200, 1400)}
              alt="Glass office towers in a financial district"
              width={1200}
              height={1400}
              loading="lazy"
              decoding="async"
              className="h-[320px] w-full object-cover lg:h-[600px]"
            />
          </div>
        </div>
      </Section>

      {mapProperties.length > 0 && (
        <Section tone="mist">
          <div className="ui-container">
            <SectionHeading
              eyebrow="Location intelligence"
              title="Commercial clusters on the map"
              description="Compare business districts, corridors and logistics zones by position rather than brochure claims."
            />
            <div className="mt-8">
              <MapView properties={mapProperties} center={{ lat: 31.2, lng: 72.9 }} zoom={9} />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {cities.slice(0, 6).map((city) => (
                <Link key={city.slug} href={`/properties/commercial?city=${city.slug}`} className="chip">
                  Commercial in {city.name}
                </Link>
              ))}
            </div>
          </div>
        </Section>
      )}

      <Section tone="light">
        <div className="ui-container grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <p className="eyebrow text-forest-700">
              <span className="h-[1px] w-6 bg-current opacity-70" />
              Corporate desk
            </p>
            <h2 className="display-2 mt-4 text-navy-900">Have a requirement or an asset to lease?</h2>
            <p className="lede mt-4">
              Send us the brief — headcount, preferred corridor, parking needs and budget. We shortlist matching options
              and arrange back-to-back viewings in a single day where possible.
            </p>
          </div>
          <LeadForm
            variant="contact"
            heading="Commercial requirement"
            description="Share your requirement and our commercial leasing desk will respond with matched options."
            source="commercial-page"
          />
        </div>
      </Section>

      <CtaSection />
    </>
  );
}
