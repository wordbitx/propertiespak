import type { Metadata } from "next";
import { ListingView, type RawSearchParams } from "@/components/listing-view";
import { buildMetadata, listingRobots } from "@/lib/seo";

const COMMERCIAL_TYPES = ["Office", "Shop", "Commercial Building", "Warehouse"];

const baseMetadata: Metadata = buildMetadata({
  title: "Commercial Property for Sale & Rent in Pakistan",
  description:
    "Offices, retail shops, commercial buildings and warehouses for sale and rent in Lahore, Islamabad and Karachi. Compare rent, frontage, parking and building services.",
  path: "/properties/commercial",
  keywords: ["commercial property Pakistan", "office for rent Lahore", "shop for sale Islamabad", "warehouse Karachi"],
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

export default async function CommercialListingsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const raw = await searchParams;
  return (
    <ListingView
      eyebrow="Commercial listings"
      title="Commercial Property for Sale & Rent"
      description="Income-ready commercial assets and workspaces — reviewed on frontage, footfall, parking, power backup and lease structure before we list them."
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Commercial", href: "/commercial" },
        { name: "Listings", href: "/properties/commercial" },
      ]}
      basePath="/properties/commercial"
      raw={raw}
      fixed={{ commercialOnly: true }}
      purposeKind="mixed"
      typeOptions={COMMERCIAL_TYPES}
      withMap
    />
  );
}
