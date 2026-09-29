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

const STEP_INTERVAL_MS = 1000;

/**
 * Dealer showcase. One circular card per account, advanced by one card every
 * second and looping back to the start. Pauses on hover, on keyboard focus and
 * when the visitor scrolls or drags the strip themselves so it never fights the
 * user; the play/pause button makes that control explicit.
 */
export function DealersSlider({ dealers }: { dealers: DealerProfile[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);
  const [atStart, setAtStart] = useState(true);

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

  if (dealers.length === 0) {
    return (
      <section className="bg-mist py-14" aria-label="Dealers on Properties Pak">
        <div className="ui-container">
          <p className="eyebrow text-forest-700">Our dealers</p>
          <h2 className="display-2 mt-3.5 text-navy-900">Dealers who publish on Properties Pak</h2>
          <p className="lede mt-4 max-w-3xl">
            No dealer profiles yet. Create an account and complete your professional profile to appear here.
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
    <section className="overflow-hidden bg-mist py-14" aria-label="Dealers on Properties Pak">
      <div className="ui-container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow text-forest-700">Our dealers</p>
            <h2 className="display-2 mt-3.5 text-navy-900">Dealers who publish on Properties Pak</h2>
            <p className="lede mt-4 max-w-3xl">
              Accounts that completed their professional profile — agencies and independent consultants who list, verify and
              manage property across Pakistan.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-label={paused ? "Resume dealer rotation" : "Pause dealer rotation"}
              className="grid h-11 w-11 place-items-center rounded-full border border-soft bg-white text-navy-900 transition-colors hover:border-navy-800"
            >
              {paused ? <IconPlay className="h-4 w-4" /> : <IconPause className="h-4 w-4" />}
            </button>
            <Link href="/dealers" className="inline-flex min-h-11 items-center gap-2 font-sans text-[0.875rem] font-semibold text-forest-700 hover:text-forest-600">
              All dealers <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="relative mt-9">
        <ul
          ref={trackRef}
          onScroll={onScroll}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
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
                  className="group flex w-[168px] flex-col items-center rounded-panel border border-soft bg-white px-4 py-5 text-center shadow-soft transition-all hover:-translate-y-1 hover:border-navy-100 hover:shadow-card sm:w-[190px]"
                >
                  <span className="relative grid h-[92px] w-[92px] shrink-0 place-items-center overflow-hidden rounded-full border border-soft bg-mist font-sans text-[1.5rem] font-bold text-navy-900">
                    {dealer.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={dealer.avatarUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : dealer.companyLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={dealer.companyLogo} alt="" className="h-full w-full object-contain p-3" loading="lazy" />
                    ) : (
                      initialsFor(dealer.name)
                    )}
                    {dealer.isVerified && (
                      <span className="absolute bottom-1 right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-white">
                        <BlueTick className="h-5 w-5" />
                      </span>
                    )}
                  </span>
                  <span className="mt-3.5 line-clamp-1 font-sans text-[0.9375rem] font-semibold text-navy-900 group-hover:text-forest-700">
                    {dealer.name}
                  </span>
                  <span className="mt-1 line-clamp-1 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-forest-700">
                    {dealer.agency || dealer.designation || "Property consultant"}
                  </span>
                  <span className="mt-1.5 line-clamp-2 text-[0.75rem] leading-5 text-ink-muted">{areas}</span>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-navy-800">
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

      <div className="ui-container mt-4 flex items-center gap-3 text-[0.75rem] text-ink-muted">
        <IconUser className="h-3.5 w-3.5" />
        <span>
          {paused ? "Rotation paused — scroll the row yourself." : "Rotating every second."}{" "}
          {atStart ? "" : ""}
        </span>
      </div>
    </section>
  );
}
