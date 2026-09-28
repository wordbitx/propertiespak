import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Calculators } from "@/components/calculators";
import { FavoriteButton } from "@/components/favorite-button";
import { CompareToggle } from "@/components/compare-toggle";
import { PropertyScorePanel } from "@/components/property-score-panel";
import {
  IconArea,
  IconArrowRight,
  IconBath,
  IconBed,
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconLayers,
  IconMail,
  IconPhone,
  IconPin,
  IconShield,
  IconWhatsApp,
} from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { LeadForm } from "@/components/lead-form";
import { MapView, type MapProperty } from "@/components/map-view";
import { SinglePropertyMap } from "@/components/single-property-map";
import { PropertyCard, purposeBadge } from "@/components/property-card";
import { PropertyGallery } from "@/components/property-gallery";
import { Reveal } from "@/components/reveal";
import { ShareButton } from "@/components/share-button";
import { Section, SectionHeading } from "@/components/section";
import { formatArea, formatDate, formatNumber, formatPrice } from "@/lib/format";
import { getAgentBySlug, getPropertyBySlug, getSimilarProperties, getNearbyProperties } from "@/lib/queries";
import { buildMetadata, propertyJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";

type PageProps = { params: Promise<{ slug: string }> };

/** Builds the search-intent heading, e.g. "10 Marla House for Sale in DHA Phase 2 Lahore". */
function intentHeading(property: {
  areaValue: number;
  areaUnit: string;
  bedrooms: number;
  propertyType: string;
  purpose: string;
  locationArea: string;
  cityName: string;
}) {
  const sizeLabel =
    property.areaUnit === "marla" || property.areaUnit === "kanal"
      ? `${Number.isInteger(property.areaValue) ? property.areaValue : property.areaValue} ${property.areaUnit === "marla" ? "Marla" : "Kanal"}`
      : property.bedrooms > 0
        ? `${property.bedrooms} Bed`
        : formatArea(property.areaValue, property.areaUnit);
  const purposeLabel = property.purpose === "rent" ? "Rent" : "Sale";
  return `${sizeLabel} ${property.propertyType} for ${purposeLabel} in ${property.locationArea} ${property.cityName}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) {
    return buildMetadata({
      title: "Property not found",
      description: "This listing is no longer available on Pak Property.",
      path: "/properties",
    });
  }
  const price = formatPrice(property.price, property.priceUnit);
  const heading = intentHeading(property);
  return buildMetadata({
    title: `${heading} | ${price}`,
    description: `${heading}. ${formatArea(property.areaValue, property.areaUnit)}${property.bedrooms ? `, ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms` : ""} — ${price}. Compare price, size and location with map search and investment tools on Pak Property.`,
    path: `/property/${property.slug}`,
    image: property.coverImage,
    keywords: [
      `${property.propertyType} for ${property.purpose === "rent" ? "rent" : "sale"} ${property.cityName}`,
      `${property.locationArea} property`,
      `real estate ${property.cityName}`,
      "property Pakistan",
    ],
  });
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const [agent, similar, nearby] = await Promise.all([
    getAgentBySlug(property.agentSlug),
    getSimilarProperties(property, 3),
    getNearbyProperties(property, 6, 20),
  ]);

  const badge = purposeBadge(property);
  const isOwnerListing = Boolean(property.listedByName && property.listedByPhone);
  const contactName = isOwnerListing ? property.listedByName : (agent?.name ?? "Pak Property Advisory");
  const contactTitle = isOwnerListing ? "Property Listing Person" : (agent?.title ?? "Property Consultant");
  const contactPhone = isOwnerListing ? property.listedByPhone : (agent?.phone ?? SITE.companyPhone);
  const contactWhatsapp = (isOwnerListing
    ? property.listedByWhatsapp || property.listedByPhone
    : agent?.whatsapp || SITE.companyPhone
  ).replace(/\D/g, "");
  const contactEmail = isOwnerListing ? property.listedByEmail : (agent?.email ?? SITE.companyEmail);
  const whatsappMessage = encodeURIComponent(
    `Hi ${contactName}, I'm interested in this property on Pak Property: ${property.title}, ${property.locationArea}, ${property.cityName}. Please share more details. Reference EWX-${String(property.id).padStart(5, "0")}.`,
  );
  const facts: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[] = [
    { label: "Property type", value: property.propertyType, icon: IconBuilding },
    { label: "Purpose", value: property.purpose === "rent" ? "For rent" : "For sale" },
    { label: "Area", value: formatArea(property.areaValue, property.areaUnit), icon: IconArea },
    { label: "Bedrooms", value: property.bedrooms > 0 ? String(property.bedrooms) : "—", icon: IconBed },
    { label: "Bathrooms", value: property.bathrooms > 0 ? String(property.bathrooms) : "—", icon: IconBath },
    { label: "Parking spaces", value: property.parking > 0 ? String(property.parking) : "—" },
    { label: "Furnishing", value: property.furnishing },
    { label: "Possession", value: property.possession, icon: IconCalendar },
    { label: "Price basis", value: property.negotiable ? "Negotiable" : "Fixed" },
    { label: "Reference", value: `EWX-${String(property.id).padStart(5, "0")}` },
  ];

  const propertyMap: MapProperty = {
    id: property.id, slug: property.slug, title: property.title,
    cityName: property.cityName, citySlug: property.citySlug, locationArea: property.locationArea,
    price: property.price, priceUnit: property.priceUnit, lat: property.lat, lng: property.lng,
    coverImage: property.coverImage, propertyType: property.propertyType, bedrooms: property.bedrooms,
    bathrooms: property.bathrooms, areaValue: property.areaValue, areaUnit: property.areaUnit,
  };
  const nearbyMap: MapProperty[] = nearby.map((item) => ({
    id: item.id, slug: item.slug, title: item.title,
    cityName: item.cityName, citySlug: item.citySlug, locationArea: item.locationArea,
    price: item.price, priceUnit: item.priceUnit, lat: item.lat, lng: item.lng,
    coverImage: item.coverImage, propertyType: item.propertyType, bedrooms: item.bedrooms,
    bathrooms: item.bathrooms, areaValue: item.areaValue, areaUnit: item.areaUnit,
    distanceKm: item.distanceKm,
  }));

  return (
    <>
      {/* Detail header band */}
      <section className="relative isolate overflow-hidden bg-navy-950 pb-40 pt-28 lg:pb-48 lg:pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(800px 400px at 10% -10%, rgba(22,179,100,0.22), transparent 60%), radial-gradient(700px 400px at 92% 10%, rgba(19,80,127,0.5), transparent 62%)",
          }}
        />
        <div className="ui-container relative z-10">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Properties", href: "/properties" },
              { name: property.cityName, href: `/city/${property.citySlug}` },
              { name: property.locationArea, href: `/properties?q=${encodeURIComponent(property.locationArea)}` },
              { name: property.title, href: `/property/${property.slug}` },
            ]}
          />
          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            <span className={`rounded-md px-2.5 py-1 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.12em] ${badge.className}`}>
              {badge.label}
            </span>
            {property.verified && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-forest-600/15 px-2.5 py-1 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-forest-400">
                <IconShield className="h-3.5 w-3.5" /> Demo listing
              </span>
            )}
            <span className="rounded-md border border-white/15 px-2.5 py-1 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/70">
              {property.cityName}
            </span>
          </div>

          <div className="mt-5 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-end">
            <div>
              <h1 className="display-2 max-w-3xl text-white ew-fade-up">{intentHeading(property)}</h1>
              <p className="mt-3 font-sans text-[1.05rem] font-semibold text-white/85">{property.title}</p>
              <p className="mt-3 flex items-center gap-2 text-[0.9375rem] text-white/70">
                <IconPin className="h-4 w-4 text-forest-400" />
                {property.address || `${property.locationArea}, ${property.cityName}`}
              </p>
            </div>
            <div className="lg:text-right">
              <p className="font-sans text-[clamp(1.7rem,3.2vw,2.4rem)] font-bold leading-none tracking-[-0.03em] text-white">
                {formatPrice(property.price, property.priceUnit)}
              </p>
              <p className="mt-2 text-[0.8125rem] text-white/60">
                {property.negotiable ? "Price negotiable" : "Fixed price"} · {formatNumber(property.views)} views ·
                Listed {formatDate(property.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery + sticky contact rail */}
      <section className="bg-white pb-4">
        <div className="ui-container relative z-10 -mt-32 lg:-mt-40">
          <div className="mb-6 flex flex-wrap items-start gap-3 rounded-panel border border-soft bg-mist px-5 py-4">
            <span className="mt-0.5 shrink-0 rounded-md bg-navy-800 px-2 py-1 font-sans text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white">
              Demo listing
            </span>
            <p className="text-[0.8125rem] leading-relaxed text-ink-muted">
              This listing is illustrative sample inventory created for the Pak Property product demonstration by WordbitX
              Software Company. Price, availability and documentation status are examples only and are not verified market
              transactions. Always verify details independently before paying a token.
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:gap-10">
            <div className="min-w-0">
              <PropertyGallery images={property.images.length ? property.images : [property.coverImage]} title={property.title} />

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <FavoriteButton propertyId={property.id} title={property.title} tone="dark" className="h-11 w-auto gap-2 rounded-[10px] px-4" />
                <CompareToggle propertyId={property.id} title={property.title} withLabel className="h-11" />
                <ShareButton title={property.title} />
                <a href="#schedule" className="btn btn-outline">
                  <IconCalendar className="h-4 w-4" /> Schedule a visit
                </a>
                <a
                  href={`https://wa.me/${contactWhatsapp}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-green"
                >
                  <IconWhatsApp className="h-4 w-4" /> WhatsApp
                </a>
              </div>

              {/* Key facts */}
              <div className="mt-8 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                {facts.slice(0, 4).map((fact) => {
                  const Icon = fact.icon ?? IconLayers;
                  return (
                    <div key={fact.label} className="rounded-xl border border-soft bg-mist/60 p-4">
                      <Icon className="h-[1.15rem] w-[1.15rem] text-forest-600" />
                      <p className="mt-3 font-sans text-[0.9375rem] font-semibold text-navy-900">{fact.value}</p>
                      <p className="mt-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                        {fact.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Description */}
              <div className="mt-10">
                <h2 className="font-sans text-[1.35rem] font-bold text-navy-900">About this property</h2>
                <p className="mt-4 text-[0.9875rem] leading-[1.75] text-ink">{property.description}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div>
                    <h3 className="font-sans text-[0.9375rem] font-semibold text-navy-900">Features</h3>
                    <ul className="mt-3 space-y-2.5">
                      {property.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-[0.9rem] text-ink">
                          <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-sans text-[0.9375rem] font-semibold text-navy-900">Society & amenities</h3>
                    <ul className="mt-3 space-y-2.5">
                      {property.amenities.map((amenity) => (
                        <li key={amenity} className="flex items-start gap-2.5 text-[0.9rem] text-ink">
                          <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Facts table */}
              <div className="mt-10">
                <h2 className="font-sans text-[1.35rem] font-bold text-navy-900">Property details</h2>
                <dl className="mt-4 grid gap-x-10 gap-y-0 sm:grid-cols-2">
                  {facts.map((fact) => (
                    <div key={fact.label} className="flex items-center justify-between gap-4 border-b border-soft py-3.5">
                      <dt className="text-[0.875rem] text-ink-muted">{fact.label}</dt>
                      <dd className="font-sans text-[0.875rem] font-semibold text-navy-900">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="mt-10">
                <PropertyScorePanel property={property} />
              </div>

              <div className="mt-10 rounded-panel border border-soft bg-mist p-6">
                <h2 className="font-sans text-[1.05rem] font-semibold text-navy-900">Related research for this property</h2>
                <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-muted">
                  Compare this listing with the wider market before you shortlist. These pages include indicative price
                  bands, buyer checks and calculators.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/property-for-sale-in-${property.citySlug}`} className="chip">
                    Property for sale in {property.cityName}
                  </Link>
                  <Link href={`/property-for-rent-in-${property.citySlug}`} className="chip">
                    Property for rent in {property.cityName}
                  </Link>
                  <Link href={`/properties?q=${encodeURIComponent(property.locationArea)}`} className="chip">
                    More in {property.locationArea}
                  </Link>
                  {property.isNewProject && property.projectSlug && (
                    <Link href={`/projects/${property.projectSlug}`} className="chip">
                      Project details
                    </Link>
                  )}
                  <Link href="/tools/mortgage-calculator" className="chip">
                    Mortgage calculator
                  </Link>
                  <Link href="/tools/rental-yield-calculator" className="chip">
                    Rental yield calculator
                  </Link>
                  <Link href="/blog/property-documentation-checklist-pakistan" className="chip">
                    Documentation checklist
                  </Link>
                  <Link href="/property-investment-in-pakistan" className="chip">
                    Investment guide
                  </Link>
                </div>
              </div>
            </div>

            {/* Sticky rail */}
            <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-panel border border-soft bg-white p-6 shadow-card">
                <div className="flex items-center gap-3.5">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-navy-800 font-sans text-[0.9375rem] font-bold text-white">
                    {contactName
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-sans text-[0.9875rem] font-semibold text-navy-900">
                      {contactName}
                    </p>
                    <p className="truncate text-[0.8125rem] text-ink-muted">{contactTitle}</p>
                  </div>
                </div>

                <dl className="mt-5 space-y-2 border-y border-soft py-4 text-[0.8125rem]">
                  {isOwnerListing ? (
                    <>
                      <div className="flex justify-between gap-3">
                        <dt className="text-ink-muted">Listed by</dt>
                        <dd className="text-right font-medium text-navy-900">{contactName}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-ink-muted">Listing type</dt>
                        <dd className="text-right font-medium text-navy-900">Owner / listing person</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-ink-muted">Location</dt>
                        <dd className="text-right font-medium text-navy-900">{property.cityName}</dd>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between gap-3">
                        <dt className="text-ink-muted">Agency</dt>
                        <dd className="text-right font-medium text-navy-900">{agent?.agency ?? SITE.name}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-ink-muted">Profile</dt>
                        <dd className="text-right font-medium text-navy-900">
                          {agent ? `${agent.experienceYears} years advising in ${agent.cityName}` : "Multi-city desk"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-ink-muted">Languages</dt>
                        <dd className="text-right font-medium text-navy-900">{agent?.languages.join(", ") ?? "English, Urdu"}</dd>
                      </div>
                    </>
                  )}
                </dl>

                <div className="mt-5 grid gap-2.5">
                  <a href={`tel:${contactPhone.replace(/\s/g, "")}`} className="btn btn-primary w-full">
                    <IconPhone className="h-4 w-4" /> {contactPhone}
                  </a>
                  <a
                    href={`https://wa.me/${contactWhatsapp}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-green w-full"
                  >
                    <IconWhatsApp className="h-4 w-4" /> WhatsApp {contactName}
                  </a>
                  <a href={`mailto:${contactEmail}`} className="btn btn-outline w-full">
                    <IconMail className="h-4 w-4" /> Email enquiry
                  </a>
                </div>

                <p className="mt-5 text-[0.75rem] leading-relaxed text-ink-muted">
                  {isOwnerListing
                    ? "The contact details above belong to the person who submitted this property listing."
                    : "Demo consultant profile shown for illustrative sample inventory."}{" "}
                  Mention reference <span className="font-semibold text-navy-900">EWX-{String(property.id).padStart(5, "0")}</span>{" "}
                  when you call or message.
                </p>
              </div>

              <div className="mt-6 min-w-0 rounded-panel border border-soft bg-white p-5 shadow-soft sm:p-6">
                <LeadForm
                  compact
                  variant="property"
                  propertySlug={property.slug}
                  propertyTitle={property.title}
                  defaultCity={property.cityName}
                  heading="Request details & availability"
                  description="Your enquiry will be saved in our admin team's inbox with this property's reference."
                  source="property-detail"
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* This property's map is isolated from every other listing. */}
      <Section tone="mist" id="schedule">
        <div className="ui-container">
          <SectionHeading
            eyebrow="Location"
            title="Where this property is located"
            description={`${property.locationArea}, ${property.cityName}. This map shows only the property you are viewing.`}
          />
          <div className="mt-8 grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
            <SinglePropertyMap property={propertyMap} address={property.address} />
            <div className="min-w-0 rounded-panel border border-soft bg-white p-5 shadow-soft sm:p-6">
              <LeadForm
                compact
                variant="visit"
                propertySlug={property.slug}
                propertyTitle={property.title}
                defaultCity={property.cityName}
                heading="Schedule a visit"
                description="Send your preferred date and contact details to our admin team. A visit is confirmed only after the team contacts you."
                source="schedule-visit"
              />
            </div>
          </div>
        </div>
      </Section>

      <Section tone="light" id="nearby-properties">
        <div className="ui-container">
          <SectionHeading
            eyebrow="Around this location"
            title="See nearby properties"
            description="Other listings within 20 km, ordered by distance from this property's saved pin. The current listing is not repeated here."
            action={{ label: `Explore ${property.cityName}`, href: `/city/${property.citySlug}` }}
          />
          <div className="mt-8">
            {nearbyMap.length > 0 ? (
              <MapView
                properties={nearbyMap}
                center={{ lat: property.lat, lng: property.lng }}
                zoom={12}
                mapSubtitle="Within 20 km"
                nearby
              />
            ) : (
              <div className="rounded-panel border border-soft bg-mist p-6 text-[0.9375rem] leading-relaxed text-ink-muted">
                No other listings are currently mapped within 20 km. <Link className="font-semibold text-forest-700 hover:underline" href={`/properties?city=${property.citySlug}`}>Browse properties in {property.cityName}</Link> instead.
              </div>
            )}
          </div>
          <p className="mt-4 text-[0.75rem] leading-relaxed text-ink-muted">Distances are approximate, straight-line calculations from saved coordinates—not driving distances or confirmed plot boundaries.</p>
        </div>
      </Section>

      {/* Calculator */}
      <Section tone="light">
        <div className="ui-container">
          <SectionHeading
            eyebrow="Smart tools"
            title="Run the numbers on this property"
            description="Model the instalment, rental yield or affordability using this listing's price as a starting point."
          />
          <div className="mt-9">
            <Calculators defaultPrice={property.price} />
          </div>
        </div>
      </Section>

      {/* Similar */}
      {similar.length > 0 && (
        <Section tone="mist">
          <div className="ui-container">
            <SectionHeading
              eyebrow="Compare next"
              title="Similar properties you may like"
              description={`Comparable ${property.propertyType.toLowerCase()} options in ${property.cityName} and nearby areas.`}
              action={{ label: "Browse all", href: `/properties?city=${property.citySlug}` }}
            />
            <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {similar.map((item, index) => (
                <Reveal key={item.id} delay={index * 50}>
                  <PropertyCard property={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-soft bg-white/97 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-sans text-[0.9375rem] font-bold leading-none text-navy-900">
              {formatPrice(property.price, property.priceUnit)}
            </p>
            <p className="mt-1 truncate text-[0.75rem] text-ink-muted">
              {property.locationArea}, {property.cityName}
            </p>
          </div>
          <a href={`tel:${contactPhone.replace(/\s/g, "")}`} className="btn btn-primary px-3.5 py-2.5 text-[0.8125rem]">
            <IconPhone className="h-4 w-4" /> Call
          </a>
          <a
            href={`https://wa.me/${contactWhatsapp}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-green px-3.5 py-2.5 text-[0.8125rem]"
          >
            <IconWhatsApp className="h-4 w-4" /> WhatsApp
          </a>
        </div>
      </div>
      <div className="h-20 lg:hidden" aria-hidden="true" />

      <JsonLd data={propertyJsonLd(property)} />
    </>
  );
}
