"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { IconArrowRight, IconSearch } from "@/components/icons";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { BUDGETS_BUY, BUDGETS_RENT, PROPERTY_TYPES } from "@/lib/constants";

type TabKey = "buy" | "rent" | "new-projects" | "commercial";
const TABS: { key: TabKey; label: string; path: string }[] = [
  { key: "buy", label: "Buy", path: "/properties/for-sale" },
  { key: "rent", label: "Rent", path: "/properties/for-rent" },
  { key: "new-projects", label: "New Projects", path: "/properties/new-projects" },
  { key: "commercial", label: "Commercial", path: "/properties/commercial" },
];
const COMMERCIAL_TYPES = ["Office", "Shop", "Commercial Building", "Warehouse"];
const CITIES = ["Lahore", "Islamabad", "Karachi", "Rawalpindi", "Faisalabad", "Multan", "Gujranwala", "Peshawar"];

export function SearchPanel({ initialTab = "buy", elevation = "panel" }: { initialTab?: TabKey; elevation?: "panel" | "flat" }) {
  const router = useRouter();
  const prefix = useId();
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");
  const [beds, setBeds] = useState("");
  const [pending, startTransition] = useTransition();
  const budgets = tab === "rent" ? BUDGETS_RENT : BUDGETS_BUY;
  const allowedTypes = tab === "commercial" ? COMMERCIAL_TYPES : PROPERTY_TYPES.filter((value) => !COMMERCIAL_TYPES.includes(value));

  function selectTab(value: TabKey) {
    setTab(value); setBudget(""); setType("");
    if (value === "commercial") setBeds("");
  }
  function selectLocation(value: string) {
    setLocation(value);
    const cityName = CITIES.find((name) => value.toLowerCase() === name.toLowerCase() || value.toLowerCase().endsWith(`, ${name.toLowerCase()}`));
    setCity(cityName?.toLowerCase() ?? "");
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const route = TABS.find((item) => item.key === tab)!.path;
    const params = new URLSearchParams();
    let term = location.trim();
    const exactCity = CITIES.find((name) => term.toLowerCase() === name.toLowerCase());
    if (exactCity) { params.set("city", exactCity.toLowerCase()); term = ""; }
    else if (city) { params.set("city", city); term = term.replace(new RegExp(`,\\s*${city}$`, "i"), ""); }
    if (term) params.set("q", term);
    if (type) params.set("type", type);
    if (beds) params.set("beds", beds);
    if (budget) {
      const [min, max] = budget.split("-");
      if (min) params.set("minPrice", min);
      if (max) params.set("maxPrice", max);
    }
    startTransition(() => router.push(params.size ? `${route}?${params}` : route));
  }

  return (
    <div className={`property-search-panel ${elevation === "panel" ? "shadow-panel" : "shadow-card"}`}>
      <div className="property-search-tabs" role="tablist" aria-label="Search mode">
        {TABS.map((item, index) => (
          <button key={item.key} id={`${prefix}-${item.key}`} type="button" role="tab" aria-selected={item.key === tab} aria-controls={`${prefix}-fields`} tabIndex={item.key === tab ? 0 : -1} onClick={() => selectTab(item.key)} className="property-search-tab"
            onKeyDown={(event) => {
              let next = index;
              if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
              else if (event.key === "ArrowLeft") next = (index + TABS.length - 1) % TABS.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = TABS.length - 1;
              else return;
              event.preventDefault(); selectTab(TABS[next].key); document.getElementById(`${prefix}-${TABS[next].key}`)?.focus();
            }}
          >{item.label}</button>
        ))}
      </div>
      <form onSubmit={submit} className="property-search-form" aria-label="Find a property" aria-busy={pending}>
        <div id={`${prefix}-fields`} role="tabpanel" aria-labelledby={`${prefix}-${tab}`} className="property-search-fields">
          <div className="search-field search-field--location">
            <label htmlFor={`${prefix}-location`}>Location</label>
            <LocationAutocomplete id={`${prefix}-location`} className="mt-2" value={location} onChange={(value) => { setLocation(value); setCity(""); }} onSelect={(suggestion) => selectLocation(suggestion.label)} placeholder="City, society or area" />
          </div>
          <div className="search-field search-field--type"><label htmlFor={`${prefix}-type`}>Property type</label><select id={`${prefix}-type`} value={type} onChange={(event) => setType(event.target.value)} className="field mt-2"><option value="">All types</option>{allowedTypes.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
          <div className="search-field search-field--budget"><label htmlFor={`${prefix}-budget`}>Budget</label><select id={`${prefix}-budget`} value={budget} onChange={(event) => setBudget(event.target.value)} className="field mt-2"><option value="">Any budget</option>{budgets.map((value) => <option key={value.value} value={value.value}>{value.label}</option>)}</select></div>
          <div className="search-field search-field--beds"><label htmlFor={`${prefix}-beds`}>Bedrooms</label><select id={`${prefix}-beds`} value={beds} onChange={(event) => setBeds(event.target.value)} className="field mt-2"><option value="">Any</option>{[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>{value}+</option>)}</select></div>
          <div className="search-field--submit"><button type="submit" disabled={pending} className="btn btn-green min-h-12 w-full disabled:opacity-60"><IconSearch className="h-4 w-4 shrink-0" />{pending ? "Searching…" : "Search"}</button></div>
        </div>
        <div className="property-search-help"><span>Search by city, society, property type or budget.</span><Link href="/properties" className="inline-flex min-h-8 items-center gap-1.5 font-semibold text-forest-700">All filters <IconArrowRight className="h-3.5 w-3.5" /></Link></div>
      </form>
    </div>
  );
}
