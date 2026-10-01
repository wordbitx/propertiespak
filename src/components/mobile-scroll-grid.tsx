"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { IconArrowRight } from "@/components/icons";

/** One native horizontal line on phones; the same cards keep their desktop grid. */
export function MobileScrollGrid({ children, label }: { children: ReactNode; label: string }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 0, full: 0, width: 0 });
  const measure = useCallback(() => {
    const element = viewportRef.current;
    if (element) setPosition({ left: element.scrollLeft, full: element.scrollWidth, width: element.clientWidth });
  }, []);
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [measure]);
  function move(direction: -1 | 1) {
    viewportRef.current?.scrollBy({ left: direction * 294, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return <div className="mobile-scroll-grid" data-testid="project-rail">
    <div className="mobile-scroll-toolbar"><span>Swipe to explore</span><div className="property-rail-controls">
      <button type="button" aria-label={`Previous ${label.toLowerCase()}`} disabled={position.left < 2} onClick={() => move(-1)}><IconArrowRight className="h-4 w-4 rotate-180" /></button>
      <button type="button" aria-label={`Next ${label.toLowerCase()}`} disabled={position.width > 0 && position.left + position.width >= position.full - 2} onClick={() => move(1)}><IconArrowRight className="h-4 w-4" /></button>
    </div></div>
    <div ref={viewportRef} role="region" aria-label={label} tabIndex={0} onScroll={measure} className="mobile-scroll-track">{children}</div>
  </div>;
}
