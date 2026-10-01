"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { IconSearch, IconSliders } from "@/components/icons";
import { beginRecentSearch } from "@/lib/recent-properties";
import { NavigationDialog } from "@/components/navigation-dialog";
import { PropertySearchFilters } from "@/components/property-search-filters";
import { BUDGETS_BUY, BUDGETS_RENT, PROPERTY_TYPES } from "@/lib/constants";
import { defaultPropertySearch, propertySearchHref, type PropertySearchState, type SearchGroup } from "@/lib/property-search";

export function SearchPanel() {
  const router = useRouter();
  const [state, setState] = useState<PropertySearchState>(() => defaultPropertySearch());
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const budgets = state.purpose === "rent" ? BUDGETS_RENT : BUDGETS_BUY;
  const budget = state.minPrice || state.maxPrice ? `${state.minPrice}-${state.maxPrice}` : "";
  function changePurpose(purpose: "buy" | "rent") {
    setState((current) => ({ ...current, purpose, minPrice: "", maxPrice: "" }));
  }
  function search(next: PropertySearchState) {
    setState(next);
    setOpen(false);
    const href = propertySearchHref(next);
    beginRecentSearch(href);
    router.push(href);
  }

  return (
    <div className="property-search-panel">
      <div className="property-search-modes">
        <div className="property-search-tabs" role="tablist" aria-label="Search purpose">
          <button type="button" role="tab" aria-selected={state.purpose === "buy"} onClick={() => changePurpose("buy")} title="Buy property for sale">Buy</button>
          <button type="button" role="tab" aria-selected={state.purpose === "rent"} onClick={() => changePurpose("rent")}>Rent</button>
        </div>
        <Link href="/list-property" className="property-search-sell">Sell a property</Link>
        <Link href="/projects" className="property-search-projects">New projects</Link>
      </div>

      <div className="property-search-quick-types" role="group" aria-label="Quick property category">
        {([{ value: "all", label: "All properties" }, { value: "homes", label: "Homes" }, { value: "plot", label: "Plots" }, { value: "commercial", label: "Commercial" }] as { value: SearchGroup; label: string }[]).map((group) => (
          <button key={group.value} type="button" aria-pressed={state.group === group.value} onClick={() => setState((current) => ({ ...current, group: group.value, type: "" }))}>{group.label}</button>
        ))}
      </div>
      <div className="property-search-mobile">
        <button type="button" aria-label="Search Properties" aria-haspopup="dialog" aria-describedby="hero-search-hint" onClick={(event) => { triggerRef.current = event.currentTarget; setOpen(true); }} className="property-search-input-like">
          <IconSearch className="h-5 w-5 shrink-0" />
          <span><span className="property-search-input-title">Search Properties</span><span id="hero-search-hint" className="property-search-input-hint">Tap to enter a city, area or keyword</span></span>
          <IconSliders className="ml-auto h-4 w-4 shrink-0" />
        </button>
      </div>

      <form className="property-search-form" aria-label="Search properties" onSubmit={(event) => { event.preventDefault(); search(state); }}>
        <div className="property-search-field property-search-field--location">
          <label htmlFor="hero-city">City</label>
          <select id="hero-city" value={state.city} onChange={(event) => setState((current) => ({ ...current, city: event.target.value, town: "" }))}>
            <option value="">All cities</option>
            <option value="lahore">Lahore</option><option value="karachi">Karachi</option><option value="islamabad">Islamabad</option>
            <option value="rawalpindi">Rawalpindi</option><option value="faisalabad">Faisalabad</option><option value="multan">Multan</option>
            <option value="gujranwala">Gujranwala</option><option value="peshawar">Peshawar</option>
          </select>
        </div>
        <div className="property-search-field">
          <label htmlFor="hero-type">Property type</label>
          <select id="hero-type" value={state.type} onChange={(event) => setState((current) => ({ ...current, type: event.target.value }))}>
            <option value="">All types</option>
            {PROPERTY_TYPES.map((type) => <option key={type}>{type}</option>)}
          </select>
        </div>
        <div className="property-search-field">
          <label htmlFor="hero-budget">Price range (PKR{state.purpose === "rent" ? " / month" : ""})</label>
          <select id="hero-budget" value={budget} onChange={(event) => {
            const [min = "", max = ""] = event.target.value ? event.target.value.split("-") : ["", ""];
            setState((current) => ({ ...current, minPrice: min, maxPrice: max }));
          }}>
            <option value="">Any price</option>
            {budgets.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
        <div className="property-search-buttons">
          <button type="submit" className="btn btn-green"><IconSearch className="h-4 w-4" />Search Properties</button>
          <button type="button" onClick={(event) => { triggerRef.current = event.currentTarget; setOpen(true); }} className="property-search-advanced"><IconSliders className="h-4 w-4" />All filters</button>
        </div>
      </form>

      {open && <NavigationDialog label="Search properties" className="property-filter-dialog" onDismiss={() => setOpen(false)} triggerRef={triggerRef}>
        <PropertySearchFilters initialState={state} onClose={() => setOpen(false)} onSearch={search} />
      </NavigationDialog>}
    </div>
  );
}
