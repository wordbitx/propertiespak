"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useId, useMemo, useState } from "react";
import { IconClose, IconMap, IconSliders } from "@/components/icons";
import type { MapProperty } from "@/components/map-view";
import { CITY_CENTERS } from "@/lib/map-engine";
import { CATEGORY_LABELS } from "@/lib/constants";
import { SEARCH_CITIES } from "@/lib/property-search";

const MapView = dynamic(() => import("@/components/map-view").then((module) => module.MapView), {
  ssr: false,
  loading: () => <div className="header-map-loading">Loading map…</div>,
});

export function HeaderPropertyMap({ initialQuery = "", onClose, onFilters }: {
  initialQuery?: string; onClose: () => void; onFilters: (query: string) => void;
}) {
  const prefix = useId();
  const initial = useMemo(() => new URLSearchParams(initialQuery), [initialQuery]);
  const [city, setCity] = useState(initial.get("city") ?? "");
  const [purpose, setPurpose] = useState(initial.get("purpose") ?? "");
  const [category, setCategory] = useState(initial.get("category") ?? "");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ key: string; items: MapProperty[]; total: number; error: string }>({ key: "", items: [], total: 0, error: "" });
  const query = useMemo(() => {
    const params = new URLSearchParams(initial);
    params.set("view", "map"); params.delete("page"); params.delete("pageSize");
    if (city) params.set("city", city); else params.delete("city");
    if (city !== (initial.get("city") ?? "")) { params.delete("town"); params.delete("townExact"); }
    if (purpose) params.set("purpose", purpose); else params.delete("purpose");
    if (purpose !== (initial.get("purpose") ?? "")) { params.delete("minPrice"); params.delete("maxPrice"); }
    if (category) params.set("category", category); else params.delete("category");
    if (category !== (initial.get("category") ?? "")) { params.delete("type"); params.delete("beds"); params.delete("baths"); }
    return params.toString();
  }, [initial, city, purpose, category]);
  const loading = result.key !== query;
  const center = CITY_CENTERS[city] ?? { lat: 30.3753, lng: 69.3451 };
  const listParams = new URLSearchParams(query);
  listParams.delete("view");

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/properties?${query}`, { signal: controller.signal }).then(async (response) => {
      const data = await response.json() as { ok?: boolean; items?: MapProperty[]; total?: number };
      if (!response.ok || !data.ok || !Array.isArray(data.items)) throw new Error("Unable to load mapped listings.");
      if (!controller.signal.aborted) setResult({ key: query, items: data.items, total: data.total ?? data.items.length, error: "" });
    }).catch(() => {
      if (!controller.signal.aborted) setResult((current) => ({ ...current, key: query, error: "Could not load listings. Please try again." }));
    });
    return () => controller.abort();
  }, [query, attempt]);

  return (
    <div className="header-map-panel">
      <div className="header-map-heading">
        <h2><IconMap className="h-5 w-5 text-forest-600" />Property Map</h2>
        <div className="header-map-heading-actions">
          <button type="button" onClick={() => onFilters(listParams.toString())}><IconSliders className="h-4 w-4" /><span>Filters</span></button>
          <Link href={`/properties${listParams.size ? `?${listParams}` : ""}`} onClick={onClose}>List view</Link>
          <button type="button" data-dialog-initial onClick={onClose} aria-label="Close property map" className="dialog-close"><IconClose className="h-5 w-5" /></button>
        </div>
      </div>
      <div className="header-map-filters">
        <div><label htmlFor={`${prefix}-city`}>City</label><select id={`${prefix}-city`} value={city} onChange={(event) => setCity(event.target.value)}><option value="">Pakistan</option>{SEARCH_CITIES.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></div>
        <div><label htmlFor={`${prefix}-purpose`}>Purpose</label><select id={`${prefix}-purpose`} value={purpose} onChange={(event) => setPurpose(event.target.value)}><option value="">Sale &amp; Rent</option><option value="buy">For Sale</option><option value="rent">For Rent</option></select></div>
        <div><label htmlFor={`${prefix}-property`}>Property</label><select id={`${prefix}-property`} value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All properties</option><option value="homes">Homes</option><option value="plot">Plots</option><option value="commercial">Commercial</option>{category && !["homes", "plot", "commercial"].includes(category) && <option value={category}>{CATEGORY_LABELS[category] ?? category}</option>}</select></div>
      </div>
      <p className="header-map-status" role="status">{loading ? "Loading properties…" : result.error || `${result.total.toLocaleString("en-PK")} listings${result.total > result.items.length ? ` · showing ${result.items.length} mapped listings; narrow your search to see more` : ""}`}</p>
      <div className="header-map-content" aria-busy={loading}>
        {result.error ? <div className="header-map-loading"><p>{result.error}</p><button className="btn btn-outline" type="button" onClick={() => { setResult((current) => ({ ...current, key: "" })); setAttempt((current) => current + 1); }}>Retry</button></div> :
          result.key || result.items.length ? <>
            {!loading && !result.items.length && <p className="header-map-empty">No listings match these filters. Try another city, purpose or property type.</p>}
            <MapView properties={result.items} center={center} zoom={city ? 12 : 6} autoFit fullScreen />
          </> : <div className="header-map-loading">Loading properties and map…</div>}
      </div>
      <p className="header-map-disclaimer">Pin locations are approximate. Confirm the exact address before a site visit.</p>
    </div>
  );
}
