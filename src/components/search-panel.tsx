"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { IconSearch, IconSliders } from "@/components/icons";
import { beginRecentSearch } from "@/lib/recent-properties";
import { NavigationDialog } from "@/components/navigation-dialog";
import { PropertySearchFilters } from "@/components/property-search-filters";
import { BUDGETS_BUY, BUDGETS_RENT } from "@/lib/constants";
import {
  COMMERCIAL_SEARCH_TYPES,
  defaultPropertySearch,
  HOME_SEARCH_TYPES,
  PLOT_SEARCH_TYPES,
  propertySearchHref,
  searchTypeLabel,
  type PropertySearchState,
  type SearchGroup,
} from "@/lib/property-search";

const CATEGORY_GROUPS: { value: SearchGroup; label: string }[] = [
  { value: "all", label: "All properties" },
  { value: "homes", label: "Homes" },
  { value: "plot", label: "Plots" },
  { value: "commercial", label: "Commercial" },
];

const GROUP_TYPES: Record<SearchGroup, readonly string[]> = {
  all: [...HOME_SEARCH_TYPES, ...PLOT_SEARCH_TYPES, ...COMMERCIAL_SEARCH_TYPES],
  homes: HOME_SEARCH_TYPES,
  plot: PLOT_SEARCH_TYPES,
  commercial: COMMERCIAL_SEARCH_TYPES,
};

const ALL_TYPE_LABEL: Record<SearchGroup, string> = {
  all: "All types",
  homes: "All Homes",
  plot: "All Plots",
  commercial: "All Commercial",
};

function heroTypeLabel(type: string) {
  if (type === "Apartment") return "Flat";
  if (type === "Farmhouse") return "Farm House";
  if (type === "Plot") return "Residential Plot";
  if (type === "Commercial Building") return "Building";
  return searchTypeLabel(type);
}

export function SearchPanel() {
  const { t } = useLanguage();
  const router = useRouter();
  const [state, setState] = useState<PropertySearchState>(() => defaultPropertySearch());
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const budgets = state.purpose === "rent" ? BUDGETS_RENT : BUDGETS_BUY;
  const budget = state.minPrice || state.maxPrice ? `${state.minPrice}-${state.maxPrice}` : "";

  function changePurpose(purpose: "buy" | "rent") {
    setState((current) => ({ ...current, purpose, minPrice: "", maxPrice: "" }));
  }

  function changeGroup(group: SearchGroup) {
    setState((current) => ({
      ...current,
      group,
      type: "",
      beds: group === "homes" || group === "all" ? current.beds : "",
    }));
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
        <div className="property-search-tabs" role="tablist" aria-label={t("Search purpose")}>
          <button type="button" role="tab" aria-selected={state.purpose === "buy"} onClick={() => changePurpose("buy")} title={t("Buy property for sale")}>{t("Buy")}</button>
          <button type="button" role="tab" aria-selected={state.purpose === "rent"} onClick={() => changePurpose("rent")}>{t("Rent")}</button>
        </div>
        <Link href="/list-property" className="property-search-sell">{t("Sell a property")}</Link>
        <Link href="/projects" className="property-search-projects">
          <span className="property-search-new-badge">NEW</span>
          <span>{t("New projects")}</span>
        </Link>
      </div>

      <div className="property-search-quick-types" role="group" aria-label={t("Quick property category")}>
        {CATEGORY_GROUPS.map((group) => (
          <button
            key={group.value}
            type="button"
            aria-pressed={state.group === group.value}
            onClick={() => changeGroup(group.value)}
          >
            {t(group.label)}
          </button>
        ))}
      </div>

      <div className="property-search-mobile">
        <button type="button" aria-label={t("Search Properties")} aria-haspopup="dialog" aria-describedby="hero-search-hint" onClick={(event) => { triggerRef.current = event.currentTarget; setOpen(true); }} className="property-search-input-like">
          <IconSearch className="h-5 w-5 shrink-0" />
          <span><span className="property-search-input-title">{t("Search Properties")}</span><span id="hero-search-hint" className="property-search-input-hint">{t("Tap to enter a city, area or keyword")}</span></span>
          <IconSliders className="ml-auto h-4 w-4 shrink-0" />
        </button>
      </div>

      <form className="property-search-form" aria-label={t("Search properties")} onSubmit={(event) => { event.preventDefault(); search(state); }}>
        <div className="property-search-field property-search-field--location">
          <label htmlFor="hero-city">{t("City")}</label>
          <select id="hero-city" value={state.city} onChange={(event) => setState((current) => ({ ...current, city: event.target.value, town: "" }))}>
            <option value="">{t("All cities")}</option>
            <option value="lahore">Lahore</option><option value="karachi">Karachi</option><option value="islamabad">Islamabad</option>
            <option value="rawalpindi">Rawalpindi</option><option value="faisalabad">Faisalabad</option><option value="multan">Multan</option>
            <option value="gujranwala">Gujranwala</option><option value="peshawar">Peshawar</option>
          </select>
        </div>
        <div className="property-search-field property-search-field--type">
          <label htmlFor="hero-type">{t("Property type")}</label>
          <select id="hero-type" value={state.type} onChange={(event) => setState((current) => ({ ...current, type: event.target.value }))}>
            <option value="">{t(ALL_TYPE_LABEL[state.group])}</option>
            {GROUP_TYPES[state.group].map((type) => <option key={type} value={type}>{t(heroTypeLabel(type))}</option>)}
          </select>
        </div>
        <div className="property-search-field property-search-field--budget">
          <label htmlFor="hero-budget">{t("Budget")} (PKR{state.purpose === "rent" ? ` / ${t("month")}` : ""})</label>
          <select id="hero-budget" value={budget} onChange={(event) => {
            const [min = "", max = ""] = event.target.value ? event.target.value.split("-") : ["", ""];
            setState((current) => ({ ...current, minPrice: min, maxPrice: max }));
          }}>
            <option value="">{t("Any budget")}</option>
            {budgets.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
        <div className="property-search-field property-search-field--beds">
          <label htmlFor="hero-beds">{t("Beds")}</label>
          <select id="hero-beds" value={state.beds} onChange={(event) => setState((current) => ({ ...current, beds: event.target.value }))}>
            <option value="">{t("Any")}</option>
            <option value="0">{t("Studio")}</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((beds) => <option key={beds} value={beds}>{beds}+</option>)}
          </select>
        </div>
        <div className="property-search-buttons">
          <button type="submit" className="btn btn-green"><IconSearch className="h-4 w-4" />{t("Search")}</button>
          <button type="button" onClick={(event) => { triggerRef.current = event.currentTarget; setOpen(true); }} className="property-search-advanced"><IconSliders className="h-4 w-4" />{t("All filters")}</button>
        </div>
      </form>

      {open && <NavigationDialog label={t("Search properties")} className="property-filter-dialog" onDismiss={() => setOpen(false)} triggerRef={triggerRef}>
        <PropertySearchFilters initialState={state} onClose={() => setOpen(false)} onSearch={search} />
      </NavigationDialog>}
    </div>
  );
}
