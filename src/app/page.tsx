import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/hero";
import { Section, SectionHeading } from "@/components/section";
import { Calculators } from "@/components/calculators";
import { IconArrowRight, IconCalculator } from "@/components/icons";
import {
  CategoryGrid,
  CityDiscovery,
  CommercialSection,
  FeaturedProperties,
  InsightsPreview,
  MarketHub,
  NewProjectsSection,
} from "@/components/sections-discovery";

import { CtaSection, InvestmentSection, TestimonialsSection, WhyEstateWx } from "@/components/sections-editorial";
import { DealersSlider } from "@/components/dealers-slider";
import { PopularSearches } from "@/components/popular-searches";
import {
  getCities,
  getCityListingCounts,
  getDealerShowcase,
  getPlatformStats,
  getPosts,
  getPopularSearches,
  getProjects,
  getTestimonials,
  searchProperties,
} from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { HomeExploreProperties } from "@/components/home-explore-properties";
import { RecentProperties } from "@/components/recent-properties";

export const metadata: Metadata = buildMetadata({
  title: "Properties Pak — Property for Sale & Rent in Pakistan | Pakistan Real Estate",
  description:
    "Properties Pak is Pakistan's property marketplace: browse houses, apartments, plots, commercial property and new housing projects for sale and rent in Lahore, Islamabad, Karachi, Rawalpindi, Faisalabad, Multan, Gujranwala and Peshawar — with map search, price filters and investment calculators.",
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
    posts,
    testimonials,
    showcaseDealers,
    popularSearches,
  ] = await Promise.all([
    getPlatformStats(),
    searchProperties({ featured: true, verified: true, pageSize: 8 }),
    searchProperties({ sort: "newest", pageSize: 8 }),
    getCities(),
    getCityListingCounts(),
    getProjects(4),
    searchProperties({ category: "commercial", pageSize: 8 }),
    searchProperties({ category: "commercial", pageSize: 1 }),
    searchProperties({ purpose: "rent", pageSize: 1 }),
    getPosts(3),
    getTestimonials(),
    getDealerShowcase(48),
    getPopularSearches(),
  ]);

  return (
    <div className="home-page">
      <Hero />

      {/* Dealer belt sits under the hero; the category tiles sit just above the commercial section. */}
      <DealersSlider dealers={showcaseDealers} />

      {/* Featured inventory leads the marketplace: the strongest listings first, then full discovery. */}
      <FeaturedProperties properties={featured.items} total={featured.total} />
      <RecentProperties />

      {/* Property discovery */}
      <Section tone="mist" id="explore">
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
          <HomeExploreProperties properties={discovery.items} total={discovery.total} />
          <div className="mt-10 flex justify-center">
            <Link href="/properties" className="btn btn-primary">
              View all {stats.listings} properties
            </Link>
          </div>
        </div>
      </Section>

      {/* Manually scroll every commercial listing, not just the first server page. */}
      <CommercialSection properties={commercialListings.items} total={commercialListings.total} />
      {/* Map access lives exclusively in the header, on desktop and mobile. */}
      <PopularSearches groups={popularSearches} />
      {/* "Every property category, in one place" closes the discovery run before new projects. */}
      <CategoryGrid />
      <NewProjectsSection projects={projects} />
      <CityDiscovery cities={cities} counts={cityCounts} />

      {/* Smart calculators */}
      <Section tone="light" id="tools" className="home-decision-tools">
        <div className="ui-container">
          <div className="decision-tools-heading">
            <span className="decision-tools-icon"><IconCalculator className="h-6 w-6" /></span>
            <div><p className="decision-tools-kicker">Plan before you decide</p><h2>Make Smarter Property Decisions</h2><p className="decision-tools-description">Work out your budget, monthly payments and potential returns.</p></div>
            <Link href="/tools" className="decision-tools-link">All property tools<IconArrowRight className="h-4 w-4" /></Link>
          </div>
          <Calculators variant="home" defaultPrice={25000000} />
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
    </div>
  );
}
