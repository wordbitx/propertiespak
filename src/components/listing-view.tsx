import Link from "next/link";
import { FiltersBar } from "@/components/filters-bar";
import { MapView, type MapProperty } from "@/components/map-view";
import { Pagination } from "@/components/pagination";
import { PageHero } from "@/components/page-hero";
import { PropertyCard } from "@/components/property-card";
import { Reveal } from "@/components/reveal";
import type { Crumb } from "@/components/breadcrumbs";
import { getCities, getMapProperties, searchProperties, type PropertyFilters } from "@/lib/queries";

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function numeric(value: string | string[] | undefined): number | undefined {
  const raw = first(value);
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseListingFilters(raw: RawSearchParams, fixed: PropertyFilters = {}): PropertyFilters {
  return {
    ...fixed,
    city: first(raw.city) ?? fixed.city,
    type: first(raw.type) ?? fixed.type,
    category: first(raw.category) ?? fixed.category,
    q: first(raw.q) ?? undefined,
    beds: numeric(raw.beds),
    minPrice: numeric(raw.minPrice),
    maxPrice: numeric(raw.maxPrice),
    minArea: numeric(raw.minArea),
    featured: first(raw.featured) === "1" ? true : fixed.featured,
    isNewProject: first(raw.newProjects) === "1" ? true : fixed.isNewProject,
    sort: first(raw.sort) ?? "newest",
    page: numeric(raw.page) ?? 1,
    pageSize: fixed.pageSize ?? 9,
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
  const [result, cities, mapRows] = await Promise.all([
    searchProperties(filters),
    getCities(),
    withMap ? getMapProperties({ ...filters, page: 1 }, 16) : Promise.resolve([]),
  ]);

  const cityOptions = cities.map((city) => ({ label: city.name, value: city.slug }));
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

  const paramRecord: Record<string, string | undefined> = {
    city: first(raw.city),
    type: first(raw.type),
    category: first(raw.category),
    q: first(raw.q),
    beds: first(raw.beds),
    minPrice: first(raw.minPrice),
    maxPrice: first(raw.maxPrice),
    minArea: first(raw.minArea),
    featured: first(raw.featured),
    newProjects: first(raw.newProjects),
    sort: first(raw.sort),
  };

  return (
    <>
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
              <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((property, index) => (
                  <Reveal key={property.id} delay={index * 40}>
                    <PropertyCard property={property} priority={index < 3} />
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
