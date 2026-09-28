"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { IconArrowRight, IconCheck, IconClose, IconLayers, IconPin } from "@/components/icons";
import { useCompare } from "@/components/compare-provider";
import type { Property } from "@/db/schema";
import { formatArea, formatPrice } from "@/lib/format";
import { computePropertyScore, indicativeYield, pricePerSqft } from "@/lib/score";
import { CATEGORY_LABELS } from "@/lib/constants";

type Row = {
  key: string;
  label: string;
  render: (property: Property) => string;
  highlight?: "low" | "high";
  numeric?: (property: Property) => number | null;
};

const ROWS: Row[] = [
  { key: "price", label: "Price", render: (p) => formatPrice(p.price, p.priceUnit), numeric: (p) => p.price, highlight: "low" },
  {
    key: "pps",
    label: "Price per sq ft",
    render: (p) => {
      const value = pricePerSqft(p);
      return value ? `PKR ${value.toLocaleString("en-PK")}` : "—";
    },
    numeric: (p) => pricePerSqft(p) || null,
    highlight: "low",
  },
  { key: "purpose", label: "Status", render: (p) => (p.purpose === "rent" ? "For rent" : "For sale") },
  { key: "type", label: "Property type", render: (p) => p.propertyType },
  { key: "category", label: "Category", render: (p) => CATEGORY_LABELS[p.category] ?? p.propertyType },
  { key: "location", label: "Location", render: (p) => `${p.locationArea}, ${p.cityName}` },
  { key: "area", label: "Area", render: (p) => formatArea(p.areaValue, p.areaUnit), numeric: (p) => p.areaSqft, highlight: "high" },
  { key: "beds", label: "Bedrooms", render: (p) => (p.bedrooms > 0 ? String(p.bedrooms) : "—"), numeric: (p) => p.bedrooms || null },
  { key: "baths", label: "Bathrooms", render: (p) => (p.bathrooms > 0 ? String(p.bathrooms) : "—"), numeric: (p) => p.bathrooms || null },
  { key: "parking", label: "Parking", render: (p) => (p.parking > 0 ? `${p.parking} bays` : "—"), numeric: (p) => p.parking || null },
  { key: "furnishing", label: "Furnishing", render: (p) => p.furnishing },
  { key: "possession", label: "Possession", render: (p) => p.possession },
  {
    key: "yield",
    label: "Indicative gross yield",
    render: (p) => {
      const value = indicativeYield(p);
      return value === null ? "—" : `${value}%`;
    },
    numeric: (p) => indicativeYield(p),
    highlight: "high",
  },
  {
    key: "project",
    label: "Project / development",
    render: (p) => (p.projectSlug ? p.projectSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—"),
  },
  { key: "features", label: "Listed features", render: (p) => `${p.features.length} items` },
  { key: "amenities", label: "Key amenities", render: (p) => p.amenities.slice(0, 3).join(", ") || "—" },
];

export function ComparePageClient() {
  const searchParams = useSearchParams();
  const { ids: storedIds, ready, remove } = useCompare();
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const urlIds = useMemo(() => {
    const raw = searchParams.get("ids");
    if (!raw) return [];
    return raw
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value) && value > 0)
      .slice(0, 3);
  }, [searchParams]);

  const effectiveIds = urlIds.length > 0 ? urlIds : storedIds;

  useEffect(() => {
    if (effectiveIds.length === 0) {
      if (ready) {
        setItems([]);
        setLoading(false);
      }
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/properties?ids=${effectiveIds.join(",")}`)
      .then((response) => response.json())
      .then((payload: { items?: Property[] }) => {
        if (cancelled) return;
        const map = new Map((payload.items ?? []).map((item) => [item.id, item]));
        setItems(effectiveIds.map((id) => map.get(id)).filter((item): item is Property => Boolean(item)));
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
  }, [effectiveIds, ready]);

  if (loading) {
    return <p className="rounded-panel border border-soft bg-mist p-10 text-center text-[0.9375rem] text-ink-muted">Loading comparison…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-panel border border-soft bg-mist p-10 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-forest-600 shadow-soft">
          <IconLayers className="h-6 w-6" />
        </span>
        <h2 className="mt-5 font-sans text-[1.15rem] font-semibold text-navy-900">Nothing to compare yet</h2>
        <p className="mx-auto mt-2 max-w-xl text-[0.9rem] leading-relaxed text-ink-muted">
          Add two or three properties to the comparison view using the compare button on any listing card. You will then
          see price, price per square foot, area, amenities and the illustrative Pak Property Property Score side by side.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/properties" className="btn btn-primary">
            Browse properties <IconArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/property-investment-in-pakistan" className="btn btn-outline">
            Investment guide
          </Link>
        </div>
      </div>
    );
  }

  const scores = items.map((item) => computePropertyScore(item));

  const bestValue = (selector: (property: Property) => number | null, mode: "low" | "high") => {
    const values = items.map(selector).filter((value): value is number => typeof value === "number" && value > 0);
    if (values.length < 2) return null;
    return mode === "low" ? Math.min(...values) : Math.max(...values);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="font-sans text-[0.9375rem] font-semibold text-navy-900">
          Comparing {items.length} properties
          <span className="ml-2 font-normal text-ink-muted">Prices, size, amenities and demo scores side by side</span>
        </p>
        <Link href="/properties" className="btn btn-outline px-3.5 py-2 text-[0.8125rem]">
          Add another property
        </Link>
      </div>

      <div className="overflow-x-auto rounded-panel border border-soft bg-white shadow-soft">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <caption className="sr-only">Property comparison table</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[168px] border-b border-soft bg-mist p-4 align-bottom">
                <span className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-ink-muted">Attribute</span>
              </th>
              {items.map((property, index) => (
                <th key={property.id} scope="col" className="border-b border-l border-soft p-4 align-top">
                  <div className="relative">
                    <img
                      src={property.coverImage}
                      alt={`${property.title} in ${property.locationArea}, ${property.cityName}`}
                      width={600}
                      height={450}
                      className="aspect-[4/3] w-full rounded-lg object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="absolute right-2 top-2 rounded-md bg-navy-950/85 px-2 py-0.5 font-sans text-[0.625rem] font-bold uppercase tracking-[0.1em] text-white">
                      {property.purpose === "rent" ? "Rent" : "Sale"}
                    </span>
                    <span className="absolute left-2 top-2 rounded-md bg-white/92 px-2 py-0.5 font-sans text-[0.625rem] font-bold uppercase tracking-[0.1em] text-navy-900">
                      Score {scores[index].overall}
                    </span>
                  </div>
                  <p className="mt-3 font-sans text-[0.9375rem] font-semibold leading-snug text-navy-900">{property.title}</p>
                  <p className="mt-1 flex items-center gap-1 text-[0.75rem] text-ink-muted">
                    <IconPin className="h-3.5 w-3.5 text-forest-600" />
                    {property.locationArea}
                  </p>
                  <p className="mt-2 font-sans text-[0.9375rem] font-bold text-navy-900">
                    {formatPrice(property.price, property.priceUnit)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/property/${property.slug}`} className="btn btn-primary px-3 py-2 text-[0.75rem]">
                      View listing
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(property.id)}
                      className="inline-flex items-center gap-1 rounded-[10px] border border-soft px-3 py-2 font-sans text-[0.75rem] font-semibold text-ink-muted hover:border-navy-800 hover:text-navy-900"
                    >
                      <IconClose className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const best = row.highlight ? bestValue(row.numeric ?? (() => null), row.highlight) : null;
              return (
                <tr key={row.key} className="even:bg-mist/50">
                  <th scope="row" className="border-b border-soft p-4 text-[0.8125rem] font-semibold text-navy-900">
                    {row.label}
                  </th>
                  {items.map((property) => {
                    const value = row.numeric?.(property) ?? null;
                    const isBest = row.highlight && best !== null && value !== null && value === best;
                    return (
                      <td key={`${row.key}-${property.id}`} className="border-b border-l border-soft p-4 text-[0.875rem] text-ink">
                        <span className={isBest ? "inline-flex items-center gap-1.5 font-semibold text-forest-700" : ""}>
                          {isBest && <IconCheck className="h-3.5 w-3.5" />}
                          {value === null && row.key === "area" ? "—" : row.render(property)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {["location", "value", "accessibility", "rental", "amenities", "investment"].map((dimensionKey) => (
              <tr key={dimensionKey} className="even:bg-mist/50">
                <th scope="row" className="border-b border-soft p-4 text-[0.8125rem] font-semibold text-navy-900">
                  Score · {scores[0].dimensions.find((dimension) => dimension.key === dimensionKey)?.label}
                </th>
                {items.map((property, index) => {
                  const dimension = scores[index].dimensions.find((item) => item.key === dimensionKey);
                  return (
                    <td key={`${dimensionKey}-${property.id}`} className="border-b border-l border-soft p-4">
                      <span className="flex items-center gap-2.5">
                        <span className="h-1.5 w-24 overflow-hidden rounded-full bg-soft">
                          <span
                            className="block h-full rounded-full bg-forest-600"
                            style={{ width: `${((dimension?.score ?? 0) / 10) * 100}%` }}
                          />
                        </span>
                        <span className="font-sans text-[0.8125rem] font-semibold text-navy-900">{dimension?.score}</span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <p className="rounded-panel border border-soft bg-mist p-5 text-[0.8125rem] leading-relaxed text-ink-muted">
          <strong className="font-semibold text-navy-900">How to read this.</strong> Price per square foot, area and the
          Pak Property Property Score make two apparently similar listings genuinely comparable. Green ticks mark the
          strongest figure in each row. The property score is an {scores[0].label.toLowerCase()} built from each listing&rsquo;s
          own attributes and sample market benchmarks — it is not a valuation or investment advice.
        </p>
        <div className="rounded-panel border border-soft bg-white p-5">
          <p className="font-sans text-[0.9375rem] font-semibold text-navy-900">Want the numbers reviewed?</p>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-muted">
            Send both properties to our advisory desk and we will highlight documentation and pricing risks you may have
            missed.
          </p>
          <Link href="/contact?topic=advisory" className="btn btn-green mt-4 w-full">
            Request a review <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
