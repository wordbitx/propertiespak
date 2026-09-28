"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { IconClose, IconMap, IconPin } from "@/components/icons";
import { formatArea, formatPrice, formatPriceShort } from "@/lib/format";
import { findSocietyMap } from "@/lib/society-maps";

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

export function MapView({
  properties, center, zoom = 14, className = "", mapTitle, mapSubtitle, nearby = false,
}: {
  properties: MapProperty[];
  center: { lat: number; lng: number };
  zoom?: number; className?: string; mapTitle?: string; mapSubtitle?: string; nearby?: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(nearby ? null : properties[0]?.id ?? null);
  const [focus, setFocus] = useState(center);
  const [focusZoom, setFocusZoom] = useState(zoom);
  const active = properties.find((property) => property.id === selected);
  const society = useMemo(() => active ? findSocietyMap(active.locationArea, active.citySlug) : null, [active]);
  const pins = useMemo(() => properties.map((property) => ({
    id: property.id, lat: property.lat, lng: property.lng, title: property.title,
    subtitle: `${formatArea(property.areaValue, property.areaUnit)} ${property.propertyType} · ${property.locationArea}, ${property.cityName}`,
    href: `/property/${property.slug}`, price: formatPriceShort(property.price, property.priceUnit), active: property.id === selected,
  })), [properties, selected]);

  return (
    <div className={`grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] ${className}`} data-testid={nearby ? "nearby-property-map" : "property-market-map"}>
      <div className="min-w-0">
        <LeafletMap
          center={focus}
          zoom={focusZoom}
          heightClass="h-[380px] sm:h-[500px]"
          pins={pins}
          fitToPins={nearby}
          society={society}
          header={{ label: nearby ? "Nearby properties" : undefined, subtitle: mapSubtitle ?? active?.locationArea, title: mapTitle }}
          onPinSelect={(id) => setSelected(Number(id))}
        />
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
      <div className="min-w-0 rounded-panel border border-soft bg-white p-2 shadow-soft">
        <div className="flex items-center justify-between gap-2 px-3 py-3">
          <p className="flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-navy-900">
            <IconMap className="h-4 w-4 shrink-0 text-forest-600" />
            {properties.length} {nearby ? "nearby listings" : "Demo Properties Mapped"}
          </p>
          {selected !== null && <button type="button" aria-label="Clear map selection" onClick={() => setSelected(null)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-mist"><IconClose className="h-4 w-4" /></button>}
        </div>
        <ul className="max-h-[480px] space-y-2 overflow-y-auto">
          {properties.map((property) => (
            <li key={property.id} className={`min-w-0 rounded-lg border p-2.5 ${property.id === selected ? "border-forest-600/40 bg-forest-50/60" : "border-soft/70"}`}>
              <div className="flex min-w-0 items-start gap-3">
                <img src={property.coverImage} alt="" width={140} height={110} loading="lazy" className="h-16 w-20 shrink-0 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <Link href={`/property/${property.slug}`} className="block text-[0.8125rem] font-semibold leading-5 text-navy-900 hover:text-forest-700">{property.title}</Link>
                  <p className="mt-1 text-[0.75rem] leading-5 text-ink-muted">{property.locationArea}, {property.cityName}</p>
                  <p className="mt-1 font-sans text-[0.8125rem] font-bold text-navy-900">{formatPriceShort(property.price, property.priceUnit)}</p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-soft pt-2">
                <span className="text-[0.6875rem] text-ink-muted">{typeof property.distanceKm === "number" ? `${property.distanceKm < 0.1 ? "Under 100 m" : `${property.distanceKm.toFixed(1)} km`} away · approximate` : formatArea(property.areaValue, property.areaUnit)}</span>
                <button type="button" onClick={() => { setSelected(property.id); setFocus({ lat: property.lat, lng: property.lng }); setFocusZoom(16); }} className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[0.75rem] font-semibold text-forest-700 hover:bg-forest-50">
                  <IconPin className="h-3.5 w-3.5" /> Show on map
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
