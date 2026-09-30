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
  /** Optional cover photo — renders the premium card popup header. */
  image?: string;
  active?: boolean;
};

type Props = {
  center: { lat: number; lng: number };
  zoom?: number;
  pins?: LeafletPin[];
  /** Fit a distinct nearby dataset once; selection never triggers another fit. */
  fitToPins?: boolean;
  /** Open the popup of whichever pin the parent marks active (list hover/click sync). */
  autoOpenActive?: boolean;
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

/** 1×1 transparent pixel — failed tiles vanish instead of showing broken art. */
const TRANSPARENT_TILE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

/** Premium card popup for listing pins (photo header, price, CTA). */
function pinPopupHtml(pin: LeafletPin): string {
  const image = pin.image ? `<img class="ewx-popup-img" src="${escapeText(pin.image)}" alt="" loading="lazy" />` : "";
  const price = pin.price ? `<span class="ewx-popup-price">${escapeText(pin.price)}</span>` : "";
  const cta = pin.href?.startsWith("/property/") ? `<a class="ewx-popup-cta" href="${escapeText(pin.href)}">View property →</a>` : "";
  return `<div class="ewx-popup${image ? " ewx-popup-card" : ""}">${image}<div class="ewx-popup-body">${price}<b>${escapeText(pin.title)}</b>${pin.subtitle ? `<span class="ewx-muted">${escapeText(pin.subtitle)}</span>` : ""}${cta}</div></div>`;
}

/** Body of the draggable picker pin popup — rebuilt on every label change. */
function pickerPopupHtml(label: string, subtitle?: string): string {
  return `<div class="ewx-popup"><b>${escapeText(label)}</b>${subtitle ? `<br/><span>${escapeText(subtitle)}</span>` : ""}<br/><span class="ewx-muted">Drag the pin or tap the map to adjust</span></div>`;
}

export function LeafletMap({
  center,
  zoom = 14,
  pins = [],
  fitToPins = false,
  autoOpenActive = false,
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
  const tileHealthRef = useRef({ loaded: 0, failed: 0, reported: false });
  const lastActiveRef = useRef<string | number | null | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  // Society layout renders like dhaplus.com by default — blended over the
  // satellite base — and can be switched off from the "Layout" pill. The
  // fault-tolerance guard swaps it off automatically if the tile source fails.
  const [layoutOn, setLayoutOn] = useState(true);
  const [opacity, setOpacity] = useState(0.65);
  const [layoutMsg, setLayoutMsg] = useState("");
  const [locating, setLocating] = useState(false);
  const [locateMsg, setLocateMsg] = useState("");
  const [baseName, setBaseName] = useState("Google Maps Satellite View");
  const autoLocated = useRef(false);
  const lastFit = useRef("");

  /**
   * Leaflet handlers live for the lifetime of the map, while the parent passes
   * fresh callbacks on every render. Keeping the latest ones in refs (synced in
   * an effect) avoids re-creating the map and keeps the handlers current.
   */
  const onPickRef = useRef(onPick);
  const onLocateRef = useRef(onLocate);
  const onPinSelectRef = useRef(onPinSelect);
  useEffect(() => {
    onPickRef.current = onPick;
    onLocateRef.current = onLocate;
    onPinSelectRef.current = onPinSelect;
  }, [onPick, onLocate, onPinSelect]);

  /* ---------- create map ---------- */
  useEffect(() => {
    let cancelled = false;
    let cleanupInteractions = () => {};
    (async () => {
      const Lmod = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = Lmod;

      const attr = { attribution: "", maxZoom: 20, minZoom: 5, errorTileUrl: TRANSPARENT_TILE } as L.TileLayerOptions;
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
        // In picker mode the map tap moves the pin, so the pin's popup must stay open.
        closePopupOnClick: !onPick,
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

  /* ---------- society overlays (opt-in, fault-tolerant) ---------- */
  useEffect(() => {
    const Lmod = leafletRef.current, group = overlayGroupRef.current;
    if (!Lmod || !group || !ready) return;
    overlayTilesRef.current.forEach((t) => group.removeLayer(t));
    overlayTilesRef.current = [];
    tileHealthRef.current = { loaded: 0, failed: 0, reported: false };
    setLayoutMsg("");
    if (!society || !layoutOn) return;
    for (const layer of society.layers) {
      const tile = Lmod.tileLayer(layer.tiles, {
        minZoom: Math.min(layer.minZoom, 12),
        maxZoom: 20,
        maxNativeZoom: layer.maxZoom,
        opacity,
        tms: false,
        bounds: Lmod.latLngBounds(normaliseBounds(layer.bounds)),
        attribution: "",
        errorTileUrl: TRANSPARENT_TILE,
      });
      // If the layout source is down (every tile failing), switch the layer off
      // once and say so — instead of leaving broken tiles on the map.
      tile.on("tileload", () => { tileHealthRef.current.loaded += 1; });
      tile.on("tileerror", () => {
        const health = tileHealthRef.current;
        health.failed += 1;
        if (!health.reported && health.failed >= 6 && health.loaded === 0) {
          health.reported = true;
          setLayoutOn(false);
          setLayoutMsg("Society layout is unavailable right now — showing the base map only.");
        }
      });
      tile.addTo(group);
      overlayTilesRef.current.push(tile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [society, layoutOn, ready]);

  useEffect(() => {
    overlayTilesRef.current.forEach((t) => t.setOpacity(opacity));
  }, [opacity]);

  /* ---------- listing pins ---------- */
  useEffect(() => {
    const Lmod = leafletRef.current, layer = pinLayerRef.current;
    if (!Lmod || !layer || !ready) return;
    layer.clearLayers();
    let activeMarker: L.Marker | null = null;
    let activeId: string | number | null = null;
    for (const pin of pins) {
      const icon = Lmod.divIcon({
        className: "ewx-pin",
        html: `<div class="ewx-pin-wrap${pin.active ? " is-active" : ""}">${pin.price ? `<div class="ewx-pin-price">${escapeText(pin.price)}</div>` : ""}${pinSvg(pin.active ? "#10a456" : "#06274a")}</div>`,
        iconSize: [30, 41],
        iconAnchor: [15, 41],
        popupAnchor: [0, -38],
      });
      const m = Lmod.marker([pin.lat, pin.lng], { icon, title: pin.title, riseOnHover: true }).addTo(layer);
      m.bindPopup(pinPopupHtml(pin), { closeButton: true, autoPan: true, maxWidth: 264, minWidth: 216 });
      m.on("click", () => onPinSelectRef.current?.(pin.id));
      // Hovering a pin reveals its card; leaving hides it again — unless the
      // pin is the one selected from the side list / a click, which stays open.
      m.on("mouseenter", () => m.openPopup());
      m.on("mouseout", () => {
        if (!pin.active && m.isPopupOpen()) m.closePopup();
      });
      if (pin.active) {
        activeMarker = m;
        activeId = pin.id;
      }
    }
    // Single-pin maps always label their pin. Multi-pin maps open the selected
    // pin's card only when the selection CHANGES (side-list hover, tap) — the
    // initial paint stays clean.
    if (lastActiveRef.current === undefined) lastActiveRef.current = activeId;
    if (activeMarker && (pins.length === 1 || (autoOpenActive && activeId !== null && activeId !== lastActiveRef.current))) {
      activeMarker.openPopup();
    }
    lastActiveRef.current = activeId;
    const dataKey = pins.map((pin) => `${pin.id}:${pin.lat}:${pin.lng}`).join("|");
    if (fitToPins && pins.length && lastFit.current !== dataKey && mapRef.current) {
      lastFit.current = dataKey;
      const bounds = Lmod.latLngBounds(pins.map((pin) => [pin.lat, pin.lng] as [number, number]));
      mapRef.current.fitBounds(bounds.pad(0.15), { padding: [40, 40], maxZoom: 15, animate: false });
    }
  }, [pins, ready, fitToPins, autoOpenActive]);

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
      /*
       * Bind the popup exactly once. Calling `bindPopup(html, options)` again
       * makes Leaflet build a NEW popup object and leaves the previously opened
       * one on the map as an orphan layer — which is how a run of map taps ended
       * up stacking a row of stale labelled popups across the map.
       */
      pickerRef.current.bindPopup(pickerPopupHtml(pickerLabel ?? "Property location", pickerSubtitle), {
        closeButton: false,
        autoClose: false,
        closeOnClick: false,
        autoPan: false,
      });
    } else {
      const cur = pickerRef.current.getLatLng();
      if (Math.abs(cur.lat - pickerPosition.lat) > 1e-9 || Math.abs(cur.lng - pickerPosition.lng) > 1e-9) pickerRef.current.setLatLng([pickerPosition.lat, pickerPosition.lng]);
    }
    pickerRef.current.setPopupContent(pickerPopupHtml(pickerLabel ?? "Property location", pickerSubtitle));
    // Safety net: drop any popup that is not the pin's own, so a single pin can
    // never show more than one label (picker maps host no other popups).
    const own = pickerRef.current.getPopup();
    const orphans: L.Popup[] = [];
    map.eachLayer((layer) => {
      if (layer instanceof Lmod.Popup && layer !== own) orphans.push(layer);
    });
    for (const orphan of orphans) map.removeLayer(orphan);
    if (!pickerRef.current.isPopupOpen()) pickerRef.current.openPopup();
  }, [pickerPosition?.lat, pickerPosition?.lng, ready]);

  /* ---------- keep the pin popup text in step with the resolved area name ---------- */
  useEffect(() => {
    const marker = pickerRef.current;
    if (!marker || !ready) return;
    marker.setPopupContent(pickerPopupHtml(pickerLabel ?? "Property location", pickerSubtitle));
    if (!marker.isPopupOpen()) marker.openPopup();
  }, [pickerLabel, pickerSubtitle, ready]);

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
        setLocateMsg(
          err.code === 1
            ? "Location is blocked for this site — allow location in your browser (or open the site in a new tab), then tap the crosshair again."
            : "Could not get your location. Check GPS and try again.",
        );
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
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 px-4 py-3.5 sm:px-5">
          <p className="flex min-w-0 items-center gap-2.5 font-sans text-[0.9375rem] font-semibold text-white">
            <span className="shrink-0">{header.label ?? "Property map"}</span>
            {header.subtitle && <span className="truncate rounded-md bg-forest-800/80 px-2.5 py-1 text-[0.75rem] font-bold text-white ring-1 ring-white/15">{header.subtitle}</span>}
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
        <div className="absolute right-3 top-3 z-[500] flex flex-col items-end gap-2">
          {showLocate && <button type="button" onClick={() => locate(false)} disabled={locating} aria-label="Use my current location" title="My location" className={`${ctl} disabled:opacity-60`}>
            <svg viewBox="0 0 24 24" className={`h-5 w-5 ${locating ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
          </button>}
          <button type="button" onClick={() => setFullscreen((v) => !v)} aria-label={fullscreen ? "Exit full screen" : "Full screen map"} title="Full screen" className={ctl}>
            <svg viewBox="0 0 24 24" className="h-[1.1rem] w-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{fullscreen ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}</svg>
          </button>
          {society && society.layers.length > 0 && (
            <button
              type="button"
              role="switch"
              aria-checked={layoutOn}
              onClick={() => { setLayoutMsg(""); setLayoutOn((v) => !v); }}
              title={layoutOn ? "Hide society layout" : "Show society layout"}
              className="flex h-9 items-center gap-2 rounded-md border border-[#cfd8e3] bg-white px-2.5 text-navy-900 shadow-[0_1px_5px_rgba(0,0,0,.3)] transition-colors hover:bg-mist"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" /></svg>
              <span className="text-[0.6875rem] font-bold uppercase tracking-[0.08em]">Layout</span>
              <span className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${layoutOn ? "bg-forest-600" : "bg-soft"}`} aria-hidden="true">
                <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${layoutOn ? "left-3.5" : "left-0.5"}`} />
              </span>
            </button>
          )}
          {society && layoutOn && (
            <div className="flex items-center gap-2 rounded-md border border-[#cfd8e3] bg-white/95 px-2.5 py-1.5 shadow-[0_1px_5px_rgba(0,0,0,.3)]" title="Society layout opacity">
              <input type="range" min={0} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} aria-label="Society layout opacity" className="h-1.5 w-24 cursor-pointer accent-[#10a456] sm:w-28" />
              <span className="w-8 text-right text-[0.625rem] font-bold tabular-nums text-ink-muted">{Math.round(opacity * 100)}%</span>
            </div>
          )}
        </div>

        {locateMsg && (
          <div className="absolute inset-x-3 bottom-8 z-[500] rounded-md border border-[#cfd8e3] bg-white/95 px-3 py-2 text-[0.75rem] text-navy-900 shadow-soft sm:left-auto sm:right-3 sm:max-w-xs" role="status">
            <div className="flex items-start justify-between gap-2"><span>{locateMsg}</span><button type="button" onClick={() => setLocateMsg("")} aria-label="Dismiss" className="shrink-0 text-ink-muted">✕</button></div>
          </div>
        )}

        {layoutMsg && (
          <div className="absolute inset-x-3 bottom-20 z-[500] rounded-md border border-[#cfd8e3] bg-white/95 px-3 py-2 text-[0.75rem] text-navy-900 shadow-soft sm:left-auto sm:right-3 sm:max-w-xs" role="status">
            <div className="flex items-start justify-between gap-2"><span>{layoutMsg}</span><button type="button" onClick={() => setLayoutMsg("")} aria-label="Dismiss" className="shrink-0 text-ink-muted">✕</button></div>
          </div>
        )}

        {!ready && <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[#e5e3df] text-[0.8125rem] text-ink-muted">Loading map…</div>}
      </div>
    </div>
  );
}
