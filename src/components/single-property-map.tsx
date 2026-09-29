"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { IconArrowRight, IconPin } from "@/components/icons";
import type { MapProperty } from "@/components/map-view";
import { findSocietyMap } from "@/lib/society-maps";
import { formatArea } from "@/lib/format";

const LeafletMap = dynamic(() => import("@/components/leaflet-map").then((module) => module.LeafletMap), {
  ssr: false,
  loading: () => <div className="grid h-[360px] place-items-center rounded-xl border border-soft bg-soft text-sm text-ink-muted sm:h-[460px] lg:h-[540px]">Loading this property’s location…</div>,
});

/** Deliberately accepts ONE property. No nearby list or unrelated pins can enter this map. */
export function SinglePropertyMap({ property, address }: { property: MapProperty; address: string }) {
  const pins = useMemo(() => [{
    id: property.id,
    lat: property.lat,
    lng: property.lng,
    title: property.title,
    subtitle: `${formatArea(property.areaValue, property.areaUnit)} ${property.propertyType} · ${property.locationArea}, ${property.cityName}`,
    active: true,
  }], [property]);
  const society = useMemo(() => findSocietyMap(property.locationArea, property.citySlug), [property.locationArea, property.citySlug]);

  return (
    <div className="min-w-0" data-testid="single-property-map" data-property-id={property.id}>
      <LeafletMap
        center={{ lat: property.lat, lng: property.lng }}
        zoom={16}
        pins={pins}
        society={society}
        showLocate={false}
        heightClass="h-[360px] sm:h-[460px] lg:h-[540px]"
        header={{ label: "Property location", subtitle: property.locationArea }}
      />
      <div className="mt-3 flex min-w-0 flex-wrap items-start justify-between gap-3 rounded-lg border border-soft bg-white p-4">
        <p className="flex min-w-0 items-start gap-2 text-[0.8125rem] leading-6 text-ink-muted">
          <IconPin className="mt-1 h-4 w-4 shrink-0 text-forest-600" />
          <span>{address || `${property.locationArea}, ${property.cityName}`}<span className="mt-0.5 block text-[0.6875rem] tabular-nums">{property.lat.toFixed(5)}, {property.lng.toFixed(5)}</span></span>
        </p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 py-1 text-[0.8125rem] font-semibold text-forest-700 hover:text-navy-900"
        >
          Open directions <IconArrowRight className="h-4 w-4" />
        </a>
      </div>
      <p className="mt-3 text-[0.6875rem] leading-5 text-ink-muted">Only this listing’s saved pin is shown. Confirm the exact address with the listing person before travelling.</p>
    </div>
  );
}
