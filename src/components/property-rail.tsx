"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconArrowRight } from "@/components/icons";
import { PropertyCard } from "@/components/property-card";
import type { Property } from "@/db/schema";
import type { PropertyWithDealer } from "@/lib/queries";

type RailProperty = Property | PropertyWithDealer;
const PAGE_SIZE = 8;

/** Native horizontal scrolling: no timer, animation loop or automatic advancement. */
export function PropertyRail({ initialProperties, initialTotal, query, label }: {
  initialProperties: RailProperty[]; initialTotal: number; query?: string; label: string;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLLIElement | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const pageRef = useRef(1);
  const busyRef = useRef(false);
  const [items, setItems] = useState(initialProperties);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [position, setPosition] = useState({ left: 0, width: 0, full: 0 });

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    if (viewport) setPosition({ left: viewport.scrollLeft, width: viewport.clientWidth, full: viewport.scrollWidth });
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
      params.set("pageSize", String(PAGE_SIZE));
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
  }, [items.length, total, query]);

  useEffect(() => () => requestRef.current?.abort(), []);
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
    <div className="property-rail" data-testid="property-rail" data-rail-label={label}>
      <div className="property-rail-toolbar">
        <p>{total.toLocaleString("en-PK")} {total === 1 ? "property" : "properties"}<span> · Swipe or use the arrows</span></p>
        <div className="property-rail-controls">
          <button type="button" aria-label={`Previous ${label.toLowerCase()}`} disabled={position.left < 2} onClick={() => void advance(-1)}><IconArrowRight className="h-4 w-4 rotate-180" /></button>
          <button type="button" aria-label={`Next ${label.toLowerCase()}`} disabled={position.width > 0 && position.left + position.width >= position.full - 2 && items.length >= total} onClick={() => void advance(1)}><IconArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div ref={viewportRef} className="property-rail-viewport" role="region" aria-label={label} tabIndex={0} onScroll={measure}>
        <ul className="property-rail-track">
          {items.map((property) => <li key={property.id} className="property-rail-item"><PropertyCard property={property} compact /></li>)}
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
