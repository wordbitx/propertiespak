import type { Metadata } from "next";
import { ListingView, type RawSearchParams } from "@/components/listing-view";
import { PROPERTY_TYPES } from "@/lib/constants";
import { buildMetadata, listingRobots } from "@/lib/seo";

const baseMetadata: Metadata = buildMetadata({
  title: "Property for Sale & Rent in Pakistan — Search All Listings",
  description:
    "Browse sample property listings across Pakistan: houses, apartments, plots, offices, shops and farmhouses with filters for city, budget, size and bedrooms.",
  path: "/properties",
  keywords: ["property for sale Pakistan", "property for rent Pakistan", "real estate Pakistan", "property Lahore"],
});

const FILTER_KEYS = ["q", "city", "type", "category", "beds", "minPrice", "maxPrice", "minArea", "featured", "newProjects", "sort", "page"];

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}): Promise<Metadata> {
  const raw = await searchParams;
  const hasFilters = FILTER_KEYS.some((key) => {
    const value = raw[key];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });
  return { ...baseMetadata, robots: listingRobots(hasFilters) };
}

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const raw = await searchParams;
  return (
    <ListingView
      eyebrow="All listings"
      title="Property across Pakistan, filtered your way"
      description="Search sample houses, apartments, plots and commercial space by city, society, budget and size. Every listing shows the numbers you need before a site visit."
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Properties", href: "/properties" },
      ]}
      basePath="/properties"
      raw={raw}
      withMap
      purposeKind="mixed"
      typeOptions={[...PROPERTY_TYPES]}
    />
  );
}
