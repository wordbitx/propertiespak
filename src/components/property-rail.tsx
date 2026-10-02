"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconArrowRight } from "@/components/icons";
import { PropertyCard } from "@/components/property-card";
import type { Property } from "@/db/schema";
import type { PropertyWithDealer } from "@/lib/queries";

type RailProperty = Property | PropertyWithDealer;
const PAGE_SIZE = 8;

/**
 * How often the rail advances itself, in milliseconds. Two home rails autoplay
 * at once, so they are deliberately given different cadences (and opposite
 * directions) — identical timings read as one machine driving both, and the
 * pair looks mechanical rather than alive.
 */
export const RAIL_AUTO_PLAY_MS = 2800;
export const RAIL_AUTO_PLAY_MS_REVERSE = 3200;

/** Native horizontal scrolling with optional, user-friendly paused auto-advancement. */
export function PropertyRail({ initialProperties, initialTotal, query, label, autoPlay = false, autoPlayDirection = "forward", autoPlayInterval, pageSize = PAGE_SIZE, propertyTypeBelowPrice = false, size = "compact" }: {
  initialProperties: RailProperty[]; initialTotal: number; query?: string; label: string;
  autoPlay?: boolean;
  /** Which way the idle rail drifts. "backward" enters from the right edge. */
  autoPlayDirection?: "forward" | "backward";
  /** Override the cadence; defaults differ by direction so the two never match. */
  autoPlayInterval?: number;
  pageSize?: number; propertyTypeBelowPrice?: boolean; size?: "compact" | "roomy";
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLLIElement | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const interactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageRef = useRef(1);
  const busyRef = useRef(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [items, setItems] = useState(initialProperties);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [position, setPosition] = useState({ left: 0, width: 0, full: 0 });

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    if (viewport) setPosition({ left: viewport.scrollLeft, width: viewport.clientWidth, full: viewport.scrollWidth });
  }, []);

  const pauseForUser = useCallback(() => {
    setInteractionPaused(true);
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    interactionTimerRef.current = setTimeout(() => {
      interactionTimerRef.current = null;
      setInteractionPaused(false);
    }, 5000);
  }, []);

  const loadMore = useCallback(async () => {
    if (!query || busyRef.current || items.length >= total) return false;
    busyRef.current = true;
    setLoading(true); setError("");
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const params = new URLSearchParams(query);
      params.set("page", String(pageRef.current + 1));
      params.set("pageSize", String(pageSize));
      const response = await fetch(`/api/properties?${params}`, { signal: controller.signal });
      const payload = await response.json() as { ok?: boolean; items?: RailProperty[]; total?: number; error?: string };
      if (!response.ok || !payload.ok || !Array.isArray(payload.items)) throw new Error("Unable to load more properties.");
      pageRef.current += 1;
      const nextItems = payload.items;
      setItems((current) => [...new Map([...current, ...nextItems].map((property) => [property.id, property])).values()]);
      setTotal(nextItems.length ? payload.total ?? total : items.length);
      return nextItems.length > 0;
    } catch {
      if (!controller.signal.aborted) setError("Could not load more listings. Please try again.");
      return false;
    } finally {
      busyRef.current = false;
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [items.length, total, query, pageSize]);

  useEffect(() => () => {
    requestRef.current?.abort();
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
  }, []);
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const frame = requestAnimationFrame(measure);
    const resize = new ResizeObserver(measure);
    resize.observe(viewport);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); };
  }, [measure, items.length]);
  useEffect(() => {
    const viewport = viewportRef.current, end = endRef.current;
    if (!query || !viewport || !end || error || items.length >= total) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void loadMore();
    }, { root: viewport, rootMargin: "0px 200px", threshold: 0 });
    observer.observe(end);
    return () => observer.disconnect();
  }, [items.length, total, error, loadMore, query]);

  /**
   * A rail that drifts backwards has to open at the far end, otherwise its very
   * first move has nowhere to go. Applied once more listings arrive — the
   * scroll width is not final until the cards have been laid out — and then
   * never again, so the visitor's own scroll position is left alone.
   */
  const reversePrimedRef = useRef(false);
  useEffect(() => {
    if (autoPlayDirection !== "backward" || reversePrimedRef.current) return;
    const rail = viewportRef.current;
    if (!rail) return;
    const frame = requestAnimationFrame(() => {
      const max = rail.scrollWidth - rail.clientWidth;
      if (max <= 2) return; // Nothing to scroll yet; a later run will retry.
      rail.scrollLeft = max;
      reversePrimedRef.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [autoPlayDirection, items.length]);

  useEffect(() => {
    if (!autoPlay || !query || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    const backward = autoPlayDirection === "backward";
    let visible = false;
    const visibility = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
    }, { threshold: 0.15 });
    visibility.observe(viewport);

    const timer = window.setInterval(() => {
      const rail = viewportRef.current;
      if (!rail || !visible || document.hidden || hovered || focused || interactionPaused || error || busyRef.current) return;
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      if (maxScroll <= 2) return;
      const track = rail.querySelector<HTMLElement>(".property-rail-track");
      const card = rail.querySelector<HTMLElement>(".property-rail-item");
      const gap = track ? parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 14 : 14;
      const step = (card?.getBoundingClientRect().width ?? 280) + gap;

      if (backward) {
        // At the left edge there is nothing further to reveal, so wrap to the
        // right edge and carry on. Loading more is left to the sentinel, which
        // fires whenever the end of the list comes into view anyway.
        if (rail.scrollLeft <= 2) {
          rail.scrollTo({ left: maxScroll, behavior: "smooth" });
          return;
        }
        rail.scrollBy({ left: -step, behavior: "smooth" });
        return;
      }

      if (rail.scrollLeft >= maxScroll - 2) {
        if (items.length < total) void loadMore();
        else rail.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }
      rail.scrollBy({ left: step, behavior: "smooth" });
    }, autoPlayInterval ?? (autoPlayDirection === "backward" ? RAIL_AUTO_PLAY_MS_REVERSE : RAIL_AUTO_PLAY_MS));

    return () => {
      window.clearInterval(timer);
      visibility.disconnect();
    };
  }, [autoPlay, autoPlayDirection, autoPlayInterval, query, items.length, total, loadMore, hovered, focused, interactionPaused, error]);

  async function advance(direction: -1 | 1) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    if (direction === 1 && viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 2 && items.length < total) {
      await loadMore();
    }
    requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      viewport.scrollBy({ left: direction * Math.max(276, viewport.clientWidth * 0.86), behavior: reducedMotion ? "instant" : "smooth" });
    });
  }

  return (
    <div className={`property-rail${size === "roomy" ? " property-rail--roomy" : ""}`} data-testid="property-rail" data-rail-label={label} data-auto-play={autoPlay ? "true" : undefined} data-auto-play-direction={autoPlay ? autoPlayDirection : undefined}
      onMouseEnter={() => { if (autoPlay) setHovered(true); }}
      onMouseLeave={() => { if (autoPlay) setHovered(false); }}
      onFocusCapture={() => { if (autoPlay) setFocused(true); }}
      onBlurCapture={(event) => {
        if (autoPlay && !event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
      onPointerDown={() => { if (autoPlay) pauseForUser(); }}
      onWheel={() => { if (autoPlay) pauseForUser(); }}>
      <div className="property-rail-toolbar">
        <p>{total.toLocaleString("en-PK")} {total === 1 ? "property" : "properties"}<span> · {autoPlay ? "Auto-advances with pauses; swipe or use the arrows" : "Swipe or use the arrows"}</span></p>
        <div className="property-rail-controls">
          <button type="button" aria-label={`Previous ${label.toLowerCase()}`} disabled={position.left < 2} onClick={() => void advance(-1)}><IconArrowRight className="h-4 w-4 rotate-180" /></button>
          <button type="button" aria-label={`Next ${label.toLowerCase()}`} disabled={position.width > 0 && position.left + position.width >= position.full - 2 && items.length >= total} onClick={() => void advance(1)}><IconArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div ref={viewportRef} className="property-rail-viewport" role="region" aria-label={label} tabIndex={0} onScroll={measure}>
        <ul className="property-rail-track">
          {items.map((property) => <li key={property.id} className="property-rail-item" data-property-featured={property.featured ? "true" : "false"} data-property-verified={property.verified ? "true" : "false"}><PropertyCard property={property} compact={size === "compact"} propertyTypeBelowPrice={propertyTypeBelowPrice} /></li>)}
          <li ref={endRef} aria-hidden="true" className="property-rail-end" />
        </ul>
      </div>
      <div className="property-rail-status" role="status" aria-live="polite">
        {loading && "Loading more properties…"}
        {error && <><span>{error}</span><button type="button" onClick={() => void loadMore()}>Retry</button></>}
      </div>
    </div>
  );
}
