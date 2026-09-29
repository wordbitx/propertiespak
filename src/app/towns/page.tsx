import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { Section, SectionHeading } from "@/components/section";
import { IconArrowRight, IconPin } from "@/components/icons";
import { getCities, getListingAreasByCity } from "@/lib/queries";
import { TOWNS, townsForCity } from "@/lib/towns";
import { buildMetadata, breadcrumbJsonLd, collectionPageJsonLd, itemListJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Towns & Housing Societies in Pakistan — Full Directory | Properties Pak",
  description:
    "Every town, housing scheme and sector covered by Properties Pak: Lake City, Etihad Town, Valencia Town, Al-Kabir Town, Bahria Enclave, Gulshan-e-Iqbal, Bahria Town Phase 8, DHA Multan, Hayatabad and more, with prices, plots and live listings.",
  path: "/towns",
  keywords: [
    "housing societies in Pakistan",
    "towns in Lahore",
    "societies in Islamabad",
    "housing schemes Karachi",
    "property towns directory Pakistan",
  ],
});

export default async function TownsDirectoryPage() {
  const [cities, areas] = await Promise.all([getCities(), getListingAreasByCity()]);
  const areasByCity = new Map<string, Set<string>>();
  for (const row of areas) {
    if (!row.area) continue;
    const set = areasByCity.get(row.citySlug) ?? new Set<string>();
    set.add(row.area);
    areasByCity.set(row.citySlug, set);
  }

  const citiesWithTowns = cities.filter((city) => townsForCity(city.slug).length > 0);
  const totalListings = areas.reduce((sum, row) => sum + row.total, 0);

  return (
    <>
      <JsonLd
        data={collectionPageJsonLd({
          name: "Towns and housing societies directory",
          description:
            "Directory of towns, housing schemes and sectors on Properties Pak, with a dedicated price and listing guide for each.",
          path: "/towns",
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Towns", href: "/towns" },
        ])}
      />
      <JsonLd
        data={itemListJsonLd({
          name: "Property towns and societies in Pakistan",
          path: "/towns",
          items: TOWNS.slice(0, 60).map((town) => ({
            name: town.name,
            path: `/property-for-sale/${town.slug}`,
          })),
        })}
      />

      <PageHero
        eyebrow="Town & society directory"
        title="Every Town & Housing Society We Cover"
        description={`${TOWNS.length} towns, schemes and sectors across ${citiesWithTowns.length} cities — each with its own price guide, plot sizes, rental band and live listings.`}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Towns", href: "/towns" },
        ]}
      />

      <Section tone="light">
        <div className="ui-container">
          <SectionHeading
            eyebrow="Browse by city"
            title="Pick a city, then a town"
            description="Our search filters follow the same structure: choose the city first and the town list narrows to that city's societies, so you never scroll through towns that do not exist in your market."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {citiesWithTowns.map((city) => {
              const towns = townsForCity(city.slug);
              const cityAreas = areasByCity.get(city.slug);
              return (
                <article key={city.slug} className="rounded-panel border border-soft bg-white p-5 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-sans text-[1.05rem] font-semibold text-navy-900">{city.name}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-[0.75rem] text-ink-muted">
                        <IconPin className="h-3.5 w-3.5 text-forest-600" /> {city.province}
                      </p>
                    </div>
                    <span className="rounded-md bg-mist px-2 py-1 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
                      {towns.length} towns
                    </span>
                  </div>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {towns.slice(0, 8).map((town) => (
                      <li key={town.slug}>
                        <Link
                          href={`/property-for-sale/${town.slug}`}
                          className="inline-flex rounded-md border border-soft px-2.5 py-1 text-[0.75rem] font-medium text-navy-900 transition-colors hover:border-forest-600 hover:text-forest-700"
                        >
                          {town.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <Link href={`/towns/${city.slug}`} className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-forest-700 hover:underline">
                      All {city.name} towns <IconArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <span className="text-[0.75rem] text-ink-muted">
                      {cityAreas ? `${cityAreas.size} areas · ` : ""}
                      <Link href={`/city/${city.slug}`} className="hover:underline">
                        city guide
                      </Link>
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-8 rounded-panel border border-soft bg-mist px-5 py-4 text-[0.8125rem] leading-relaxed text-ink-muted">
            Searching across all of them: {totalListings.toLocaleString("en-PK")} live property listings with city, town,
            budget, size and bedroom filters.{" "}
            <Link href="/properties" className="font-semibold text-forest-700 hover:underline">
              Open the marketplace
            </Link>
            .
          </p>
        </div>
      </Section>
    </>
  );
}
