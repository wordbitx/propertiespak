"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { MapProperty } from "@/components/map-view";

const MapView = dynamic(() => import("@/components/map-view").then((module) => module.MapView), { ssr: false });
const MEDIA = "(min-width: 768px)";
function subscribe(onChange: () => void) {
  const media = window.matchMedia(MEDIA);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** Hidden mobile maps must not initialise Leaflet in a zero-width container. */
export function ResponsiveHomeMap({ properties, center, zoom }: {
  properties: MapProperty[]; center: { lat: number; lng: number }; zoom: number;
}) {
  const desktop = useSyncExternalStore(subscribe, () => window.matchMedia(MEDIA).matches, () => false);
  const host = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!desktop || !host.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "200px" });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, [desktop]);
  return (
    <div ref={host}>
      {desktop && visible ? <MapView properties={properties} center={center} zoom={zoom} autoFit /> :
        <div className="home-map-placeholder" aria-hidden="true">Property map</div>}
    </div>
  );
}
