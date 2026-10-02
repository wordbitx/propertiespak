"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconArrowRight, IconClose } from "@/components/icons";
import { useRecentProperties } from "@/lib/recent-properties";
import type { PropertyWithDealer } from "@/lib/queries";

const RECENT_ACTIVITY_INTERVAL = 5200;

function RecentActivityRail({ properties }: { properties: PropertyWithDealer[] }) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const pauseUntilRef = useRef(0);
  const interactionRef = useRef({ hovered: false, focused: false });

  function move(direction: -1 | 1) {
    const viewport = viewportRef.current;
    const firstItem = viewport?.querySelector<HTMLElement>(".recent-activity-item");
    if (!viewport || !firstItem) return;
    const track = viewport.querySelector<HTMLElement>(".recent-activity-track");
    const gap = track ? parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 10 : 10;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    viewport.scrollBy({ left: direction * (firstItem.getBoundingClientRect().width + gap), behavior: reducedMotion ? "instant" : "smooth" });
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let visible = false;
    const visibility = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
    }, { threshold: 0.15 });
    visibility.observe(viewport);

    const timer = window.setInterval(() => {
      const rail = viewportRef.current;
      const interaction = interactionRef.current;
      if (!rail || !visible || document.hidden || interaction.hovered || interaction.focused || Date.now() < pauseUntilRef.current) return;
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      if (maxScroll <= 2) return;
      if (rail.scrollLeft >= maxScroll - 2) {
        // Keep the newest viewed property as the start of every new cycle.
        rail.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }

      const cards = Array.from(rail.querySelectorAll<HTMLElement>(".recent-activity-item"));
      const viewportLeft = rail.getBoundingClientRect().left;
      let currentIndex = -1;
      cards.forEach((card, index) => {
        if (card.getBoundingClientRect().left <= viewportLeft + 2) currentIndex = index;
      });

      const next = cards[currentIndex + 1];
      if (!next) {
        // Begin again at the newest viewed property after reaching the end.
        rail.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }
      const nextLeft = rail.scrollLeft + next.getBoundingClientRect().left - viewportLeft;
      rail.scrollTo({ left: nextLeft, behavior: "smooth" });
    }, RECENT_ACTIVITY_INTERVAL);

    return () => {
      window.clearInterval(timer);
      visibility.disconnect();
    };
  }, [properties.length]);

  function pauseAfterInteraction() {
    pauseUntilRef.current = Date.now() + 6000;
  }

  return (
    <div className="recent-activity-strip"
      onMouseEnter={() => { interactionRef.current.hovered = true; }}
      onMouseLeave={() => { interactionRef.current.hovered = false; }}
      onFocusCapture={() => { interactionRef.current.focused = true; }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) interactionRef.current.focused = false;
      }}
      onPointerDown={pauseAfterInteraction}
      onWheel={pauseAfterInteraction}>
      <div ref={viewportRef} className="recent-activity-viewport" role="region" aria-label="Recent property activity" tabIndex={0}>
        <ul className="recent-activity-track">
          {properties.map((property) => (
            <li key={property.id} className="recent-activity-item">
              <article>
                <Link href={`/property/${property.slug}`} title={property.title} className="recent-activity-card">
                  <h3>{property.title}</h3>
                  <span>{property.locationArea}, {property.cityName}</span>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
      <div className="recent-activity-controls" role="group" aria-label="Scroll recent activity">
        <button type="button" aria-label="Previous recent activity" onClick={() => move(-1)}>
          <IconArrowRight className="h-4 w-4 rotate-180" />
        </button>
        <button type="button" aria-label="Next recent activity" onClick={() => move(1)}>
          <IconArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function RecentProperties() {
  const { ids, clear } = useRecentProperties();
  const key = ids.join(",");
  const [result, setResult] = useState<{ key: string; items: PropertyWithDealer[]; error: boolean }>({ key: "", items: [], error: false });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    void fetch(`/api/properties?ids=${key}`, { signal: controller.signal }).then(async (response) => {
      const data = await response.json() as { ok?: boolean; items?: PropertyWithDealer[] };
      if (!response.ok || !data.ok || !Array.isArray(data.items)) throw new Error("Unable to load recent properties");
      const byId = new Map(data.items.map((item) => [item.id, item]));
      const ordered = key.split(",").map((id) => byId.get(Number(id))).filter((item): item is PropertyWithDealer => !!item);
      if (!controller.signal.aborted) setResult({ key, items: ordered, error: false });
    }).catch(() => { if (!controller.signal.aborted) setResult({ key, items: [], error: true }); });
    return () => controller.abort();
  }, [key, attempt]);

  // A fresh visitor sees no empty section; a hidden/deleted listing never reappears here.
  if (!key || (result.key === key && !result.error && !result.items.length)) return null;
  const loading = result.key !== key;
  return (
    <section id="recent-properties" className="home-recent-properties bg-white" aria-labelledby="recent-heading">
      <div className="ui-container">
        <div className="home-section-topline">
          <div>
            <h2 id="recent-heading">Recent Activity</h2>
            <p className="recent-properties-caption">Recently viewed or found in your searches.</p>
          </div>
          {!loading && !result.error && result.items.length > 0 && (
            <button type="button" onClick={() => {
              clear();
              document.querySelector<HTMLElement>("#featured .property-rail-viewport")?.focus({ preventScroll: true });
            }} className="clear-recent"><IconClose className="h-3.5 w-3.5" />Clear Recent</button>
          )}
        </div>
        {loading ? <p className="recent-properties-status" role="status">Loading your recent activity…</p> : result.error ?
          <p className="recent-properties-status" role="status">Unable to load recent activity. <button type="button" onClick={() => setAttempt((current) => current + 1)}>Retry</button></p> :
          <RecentActivityRail key={key} properties={result.items} />}
      </div>
    </section>
  );
}
