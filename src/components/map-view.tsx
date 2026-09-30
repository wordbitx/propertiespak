"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { IconClose, IconMap, IconPin } from "@/components/icons";
import { formatArea, formatPrice, formatPriceShort } from "@/lib/format";
import { findSocietyMap, layersContaining } from "@/lib/society-maps";

const LeafletMap = dynamic(() => import("@/components/leaflet-map").then((module) => module.LeafletMap), {
  ssr: false,
  loading: () => <div className="grid h-[380px] place-items-center rounded-lg border border-soft bg-soft text-sm text-ink-muted sm:h-[500px]">Loading property map…</div>,
});

export type MapProperty = {
  id: number; slug: string; title: string; cityName: string; locationArea: string;
  price: number; priceUnit: string; lat: number; lng: number; coverImage: string;
  propertyType: string; bedrooms: number; bathrooms: number; areaValue: number; areaUnit: string;
  citySlug?: string; distanceKm?: number;
};

/** Category colour coding for map pins (the selected pin always renders green). */
const APARTMENT_TYPE = /(apartment|penthouse|portion|studio|flat\b)/i;
const COMMERCIAL_TYPE = /(office|shop|warehouse|industrial|commercial|plaza|factory|building)/i;
const PLOT_TYPE = /\b(plot|file|agricultural)\b/i;
export function pinColorFor(propertyType: string): string {
  if (COMMERCIAL_TYPE.test(propertyType)) return "#d97706";
  if (APARTMENT_TYPE.test(propertyType)) return "#7c3aed";
  if (PLOT_TYPE.test(propertyType)) return "#0e7490";
  return "#06274a";
}

/** Legend for the category colours, shown under multi-pin overview maps. */
function PinLegend() {
  const items = [
    { color: "#06274a", label: "Houses & villas" },
    { color: "#7c3aed", label: "Apartments" },
    { color: "#d97706", label: "Commercial" },
    { color: "#0e7490", label: "Plots" },
    { color: "#10a456", label: "Selected" },
  ];
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.6875rem] font-medium text-ink-muted">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <svg viewBox="0 0 30 41" className="h-3.5 w-auto" aria-hidden="true">
            <path d="M15 0C6.7 0 0 6.7 0 15c0 10.6 15 26 15 26s15-15.4 15-26C30 6.7 23.3 0 15 0z" fill={item.color} />
            <circle cx="15" cy="15" r="6" fill="#fff" />
          </svg>
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function MapView({
  properties, center, zoom = 14, className = "", mapTitle, mapSubtitle, nearby = false, autoFit = false,
}: {
  properties: MapProperty[];
  center: { lat: number; lng: number };
  zoom?: number; className?: string; mapTitle?: string; mapSubtitle?: string; nearby?: boolean; autoFit?: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(nearby ? null : properties[0]?.id ?? null);
  const [focus, setFocus] = useState(center);
  const [focusZoom, setFocusZoom] = useState(zoom);
  const active = properties.find((property) => property.id === selected);
  const society = useMemo(() => {
    if (!active) return null;
    const found = findSocietyMap(active.locationArea, active.citySlug);
    if (!found) return null;
    const containing = layersContaining(found, active.lat, active.lng);
    return containing.length > 0 && containing.length < found.layers.length ? { ...found, layers: containing } : found;
  }, [active]);
  const pins = useMemo(() => properties.map((property) => ({
    id: property.id, lat: property.lat, lng: property.lng, title: property.title,
    subtitle: `${formatArea(property.areaValue, property.areaUnit)} ${property.propertyType} · ${property.locationArea}, ${property.cityName}`,
    href: `/property/${property.slug}`, price: formatPriceShort(property.price, property.priceUnit), image: property.coverImage,
    color: pinColorFor(property.propertyType), active: property.id === selected,
  })), [properties, selected]);

  return (
    <div className={`grid min-w-0 gap-5 lg:grid-cols-[minmax(0,2.25fr)_minmax(0,1fr)] ${className}`} data-testid={nearby ? "nearby-property-map" : "property-market-map"}>
      <div className="min-w-0">
        <LeafletMap
          center={focus}
          zoom={focusZoom}
          heightClass="h-[420px] sm:h-[580px]"
          pins={pins}
          fitToPins={nearby || autoFit}
          autoOpenActive
          society={society}
          header={{ label: nearby ? "Nearby properties" : "Property map", subtitle: mapSubtitle ?? active?.locationArea, title: mapTitle }}
          onPinSelect={(id) => setSelected(Number(id))}
        />
        {!nearby && properties.length > 1 && <PinLegend />}
        {active && (
          <div className="mt-3 flex min-w-0 gap-3 rounded-xl border border-soft bg-white p-3">
            <img src={active.coverImage} alt={active.title} width={160} height={120} loading="lazy" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-sans text-[0.9375rem] font-bold text-navy-900">{formatPrice(active.price, active.priceUnit)}</p>
              <Link href={`/property/${active.slug}`} className="mt-1 block text-[0.8125rem] font-semibold leading-5 text-navy-900 hover:text-forest-700">{active.title}</Link>
              <p className="mt-1 text-[0.75rem] text-ink-muted">{active.locationArea}, {active.cityName}</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex h-full min-w-0 flex-col rounded-panel border border-soft bg-white p-2 shadow-soft">
        <div className="flex items-center justify-between gap-2 px-3 py-3">
          <p className="flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-navy-900">
            <IconMap className="h-4 w-4 shrink-0 text-forest-600" />
            {properties.length} {nearby ? "nearby listings" : "Properties mapped"}
          </p>
          {selected !== null && <button type="button" aria-label="Clear map selection" onClick={() => setSelected(null)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-mist"><IconClose className="h-4 w-4" /></button>}
        </div>
        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {properties.map((property) => (
            <li
              key={property.id}
              onMouseEnter={() => setSelected(property.id)}
              className={`group min-w-0 overflow-hidden rounded-xl border transition-all duration-150 ${property.id === selected ? "border-forest-600/50 bg-forest-50/40 shadow-[0_0_0_1px_rgba(16,164,86,0.35)]" : "border-soft/80 hover:border-navy-100 hover:shadow-soft"}`}
            >
              <div className="relative">
                <img src={property.coverImage} alt="" width={280} height={152} loading="lazy" className="h-[74px] w-full object-cover" />
                <span className="absolute left-2 top-2 rounded-md bg-white/95 px-1.5 py-0.5 font-sans text-[0.6875rem] font-bold text-navy-900 shadow-sm">
                  {formatPriceShort(property.price, property.priceUnit)}
                </span>
                <button
                  type="button"
                  aria-label={`Show ${property.title} on map`}
                  title="Show on map"
                  onClick={() => { setSelected(property.id); setFocus({ lat: property.lat, lng: property.lng }); setFocusZoom(16); }}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/95 text-forest-700 shadow-sm transition-transform hover:scale-105 hover:bg-white"
                >
                  <IconPin className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="min-w-0 px-2.5 py-2">
                <Link href={`/property/${property.slug}`} className="block truncate text-[0.8125rem] font-semibold leading-5 text-navy-900 hover:text-forest-700">{property.title}</Link>
                <p className="mt-0.5 truncate text-[0.6875rem] leading-4 text-ink-muted">
                  {typeof property.distanceKm === "number"
                    ? `${property.distanceKm < 0.1 ? "Under 100 m" : `${property.distanceKm.toFixed(1)} km`} away · ${property.locationArea}`
                    : `${formatArea(property.areaValue, property.areaUnit)} · ${property.locationArea}, ${property.cityName}`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
