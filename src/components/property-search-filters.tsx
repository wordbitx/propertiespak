"use client";

import { useId, useState, type FormEvent } from "react";
import { useLanguage } from "@/components/language-provider";
import { IconArrowRight, IconSearch } from "@/components/icons";
import { CATEGORY_LABELS } from "@/lib/constants";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import {
  areaFactor, defaultPropertySearch, nonNegativeNumber, SEARCH_CITIES, SEARCH_GROUPS,
  searchTypeLabel, typesForGroup, type PropertySearchState, type SearchAreaUnit,
} from "@/lib/property-search";

function RangeFields({
  label, unit, min, max, ceiling, step, prefix, onChange,
}: {
  label: "Price" | "Area"; unit: string; min: string; max: string; ceiling: number; step: number; prefix: string;
  onChange: (side: "min" | "max", value: string) => void;
}) {
  const { t } = useLanguage();
  const low = nonNegativeNumber(min) ?? 0;
  const high = nonNegativeNumber(max) ?? ceiling;
  return (
    <>
      <div className="filter-range-values">
        <label htmlFor={`${prefix}-min`}>
          <span>{t("Minimum")} {t(label.toLowerCase())} ({unit})</span>
          <input id={`${prefix}-min`} type="number" min="0" step={label === "Area" ? "any" : "1"} inputMode="decimal" value={min}
            onChange={(event) => onChange("min", event.target.value)} placeholder={t("Any")} className="field" />
        </label>
        <span className="filter-range-to" aria-hidden="true">{t("to")}</span>
        <label htmlFor={`${prefix}-max`}>
          <span>{t("Maximum")} {t(label.toLowerCase())} ({unit})</span>
          <input id={`${prefix}-max`} type="number" min="0" step={label === "Area" ? "any" : "1"} inputMode="decimal" value={max}
            onChange={(event) => onChange("max", event.target.value)} placeholder={t("Any")} className="field" />
        </label>
      </div>
      <div className="filter-range-sliders">
        <label><span className="sr-only">{t("Minimum")} {t(label.toLowerCase())} {t("slider")}</span>
          <input type="range" min="0" max={ceiling} step={step} value={Math.min(low, ceiling)}
            onChange={(event) => onChange("min", String(Math.min(Number(event.target.value), high)))} />
        </label>
        <label><span className="sr-only">{t("Maximum")} {t(label.toLowerCase())} {t("slider")}</span>
          <input type="range" min="0" max={ceiling} step={step} value={Math.min(high, ceiling)}
            onChange={(event) => onChange("max", String(Math.max(Number(event.target.value), low)))} />
        </label>
      </div>
    </>
  );
}

