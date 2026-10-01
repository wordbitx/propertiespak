"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { IconClose, IconMap, IconPin, IconSliders } from "@/components/icons";
import { useLanguage } from "@/components/language-provider";
import type { MapProperty } from "@/components/map-view";
import { CITY_CENTERS } from "@/lib/map-engine";
import { CATEGORY_LABELS } from "@/lib/constants";
import { SEARCH_CITIES } from "@/lib/property-search";

const MapView = dynamic(() => import("@/components/map-view").then((module) => module.MapView), {
  ssr: false,
  loading: () => <div className="header-map-loading">Loading map…</div>,
});

const PAKISTAN_CENTER = { lat: 30.3753, lng: 69.3451 };

function nearestSearchCity(lat: number, lng: number) {
  const radians = Math.PI / 180;
  const candidates = SEARCH_CITIES.flatMap((city) => {
    const center = CITY_CENTERS[city.slug];
    if (!center) return [];
    const dLat = (center.lat - lat) * radians;
    const dLng = (center.lng - lng) * radians;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * radians) * Math.cos(center.lat * radians) * Math.sin(dLng / 2) ** 2;
    return [{ ...city, distanceKm: 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) }];
  }).sort((a, b) => a.distanceKm - b.distanceKm);
  return candidates[0] && candidates[0].distanceKm <= 140 ? candidates[0] : null;
}

