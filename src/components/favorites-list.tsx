"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconArrowRight, IconClose, IconHeart } from "@/components/icons";
import { useFavorites } from "@/components/favorites-provider";
import { PropertyCard } from "@/components/property-card";
import type { Property } from "@/db/schema";

export function FavoritesList() {
  const { ids, ready, clear } = useFavorites();
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (ids.length === 0) {
      setItems([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/properties?ids=${ids.join(",")}`)
      .then((response) => response.json())
      .then((payload: { items?: Property[] }) => {
        if (!cancelled) setItems(payload.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ids, ready]);

  if (!ready) {
    return <p className="text-[0.9375rem] text-ink-muted">Loading your shortlist…</p>;
  }

  if (ids.length === 0) {
    return (
      <div className="rounded-panel border border-soft bg-mist p-10 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-forest-600 shadow-soft">
          <IconHeart className="h-6 w-6" />
        </span>
        <h2 className="mt-5 font-sans text-[1.15rem] font-semibold text-navy-900">No saved properties yet</h2>
        <p className="mx-auto mt-2 max-w-lg text-[0.9rem] leading-relaxed text-ink-muted">
          Tap the heart on any listing to build a shortlist. Saved properties stay on this device and can be synced to your
          account once you sign in.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/properties" className="btn btn-primary">
            Browse properties <IconArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login" className="btn btn-outline">
            Sign in to sync
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-sans text-[0.9375rem] font-semibold text-navy-900">
          {ids.length} saved {ids.length === 1 ? "property" : "properties"}
          {loading && <span className="ml-2 font-normal text-ink-muted">refreshing…</span>}
        </p>
        <button type="button" onClick={clear} className="btn btn-outline px-3.5 py-2 text-[0.8125rem]">
          <IconClose className="h-4 w-4" /> Clear shortlist
        </button>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
