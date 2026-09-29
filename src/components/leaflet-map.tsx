"use client";

import { useEffect, useRef, useState } from "react";
import type L from "leaflet";
import type { SocietyMapDef } from "@/lib/society-maps";

export type LeafletPin = {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  href?: string;
  price?: string;
  active?: boolean;
};

type Props = {
  center: { lat: number; lng: number };
  zoom?: number;
  pins?: LeafletPin[];
  /** Fit a distinct nearby dataset once; selection never triggers another fit. */
  fitToPins?: boolean;
  showLocate?: boolean;
  society?: SocietyMapDef | null;
  /** Called when the user taps/clicks the map (picker mode). */
  onPick?: (lat: number, lng: number) => void;
  /** Called after a GPS fix. */
  onLocate?: (lat: number, lng: number, accuracy: number) => void;
  /** Ask for GPS automatically on mount (picker mode). */
  autoLocate?: boolean;
  /** Draggable single picker marker at `pickerPosition`. */
  pickerPosition?: { lat: number; lng: number } | null;
  pickerLabel?: string;
  pickerSubtitle?: string;
  heightClass?: string;
  className?: string;
  onPinSelect?: (id: string | number) => void;
  /** Show the collapsible "Society Map" header bar (DHA Plus style). */
  header?: { label?: string; subtitle?: string; title?: string } | null;
};

/** Normalise DHA Plus bounds which are sometimes [N,E,S,W] and sometimes [S,W,N,E]. */
function normaliseBounds([a, b, c, d]: [number, number, number, number]): [[number, number], [number, number]] {
  const south = Math.min(a, c), north = Math.max(a, c), west = Math.min(b, d), east = Math.max(b, d);
  return [[south, west], [north, east]];
}

