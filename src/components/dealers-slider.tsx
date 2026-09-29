"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconArrowRight } from "@/components/icons";
import { BlueTick } from "@/components/verified-badge";
import type { DealerProfile } from "@/lib/queries";

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "PP";
}

/**
 * One card leaves the left edge every ~5 seconds. The duration grows with the
 * number of cards, so the belt always travels at the same calm speed regardless
 * of how many profiles exist.
 */
const SECONDS_PER_CARD = 5;
const MIN_DURATION_SECONDS = 26;
/** Cards rendered per belt pass — a short list is repeated so the belt stays seamless. */
const MIN_GROUP_CARDS = 12;

/**
 * Dealer showcase.
 *
 * The belt is a true continuous loop: the row is duplicated once and the track
 * is translated by exactly −50%, so the last visible card slides off as the
 * first one comes back in. It never stops, never jumps back to the start and it
 * is clipped inside the page container — with a soft fade at each edge instead
 * of a scrollbar.
 *
 * Layout and motion never depend on the stylesheet alone: the critical
 * horizontal-flex layout is also applied inline and, if the CSS animation is
 * unavailable (for example a stale cached stylesheet in the visitor's browser),
 * the same loop is driven from JavaScript. Either way the row stays horizontal
 * and keeps moving — it never falls back to a stacked list.
 *
 * Visitors who prefer reduced motion get a still, manually scrollable row and
 * no duplicated content.
 */
