"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconClose, IconLayers } from "@/components/icons";
import { useCompare } from "@/components/compare-provider";
import { useEffect, useState } from "react";

export function CompareBar() {
  const { ids, ready, remove, clear } = useCompare();
  const pathname = usePathname();
  const [items, setItems] = useState<{ id: number; title: string; coverImage: string; cityName: string }[]>([]);

  useEffect(() => {
    if (!ready || ids.length === 0) {
      setItems([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/properties?ids=${ids.join(",")}`)
      .then((response) => response.json())
      .then((payload: { items?: { id: number; title: string; coverImage: string; cityName: string }[] }) => {
        if (!cancelled) setItems(payload.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [ids, ready]);

  if (!ready || ids.length === 0 || pathname === "/compare") return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 hidden px-4 pb-4 lg:block">
      <div className="pointer-events-auto mx-auto flex max-w-5xl items-center gap-4 rounded-panel border border-white/12 bg-navy-950/96 p-3 pr-4 shadow-lift backdrop-blur">
        <span className="flex items-center gap-2 pl-2 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-forest-400">
          <IconLayers className="h-4 w-4" />
          Compare
        </span>

        <ul className="flex flex-1 items-center gap-3 overflow-x-auto">
          {items.map((item) => (
            <li key={item.id} className="relative shrink-0">
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] p-1.5 pr-3">
                <img
                  src={item.coverImage}
                  alt=""
                  width={120}
                  height={90}
                  loading="lazy"
                  decoding="async"
                  className="h-11 w-14 rounded-lg object-cover"
                />
                <span className="max-w-[9.5rem]">
                  <span className="block truncate font-sans text-[0.8125rem] font-semibold text-white">{item.title}</span>
                  <span className="block truncate text-[0.6875rem] text-white/55">{item.cityName}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.title} from comparison`}
                className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-white text-navy-900 shadow-soft hover:bg-forest-500 hover:text-white"
              >
                <IconClose className="h-3 w-3" />
              </button>
            </li>
          ))}
          {items.length < ids.length && (
            <li className="shrink-0 text-[0.75rem] text-white/45">Loading…</li>
          )}
        </ul>

        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={clear} className="rounded-[10px] px-3 py-2 text-[0.8125rem] font-semibold text-white/60 hover:text-white">
            Clear
          </button>
          <Link
            href={`/compare?ids=${ids.join(",")}`}
            className={`btn btn-green px-4 py-2.5 text-[0.8125rem] ${ids.length < 2 ? "pointer-events-none opacity-50" : ""}`}
            aria-disabled={ids.length < 2}
          >
            Compare {ids.length} properties
          </Link>
        </div>
      </div>
    </div>
  );
}
