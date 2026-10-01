"use client";

import { useEffect, useRef } from "react";
import { consumeRecentSearch, recordRecentProperties } from "@/lib/recent-properties";

export function RecentPropertyTracker({ id, path }: { id: number; path: string }) {
  useEffect(() => { if (window.location.pathname === path) recordRecentProperties([id]); }, [id, path]);
  return null;
}

const CRITERIA = ["q", "city", "town", "category", "type", "minPrice", "maxPrice", "minArea", "maxArea", "beds", "baths", "paymentType", "verified", "withImages", "withVideos", "featured", "newProjects", "commercial", "furnishing", "possession"];

/** Only actual, visible search results: homepage suggestions and speculative prefetches don't create history. */
export function RecentSearchResultsTracker({ ids, path }: { ids: number[]; path: string }) {
  const seen = useRef("");
  const idsKey = ids.slice(0, 8).join(",");
  useEffect(() => {
    if (window.location.pathname !== path) return;
    const key = `${window.location.href}:${idsKey}`;
    if (seen.current === key) return;
    seen.current = key;
    const params = new URLSearchParams(window.location.search);
    const submitted = consumeRecentSearch(window.location.href);
    if (idsKey && (submitted || CRITERIA.some((field) => !!params.get(field)))) recordRecentProperties(idsKey.split(",").map(Number));
  }, [idsKey, path]);
  return null;
}
