import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowRight, IconPin } from "@/components/icons";
import { ListingView, type RawSearchParams } from "@/components/listing-view";
import { LeadForm } from "@/components/lead-form";
import { MapView, type MapProperty } from "@/components/map-view";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section";
import { PROPERTY_TYPES } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { getCities, getCityBySlug, getMapProperties, searchProperties } from "@/lib/queries";
import { buildMetadata, listingRobots } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
};

const FILTER_KEYS = ["q", "type", "category", "beds", "minPrice", "maxPrice", "minArea", "sort", "page"];

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  const city = await getCityBySlug(slug);
  if (!city) {
    return buildMetadata({
      title: "City not found",
      description: "This property market is not covered yet on Pak Property.",
      path: "/properties",
    });
  }
  const hasFilters = FILTER_KEYS.some((key) => {
    const value = raw[key];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });
  return {
    ...buildMetadata({
      title: `Property in ${city.name} — Houses, Plots & Apartments for Sale and Rent`,
      description: `${city.tagline}. Browse property for sale and rent in ${city.name}: locations, indicative pricing bands, new developments and rental demand across ${city.province}.`,
      path: `/city/${city.slug}`,
      image: city.imageUrl,
      keywords: [
        `property ${city.name}`,
        `real estate ${city.name}`,
        `houses for sale ${city.name}`,
        `property for rent ${city.name}`,
        `plots ${city.name}`,
      ],
    }),
    robots: listingRobots(hasFilters),
  };
}

