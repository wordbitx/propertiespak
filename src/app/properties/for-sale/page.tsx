import type { Metadata } from "next";
import { ListingView, type RawSearchParams } from "@/components/listing-view";
import { PROPERTY_TYPES } from "@/lib/constants";
import { buildMetadata, listingRobots } from "@/lib/seo";

const baseMetadata: Metadata = buildMetadata({
  title: "Houses, Plots & Apartments for Sale in Pakistan",
  description:
    "Property for sale in Pakistan — houses in DHA Lahore, apartments in Islamabad, plots in Bahria Town and commercial buildings in Karachi. Compare prices, sizes and locations.",
  path: "/properties/for-sale",
  keywords: ["houses for sale Lahore", "property for sale Pakistan", "apartments for sale Islamabad", "plots for sale"],
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

export default async function ForSalePage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const raw = await searchParams;
  return (
    <ListingView
      eyebrow="For sale"
      title="Property for Sale in Pakistan"
      description="From DHA and Bahria Town addresses to family houses in Johar Town and investment plots in new societies — compare sample sale listings in one place."
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Properties", href: "/properties" },
        { name: "For Sale", href: "/properties/for-sale" },
      ]}
      basePath="/properties/for-sale"
      raw={raw}
      fixed={{ purpose: "buy" }}
      purposeKind="buy"
      typeOptions={PROPERTY_TYPES.filter((type) => !["Office", "Shop", "Commercial Building", "Warehouse"].includes(type))}
    />
  );
}
