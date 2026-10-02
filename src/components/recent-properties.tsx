"use client";

import { useEffect, useState } from "react";
import { IconClose } from "@/components/icons";
import { PropertyRail } from "@/components/property-rail";
import { useRecentProperties } from "@/lib/recent-properties";
import type { PropertyWithDealer } from "@/lib/queries";

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
          <div><h2 id="recent-heading">Recent Properties</h2><p className="recent-properties-caption">Recently viewed or found in your searches.</p></div>
          <button type="button" onClick={() => {
            clear();
            document.querySelector<HTMLElement>("#featured .property-rail-viewport")?.focus({ preventScroll: true });
          }} className="clear-recent"><IconClose className="h-3.5 w-3.5" />Clear Recent</button>
        </div>
        {loading ? <p className="recent-properties-status" role="status">Loading your recent properties…</p> : result.error ?
          <p className="recent-properties-status" role="status">Unable to load recent properties. <button type="button" onClick={() => setAttempt((current) => current + 1)}>Retry</button></p> :
          <PropertyRail key={key} initialProperties={result.items} initialTotal={result.items.length} label="Recent properties" size="compact" />}
      </div>
    </section>
  );
}