export function DealersSlider({ dealers }: { dealers: DealerProfile[] }) {
  const [held, setHeld] = useState(false);
  const beltRef = useRef<HTMLDivElement>(null);

  const repeats = Math.max(1, Math.ceil(MIN_GROUP_CARDS / Math.max(1, dealers.length)));
  const belt = Array.from({ length: repeats }, () => dealers).flat();
  const duration = Math.max(MIN_DURATION_SECONDS, Math.round(dealers.length * SECONDS_PER_CARD));

  /**
   * Fallback loop. The stylesheet animates the belt; if that animation is not
   * available the belt would otherwise sit still, so the same −50% travel is
   * driven here with requestAnimationFrame. It steps aside the moment the CSS
   * animation exists, and never runs for reduced-motion visitors.
   */
  useEffect(() => {
    const track = beltRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (getComputedStyle(track).animationName !== "none") return;

    let frame = 0;
    let started = performance.now();
    const step = (now: number) => {
      const half = track.scrollWidth / 2;
      if (half > 0) {
        const elapsed = (now - started) / 1000;
        const travelled = (elapsed * half) / duration;
        track.style.transform = `translate3d(${-(travelled % half)}px, 0, 0)`;
      } else {
        started = now;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [duration]);

  const verifiedCount = dealers.filter((dealer) => dealer.isVerified).length;
  const listingCount = dealers.reduce((total, dealer) => total + (dealer.listings ?? 0), 0);

  const eyebrow = (
    <p className="eyebrow text-forest-700">
      <span className="h-px w-6 bg-current" /> Verified dealer network
    </p>
  );

  if (dealers.length === 0) {
    return (
      <section className="overflow-hidden bg-mist py-16" aria-label="Dealers on Properties Pak">
        <div className="ui-container">
          {eyebrow}
          <h2 className="display-2 mt-3.5 max-w-3xl text-navy-900">The dealers behind every listing</h2>
          <p className="lede mt-4 max-w-3xl">
            No dealer profiles yet. Create an account and complete your professional profile to stand here with a verified
            badge.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/list-property" className="btn btn-primary">
              List a property <IconArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login?mode=register" className="btn btn-outline">
              Create a dealer account
            </Link>
          </div>
        </div>
      </section>
    );
  }

  function renderCard(dealer: DealerProfile, clone: boolean) {
    const href = dealer.slug ? `/dealers/${dealer.slug}` : "/dealers";
    const areas = dealer.areas
      ? dealer.areas.split(",").map((area) => area.trim()).filter(Boolean).slice(0, 2).join(" · ")
      : dealer.cityName || "Pakistan";
    return (
      <Link
        href={href}
        // Clones exist only to make the belt seamless — never focusable, never announced.
        tabIndex={clone ? -1 : undefined}
        aria-hidden={clone ? "true" : undefined}
        className="group flex h-[272px] w-[176px] flex-col items-center rounded-panel border border-soft bg-white px-4 py-5 text-center shadow-soft transition-all hover:-translate-y-1 hover:border-navy-100 hover:shadow-card sm:w-[200px]"
      >
        <span className="grid h-[92px] w-[92px] shrink-0 place-items-center overflow-hidden rounded-full border border-soft bg-mist font-sans text-[1.5rem] font-bold text-navy-900">
          {dealer.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dealer.avatarUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : dealer.companyLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dealer.companyLogo} alt="" className="h-full w-full object-contain p-3" loading="lazy" />
          ) : (
            initialsFor(dealer.name)
          )}
        </span>

        {/* Blue tick sits next to the name, same as the dealer cards and profiles. */}
        <span className="mt-3.5 flex w-full min-w-0 items-center justify-center gap-1.5">
          <span className="truncate font-sans text-[0.9375rem] font-semibold text-navy-900 group-hover:text-forest-700">
            {dealer.name}
          </span>
          {dealer.isVerified && <BlueTick className="h-4 w-4 shrink-0" />}
        </span>
        <span className="mt-1 w-full truncate text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-forest-700">
          {dealer.agency || dealer.designation || "Property consultant"}
        </span>
        <span className="mt-1.5 line-clamp-2 min-h-10 text-[0.75rem] leading-5 text-ink-muted">{areas}</span>
        <span className="mt-auto inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-navy-800">
          <span className="h-1.5 w-1.5 rounded-full bg-forest-500" aria-hidden="true" />
          {dealer.listings > 0 ? `${dealer.listings} ${dealer.listings === 1 ? "listing" : "listings"}` : "Profile"}
          <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    );
  }

  function renderBelt(cards: DealerProfile[], hidden: boolean) {
    return (
      <ul
        className="dealer-belt-group"
        style={{ display: "flex" }}
        aria-hidden={hidden ? "true" : undefined}
        aria-label={hidden ? undefined : "Dealer profiles"}
      >
        {cards.map((dealer, index) => (
          <li key={`${hidden ? "clone" : "card"}-${dealer.id}-${index}`} className="shrink-0">
            {renderCard(dealer, hidden)}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="overflow-hidden bg-mist py-16" aria-label="Dealers on Properties Pak">
      <div className="ui-container">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            {eyebrow}
            <h2 className="display-2 mt-4 text-navy-900">Dealers you can verify before you deal</h2>
            <p className="lede mt-4">
              Every account below completed a professional profile — agency details, service areas and credentials on the
              record. Look for the blue tick before you commit.
            </p>
            <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.8125rem] text-ink-muted">
              <span className="inline-flex items-center gap-1.5 font-semibold text-navy-900">
                <BlueTick className="h-4 w-4" /> {verifiedCount} verified {verifiedCount === 1 ? "account" : "accounts"}
              </span>
              <span aria-hidden="true" className="text-soft">
                •
              </span>
              <span>{dealers.length} dealer profiles</span>
              <span aria-hidden="true" className="text-soft">
                •
              </span>
              <span>{listingCount} live listings</span>
            </p>
          </div>

          <Link
            href="/dealers"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 font-sans text-[0.875rem] font-semibold text-forest-700 hover:text-forest-600"
          >
            All dealers <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Clipped inside the page container — the belt fades out at both edges instead of scrolling the page. */}
      <div className="ui-container mt-10">
        <div className="dealer-belt-viewport" data-testid="dealers-marquee" style={{ overflow: "hidden" }}>
          <div
            ref={beltRef}
            className="dealer-belt"
            data-held={held ? "true" : undefined}
            // Layout is inline on purpose: the belt stays a single horizontal row
            // even if the stylesheet that carries the belt rules is unavailable.
            style={{ display: "flex", width: "max-content", animationDuration: `${duration}s` }}
            onFocusCapture={() => setHeld(true)}
            onBlurCapture={() => setHeld(false)}
          >
            {renderBelt(belt, false)}
            {renderBelt(belt, true)}
          </div>
        </div>
      </div>
    </section>
  );
}
