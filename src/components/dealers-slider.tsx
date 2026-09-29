"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconArrowRight, IconPause, IconPlay, IconUser } from "@/components/icons";
import { BlueTick } from "@/components/verified-badge";
import type { DealerProfile } from "@/lib/queries";

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "PP";
}

/** One card every three seconds: calm enough to read, still visibly alive. */
const STEP_INTERVAL_MS = 3000;

/**
 * Dealer showcase. One card per account, advanced by a single card every three
 * seconds and looping back to the start. Pauses on hover, on keyboard focus and
 * when the visitor scrolls or drags the strip themselves so it never fights the
 * user; the labelled play/pause button makes that control explicit.
 *
 * Every card is the same fixed height, and the blue tick sits next to the name
 * exactly like it does on the dealer cards and profiles.
 */
export function DealersSlider({ dealers }: { dealers: DealerProfile[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  /** Visitor pressed the pause button — this survives hovering and scrolling. */
  const [userPaused, setUserPaused] = useState(false);
  /** Pointer, keyboard focus or touch sits on the strip right now. */
  const [interacting, setInteracting] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const paused = userPaused || interacting;

  const verifiedCount = dealers.filter((dealer) => dealer.isVerified).length;
  const listingCount = dealers.reduce((total, dealer) => total + (dealer.listings ?? 0), 0);

  const step = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const first = track.firstElementChild as HTMLElement | null;
    const cardWidth = first ? first.getBoundingClientRect().width + 16 : 200; // 16px gap
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 4) return;
    if (track.scrollLeft >= maxScroll - 4) {
      track.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    track.scrollBy({ left: cardWidth, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (paused || dealers.length < 3) return;
    const timer = window.setInterval(step, STEP_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, step, dealers.length]);

  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (track) setAtStart(track.scrollLeft < 8);
  }, []);

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

  return (
    <section className="overflow-hidden bg-mist py-16" aria-label="Dealers on Properties Pak">
      <div className="ui-container">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            {eyebrow}
            <h2 className="display-2 mt-4 text-navy-900">Dealers you can verify before you deal</h2>
            <p className="lede mt-4">
              Every account here completed a professional profile — agency details, service areas and credentials on the
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

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setUserPaused((value) => !value)}
              aria-pressed={userPaused}
              aria-label={userPaused ? "Play dealer rotation" : "Pause dealer rotation"}
              className="btn btn-outline"
            >
              {userPaused ? <IconPlay className="h-4 w-4" /> : <IconPause className="h-4 w-4" />}
              {userPaused ? "Play" : "Pause"}
            </button>
            <Link
              href="/dealers"
              className="inline-flex min-h-11 items-center gap-2 font-sans text-[0.875rem] font-semibold text-forest-700 hover:text-forest-600"
            >
              All dealers <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="relative mt-10">
        <ul
          ref={trackRef}
          onScroll={onScroll}
          onMouseEnter={() => setInteracting(true)}
          onMouseLeave={() => setInteracting(false)}
          onFocusCapture={() => setInteracting(true)}
          onBlurCapture={() => setInteracting(false)}
          onTouchStart={() => setInteracting(true)}
          className="dealer-slider-track flex gap-4 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-[max(1.5rem,calc((100vw-1180px)/2+1.5rem))]"
          aria-label="Dealer profiles"
        >
          {dealers.map((dealer) => {
            const href = dealer.slug ? `/dealers/${dealer.slug}` : "/dealers";
            const areas = dealer.areas
              ? dealer.areas.split(",").map((area) => area.trim()).filter(Boolean).slice(0, 2).join(" · ")
              : dealer.cityName || "Pakistan";
            return (
              <li key={dealer.id} className="shrink-0">
                <Link
                  href={href}
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
              </li>
            );
          })}
        </ul>

        {/* Edge fade hints that the strip keeps moving. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-mist to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-mist to-transparent" />
      </div>

      <div className="ui-container mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.75rem] text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <IconUser className="h-3.5 w-3.5" />
          {userPaused
            ? "Auto-rotation paused — press Play to resume."
            : interacting
              ? "Holding still while you read — move away to keep it rolling."
              : "Auto-rotating every 3 seconds."}
        </span>
        <span aria-hidden="true" className="text-soft">
          •
        </span>
        <span>{atStart ? "Starting from the first dealer." : "Newer profiles keep appearing as the row moves."}</span>
      </div>
    </section>
  );
}
