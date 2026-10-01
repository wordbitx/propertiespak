"use client";

import { ResilientImage } from "@/components/resilient-image";

import Link from "next/link";
import { useRef } from "react";
import { IconArrowRight } from "@/components/icons";
import { BlueTick } from "@/components/verified-badge";
import { siteImages } from "@/lib/site-images";
import { useDealerRail } from "@/components/use-dealer-rail";
import type { DealerProfile } from "@/lib/queries";

// Temporary architectural thumbnails, not invented photos of the named people.
// A real uploaded company logo/avatar always takes priority.
const AGENCY_IMAGES = [siteImages.commercialTower.webp[0].src, siteImages.commercialLobby.webp[0].src, siteImages.aboutVilla.webp[0].src, siteImages.smarterLiving.webp[0].src];
const SECONDS_PER_CARD = 3.5;
const MIN_GROUP_CARDS = 12;

export function DealersSlider({ dealers }: { dealers: DealerProfile[] }) {
  const repeats = Math.max(1, Math.ceil(MIN_GROUP_CARDS / Math.max(1, dealers.length)));
  const belt = Array.from({ length: repeats }, () => dealers).flat();
  const duration = Math.max(36, Math.round(belt.length * SECONDS_PER_CARD));
  const { viewportRef, beltRef, held, hold, release, interrupt, move } = useDealerRail(duration);
  const drag = useRef<{ pointer: number; x: number; left: number; moved: boolean } | null>(null);
  const dragged = useRef(false);

  function renderBelt(hidden: boolean) {
    return (
      <ul className="dealer-belt-group" style={{ display: "flex" }} aria-hidden={hidden ? "true" : undefined} aria-label={hidden ? undefined : "Dealer profiles"}>
        {belt.map((dealer, index) => {
          const clone = hidden || index >= dealers.length;
          return (
            <li key={`${hidden ? "clone" : "card"}-${dealer.id}-${index}`} className="shrink-0">
              <Link href={dealer.slug ? `/dealers/${dealer.slug}` : "/dealers"} tabIndex={clone ? -1 : undefined} aria-hidden={clone ? "true" : undefined}
                className="dealer-showcase-card group">
                <span className="dealer-showcase-avatar">
                  <ResilientImage src={dealer.companyLogo || dealer.avatarUrl || AGENCY_IMAGES[index % AGENCY_IMAGES.length]}
                    fallbackSrc={AGENCY_IMAGES[index % AGENCY_IMAGES.length]}
                    alt={dealer.companyLogo || dealer.avatarUrl ? "" : "Temporary agency image"}
                    title={dealer.companyLogo || dealer.avatarUrl ? undefined : "Temporary image — replace from your profile"}
                    data-agency-placeholder={!dealer.companyLogo && !dealer.avatarUrl ? "true" : undefined}
                    width={128} height={128} loading="lazy" draggable={false}
                    className={dealer.companyLogo ? "h-full w-full object-contain p-1.5" : "h-full w-full object-cover"} />
                </span>
                <span className="dealer-showcase-info">
                  <span className="dealer-showcase-name"><span>{dealer.agency || dealer.name}</span>{dealer.isVerified && <BlueTick className="h-3.5 w-3.5 shrink-0" />}</span>
                  <span className="dealer-showcase-person">{dealer.agency ? dealer.name : dealer.designation || "Property consultant"}</span>
                  <span className="dealer-showcase-city">{dealer.cityName || "Pakistan"}</span>
                  <span className="dealer-showcase-listings">{dealer.listings > 0 ? `${dealer.listings} ${dealer.listings === 1 ? "listing" : "listings"}` : "View profile"}<IconArrowRight className="h-3 w-3" /></span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <section id="home-dealers" className="home-dealers bg-mist" aria-label="Dealers on Properties Pak">
      <div className="ui-container" onFocusCapture={() => hold("focus")} onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) release("focus");
      }}>
        <div className="home-section-topline">
          <div>
            <h2>{"Dealers & Agencies"}</h2>
            <p className="dealer-scroll-hint">Swipe to explore every agency</p>
          </div>
          <div className="dealer-heading-actions">
            <Link href="/dealers">View all<IconArrowRight className="h-4 w-4" /></Link>
            {dealers.length > 0 && <div className="dealer-rail-controls">
              <button type="button" aria-label="Previous dealers and agencies" onClick={() => move(-1)}><IconArrowRight className="h-4 w-4 rotate-180" /></button>
              <button type="button" aria-label="Next dealers and agencies" onClick={() => move(1)}><IconArrowRight className="h-4 w-4" /></button>
            </div>}
          </div>
        </div>
        {dealers.length ? (
          <div ref={viewportRef} className="dealer-belt-viewport dealer-native-viewport" data-testid="dealers-marquee"
            role="region" aria-label="Dealers and agencies" tabIndex={0}
            onMouseEnter={() => hold("pointer")} onMouseLeave={() => release("pointer")}
            onWheel={interrupt}
            onDragStart={(event) => event.preventDefault()}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); }
            }}
            onPointerDown={(event) => {
              interrupt(); hold("gesture"); dragged.current = false;
              if (event.pointerType === "mouse") drag.current = { pointer: event.pointerId, x: event.clientX, left: event.currentTarget.scrollLeft, moved: false };
            }}
            onPointerMove={(event) => {
              const current = drag.current;
              if (!current || current.pointer !== event.pointerId) return;
              const delta = event.clientX - current.x;
              if (!current.moved && Math.abs(delta) < 6) return;
              current.moved = true; dragged.current = true;
              event.currentTarget.dataset.dragging = "true";
              if (!event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.setPointerCapture(event.pointerId);
              event.currentTarget.scrollLeft = current.left - delta;
            }}
            onPointerUp={(event) => {
              drag.current = null; delete event.currentTarget.dataset.dragging;
              interrupt(); release("gesture");
              if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            onPointerCancel={(event) => { drag.current = null; delete event.currentTarget.dataset.dragging; release("gesture"); interrupt(); }}
            onClickCapture={(event) => { if (dragged.current) { event.preventDefault(); event.stopPropagation(); dragged.current = false; } }}>
            <div ref={beltRef} className="dealer-belt" data-held={held ? "true" : undefined} style={{ display: "flex", width: "max-content" }}>
              {renderBelt(false)}{renderBelt(true)}
            </div>
          </div>
        ) : <p className="mt-3 text-sm text-ink-muted">No agency profiles yet. <Link href="/login?mode=register" className="font-semibold text-forest-700">Create a dealer account</Link>.</p>}
      </div>
    </section>
  );
}
