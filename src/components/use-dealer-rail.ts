"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Native scrollLeft is shared by the slow automatic loop, touch, mouse and arrow controls. */
export function useDealerRail(durationSeconds: number) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const beltRef = useRef<HTMLDivElement>(null);
  const reasons = useRef(new Set<string>());
  const pauseUntil = useRef(0);
  const [held, setHeld] = useState(false);
  const hold = useCallback((reason: string) => { reasons.current.add(reason); setHeld(true); }, []);
  const release = useCallback((reason: string) => { reasons.current.delete(reason); setHeld(reasons.current.size > 0); }, []);
  const interrupt = useCallback(() => { pauseUntil.current = performance.now() + 6000; }, []);

  useEffect(() => {
    const viewport = viewportRef.current, belt = beltRef.current;
    if (!viewport || !belt) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let half = 0, visible = false, frame = 0, last = 0;
    let position = viewport.scrollLeft, written = position;
    const measure = () => { half = belt.scrollWidth / 2; };
    const resize = new ResizeObserver(measure);
    resize.observe(viewport); resize.observe(belt); measure();
    function tick(now: number) {
      frame = 0;
      if (!visible || motion.matches || document.hidden || !viewport) return;
      const delta = Math.min(32, last ? now - last : 16); last = now;
      if (reasons.current.size || now < pauseUntil.current || Math.abs(viewport.scrollLeft - written) > 2) {
        position = viewport.scrollLeft; written = position;
      } else if (half > viewport.clientWidth) {
        const speed = Math.max(18, Math.min(36, half / durationSeconds));
        position += speed * delta / 1000;
        if (position >= half) position %= half;
        viewport.scrollLeft = position;
        written = viewport.scrollLeft;
      }
      frame = requestAnimationFrame(tick);
    }
    function restart() {
      cancelAnimationFrame(frame); frame = 0; last = 0;
      if (visible && !motion.matches && !document.hidden) frame = requestAnimationFrame(tick);
    }
    const observer = new IntersectionObserver((entries) => { visible = entries.some((entry) => entry.isIntersecting); restart(); });
    observer.observe(viewport);
    motion.addEventListener("change", restart);
    document.addEventListener("visibilitychange", restart);
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect();
      motion.removeEventListener("change", restart); document.removeEventListener("visibilitychange", restart);
    };
  }, [durationSeconds]);

  const move = useCallback((direction: -1 | 1) => {
    const viewport = viewportRef.current, belt = beltRef.current;
    if (!viewport || !belt) return;
    interrupt();
    const half = belt.scrollWidth / 2;
    if (direction < 0 && viewport.scrollLeft < 2 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) viewport.scrollLeft = half;
    viewport.scrollBy({ left: direction * Math.max(266, viewport.clientWidth * .78), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [interrupt]);
  return { viewportRef, beltRef, held, hold, release, interrupt, move };
}
