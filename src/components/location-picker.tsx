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
  /** Name of the area the pin currently sits in — never the previously picked one. */
  const [pinLabel, setPinLabel] = useState("");
  const [pinDetail, setPinDetail] = useState("");
  const [pinBusy, setPinBusy] = useState(false);
  /** True once the user moved the pin on the map — the pin then names the place. */
  const [pinTouched, setPinTouched] = useState(false);
  const lastQuery = useRef("");
  /** Label we pushed into the form ourselves, so its effect does not re-open the list. */
  const pushedLabel = useRef("");
  const reverseSeq = useRef(0);
  /** Set only when this map moved the pin, so typed addresses are never overwritten. */
  const wantsReverse = useRef(false);
  /** Kept in a ref so an inline parent callback never retriggers the lookup. */
  const onLocationLabelRef = useRef(onLocationLabel);
  useEffect(() => {
    onLocationLabelRef.current = onLocationLabel;
  }, [onLocationLabel]);

  const society = useMemo(() => findSocietyMap(`${locationQuery ?? ""} ${previewLabel}`, citySlug), [locationQuery, previewLabel, citySlug]);

  /**
   * Resolve a dropped / dragged pin back to an area name. The old label is
   * cleared first, so the header and the pin popup can never keep showing the
   * society that was selected before the user tapped somewhere else.
   */
  useEffect(() => {
    if (!wantsReverse.current) return; // typed address / initial render: nothing to rename
    wantsReverse.current = false;
    const seq = (reverseSeq.current += 1);
    let active = true;
    const params = new URLSearchParams({
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
      city: citySlug,
      cityName: cityName ?? "",
    });
    fetch(`/api/geocode?${params}`)
      .then((res) => res.json())
      .then((data: { reverse?: { label?: string; detail?: string } | null }) => {
        if (!active || seq !== reverseSeq.current) return;
        const label = data.reverse?.label?.trim() ?? "";
        setPinLabel(label);
        setPinDetail(data.reverse?.detail?.trim() ?? "");
        if (label) {
          pushedLabel.current = label;
          onLocationLabelRef.current?.(label);
        }
      })
      .catch(() => {
        if (!active || seq !== reverseSeq.current) return;
        setPinLabel("");
        setPinDetail("");
      })
      .finally(() => {
        if (active && seq === reverseSeq.current) setPinBusy(false);
      });
    return () => {
      active = false;
    };
    // Only re-resolve when the coordinates move after a map interaction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  useEffect(() => {
    const query = (locationQuery ?? "").trim();
    if (query === lastQuery.current) return;
    lastQuery.current = query;
    // A label we wrote from the map must not bounce back as a suggestion list.
    if (query && query === pushedLabel.current) { setResults([]); setShowList(false); setSearching(false); return; }
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
    setCenter({ lat: p.lat, lng: p.lng }); setZoom(p.zoom); setPreviewLabel(""); setPinDetail(""); setPinTouched(true);
    wantsReverse.current = true;
    onChange(p.lat, p.lng); // the reverse lookup renames the pin for the new centre
  }
  function chooseResult(r: GeoResult) {
    const nlat = Math.round(r.lat * 1e5) / 1e5, nlng = Math.round(r.lng * 1e5) / 1e5;
    setCenter({ lat: nlat, lng: nlng }); setZoom(r.kind === "society" || r.kind === "city" ? 15 : 17);
    setPreviewLabel(r.label); setPinLabel(r.label); setPinDetail(""); setPinBusy(false);
    reverseSeq.current += 1; // a pending reverse lookup must not overwrite this pick
    pushedLabel.current = r.label;
    onChange(nlat, nlng); onLocationLabel?.(r.label); setShowList(false);
  }
  /**
   * Map tap / dragged pin. The coordinate change triggers the reverse lookup,
   * but we clear the previous society label immediately so nothing stale shows
   * in the map header or in the pin popup while the lookup runs.
   */
  function handlePick(pl: number, pg: number) {
    setPreviewLabel("");
    setPinLabel("");
    setPinDetail("");
    setPinBusy(true);
    setPinTouched(true);
    wantsReverse.current = true;
    onChange(Math.round(pl * 1e5) / 1e5, Math.round(pg * 1e5) / 1e5);
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
                  <span className="min-w-0 flex-1"><span className="block truncate text-[0.875rem] font-semibold text-navy-900">{r.label}</span><span className="block text-[0.6875rem] text-ink-muted">{r.lat.toFixed(5)}, {r.lng.toFixed(5)} · {r.source === "estatewx" ? "Properties Pak index" : "OpenStreetMap"}</span></span>
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
          header={{
            subtitle: pinBusy
              ? "Locating address…"
              : (pinDetail || pinLabel || cityName || "Tap map to drop pin").split(",")[0],
            title: pinBusy
              ? "Locating address…"
              : pinLabel
                ? pinDetail && !pinLabel.includes(pinDetail)
                  ? `${pinLabel} · ${pinDetail}`
                  : pinLabel
                : pinTouched
                  ? "Pinned location — tap again or drag the pin"
                  : locationQuery || "Pin your exact property location",
          }}
          pickerPosition={{ lat, lng }}
          pickerLabel={
            pinBusy
              ? "Locating address…"
              : pinLabel || (pinTouched ? "Pinned property location" : plotLabel || "Property location")
          }
          pickerSubtitle={pinDetail || pinBusy ? [pinBusy ? "" : pinDetail, plotSubtitle].filter(Boolean).join(" · ") : plotSubtitle}
          onPick={handlePick}
          onLocate={(gl, gg) => { const a = Math.round(gl * 1e5) / 1e5, b = Math.round(gg * 1e5) / 1e5; setCenter({ lat: a, lng: b }); setZoom(17.5); setPreviewLabel(""); setPinTouched(true); wantsReverse.current = true; onChange(a, b); }}
          autoLocate={autoLocate}
        />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[0.8125rem] text-ink-muted">
        <p className="flex items-center gap-1.5"><IconPin className="h-4 w-4 text-forest-600" />Pinned at <span className="font-semibold tabular-nums text-navy-900">{lat.toFixed(5)}, {lng.toFixed(5)}</span></p>
        <p>Scroll / pinch to zoom · drag the blue pin or tap the map · ⊕ my location · layers icon (top-left) for Satellite / Map / society layout</p>
        {pinBusy ? (
          <p className="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-forest-700" role="status">
            Checking the area name for this pin…
          </p>
        ) : (
          pinLabel && (
            <p className="flex items-center gap-1.5 text-[0.8125rem] text-ink-muted">
              <IconPin className="h-4 w-4 text-forest-600" />Area name:{" "}
              <span className="font-semibold text-navy-900">{[pinLabel, pinDetail].filter(Boolean).join(" · ")}</span>
            </p>
          )
        )}
      </div>
    </div>
  );
}
