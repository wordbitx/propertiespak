import Link from "next/link";
import { FiltersBar, type TownGroup } from "@/components/filters-bar";
import { MapView, type MapProperty } from "@/components/map-view";
import { Pagination } from "@/components/pagination";
import { PageHero } from "@/components/page-hero";
import { PropertyCard } from "@/components/property-card";
import { Reveal } from "@/components/reveal";
import type { Crumb } from "@/components/breadcrumbs";
import { RecentSearchResultsTracker } from "@/components/recent-properties-tracker";
import { JsonLd } from "@/components/json-ld";
import { getCities, getListingAreasByCity, getMapProperties, searchProperties, type PropertyFilters } from "@/lib/queries";
import { townFilterOptions, townMatchFor } from "@/lib/towns";
import { collectionPageJsonLd, itemListJsonLd } from "@/lib/seo";
import { propertyQueryFromParams, SEARCH_FILTER_KEYS } from "@/lib/property-search";

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseListingFilters(raw: RawSearchParams, fixed: PropertyFilters = {}): PropertyFilters {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    const selected = first(value);
    if (selected !== undefined) params.set(key, selected);
  }
  const parsed = propertyQueryFromParams(params);
  // Optional URL fields must not erase fixed scope (e.g. commercialOnly).
  const selected = Object.fromEntries(Object.entries(parsed).filter(([, value]) => value !== undefined));
  return {
    ...fixed, ...selected,
    purpose: fixed.purpose ?? parsed.purpose,
    city: parsed.city ?? fixed.city,
    town: parsed.town ? parsed.townExact ? parsed.town : townMatchFor(parsed.town) : fixed.town,
    type: parsed.type ?? fixed.type,
    category: parsed.category ?? fixed.category,
    featured: parsed.featured ?? fixed.featured,
    verified: parsed.verified ?? fixed.verified,
    isNewProject: parsed.isNewProject ?? fixed.isNewProject,
    pageSize: fixed.pageSize ?? 12,
  };
}

export async function ListingView({
  eyebrow,
  title,
  description,
  crumbs,
  basePath,
  raw,
  fixed,
  purposeKind = "buy",
  withMap = false,
  typeOptions,
  showHero = true,
}: {
  eyebrow: string;
  title: string;
  description: string;
  crumbs: Crumb[];
  basePath: string;
  raw: RawSearchParams;
  fixed?: PropertyFilters;
  purposeKind?: "buy" | "rent" | "mixed";
  withMap?: boolean;
  typeOptions: string[];
  showHero?: boolean;
}) {
  const filters = parseListingFilters(raw, fixed);
  const [result, cities, mapRows, areasByCity] = await Promise.all([
    searchProperties(filters),
    getCities(),
    withMap ? getMapProperties({ ...filters, page: 1 }, 16) : Promise.resolve([]),
    getListingAreasByCity(),
  ]);

  const cityOptions = cities.map((city) => ({ label: city.name, value: city.slug }));

  // Registry towns first (full coverage), then any live area names that are not
  // in the registry yet, so the cascade always reflects real inventory.
  const cityNameBySlug = new Map(cities.map((city) => [city.slug, city.name]));
  const townGroups: TownGroup[] = townFilterOptions().map((group) => ({
    citySlug: group.citySlug,
    cityName: cityNameBySlug.get(group.citySlug) ?? group.citySlug,
    towns: [...group.towns],
  }));
  for (const row of areasByCity) {
    if (!row.area) continue;
    const group = townGroups.find((item) => item.citySlug === row.citySlug);
    if (!group) continue;
    const alreadyListed = group.towns.some(
      (town) => town.value.toLowerCase() === row.area.toLowerCase() || row.area.toLowerCase().includes(town.label.toLowerCase()),
    );
    if (!alreadyListed) group.towns.push({ label: row.area, value: row.area });
  }
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

  // Structured data only on the canonical, unfiltered view of the page, so
  // Google reads one ItemList per URL instead of per filter combination.
  const hasActiveFilters = SEARCH_FILTER_KEYS.some((key) => Boolean(first(raw[key])));
  // Keep every advanced filter when moving between result pages.
  const paramRecord: Record<string, string | undefined> = Object.fromEntries(
    SEARCH_FILTER_KEYS.filter((key) => key !== "page").map((key) => [key, first(raw[key])]),
  );

  return (
    <>
      <RecentSearchResultsTracker ids={result.items.map((item) => item.id)} path={basePath} />
      {!hasActiveFilters && (
        <>
          <JsonLd data={collectionPageJsonLd({ name: title, description, path: basePath })} />
          {result.items.length > 0 && (
            <JsonLd
              data={itemListJsonLd({
                name: title,
                path: basePath,
                items: result.items.slice(0, 20).map((property) => ({
                  name: property.title,
                  path: `/property/${property.slug}`,
                })),
              })}
            />
          )}
        </>
      )}
      {showHero ? (
        <PageHero eyebrow={eyebrow} title={title} description={description} crumbs={crumbs} />
      ) : (
        <div className="ui-container pt-12 lg:pt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-forest-700">
                <span className="h-[1px] w-6 bg-current opacity-70" />
                {eyebrow}
              </p>
              <h2 className="display-3 mt-3 text-navy-900">{title}</h2>
            </div>
            <p className="max-w-xl text-[0.875rem] leading-relaxed text-ink-muted">{description}</p>
          </div>
        </div>
      )}

      <section className="bg-white py-12 lg:py-16">
        <div className="ui-container">
          <FiltersBar
            basePath={basePath}
            cityOptions={cityOptions}
            townGroups={townGroups}
            typeOptions={typeOptions}
            total={result.total}
            purposeKind={purposeKind}
          />

          {result.items.length === 0 ? (
            <div className="mt-10 rounded-panel border border-soft bg-mist p-10 text-center">
              <h2 className="font-sans text-[1.15rem] font-semibold text-navy-900">No properties matched those filters</h2>
              <p className="mx-auto mt-2 max-w-xl text-[0.9rem] leading-relaxed text-ink-muted">
                Try widening the budget, removing a filter, or browsing by city. New inventory is added every week and our
                consultants also have off-market options.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href={basePath} className="btn btn-primary">
                  Reset filters
                </Link>
                <Link href="/contact" className="btn btn-outline">
                  Ask a consultant
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {result.items.map((property, index) => (
                  <Reveal key={property.id} delay={index * 40}>
                    <PropertyCard property={property} priority={index < 4} />
                  </Reveal>
                ))}
              </div>

              <Pagination
                page={result.page}
                pageCount={result.pageCount}
                basePath={basePath}
                params={paramRecord}
              />
            </>
          )}

          {withMap && mapProperties.length > 0 && (
            <div className="mt-16">
              <h2 className="font-sans text-[1.15rem] font-semibold text-navy-900">See these results on the map</h2>
              <p className="mt-2 max-w-2xl text-[0.9rem] text-ink-muted">
                Markers show society-level positions so you can judge access, distance and neighbouring development before
                booking visits.
              </p>
              <div className="mt-6">
                <MapView
                  properties={mapProperties}
                  center={{
                    lat: mapProperties.reduce((sum, item) => sum + item.lat, 0) / mapProperties.length,
                    lng: mapProperties.reduce((sum, item) => sum + item.lng, 0) / mapProperties.length,
                  }}
                  zoom={11}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