export default async function CityPage({ params, searchParams }: PageProps) {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  const city = await getCityBySlug(slug);
  if (!city) notFound();

  const [allCities, cityListings, forSale, forRent, mapRows] = await Promise.all([
    getCities(),
    searchProperties({ city: city.slug, pageSize: 3, sort: "popular" }),
    searchProperties({ city: city.slug, purpose: "buy", pageSize: 1 }),
    searchProperties({ city: city.slug, purpose: "rent", pageSize: 1 }),
    getMapProperties({ city: city.slug }, 16),
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

  const bands = cityListings.items.length
    ? { low: Math.min(...cityListings.items.map((item) => item.price)), high: Math.max(...cityListings.items.map((item) => item.price)) }
    : null;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy-950 pb-16 pt-28 lg:pb-20 lg:pt-36">
        <div className="absolute inset-0">
          <img
            src={city.imageUrl}
            alt={city.imageAlt || `${city.name} property market`}
            width={1800}
            height={1000}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/92 to-navy-900/55" />
        </div>
        <div className="ui-container relative z-10">
          <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-white/60">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <IconArrowRight className="h-3.5 w-3.5 opacity-60" />
                <Link href="/properties" className="hover:text-white">
                  Properties
                </Link>
              </li>
              <li className="flex items-center gap-2 text-white/85">
                <IconArrowRight className="h-3.5 w-3.5 opacity-60" />
                {city.name}
              </li>
            </ol>
          </nav>

          <p className="eyebrow mt-7 text-forest-400">
            <IconPin className="h-3.5 w-3.5" />
            {city.province}
          </p>
          <h1 className="display-2 mt-4 max-w-3xl text-white ew-fade-up">
            Property in {city.name} — For Sale &amp; For Rent
          </h1>
          <p className="lede mt-4 max-w-2xl text-white/70">{city.description}</p>

          <dl className="mt-9 grid grid-cols-2 gap-6 border-t border-white/12 pt-7 sm:grid-cols-4">
            <div>
              <dt className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-white/55">Sale listings</dt>
              <dd className="mt-2 font-sans text-[1.5rem] font-bold text-white">{forSale.total}</dd>
            </div>
            <div>
              <dt className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-white/55">Rentals</dt>
              <dd className="mt-2 font-sans text-[1.5rem] font-bold text-white">{forRent.total}</dd>
            </div>
            <div>
              <dt className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-white/55">Mapped listings</dt>
              <dd className="mt-2 font-sans text-[1.5rem] font-bold text-white">{mapRows.length}</dd>
            </div>
            {bands && (
              <div>
                <dt className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-white/55">Featured band</dt>
                <dd className="mt-2 font-sans text-[1.05rem] font-bold text-white">
                  {formatPrice(bands.low)} – {formatPrice(bands.high)}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      <ListingView
        eyebrow={`${city.name} listings`}
        title={`Sample property listings in ${city.name}`}
        description={`Filter ${city.name} inventory by society, property type, budget and size. Compare rentals and sale prices across the city's active sectors.`}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Cities", href: "/properties" },
          { name: city.name, href: `/city/${city.slug}` },
        ]}
        basePath={`/city/${city.slug}`}
        raw={raw}
        fixed={{ city: city.slug }}
        purposeKind="mixed"
        typeOptions={[...PROPERTY_TYPES]}
        withMap={false}
        showHero={false}
      />

      <Section tone="mist">
        <div className="ui-container">
          <SectionHeading
            eyebrow="Market notes"
            title={`What to know about buying in ${city.name}`}
            description={`Practical context on ${city.name}'s pricing, documentation and rental demand.`}
          />
          <div className="mt-9 grid gap-6 md:grid-cols-3">
            <div className="rounded-panel border border-soft bg-white p-6">
              <h3 className="font-sans text-[1rem] font-semibold text-navy-900">Pricing structure</h3>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-muted">
                Prices in {city.name} vary sharply by society and development status. Developed sectors with utilities
                complete generally carry a premium over newer schemes with instalment plans.
              </p>
            </div>
            <div className="rounded-panel border border-soft bg-white p-6">
              <h3 className="font-sans text-[1rem] font-semibold text-navy-900">Documentation</h3>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-muted">
                Always confirm the transfer procedure, dues clearance and any authority NOC in writing before paying a
                token. Our consultants provide the checklist for each society.
              </p>
            </div>
            <div className="rounded-panel border border-soft bg-white p-6">
              <h3 className="font-sans text-[1rem] font-semibold text-navy-900">Rental demand</h3>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-muted">
                Rentals near business districts, universities and hospitals in {city.name} let fastest. Use our yield
                calculator to compare rent against purchase price.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <LeadForm
              variant="contact"
              heading={`Talk to our ${city.name} desk`}
              description={`Tell us your requirement in ${city.name} and we will send matched options, including off-market files.`}
              defaultCity={city.name}
              source={`city-${city.slug}`}
            />
            <div>
              <h3 className="font-sans text-[1.05rem] font-semibold text-navy-900">Other property markets</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {allCities
                  .filter((item) => item.slug !== city.slug)
                  .map((item) => (
                    <Link key={item.slug} href={`/city/${item.slug}`} className="chip">
                      Property in {item.name}
                    </Link>
                  ))}
              </div>
              <div className="mt-6 grid gap-3">
                {cityListings.items.map((item) => (
                  <Reveal key={item.id}>
                    <Link
                      href={`/property/${item.slug}`}
                      className="flex items-center justify-between gap-4 rounded-xl border border-soft bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-card"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-sans text-[0.9375rem] font-semibold text-navy-900">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-[0.8125rem] text-ink-muted">{item.locationArea}</span>
                      </span>
                      <span className="shrink-0 font-sans text-[0.875rem] font-bold text-forest-700">
                        {formatPrice(item.price, item.priceUnit)}
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {mapProperties.length > 0 && (
        <Section tone="light">
          <div className="ui-container">
            <SectionHeading
              eyebrow="Map"
              title={`${city.name} inventory on the map`}
              description="Markers are placed at society level. Open a pin to jump straight to the listing."
            />
            <div className="mt-8">
              <MapView properties={mapProperties} center={{ lat: city.lat, lng: city.lng }} zoom={12} />
            </div>
          </div>
        </Section>
      )}
    </>
  );
}