export function HeaderPropertyMap({ initialQuery = "", onClose, onFilters }: {
  initialQuery?: string; onClose: () => void; onFilters: (query: string) => void;
}) {
  const { t } = useLanguage();
  const prefix = useId();
  const initial = useMemo(() => new URLSearchParams(initialQuery), [initialQuery]);
  const [city, setCity] = useState(initial.get("city") ?? "");
  const [purpose, setPurpose] = useState(initial.get("purpose") ?? "");
  const [category, setCategory] = useState(initial.get("category") ?? "");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ key: string; items: MapProperty[]; total: number; error: string }>({ key: "", items: [], total: 0, error: "" });
  const [locationPromptOpen, setLocationPromptOpen] = useState(() => !initial.get("city"));
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationNotice, setLocationNotice] = useState("");
  const [locatedCenter, setLocatedCenter] = useState<{ lat: number; lng: number } | null>(null);
  const cityManuallySelectedRef = useRef(false);
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
  const cityCenter = CITY_CENTERS[city];
  const center = locatedCenter ?? cityCenter ?? PAKISTAN_CENTER;
  const zoom = locatedCenter ? cityCenter?.zoom ?? 12 : cityCenter?.zoom ?? 6;
  const listParams = new URLSearchParams(query);
  listParams.delete("view");

  function selectCity(value: string) {
    const selectedCity = SEARCH_CITIES.find((item) => item.slug === value);
    cityManuallySelectedRef.current = true;
    setCity(value);
    setLocatedCenter(null);
    setLocationLoading(false);
    setLocationPromptOpen(false);
    setLocationNotice(value ? t("Showing {city} property locations.").replace("{city}", selectedCity?.name ?? t("selected city")) : t("Showing property locations across Pakistan."));
  }

  function applyLocatedCity(lat: number, lng: number) {
    const nearbyCity = nearestSearchCity(lat, lng);
    setLocationPromptOpen(false);
    if (!nearbyCity) {
      setCity("");
      setLocatedCenter(null);
      setLocationNotice(t("We couldn't match your location to a listed city, so the map is showing Pakistan."));
      return;
    }
    cityManuallySelectedRef.current = false;
    setCity(nearbyCity.slug);
    setLocatedCenter({ lat, lng });
    setLocationNotice(t("Showing {city} around your location.").replace("{city}", nearbyCity.name));
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      selectCity("");
      setLocationPromptOpen(false);
      setLocationNotice(t("Location is unavailable in this browser. Showing Pakistan."));
      return;
    }
    cityManuallySelectedRef.current = false;
    setLocationLoading(true);
    setLocationNotice(t("Waiting for location permission…"));
    navigator.geolocation.getCurrentPosition((position) => {
      setLocationLoading(false);
      if (cityManuallySelectedRef.current) return;
      applyLocatedCity(position.coords.latitude, position.coords.longitude);
    }, (error) => {
      setLocationLoading(false);
      if (cityManuallySelectedRef.current) return;
      setCity("");
      setLocatedCenter(null);
      setLocationPromptOpen(false);
      setLocationNotice(t(error.code === 1 ? "Location permission wasn't enabled. Showing Pakistan." : "Couldn't get your location. Showing Pakistan."));
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  }

  function choosePakistan() {
    selectCity("");
  }

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
        <h2><IconMap className="h-5 w-5 text-forest-600" />{t("Property Map")}</h2>
        <div className="header-map-heading-actions">
          <button type="button" onClick={() => onFilters(listParams.toString())}><IconSliders className="h-4 w-4" /><span>{t("Filters")}</span></button>
          <Link href={`/properties${listParams.size ? `?${listParams}` : ""}`} onClick={onClose}>{t("List view")}</Link>
          <button type="button" data-dialog-initial onClick={onClose} aria-label={t("Close property map")} className="dialog-close"><IconClose className="h-5 w-5" /></button>
        </div>
      </div>
      <div className="header-map-filters">
        <div><label htmlFor={`${prefix}-city`}>{t("City")}</label><select id={`${prefix}-city`} value={city} onChange={(event) => selectCity(event.target.value)}><option value="">Pakistan</option>{SEARCH_CITIES.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></div>
        <div><label htmlFor={`${prefix}-purpose`}>{t("Purpose")}</label><select id={`${prefix}-purpose`} value={purpose} onChange={(event) => setPurpose(event.target.value)}><option value="">{t("Sale & Rent")}</option><option value="buy">{t("For Sale")}</option><option value="rent">{t("For Rent")}</option></select></div>
        <div><label htmlFor={`${prefix}-property`}>{t("Property")}</label><select id={`${prefix}-property`} value={category} onChange={(event) => setCategory(event.target.value)}><option value="">{t("All properties")}</option><option value="homes">{t("Homes")}</option><option value="plot">{t("Plots")}</option><option value="commercial">{t("Commercial")}</option>{category && !["homes", "plot", "commercial"].includes(category) && <option value={category}>{t(CATEGORY_LABELS[category] ?? category)}</option>}</select></div>
      </div>
      {locationPromptOpen && <div className="header-map-location-prompt" role="group" aria-label={t("Choose property map location")}>
        <span className="header-map-location-icon"><IconPin className="h-4 w-4" /></span>
        <div className="header-map-location-copy"><strong>{t("Find properties near you")}</strong><span>{t("Use your location to focus on the nearest city, or explore Pakistan.")}</span></div>
        <div className="header-map-location-actions">
          <button type="button" className="header-map-location-primary" onClick={requestLocation} disabled={locationLoading}>{t(locationLoading ? "Finding your city…" : "Use my location")}</button>
          <button type="button" className="header-map-location-secondary" onClick={choosePakistan} disabled={locationLoading}>{t("Explore Pakistan")}</button>
        </div>
      </div>}
      <p className="header-map-status" role="status">{loading ? t("Loading property locations…") : result.error ? t(result.error) : locationNotice || (result.total === 0 ? t("No listings match these filters.") : result.total > result.items.length ? t("Zoom in or refine your filters to explore more property locations.") : t("Select a location pin to preview a property. Pin locations are approximate."))}</p>
      <div className="header-map-content" aria-busy={loading}>
        {result.error ? <div className="header-map-loading"><p>{t(result.error)}</p><button className="btn btn-outline" type="button" onClick={() => { setResult((current) => ({ ...current, key: "" })); setAttempt((current) => current + 1); }}>{t("Retry")}</button></div> :
          result.key || result.items.length ? <>
            {!loading && !result.items.length && <p className="header-map-empty">{t("No listings match these filters. Try another city, purpose or property type.")}</p>}
            <MapView properties={result.items} center={center} zoom={zoom} autoFit fullScreen onLocate={(lat, lng) => applyLocatedCity(lat, lng)} />
          </> : <div className="header-map-loading">{t("Loading properties and map…")}</div>}
      </div>
      <p className="header-map-disclaimer"><span className="hidden sm:inline">{t("Drag to pan; scroll or use +/− to zoom.")} </span><span className="sm:hidden">{t("Drag to pan or pinch to zoom.")} </span>{t("Pin locations are approximate; confirm the exact address before a site visit.")}</p>
    </div>
  );
}
