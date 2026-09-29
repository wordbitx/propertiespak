"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { IconClose, IconSearch, IconSliders } from "@/components/icons";
import { BUDGETS_BUY, BUDGETS_RENT, SORT_OPTIONS } from "@/lib/constants";

type Option = { label: string; value: string };

export function FiltersBar({
  basePath,
  cityOptions,
  typeOptions,
  total,
  purposeKind = "buy",
}: {
  basePath: string;
  cityOptions: Option[];
  typeOptions: string[];
  total: number;
  purposeKind?: "buy" | "rent" | "mixed";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");

  const budgets = purposeKind === "rent" ? BUDGETS_RENT : BUDGETS_BUY;

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
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

  const activeCount = ["q", "city", "type", "beds", "minPrice", "category", "minArea"].filter((key) =>
    searchParams.get(key),
  ).length;

  const fields = (
    <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-5">
      <form
        className="sm:col-span-2 xl:col-span-1"
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
            placeholder="Society, area or type"
            className="field pl-9"
          />
        </div>
      </form>

      <div>
        <label htmlFor="filter-city" className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          City
        </label>
        <select
          id="filter-city"
          className="field mt-2"
          value={searchParams.get("city") ?? ""}
          onChange={(event) => update("city", event.target.value)}
        >
          <option value="">All cities</option>
          {cityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
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
          onChange={(event) => update("type", event.target.value)}
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
          {["1", "2", "3", "4", "5", "6"].map((value) => (
            <option key={value} value={value}>
              {value}+
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

      <div className="flex items-end xl:col-span-1">
        <button
          type="button"
          onClick={() => {
            setKeyword("");
            router.push(basePath);
          }}
          className="btn btn-outline w-full"
        >
          <IconClose className="h-4 w-4" /> Clear filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="panel p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-sans text-[0.9375rem] font-semibold text-navy-900">
          {total.toLocaleString("en-PK")} {total === 1 ? "property" : "properties"} found
          {activeCount > 0 && <span className="ml-2 text-[0.8125rem] font-medium text-ink-muted">{activeCount} filter{activeCount > 1 ? "s" : ""} active</span>}
        </p>
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="btn btn-outline px-3.5 py-2 text-[0.8125rem] xl:hidden"
          aria-expanded={mobileOpen}
        >
          <IconSliders className="h-4 w-4" /> {mobileOpen ? "Hide filters" : "Filters & sort"}
        </button>
      </div>
      <div className={`${mobileOpen ? "mt-4 block" : "hidden"} xl:mt-4 xl:block`}>{fields}</div>
    </div>
  );
}
