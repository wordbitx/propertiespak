import type { Metadata } from "next";
import { ListingView, type RawSearchParams } from "@/components/listing-view";
import { PROPERTY_TYPES } from "@/lib/constants";
import { buildMetadata, listingRobots } from "@/lib/seo";

const baseMetadata: Metadata = buildMetadata({
  title: "Houses & Apartments for Rent in Pakistan",
  description:
    "Rent a house, apartment, portion or commercial unit in Lahore, Islamabad, Karachi and Rawalpindi. Compare monthly rent, furnishing, size and society facilities.",
  path: "/properties/for-rent",
  keywords: ["houses for rent Lahore", "apartments for rent Islamabad", "property for rent Pakistan"],
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

export default async function ForRentPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const raw = await searchParams;
  return (
    <ListingView
      eyebrow="For rent"
      title="Property for Rent in Pakistan"
      description="Furnished and unfurnished options by month, with rent levels checked against similar units in the same society so you know what fair value looks like."
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Properties", href: "/properties" },
        { name: "For Rent", href: "/properties/for-rent" },
      ]}
      basePath="/properties/for-rent"
      raw={raw}
      fixed={{ purpose: "rent" }}
      purposeKind="rent"
      typeOptions={PROPERTY_TYPES.filter((type) => !["Office", "Shop", "Commercial Building", "Warehouse"].includes(type))}
    />
  );
}