function escapeText(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

function pinSvg(color: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="41" viewBox="0 0 30 41"><path d="M15 0C6.7 0 0 6.7 0 15c0 10.6 15 26 15 26s15-15.4 15-26C30 6.7 23.3 0 15 0z" fill="${color}"/><circle cx="15" cy="15" r="6" fill="#fff"/></svg>`;
}

export function LeafletMap({
  center,
  zoom = 14,
  pins = [],
  fitToPins = false,
  showLocate = true,
  society = null,
  onPick,
  onLocate,
  autoLocate = false,
  pickerPosition = null,
  pickerLabel,
  pickerSubtitle,
  heightClass = "h-[420px] sm:h-[500px] lg:h-[560px]",
  className = "",
  onPinSelect,
  header = null,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const leafletRef = useRef<typeof L | null>(null);
  const pinLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerRef = useRef<L.Marker | null>(null);
  const gpsRef = useRef<{ marker: L.CircleMarker; circle: L.Circle } | null>(null);
  const overlayGroupRef = useRef<L.LayerGroup | null>(null);
  const overlayTilesRef = useRef<L.TileLayer[]>([]);
  const controlRef = useRef<L.Control.Layers | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [locating, setLocating] = useState(false);
  const [locateMsg, setLocateMsg] = useState("");
  const [baseName, setBaseName] = useState("Google Maps Satellite View");
  const autoLocated = useRef(false);
  const lastFit = useRef("");

  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const onLocateRef = useRef(onLocate);
  onLocateRef.current = onLocate;
  const onPinSelectRef = useRef(onPinSelect);
  onPinSelectRef.current = onPinSelect;

  /* ---------- create map ---------- */
  useEffect(() => {
    let cancelled = false;
    let cleanupInteractions = () => {};
    (async () => {
      const Lmod = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = Lmod;

      const attr = { attribution: "", maxZoom: 20, minZoom: 5 } as L.TileLayerOptions;
      const osm = Lmod.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { ...attr, subdomains: ["a", "b", "c"] });
      const gmap = Lmod.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en", { ...attr, subdomains: ["mt0", "mt1", "mt2", "mt3"] });
      const gsat = Lmod.tileLayer("https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}&hl=en", { ...attr, subdomains: ["mt0", "mt1", "mt2", "mt3"] });

      const map = Lmod.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom,
        minZoom: 5,
        maxZoom: 20,
        layers: [gsat],
        zoomControl: true,
        scrollWheelZoom: false, // Handled smoothly via custom requestAnimationFrame wheel listener
        zoomSnap: 0,            // Full fractional continuous zoom without discrete jumping
        zoomDelta: 1,
        touchZoom: true,
        doubleClickZoom: false, // Handled with smooth setZoomAround
        inertia: true,
        inertiaDeceleration: 3000,
        inertiaMaxSpeed: 2500,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
        attributionControl: true,
      });
      map.attributionControl.setPrefix("");
      map.attributionControl.addAttribution("Imagery © Google · Society layouts © ioi Technologies / DHA Plus");
      Lmod.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);

      /* ---------- smooth continuous wheel zoom ---------- */
      const mapElem = containerRef.current;
      let targetZoom = map.getZoom();
      let animId: number | null = null;
      let mousePoint: L.Point | null = null;
      let isZooming = false;

      const onWheel = (e: WheelEvent) => {
        if ((e.target as Element)?.closest?.(".leaflet-control")) return;
        e.preventDefault();
        const rect = mapElem.getBoundingClientRect();
        mousePoint = Lmod.point(e.clientX - rect.left, e.clientY - rect.top);

        const delta = -e.deltaY * (e.deltaMode === 1 ? 24 : e.deltaMode === 2 ? 350 : 1);
        const factor = e.ctrlKey ? 0.007 : 0.0022;
        const zoomStep = delta * factor;

        targetZoom = Math.min(20, Math.max(5, (isZooming ? targetZoom : map.getZoom()) + zoomStep));

        if (!isZooming) {
          isZooming = true;
          const render = () => {
            const curZ = map.getZoom();
            const diff = targetZoom - curZ;
            if (Math.abs(diff) > 0.005) {
              const nextZ = curZ + diff * 0.22;
              if (mousePoint) {
                map.setZoomAround(mousePoint, nextZ, { animate: false });
              }
              animId = requestAnimationFrame(render);
            } else {
              if (mousePoint) {
                map.setZoomAround(mousePoint, targetZoom, { animate: false });
              }
              isZooming = false;
              animId = null;
            }
          };
          animId = requestAnimationFrame(render);
        }
      };

      const onDblClick = (e: MouseEvent) => {
        e.preventDefault();
        const rect = mapElem.getBoundingClientRect();
        const pt = Lmod.point(e.clientX - rect.left, e.clientY - rect.top);
        map.setZoomAround(pt, Math.min(20, Math.round(map.getZoom()) + 1), { animate: true });
      };

      mapElem.addEventListener("wheel", onWheel, { passive: false });
      mapElem.addEventListener("dblclick", onDblClick);
      cleanupInteractions = () => {
        if (animId !== null) cancelAnimationFrame(animId);
        isZooming = false;
        mapElem.removeEventListener("wheel", onWheel);
        mapElem.removeEventListener("dblclick", onDblClick);
      };

      const overlayGroup = Lmod.layerGroup().addTo(map);
      overlayGroupRef.current = overlayGroup;

      const control = Lmod.control.layers(
        { "OpenStreetMap": osm, "Google Maps": gmap, "Google Maps Satellite View": gsat },
        {},
        { collapsed: true, position: "topleft" },
      ).addTo(map);
      controlRef.current = control;
      map.on("baselayerchange", (e) => setBaseName((e as L.LayersControlEvent).name));

      pinLayerRef.current = Lmod.layerGroup().addTo(map);

      map.on("click", (e: L.LeafletMouseEvent) => onPickRef.current?.(e.latlng.lat, e.latlng.lng));

      mapRef.current = map;
      setReady(true);
    })();

    return () => {
      cancelled = true;
      cleanupInteractions();
      mapRef.current?.remove();
      mapRef.current = null;
      pinLayerRef.current = null;
      pickerRef.current = null;
      lastFit.current = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- recenter when props change ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const cur = map.getCenter();
    if (Math.abs(cur.lat - center.lat) > 1e-7 || Math.abs(cur.lng - center.lng) > 1e-7 || Math.abs(map.getZoom() - zoom) > 0.01) {
      map.flyTo([center.lat, center.lng], zoom, { duration: 0.6 });
    }
  }, [center.lat, center.lng, zoom, ready]);

  /* ---------- society overlays ---------- */
  useEffect(() => {
    const Lmod = leafletRef.current, map = mapRef.current, group = overlayGroupRef.current, control = controlRef.current;
    if (!Lmod || !map || !group || !control || !ready) return;
    overlayTilesRef.current.forEach((t) => { control.removeLayer(t); group.removeLayer(t); });
    overlayTilesRef.current = [];
    if (!society) return;
    for (const layer of society.layers) {
      const tile = Lmod.tileLayer(layer.tiles, {
        minZoom: Math.min(layer.minZoom, 12),
        maxZoom: 20,
        maxNativeZoom: layer.maxZoom,
        opacity,
        tms: false,
        bounds: Lmod.latLngBounds(normaliseBounds(layer.bounds)),
        attribution: "",
      });
      tile.addTo(group);
      control.addOverlay(tile, `${society.name.replace(/ Map$/, "")} — ${layer.name}`);
      overlayTilesRef.current.push(tile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [society, ready]);

  useEffect(() => {
    overlayTilesRef.current.forEach((t) => t.setOpacity(opacity));
  }, [opacity]);

  /* ---------- listing pins ---------- */
  useEffect(() => {
    const Lmod = leafletRef.current, layer = pinLayerRef.current;
    if (!Lmod || !layer || !ready) return;
    layer.clearLayers();
    for (const pin of pins) {
      const icon = Lmod.divIcon({
        className: "ewx-pin",
        html: `<div class="ewx-pin-wrap${pin.active ? " is-active" : ""}">${pin.price ? `<div class="ewx-pin-price">${escapeText(pin.price)}</div>` : ""}${pinSvg(pin.active ? "#1f4fd8" : "#0d3b7d")}</div>`,
        iconSize: [30, 41],
        iconAnchor: [15, 41],
        popupAnchor: [0, -38],
      });
      const m = Lmod.marker([pin.lat, pin.lng], { icon, title: pin.title }).addTo(layer);
      const html = `<div class="ewx-popup"><b>${escapeText(pin.title)}</b>${pin.subtitle ? `<br/><span>${escapeText(pin.subtitle)}</span>` : ""}${pin.href?.startsWith("/property/") ? `<br/><a href="${escapeText(pin.href)}">View property →</a>` : ""}</div>`;
      m.bindPopup(html, { closeButton: true, autoPan: false, maxWidth: 260 });
      m.on("click", () => onPinSelectRef.current?.(pin.id));
      if (pin.active) m.openPopup();
    }
    const dataKey = pins.map((pin) => `${pin.id}:${pin.lat}:${pin.lng}`).join("|");
    if (fitToPins && pins.length && lastFit.current !== dataKey && mapRef.current) {
      lastFit.current = dataKey;
      const bounds = Lmod.latLngBounds(pins.map((pin) => [pin.lat, pin.lng] as [number, number]));
      mapRef.current.fitBounds(bounds.pad(0.15), { padding: [40, 40], maxZoom: 15, animate: false });
    }
  }, [pins, ready, fitToPins]);

  /* ---------- draggable picker marker ---------- */
  useEffect(() => {
    const Lmod = leafletRef.current, map = mapRef.current;
    if (!Lmod || !map || !ready) return;
    if (!pickerPosition) {
      pickerRef.current?.remove();
      pickerRef.current = null;
      return;
    }
    const icon = Lmod.divIcon({ className: "ewx-pin", html: `<div class="ewx-pin-wrap is-active">${pinSvg("#1f4fd8")}</div>`, iconSize: [30, 41], iconAnchor: [15, 41], popupAnchor: [0, -38] });
    if (!pickerRef.current) {
      pickerRef.current = Lmod.marker([pickerPosition.lat, pickerPosition.lng], { icon, draggable: true, autoPan: true }).addTo(map);
      pickerRef.current.on("dragend", () => {
        const p = pickerRef.current!.getLatLng();
        onPickRef.current?.(p.lat, p.lng);
      });
    } else {
      const cur = pickerRef.current.getLatLng();
      if (Math.abs(cur.lat - pickerPosition.lat) > 1e-9 || Math.abs(cur.lng - pickerPosition.lng) > 1e-9) pickerRef.current.setLatLng([pickerPosition.lat, pickerPosition.lng]);
    }
    const html = `<div class="ewx-popup"><b>${escapeText(pickerLabel ?? "Property location")}</b>${pickerSubtitle ? `<br/><span>${escapeText(pickerSubtitle)}</span>` : ""}<br/><span class="ewx-muted">Drag the pin or tap the map to adjust</span></div>`;
    pickerRef.current.bindPopup(html, { closeButton: false, autoClose: false, closeOnClick: false }).openPopup();
  }, [pickerPosition?.lat, pickerPosition?.lng, pickerLabel, pickerSubtitle, ready]);

  /* ---------- GPS ---------- */
  function locate(silent = false) {
    const Lmod = leafletRef.current, map = mapRef.current;
    if (!Lmod || !map) return;
    if (!navigator.geolocation) { if (!silent) setLocateMsg("Location not supported on this device."); return; }
    setLocating(true); setLocateMsg("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        gpsRef.current?.marker.remove(); gpsRef.current?.circle.remove();
        const circle = Lmod.circle([lat, lng], { radius: accuracy, color: "#1f4fd8", weight: 1, fillColor: "#1f4fd8", fillOpacity: 0.12 }).addTo(map);
        const marker = Lmod.circleMarker([lat, lng], { radius: 7, color: "#fff", weight: 3, fillColor: "#1f4fd8", fillOpacity: 1 }).addTo(map);
        gpsRef.current = { marker, circle };
        map.flyTo([lat, lng], Math.max(map.getZoom(), 17), { duration: 0.8 });
        setLocating(false);
        setLocateMsg(`Live location found (±${Math.round(accuracy)} m).`);
        onLocateRef.current?.(lat, lng, accuracy);
      },
      (err) => {
        setLocating(false);
        if (silent) return;
        setLocateMsg(err.code === 1 ? "Location permission denied — allow it in your browser and tap ⊕ again." : "Could not get your location. Check GPS and try again.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  }

  useEffect(() => {
    if (!autoLocate || !ready || autoLocated.current) return;
    autoLocated.current = true;
    const t = window.setTimeout(() => locate(true), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLocate, ready]);

  /* ---------- fullscreen + resize ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const t = window.setTimeout(() => map.invalidateSize(), 60);
    if (fullscreen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFullscreen(false);
      window.addEventListener("keydown", onKey);
      return () => { window.clearTimeout(t); document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
    }
    return () => window.clearTimeout(t);
  }, [fullscreen, open]);

  const ctl = "grid h-9 w-9 place-items-center rounded-md border border-[#cfd8e3] bg-white text-navy-900 shadow-[0_1px_5px_rgba(0,0,0,.3)] hover:bg-mist";
  const frame = fullscreen ? "fixed inset-0 z-[120] flex flex-col bg-white" : `relative isolate min-w-0 max-w-full overflow-hidden rounded-xl border border-soft bg-white shadow-soft ${className}`;

  return (
    <div className={frame} data-map-marker-count={pins.length} data-map-property-ids={pins.map((pin) => pin.id).join(",")}>
      {header && (
        <div className="flex items-center justify-between gap-3 bg-[#1f4fd8] px-4 py-3.5 sm:px-5">
          <p className="flex min-w-0 items-center gap-2.5 font-sans text-[0.9375rem] font-semibold text-white">
            <span className="shrink-0">{header.label ?? "Society Map"}</span>
            {header.subtitle && <span className="truncate rounded-md bg-[#173db0] px-2.5 py-1 text-[0.75rem] font-bold text-white">{header.subtitle}</span>}
            {header.title && header.title !== header.subtitle && <span className="hidden truncate font-normal text-white/70 2xl:inline">{header.title}</span>}
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-white/80 sm:inline">{baseName.replace("Google Maps ", "")}</span>
            <button type="button" onClick={() => (fullscreen ? setFullscreen(false) : setOpen((v) => !v))} aria-label={fullscreen ? "Exit full screen" : open ? "Collapse map" : "Expand map"} className="grid h-8 w-8 place-items-center rounded-md text-white hover:bg-white/15">
              {fullscreen ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9.5 6 6 6-6" /></svg>
              )}
            </button>
          </div>
        </div>
      )}

      <div className={`relative ${open || fullscreen ? "" : "hidden"} ${fullscreen ? "flex-1" : ""}`}>
        <div ref={containerRef} className={`w-full ${fullscreen ? "h-full" : heightClass} ${onPick ? "cursor-crosshair" : ""}`} />

        {/* Right-side custom controls */}
        <div className="absolute right-3 top-3 z-[500] flex flex-col gap-2">
          {showLocate && <button type="button" onClick={() => locate(false)} disabled={locating} aria-label="Use my current location" title="My location" className={`${ctl} disabled:opacity-60`}>
            <svg viewBox="0 0 24 24" className={`h-5 w-5 ${locating ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
          </button>}
          <button type="button" onClick={() => setFullscreen((v) => !v)} aria-label={fullscreen ? "Exit full screen" : "Full screen map"} title="Full screen" className={ctl}>
            <svg viewBox="0 0 24 24" className="h-[1.1rem] w-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{fullscreen ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}</svg>
          </button>
        </div>

        {/* Society layout opacity slider */}
        {society && society.layers.length > 0 && (
          <div className="absolute right-14 top-3 z-[500] flex items-center gap-2 rounded-md border border-[#cfd8e3] bg-white/95 px-2.5 py-1.5 shadow-[0_1px_5px_rgba(0,0,0,.3)]" title="Society layout opacity">
            <span className="hidden text-[0.625rem] font-bold uppercase tracking-[0.08em] text-ink-muted sm:inline">Layout</span>
            <input type="range" min={0} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} aria-label="Society layout opacity" className="h-1.5 w-24 cursor-pointer accent-[#1f4fd8] sm:w-32" />
          </div>
        )}

        {locateMsg && (
          <div className="absolute inset-x-3 bottom-8 z-[500] rounded-md border border-[#cfd8e3] bg-white/95 px-3 py-2 text-[0.75rem] text-navy-900 shadow-soft sm:left-auto sm:right-3 sm:max-w-xs" role="status">
            <div className="flex items-start justify-between gap-2"><span>{locateMsg}</span><button type="button" onClick={() => setLocateMsg("")} aria-label="Dismiss" className="shrink-0 text-ink-muted">✕</button></div>
          </div>
        )}

        {!ready && <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[#e5e3df] text-[0.8125rem] text-ink-muted">Loading map…</div>}
      </div>
    </div>
  );
}
