"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { IconClose, IconSearch, IconSliders } from "@/components/icons";
import { BUDGETS_BUY, BUDGETS_RENT, SORT_OPTIONS } from "@/lib/constants";
import { beginRecentSearch } from "@/lib/recent-properties";
import { NavigationDialog } from "@/components/navigation-dialog";
import { PropertySearchFilters } from "@/components/property-search-filters";
import { propertySearchFromParams, propertySearchHref, SEARCH_FILTER_KEYS } from "@/lib/property-search";

type Option = { label: string; value: string };
export type TownGroup = { citySlug: string; cityName: string; towns: Option[] };

const AREA_OPTIONS = [
  { label: "Any size", value: "" },
  { label: "3 Marla +", value: "675" },
  { label: "5 Marla +", value: "1125" },
  { label: "10 Marla +", value: "2250" },
  { label: "1 Kanal +", value: "4500" },
  { label: "2 Kanal +", value: "9000" },
];

const BATH_OPTIONS = ["1", "2", "3", "4", "5", "6"];

export function FiltersBar({
  basePath,
  cityOptions,
  townGroups,
  typeOptions,
  total,
  purposeKind = "buy",
}: {
  basePath: string;
  cityOptions: Option[];
  townGroups: TownGroup[];
  typeOptions: string[];
  total: number;
  purposeKind?: "buy" | "rent" | "mixed";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");

  const budgets = purposeKind === "rent" ? BUDGETS_RENT : BUDGETS_BUY;
  const selectedCity = searchParams.get("city") ?? "";

  const update = useCallback(
    (key: string, value: string, extra?: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      for (const [extraKey, extraValue] of Object.entries(extra ?? {})) {
        if (extraValue) params.set(extraKey, extraValue);
        else params.delete(extraKey);
      }
      params.delete("page");
      const query = params.toString();
      router.push(query ? `${basePath}?${query}` : basePath);
    },
    [basePath, router, searchParams],
  );

  /** City changes reset the town filter: a Lahore town is meaningless in Karachi. */
  const onCityChange = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug) params.set("city", slug);
      else params.delete("city");
      params.delete("town");
      params.delete("townExact");
      params.delete("page");
      const query = params.toString();
      router.push(query ? `${basePath}?${query}` : basePath);
    },
    [basePath, router, searchParams],
  );

  const budgetValue = (() => {
    const min = searchParams.get("minPrice") ?? "";
    const max = searchParams.get("maxPrice") ?? "";
    if (!min && !max) return "";
    return `${min}-${max}`;
  })();

  // Towns for the chosen city only; without a city the list is grouped by city.
  const visibleTownGroups = useMemo(
    () => (selectedCity ? townGroups.filter((group) => group.citySlug === selectedCity) : townGroups),
    [selectedCity, townGroups],
  );

  const activeCount = SEARCH_FILTER_KEYS.filter((key) => !["page", "sort", "areaUnit", "townExact"].includes(key)).filter(
    (key) => searchParams.get(key),
  ).length;

  const fields = (
    <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
      <form
        className="sm:col-span-2 xl:col-span-2"
        onSubmit={(event) => {
          event.preventDefault();
          update("q", keyword.trim());
        }}
      >
        <label htmlFor="filter-keyword" className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Keyword
        </label>
        <div className="relative mt-2">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            id="filter-keyword"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Society, town, area or property type"
            className="field pl-9"
          />
        </div>
      </form>

      {purposeKind === "mixed" && (
        <div>
          <label htmlFor="filter-purpose" className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Purpose
          </label>
          <select
            id="filter-purpose"
            className="field mt-2"
            value={searchParams.get("purpose") ?? ""}
            onChange={(event) => update("purpose", event.target.value)}
          >
            <option value="">Sale &amp; rent</option>
            <option value="buy">For sale</option>
            <option value="rent">For rent</option>
          </select>
        </div>
      )}

      <div>
        <label htmlFor="filter-city" className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          City
        </label>
        <select id="filter-city" className="field mt-2" value={selectedCity} onChange={(event) => onCityChange(event.target.value)}>
          <option value="">All cities</option>
          {cityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-town" className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Town / Society
        </label>
        <select
          id="filter-town"
          className="field mt-2"
          value={searchParams.get("town") ?? ""}
          onChange={(event) => update("town", event.target.value, { townExact: "" })}
        >
          <option value="">All towns &amp; societies</option>
          {selectedCity
            ? visibleTownGroups.flatMap((group) =>
                group.towns.map((town) => (
                  <option key={`${group.citySlug}-${town.value}`} value={town.value}>
                    {town.label}
                  </option>
                )),
              )
            : visibleTownGroups.map((group) => (
                <optgroup key={group.citySlug} label={group.cityName}>
                  {group.towns.map((town) => (
                    <option key={`${group.citySlug}-${town.value}`} value={town.value}>
                      {town.label}
                    </option>
                  ))}
                </optgroup>
              ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-type" className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Property type
        </label>
        <select
          id="filter-type"
          className="field mt-2"
          value={searchParams.get("type") ?? ""}
          onChange={(event) => update("type", event.target.value, { category: "" })}
        >
          <option value="">All types</option>
          {typeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-budget" className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Budget
        </label>
        <select
          id="filter-budget"
          className="field mt-2"
          value={budgetValue}
          onChange={(event) => {
            const [min = "", max = ""] = event.target.value.split("-");
            const params = new URLSearchParams(searchParams.toString());
            if (min) params.set("minPrice", min);
            else params.delete("minPrice");
            if (max) params.set("maxPrice", max);
            else params.delete("maxPrice");
            params.delete("page");
            const query = params.toString();
            router.push(query ? `${basePath}?${query}` : basePath);
          }}
        >
          <option value="">Any budget</option>
          {budgetValue && !budgets.some((item) => item.value === budgetValue) && <option value={budgetValue}>Custom price range</option>}
          {budgets.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-beds" className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Bedrooms
        </label>
        <select
          id="filter-beds"
          className="field mt-2"
          value={searchParams.get("beds") ?? ""}
          onChange={(event) => update("beds", event.target.value)}
        >
          <option value="">Any</option>
          <option value="0">Studio</option>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((value) => (
            <option key={value} value={value}>
              {value}+
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-baths" className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Bathrooms
        </label>
        <select
          id="filter-baths"
          className="field mt-2"
          value={searchParams.get("baths") ?? ""}
          onChange={(event) => update("baths", event.target.value)}
        >
          <option value="">Any</option>
          {BATH_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value}+
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-area" className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Size
        </label>
        <select
          id="filter-area"
          className="field mt-2"
          value={searchParams.get("minArea") ?? ""}
          onChange={(event) => update("minArea", event.target.value)}
        >
          {searchParams.get("minArea") && !AREA_OPTIONS.some((item) => item.value === searchParams.get("minArea")) && <option value={searchParams.get("minArea")!}>Custom area range</option>}
          {AREA_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-sort" className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Sort by
        </label>
        <select
          id="filter-sort"
          className="field mt-2"
          value={searchParams.get("sort") ?? "newest"}
          onChange={(event) => update("sort", event.target.value)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end sm:col-span-2 xl:col-span-2">
        <button
          type="button"
          onClick={() => {
            setKeyword("");
            router.push(basePath);
          }}
          className="btn btn-outline w-full"
        >
          <IconClose className="h-4 w-4" /> Clear all filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="panel p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-sans text-[0.9375rem] font-semibold text-navy-900">
          {total.toLocaleString("en-PK")} {total === 1 ? "property" : "properties"} found
          {activeCount > 0 && (
            <span className="ml-2 text-[0.8125rem] font-medium text-ink-muted">
              {activeCount} filter{activeCount > 1 ? "s" : ""} active
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setAdvancedOpen(true)} className="btn btn-outline px-3.5 py-2 text-[0.8125rem]"><IconSliders className="h-4 w-4" />All filters</button>
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="btn btn-outline px-3.5 py-2 text-[0.8125rem] xl:hidden"
          aria-expanded={mobileOpen}
        >
          <IconSliders className="h-4 w-4" /> {mobileOpen ? "Hide filters" : "Filters & sort"}
        </button>
        </div>
      </div>
      <div className={`${mobileOpen ? "mt-4 block" : "hidden"} xl:mt-4 xl:block`}>{fields}</div>
      {advancedOpen && <NavigationDialog label="Search properties" className="property-filter-dialog" onDismiss={() => setAdvancedOpen(false)}>
        <PropertySearchFilters initialState={{ ...propertySearchFromParams(searchParams, purposeKind === "rent" ? "rent" : "buy"),
          ...(basePath.includes("/commercial") ? { group: "commercial" as const } : {}),
          ...(basePath.includes("/new-projects") ? { newProjects: true } : {}),
        }} onClose={() => setAdvancedOpen(false)} onSearch={(state) => { setAdvancedOpen(false); const href = propertySearchHref(state); beginRecentSearch(href); router.push(href); }} />
      </NavigationDialog>}
    </div>
  );
}
