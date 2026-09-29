import type { Metadata } from "next";
import { ListingView, type RawSearchParams } from "@/components/listing-view";
import { buildMetadata, listingRobots } from "@/lib/seo";

const baseMetadata: Metadata = buildMetadata({
  title: "New Projects & Off-Plan Property in Pakistan",
  description:
    "Explore off-plan apartments, housing schemes and new developments in Islamabad, Lahore, Karachi, Faisalabad and Multan with launch pricing and payment plans.",
  path: "/properties/new-projects",
  keywords: ["new projects Pakistan", "off plan property Pakistan", "new housing schemes Lahore"],
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

export default async function NewProjectsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const raw = await searchParams;
  return (
    <ListingView
      eyebrow="Off-plan inventory"
      title="New Project Units & Launch Pricing"
      description="Units released in active developments, shown with instalment plans, handover windows and unit configurations so you can compare like for like."
      crumbs={[
        { name: "Home", href: "/" },
        { name: "New Projects", href: "/projects" },
        { name: "Units", href: "/properties/new-projects" },
      ]}
      basePath="/properties/new-projects"
      raw={raw}
      fixed={{ isNewProject: true }}
      purposeKind="buy"
      typeOptions={["Apartment", "Penthouse", "House", "Plot"]}
    />
  );
}
