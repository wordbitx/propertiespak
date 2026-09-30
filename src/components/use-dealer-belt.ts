"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Shared logic for the homepage's continuous dealer belts (the verified-network
 * slider and the lower "Dealers & agencies" strip). CSS owns the animation
 * (translate −50% over the duplicated track); this hook adds:
 *  - hover / keyboard hold: the belt pauses under the visitor's pointer and
 *    resumes the moment the pointer moves away;
 *  - a requestAnimationFrame fallback that drives the same −50% travel when
 *    the stylesheet carrying the keyframes is unavailable (stale cache).
 * Visitors who prefer reduced motion never see the fallback — the belt stays
 * still and manually scrollable.
 */
export function useDealerBelt(durationSeconds: number) {
  const beltRef = useRef<HTMLDivElement>(null);
  const [held, setHeld] = useState(false);
  const heldRef = useRef(false);

  useEffect(() => {
    heldRef.current = held;
  }, [held]);

  useEffect(() => {
    const track = beltRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (getComputedStyle(track).animationName !== "none") return;

    let frame = 0;
    let baseMs = 0;
    let last = performance.now();
    const step = (now: number) => {
      const delta = now - last;
      last = now;
      if (!heldRef.current) baseMs += delta;
      const half = track.scrollWidth / 2;
      if (half > 0) {
        const travelled = ((baseMs / 1000) * half) / durationSeconds;
        track.style.transform = `translate3d(${-(travelled % half)}px, 0, 0)`;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [durationSeconds]);

  return {
    beltRef,
    held,
    /** Pointer entered the belt / a card received focus — pause the loop. */
    hold: () => setHeld(true),
    /** Pointer left the belt / focus moved on — continue the loop. */
    release: () => setHeld(false),
  };
}