function FilterSwitch({ label, checked, onChange, children }: {
  label: string; checked: boolean; onChange: (value: boolean) => void; children?: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <label className="filter-switch-row">
      <span><span className="filter-switch-label">{t(label)}</span>{children && <span className="filter-switch-note">{typeof children === "string" ? t(children) : children}</span>}</span>
      <input type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

/** The same real filters are used by the mobile search bar and the header. */
export function PropertySearchFilters({ initialState, onClose, onSearch, pending = false }: {
  initialState: PropertySearchState;
  onClose: () => void;
  onSearch: (state: PropertySearchState) => void;
  pending?: boolean;
}) {
  const { t } = useLanguage();
  const prefix = useId();
  const [state, setState] = useState<PropertySearchState>(initialState);
  const [error, setError] = useState("");
  const city = SEARCH_CITIES.find((item) => item.slug === state.city);
  const id = (name: string) => `${prefix}-${name}`;
  function set<K extends keyof PropertySearchState>(key: K, value: PropertySearchState[K]) {
    setState((current) => ({ ...current, [key]: value, ...(key === "town" ? { townExact: false } : key === "type" ? { originalCategory: "" } : {}) }));
    setError("");
  }
  function changeUnit(unit: SearchAreaUnit) {
    const ratio = areaFactor(state.areaUnit) / areaFactor(unit);
    setState((current) => ({ ...current, areaUnit: unit,
      minArea: current.minArea ? String(Number((Number(current.minArea) * ratio).toFixed(3))) : "",
      maxArea: current.maxArea ? String(Number((Number(current.maxArea) * ratio).toFixed(3))) : "",
    }));
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    for (const [min, max, label] of [[state.minPrice, state.maxPrice, "price"], [state.minArea, state.maxArea, "area"]]) {
      const low = nonNegativeNumber(min), high = nonNegativeNumber(max);
      if (low !== undefined && high !== undefined && low > high) {
        setError(`Minimum ${label} cannot be greater than maximum ${label}.`);
        return;
      }
    }
    onSearch(state);
  }

  return (
    <form className="property-filter-panel" aria-label={t("Find a property")} onSubmit={submit} aria-busy={pending}>
      <div className="property-filter-heading">
        <button type="button" data-dialog-initial onClick={onClose} className="filter-back" aria-label={t("Close search")}>
          <IconArrowRight className="h-5 w-5 rotate-180" />
        </button>
        <h2>{t("Search Properties")}</h2>
        <button type="button" onClick={onClose} className="filter-done">{t("Close")}</button>
      </div>
      <div className="property-filter-scroll">
        {(state.featured || state.newProjects || state.originalCategory || state.furnishing || state.possession) && <div className="filter-context">
          <span>{t("Current search:")}</span>
          {state.featured && <button type="button" onClick={() => set("featured", false)}>{t("Featured")} ×</button>}
          {state.newProjects && <button type="button" onClick={() => set("newProjects", false)}>{t("New projects")} ×</button>}
          {state.originalCategory && <button type="button" onClick={() => set("originalCategory", "")}>{CATEGORY_LABELS[state.originalCategory] ?? state.originalCategory} ×</button>}
          {state.furnishing && <button type="button" onClick={() => set("furnishing", "")}>{state.furnishing} ×</button>}
          {state.possession && <button type="button" onClick={() => set("possession", "")}>{state.possession} ×</button>}
        </div>}
        <fieldset className="filter-section filter-purpose">
          <legend>{t("I want to")}</legend>
          <div className="filter-pills" role="group" aria-label={t("I want to")}>
            {(["buy", "rent"] as const).map((purpose) => (
              <button key={purpose} type="button" aria-pressed={state.purpose === purpose} onClick={() => {
                setState((current) => ({ ...current, purpose, minPrice: "", maxPrice: "" })); setError("");
              }}>{t(purpose === "buy" ? "Buy" : "Rent")}</button>
            ))}
          </div>
        </fieldset>

        <div className="filter-location-grid filter-section">
          <div><label htmlFor={id("city")} className="filter-label">{t("City")}</label>
            <select id={id("city")} className="field" value={state.city} onChange={(event) => {
              setState((current) => ({ ...current, city: event.target.value, town: "", townExact: false }));
            }}>
              <option value="">{t("All cities")}</option>
              {SEARCH_CITIES.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={id("location")} className="filter-label">{t("Select location")}</label>
            <LocationAutocomplete id={id("location")} value={state.town} onChange={(value) => set("town", value)}
              citySlug={state.city} cityName={city?.name} placeholder={t("Society, town or area")} onSelect={(suggestion) => {
                const matchingCity = SEARCH_CITIES.find((item) => suggestion.label.toLowerCase() === item.name.toLowerCase());
                if (matchingCity) setState((current) => ({ ...current, city: matchingCity.slug, town: "", townExact: false }));
                else set("town", suggestion.label.replace(new RegExp(`,\\s*${city?.name ?? "__none__"}$`, "i"), ""));
              }} />
          </div>
        </div>

        <fieldset className="filter-section">
          <legend>{t("Payment type")}</legend>
          <div className="filter-pills" role="group" aria-label={t("Payment type")}>
            {[{ value: "", label: "Any" }, { value: "cash", label: "Cash" }, { value: "installments", label: "Installments" }].map((item) => (
              <button key={item.value} type="button" aria-pressed={state.paymentType === item.value} onClick={() => set("paymentType", item.value)}>{t(item.label)}</button>
            ))}
          </div>
        </fieldset>

        <fieldset className="filter-section">
          <legend>{t("Property type")}</legend>
          <div className="filter-property-groups" role="group" aria-label={t("Property category")}>
            {SEARCH_GROUPS.map((group) => <button key={group.value} type="button" aria-pressed={state.group === group.value} onClick={() => {
              setState((current) => ({ ...current, group: group.value, originalCategory: "", type: "", beds: "", baths: "" }));
            }}>{t(group.label)}</button>)}
          </div>
          <div className="filter-pills filter-type-pills" role="group" aria-label={t("Property type")}>
            <button type="button" aria-pressed={!state.type} onClick={() => set("type", "")}>{t("All types")}</button>
            {typesForGroup(state.group).map((type) => <button key={type} type="button" aria-pressed={state.type === type} onClick={() => set("type", type)}>{t(searchTypeLabel(type))}</button>)}
          </div>
        </fieldset>

        <fieldset className="filter-section">
          <legend>{t("Price range")} <span>PKR{state.purpose === "rent" ? ` / ${t("month")}` : ""}</span></legend>
          <RangeFields label="Price" unit="PKR" min={state.minPrice} max={state.maxPrice} prefix={id("price")}
            ceiling={state.purpose === "rent" ? 10000000 : 5000000000} step={state.purpose === "rent" ? 5000 : 100000}
            onChange={(side, value) => set(side === "min" ? "minPrice" : "maxPrice", value)} />
        </fieldset>

        <fieldset className="filter-section">
          <legend>{t("Area range")}</legend>
          <div className="filter-unit"><label htmlFor={id("unit")}>{t("Area unit")}</label>
            <select id={id("unit")} value={state.areaUnit} onChange={(event) => changeUnit(event.target.value as SearchAreaUnit)}>
              <option value="marla">{t("Marla")}</option><option value="kanal">{t("Kanal")}</option><option value="sqft">{t("Sq ft")}</option>
            </select>
          </div>
          <RangeFields label="Area" unit={state.areaUnit === "sqft" ? "sq ft" : state.areaUnit} min={state.minArea} max={state.maxArea}
            ceiling={state.areaUnit === "marla" ? 500 : state.areaUnit === "kanal" ? 25 : 112500} step={state.areaUnit === "sqft" ? 225 : state.areaUnit === "kanal" ? 0.25 : 1}
            prefix={id("area")} onChange={(side, value) => set(side === "min" ? "minArea" : "maxArea", value)} />
          <div className="filter-pills" role="group" aria-label={t("Popular area sizes")}>
            {[{ label: "5 Marla", sqft: 1125 }, { label: "10 Marla", sqft: 2250 }, { label: "15 Marla", sqft: 3375 }, { label: "1 Kanal", sqft: 4500 }, { label: "2 Kanal", sqft: 9000 }, { label: "4 Kanal", sqft: 18000 }, { label: "6 Kanal", sqft: 27000 }].map((area) => (
              <button key={area.label} type="button" aria-pressed={Number(state.minArea) * areaFactor(state.areaUnit) === area.sqft && state.minArea === state.maxArea} onClick={() => {
                const value = String(area.sqft / areaFactor(state.areaUnit));
                setState((current) => ({ ...current, minArea: value, maxArea: value }));
              }}>{area.label}</button>
            ))}
          </div>
          <p className="filter-help">{t("Area conversion: 1 Marla = 225 sq ft; 1 Kanal = 20 Marla.")}</p>
        </fieldset>

        <div className="filter-section">
          <FilterSwitch label={t("Show verified listings only")} checked={state.verified} onChange={(value) => set("verified", value)}>
            Listings reviewed by Properties Pak. Independently check ownership and documents before paying.
          </FilterSwitch>
        </div>

        {state.group !== "plot" && state.group !== "commercial" && <>
          <fieldset className="filter-section"><legend>{t("Bedrooms")}</legend>
            <div className="filter-pills" role="group" aria-label={t("Bedrooms")}>
              <button type="button" aria-pressed={state.beds === ""} onClick={() => set("beds", "")}>{t("Any")}</button>
              <button type="button" aria-pressed={state.beds === "0"} onClick={() => set("beds", "0")}>{t("Studio")}</button>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => <button key={number} type="button" aria-pressed={state.beds === String(number)} onClick={() => set("beds", String(number))}>{number}+</button>)}
            </div>
          </fieldset>
          <fieldset className="filter-section"><legend>{t("Bathrooms")}</legend>
            <div className="filter-pills" role="group" aria-label={t("Bathrooms")}>
              <button type="button" aria-pressed={!state.baths} onClick={() => set("baths", "")}>{t("Any")}</button>
              {[1, 2, 3, 4, 5, 6].map((number) => <button key={number} type="button" aria-pressed={state.baths === String(number)} onClick={() => set("baths", String(number))}>{number}+</button>)}
            </div>
          </fieldset>
        </>}

        <div className="filter-section">
          <label htmlFor={id("keyword")} className="filter-label">{t("Add keyword")}</label>
          <input id={id("keyword")} className="field" value={state.keyword} maxLength={200} onChange={(event) => set("keyword", event.target.value)} placeholder={t('Try "furnished", "corner plot" or "low price"')} />
        </div>
        <div className="filter-section filter-media">
          <FilterSwitch label="Show ads with videos only" checked={state.withVideos} onChange={(value) => set("withVideos", value)} />
          <FilterSwitch label="Show ads with images only" checked={state.withImages} onChange={(value) => set("withImages", value)} />
        </div>
      </div>
      {error && <p role="alert" className="filter-error filter-error-dock">{error}</p>}
      <div className="property-filter-footer">
        <button type="button" onClick={() => { setState(defaultPropertySearch(state.purpose)); setError(""); }} className="btn btn-outline">{t("Reset")}</button>
        <button type="submit" disabled={pending} className="btn btn-green"><IconSearch className="h-4 w-4" />{t(pending ? "Searching…" : "Find properties")}</button>
      </div>
    </form>
  );
}
