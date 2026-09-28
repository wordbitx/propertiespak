"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { IconClose, IconPin, IconSearch } from "@/components/icons";
import { CITY_CENTERS } from "@/lib/map-engine";
import { findSocietyMap } from "@/lib/society-maps";

const LeafletMap = dynamic(() => import("@/components/leaflet-map").then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => <div className="grid h-[420px] place-items-center rounded-[6px] border border-soft bg-[#e5e3df] text-[0.8125rem] text-ink-muted sm:h-[500px] lg:h-[560px]">Loading map…</div>,
});

const QUICK_CITIES = [
  { slug: "lahore", label: "Lahore" },
  { slug: "islamabad", label: "Islamabad" },
  { slug: "karachi", label: "Karachi" },
  { slug: "rawalpindi", label: "Rawalpindi" },
  { slug: "faisalabad", label: "Faisalabad" },
  { slug: "multan", label: "Multan" },
];

type GeoResult = { label: string; lat: number; lng: number; source: string; kind?: string };
const KIND_LABEL: Record<string, string> = { society: "Society", phase: "Phase", sector: "Sector", block: "Block", area: "Area", city: "City" };

export function LocationPicker({
  lat,
  lng,
  citySlug,
  cityName,
  locationQuery,
  plotLabel,
  plotSubtitle,
  onChange,
  onLocationLabel,
  autoLocate = false,
}: {
  lat: number;
  lng: number;
  citySlug: string;
  cityName?: string;
  locationQuery?: string;
  plotLabel?: string;
  plotSubtitle?: string;
  onChange: (lat: number, lng: number) => void;
  onLocationLabel?: (label: string) => void;
  autoLocate?: boolean;
}) {
  const [center, setCenter] = useState({ lat, lng });
  const [zoom, setZoom] = useState(15);
  const [results, setResults] = useState<GeoResult[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showList, setShowList] = useState(false);
  const [previewLabel, setPreviewLabel] = useState("");
  const lastQuery = useRef("");

  const society = useMemo(() => findSocietyMap(`${locationQuery ?? ""} ${previewLabel}`, citySlug), [locationQuery, previewLabel, citySlug]);

  useEffect(() => {
    const query = (locationQuery ?? "").trim();
    if (query === lastQuery.current) return;
    lastQuery.current = query;
    if (query.length < 2) { setResults([]); setShowList(false); return; }
    const controller = new AbortController();
    const t = window.setTimeout(async () => {
      setSearching(true);
      try {
        const params = new URLSearchParams({ q: query, city: citySlug, cityName: cityName ?? "" });
        const res = await fetch(`/api/geocode?${params}`, { signal: controller.signal });
        const data = (await res.json()) as { results?: GeoResult[]; expanded?: boolean };
        setResults(data.results ?? []); setExpanded(Boolean(data.expanded)); setShowList((data.results ?? []).length > 0);
      } catch { if (!controller.signal.aborted) setResults([]); }
      finally { if (!controller.signal.aborted) setSearching(false); }
    }, 280);
    return () => { controller.abort(); window.clearTimeout(t); };
  }, [locationQuery, citySlug, cityName]);

  // Snap the map to the society layout when one is detected and the pin is still at a city centre.
  useEffect(() => {
    if (!society?.center) return;
    const atCityCentre = Object.values(CITY_CENTERS).some((c) => Math.abs(c.lat - lat) < 1e-6 && Math.abs(c.lng - lng) < 1e-6);
    if (atCityCentre) { setCenter({ lat: society.center[0], lng: society.center[1] }); setZoom(society.zoom ?? 16); }
  }, [society, lat, lng]);

  function jumpToCity(slug: string) {
    const p = CITY_CENTERS[slug]; if (!p) return;
    setCenter({ lat: p.lat, lng: p.lng }); setZoom(p.zoom); onChange(p.lat, p.lng);
  }
  function chooseResult(r: GeoResult) {
    const nlat = Math.round(r.lat * 1e5) / 1e5, nlng = Math.round(r.lng * 1e5) / 1e5;
    setCenter({ lat: nlat, lng: nlng }); setZoom(r.kind === "society" || r.kind === "city" ? 15 : 17);
    setPreviewLabel(r.label); onChange(nlat, nlng); onLocationLabel?.(r.label); setShowList(false);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">Jump to:</span>
        {QUICK_CITIES.map((c) => (
          <button key={c.slug} type="button" onClick={() => jumpToCity(c.slug)} className={["rounded-full border px-3 py-1.5 text-[0.75rem] font-semibold transition-colors", c.slug === citySlug ? "border-navy-800 bg-navy-800 text-white" : "border-soft bg-white text-navy-900 hover:border-navy-800"].join(" ")}>{c.label}</button>
        ))}
        {society && <span className="ml-auto rounded-full bg-[#1f4fd8]/10 px-3 py-1.5 text-[0.75rem] font-semibold text-[#1f4fd8]">Society layout: {society.name.replace(/ Map$/, "")}</span>}
      </div>

      {(searching || (showList && results.length > 0)) && (
        <div className="relative mt-3 rounded-xl border border-soft bg-white shadow-card">
          <div className="flex items-center justify-between gap-2 border-b border-soft px-3 py-2">
            <p className="flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-muted"><IconSearch className="h-3.5 w-3.5 text-forest-600" />{searching ? "Finding locations…" : expanded ? `${results.length} matching areas — pick one` : "Location suggestions — pick the closest match"}</p>
            <button type="button" onClick={() => setShowList(false)} aria-label="Hide suggestions" className="text-ink-muted hover:text-navy-900"><IconClose className="h-4 w-4" /></button>
          </div>
          <ul className="max-h-72 overflow-y-auto p-1.5" role="listbox">
            {results.map((r) => (
              <li key={`${r.lat}-${r.lng}-${r.label}`} role="option" aria-selected={previewLabel === r.label}>
                <button type="button" onClick={() => chooseResult(r)} className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-mist">
                  <IconPin className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                  <span className="min-w-0 flex-1"><span className="block truncate text-[0.875rem] font-semibold text-navy-900">{r.label}</span><span className="block text-[0.6875rem] text-ink-muted">{r.lat.toFixed(5)}, {r.lng.toFixed(5)} · {r.source === "estatewx" ? "Pak Property index" : "OpenStreetMap"}</span></span>
                  {r.kind && KIND_LABEL[r.kind] && <span className="shrink-0 rounded-md bg-mist px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-ink-muted">{KIND_LABEL[r.kind]}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!showList && results.length > 0 && !searching && (
        <button type="button" onClick={() => setShowList(true)} className="mt-2 text-[0.75rem] font-semibold text-forest-700 hover:underline">Show {results.length} location suggestions</button>
      )}

      <div className="mt-3">
        <LeafletMap
          center={center}
          zoom={zoom}
          heightClass="h-[460px] sm:h-[540px] lg:h-[600px]"
          society={society}
          header={{ subtitle: previewLabel ? previewLabel.split(",")[0] : locationQuery?.trim() || cityName || "Tap map to drop pin", title: previewLabel || locationQuery || "Pin your exact property location" }}
          pickerPosition={{ lat, lng }}
          pickerLabel={plotLabel || "Property location"}
          pickerSubtitle={plotSubtitle}
          onPick={(pl, pg) => onChange(Math.round(pl * 1e5) / 1e5, Math.round(pg * 1e5) / 1e5)}
          onLocate={(gl, gg) => { const a = Math.round(gl * 1e5) / 1e5, b = Math.round(gg * 1e5) / 1e5; setCenter({ lat: a, lng: b }); setZoom(17.5); onChange(a, b); setPreviewLabel("My current location"); }}
          autoLocate={autoLocate}
        />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[0.8125rem] text-ink-muted">
        <p className="flex items-center gap-1.5"><IconPin className="h-4 w-4 text-forest-600" />Pinned at <span className="font-semibold tabular-nums text-navy-900">{lat.toFixed(5)}, {lng.toFixed(5)}</span></p>
        <p>Scroll / pinch to zoom · drag the blue pin or tap the map · ⊕ my location · layers icon (top-left) for Satellite / Map / society layout</p>
      </div>
    </div>
  );
}
