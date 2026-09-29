import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { Section, SectionHeading } from "@/components/section";
import { IconArrowRight, IconPin } from "@/components/icons";
import { getCityBySlug, getListingAreasByCity, searchProperties } from "@/lib/queries";
import { TOWNS, townsForCity } from "@/lib/towns";
import { buildMetadata, breadcrumbJsonLd, collectionPageJsonLd, itemListJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ city: string }> };

export function generateStaticParams() {
  return Array.from(new Set(TOWNS.map((town) => town.citySlug))).map((city) => ({ city }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city) {
    return buildMetadata({
      title: "City not found",
      description: "This town directory is not available on Properties Pak.",
      path: "/towns",
      robots: { index: false, follow: true },
    });
  }
  const towns = townsForCity(city.slug);
  return {
    ...buildMetadata({
      title: `Towns & Housing Societies in ${city.name} — Prices & Listings | Properties Pak`,
      description: `All ${towns.length} towns and housing schemes Properties Pak covers in ${city.name}: ${towns
        .slice(0, 8)
        .map((town) => town.name)
        .join(", ")} and more — each with price bands, plot sizes and live property listings.`,
      path: `/towns/${city.slug}`,
      keywords: [
        `towns in ${city.name}`,
        `housing societies in ${city.name}`,
        `property schemes ${city.name}`,
        `${city.name} societies list`,
        `plot prices ${city.name}`,
      ],
    }),
    robots: { index: true, follow: true },
  };
}

export default async function CityTownsPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city) notFound();

  const [areas, cityListings] = await Promise.all([
    getListingAreasByCity(),
    searchProperties({ city: city.slug, pageSize: 1 }),
  ]);
  const towns = townsForCity(city.slug);

  // Live areas that are not yet in the registry still deserve a mention.
  const extraAreas = areas
    .filter((row) => row.citySlug === city.slug)
    .map((row) => row.area)
    .filter((area) => area && !towns.some((town) => area.toLowerCase().includes(town.name.split(" ")[0].toLowerCase())))
    .slice(0, 12);

  return (
    <>
      <JsonLd
        data={collectionPageJsonLd({
          name: `Towns and housing societies in ${city.name}`,
          description: `Directory of towns, schemes and sectors in ${city.name} with a guide page and live listings for each.`,
          path: `/towns/${city.slug}`,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Towns", href: "/towns" },
          { name: city.name, href: `/towns/${city.slug}` },
        ])}
      />
      <JsonLd
        data={itemListJsonLd({
          name: `Property towns in ${city.name}`,
          path: `/towns/${city.slug}`,
          items: towns.map((town) => ({ name: town.name, path: `/property-for-sale/${town.slug}` })),
        })}
      />

      <PageHero
        eyebrow={`${city.name} · Town directory`}
        title={`Towns & Housing Societies in ${city.name}`}
        description={`${towns.length} towns and schemes with a dedicated price guide, plus ${cityListings.total.toLocaleString(
          "en-PK",
        )} live listings in ${city.name}.`}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Towns", href: "/towns" },
          { name: city.name, href: `/towns/${city.slug}` },
        ]}
      />

      <Section tone="light">
        <div className="ui-container">
          <SectionHeading
            eyebrow="Town guides"
            title={`Where to buy in ${city.name}`}
            description={city.description}
            action={{ label: `All property in ${city.name}`, href: `/property-for-sale-in-${city.slug}` }}
          />

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {towns.map((town) => (
              <article key={town.slug} className="flex h-full flex-col rounded-panel border border-soft bg-white p-5 shadow-soft">
                <h3 className="font-sans text-[1.0625rem] font-semibold text-navy-900">
                  <Link href={`/property-for-sale/${town.slug}`} className="transition-colors hover:text-forest-700">
                    {town.name}
                  </Link>
                </h3>
                <p className="mt-1.5 flex items-center gap-1.5 text-[0.75rem] text-ink-muted">
                  <IconPin className="h-3.5 w-3.5 shrink-0 text-forest-600" />
                  <span className="truncate">{town.belt}</span>
                </p>
                <p className="mt-3 line-clamp-3 text-[0.8125rem] leading-relaxed text-ink-muted">{town.character}</p>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-[0.75rem]">
                  <div className="rounded-lg border border-soft bg-mist px-2.5 py-2">
                    <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ink-muted">Sale band</dt>
                    <dd className="mt-1 font-semibold text-navy-900">{town.priceBand}</dd>
                  </div>
                  <div className="rounded-lg border border-soft bg-mist px-2.5 py-2">
                    <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ink-muted">Rent band</dt>
                    <dd className="mt-1 font-semibold text-navy-900">{town.rentBand}</dd>
                  </div>
                </dl>
                <div className="mt-auto pt-4">
                  <Link
                    href={`/property-for-sale/${town.slug}`}
                    className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-forest-700 hover:underline"
                  >
                    Listings &amp; price guide <IconArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {extraAreas.length > 0 && (
            <div className="mt-10 rounded-panel border border-soft bg-mist p-6">
              <h3 className="font-sans text-[0.9375rem] font-semibold text-navy-900">Other areas with live listings in {city.name}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {extraAreas.map((area) => (
                  <Link
                    key={area}
                    href={`/properties?city=${city.slug}&town=${encodeURIComponent(area)}`}
                    className="inline-flex rounded-md border border-soft bg-white px-2.5 py-1 text-[0.75rem] font-medium text-navy-900 hover:border-forest-600 hover:text-forest-700"
                  >
                    {area}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={`/property-for-sale-in-${city.slug}`} className="btn btn-primary">
              Property for sale in {city.name}
            </Link>
            <Link href={`/property-for-rent-in-${city.slug}`} className="btn btn-outline">
              Rentals in {city.name}
            </Link>
            <Link href="/towns" className="btn btn-outline">
              All cities
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
