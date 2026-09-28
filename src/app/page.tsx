import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/hero";
import { PropertyCard } from "@/components/property-card";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section";
import { Calculators } from "@/components/calculators";
import {
  CategoryGrid,
  CityDiscovery,
  CommercialSection,
  FeaturedProperties,
  InsightsPreview,
  MapSection,
  MarketHub,
  NewProjectsSection,
} from "@/components/sections-discovery";

import { CtaSection, InvestmentSection, TestimonialsSection, WhyEstateWx } from "@/components/sections-editorial";
import {
  getCities,
  getCityListingCounts,
  getFeaturedProperties,
  getMapProperties,
  getPlatformStats,
  getPosts,
  getProjects,
  getTestimonials,
  searchProperties,
} from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import type { MapProperty } from "@/components/map-view";

export const metadata: Metadata = buildMetadata({
  title: "Pak Property — Property for Sale & Rent in Pakistan | Pakistan Real Estate",
  description:
    "Explore sample property listings for sale and rent across Lahore, Islamabad, Karachi, Rawalpindi, Faisalabad and Multan. Houses, apartments, plots, commercial space and new projects with map search, filters and investment tools.",
  path: "/",
  keywords: [
    "real estate Pakistan",
    "property for sale Pakistan",
    "property for rent Pakistan",
    "houses for sale Lahore",
    "apartments for sale Islamabad",
    "plots for sale Karachi",
    "commercial property Pakistan",
    "new projects Pakistan",
  ],
});

const QUICK_CHIPS = [
  { label: "Featured listings", href: "/properties?featured=1" },
  { label: "Houses for sale", href: "/properties/for-sale?type=House" },
  { label: "Apartments for rent", href: "/properties/for-rent?type=Apartment" },
  { label: "Commercial space", href: "/properties/commercial" },
  { label: "Plots & files", href: "/properties?category=plot" },
];

export default async function HomePage() {
  const [
    stats,
    featured,
    discovery,
    cities,
    cityCounts,
    projects,
    commercialListings,
    commercialCount,
    rentalCount,
    mapRows,
    posts,
    testimonials,
  ] = await Promise.all([
    getPlatformStats(),
    getFeaturedProperties(6),
    searchProperties({ sort: "newest", pageSize: 9 }),
    getCities(),
    getCityListingCounts(),
    getProjects(3),
    searchProperties({ category: "commercial", pageSize: 3, sort: "popular" }),
    searchProperties({ category: "commercial", pageSize: 1 }),
    searchProperties({ purpose: "rent", pageSize: 1 }),
    getMapProperties({}, 100),
    getPosts(3),
    getTestimonials(),
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
      <Hero stats={stats} />

      {/* Property discovery */}
      <Section tone="light" id="explore">
        <div className="ui-container">
          <SectionHeading
            eyebrow="Property discovery"
            title="Explore Properties"
            description="Find spaces that match the way you live, work and invest."
            action={{ label: "Advanced search", href: "/properties" }}
          />
          <div className="mt-6 flex flex-wrap gap-2">
            {QUICK_CHIPS.map((chip) => (
              <Link key={chip.href} href={chip.href} className="chip">
                {chip.label}
              </Link>
            ))}
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {discovery.items.map((property, index) => (
              <Reveal key={property.id} delay={index * 50}>
                <PropertyCard property={property} priority={index < 3} />
              </Reveal>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link href="/properties" className="btn btn-primary">
              View all {stats.listings} properties
            </Link>
          </div>
        </div>
      </Section>

      <FeaturedProperties properties={featured} />
      <MapSection properties={mapProperties} center={{ lat: 31.47, lng: 74.38 }} cities={cities.slice(0, 8)} zoom={12} />
      <CommercialSection properties={commercialListings.items} />
      <NewProjectsSection projects={projects} />
      <CategoryGrid />
      <CityDiscovery cities={cities} counts={cityCounts} />

      {/* Smart calculators */}
      <Section tone="light" id="tools">
        <div className="ui-container">
          <SectionHeading
            eyebrow="Smart tools"
            title="Make Smarter Property Decisions"
            description="Understand the numbers before you make the move — instalments, yield, growth scenarios and affordability in one place."
            action={{ label: "Open tools hub", href: "/tools" }}
          />
          <div className="mt-10">
            <Calculators defaultPrice={featured[0]?.price ?? 25000000} />
          </div>
        </div>
      </Section>

      <WhyEstateWx listings={stats.listings} cities={stats.cities} />

      <InvestmentSection
        snapshot={{
          projects: stats.projects,
          commercial: commercialCount.total,
          cities: stats.cities,
          rentals: rentalCount.total,
        }}
      />

      <InsightsPreview posts={posts} />
      <TestimonialsSection testimonials={testimonials} />
      <MarketHub
        cities={cities.slice(0, 8).map((city) => ({ name: city.name, slug: city.slug }))}
        typeLinks={[
          { label: "Houses for sale in Lahore", href: "/houses-for-sale-in-lahore" },
          { label: "Apartments for sale in Lahore", href: "/apartments-for-sale-in-lahore" },
          { label: "Plots for sale in Lahore", href: "/plots-for-sale-in-lahore" },
          { label: "Houses for sale in Islamabad", href: "/houses-for-sale-in-islamabad" },
          { label: "Apartments for sale in Islamabad", href: "/apartments-for-sale-in-islamabad" },
          { label: "Commercial property in Lahore", href: "/commercial-property-in-lahore" },
          { label: "Commercial property in Islamabad", href: "/commercial-property-in-islamabad" },
          { label: "Commercial property in Karachi", href: "/commercial-property-in-karachi" },
        ]}
        societyLinks={[
          { label: "DHA Lahore", href: "/property-for-sale/dha-lahore" },
          { label: "DHA Phase 5 Lahore", href: "/property-for-sale/dha-phase-5-lahore" },
          { label: "Bahria Town Lahore", href: "/property-for-sale/bahria-town-lahore" },
          { label: "Gulberg Lahore", href: "/property-for-sale/gulberg-lahore" },
          { label: "DHA Islamabad", href: "/property-for-sale/dha-islamabad" },
          { label: "Clifton Karachi", href: "/property-for-sale/clifton-karachi" },
          { label: "DHA Multan", href: "/property-for-sale/dha-multan" },
        ]}
      />
      <CtaSection />
    </>
  );
}
