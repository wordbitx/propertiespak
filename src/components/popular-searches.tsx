"use client";

import Link from "next/link";
import { useState } from "react";
import { IconArrowRight, IconSearch } from "@/components/icons";
import { SEARCH_CITIES } from "@/lib/property-search";
import type { PopularSearchGroup } from "@/lib/queries";

const TYPES = [
  { value: "all", label: "All properties" }, { value: "House", label: "Houses" },
  { value: "Apartment", label: "Flats" }, { value: "Plot", label: "Plots" },
  { value: "commercial", label: "Commercial" },
];

export function PopularSearches({ groups }: { groups: PopularSearchGroup[] }) {
  const [purpose, setPurpose] = useState<"buy" | "rent">("buy");
  const [city, setCity] = useState(groups.some((group) => group.citySlug === "lahore") ? "lahore" : "");
  const [type, setType] = useState("all");
  const cityName = SEARCH_CITIES.find((item) => item.slug === city)?.name ?? city;
  const current = groups.find((group) => group.purpose === purpose && group.citySlug === city && group.type === type);
  const cityGroups = groups.filter((group) => group.purpose === purpose && group.type === type);
  const availableCities = SEARCH_CITIES.filter((item) => groups.some((group) => group.citySlug === item.slug));
  function href(slug: string, area?: string) {
    const params = new URLSearchParams({ city: slug });
    if (type === "commercial") params.set("category", "commercial");
    else if (type !== "all") params.set("type", type);
    if (area) { params.set("town", area); params.set("townExact", "1"); }
    return `/properties/for-${purpose === "buy" ? "sale" : "rent"}?${params}`;
  }

  return (
    <section id="popular-searches" className="home-popular-searches bg-white" aria-labelledby="popular-heading">
      <div className="ui-container">
        <div className="popular-search-surface">
        <div className="popular-search-header"><span className="popular-search-icon"><IconSearch className="h-5 w-5" /></span><div><h2 id="popular-heading">Popular Searches</h2><p>Explore active listings by city, area and property type.</p></div></div>
        <div className="popular-search-body">
        <div className="popular-search-purpose" role="group" aria-label="Popular search purpose">
          <button type="button" aria-pressed={purpose === "buy"} onClick={() => setPurpose("buy")}>For Sale</button>
          <button type="button" aria-pressed={purpose === "rent"} onClick={() => setPurpose("rent")}>To Rent</button>
        </div>
        <div className="popular-search-cities" role="group" aria-label="Popular cities">
          <button type="button" aria-pressed={!city} onClick={() => setCity("")}>Pakistan</button>
          {availableCities.map((item) => <button key={item.slug} type="button" aria-pressed={city === item.slug} onClick={() => setCity(item.slug)}>{item.name}</button>)}
        </div>
        <div className="popular-search-types" role="group" aria-label="Popular property types">
          {TYPES.map((item) => <button key={item.value} type="button" aria-pressed={type === item.value} onClick={() => setType(item.value)}>{item.label}</button>)}
        </div>
        <div className="popular-search-results" aria-live="polite">
          <h3>{city ? `${TYPES.find((item) => item.value === type)?.label} ${purpose === "buy" ? "for sale" : "to rent"} in ${cityName}` : `Popular cities ${purpose === "buy" ? "for sale" : "to rent"}`}</h3>
          {city ? (
            current ? <>
              <ul className="popular-location-grid">
                {current.locations.map((area) => <li key={area.name}><Link href={href(city, area.name)}>
                  <span>{area.name}</span><span className="popular-location-count">{area.total.toLocaleString("en-PK")}</span><IconArrowRight className="h-3.5 w-3.5 shrink-0" />
                </Link></li>)}
              </ul>
              <Link href={href(city)} className="popular-search-all">View all {current.total.toLocaleString("en-PK")} listings in {cityName}<IconArrowRight className="h-4 w-4" /></Link>
            </> : <p className="popular-search-empty">No matching listings in this city yet. Try another city or property type.</p>
          ) : (
            <ul className="popular-location-grid">
              {cityGroups.sort((a, b) => b.total - a.total).map((group) => <li key={group.citySlug}><Link href={href(group.citySlug)}><span>{group.cityName}</span><span className="popular-location-count">{group.total.toLocaleString("en-PK")}</span><IconArrowRight className="h-3.5 w-3.5 shrink-0" /></Link></li>)}
              {!cityGroups.length && <li className="popular-search-empty">No matching listings yet.</li>}
            </ul>
          )}
        </div>
        <p className="popular-search-note">Counts show currently published listings, not search traffic.</p>
        </div>
        </div>
      </div>
    </section>
  );
}
