"use client";

import { useEffect, useId, useRef, useState } from "react";
import { IconPin, IconSearch } from "@/components/icons";

type Suggestion = { label: string; lat: number; lng: number; source: string; kind?: string };

const KIND_LABEL: Record<string, string> = {
  society: "Society",
  phase: "Phase",
  sector: "Sector",
  block: "Block",
  area: "Area",
  city: "City",
};

/**
 * Text input with an attached suggestions dropdown. Typing "Bahria Town Sector"
 * lists Sector A, Sector B, …; typing "DHA Phase" lists Phase 1 … 13, etc.
 * Selecting a suggestion fills the field and (optionally) moves the map pin.
 */
export function LocationAutocomplete({
  id,
  value,
  onChange,
  onSelect,
  citySlug,
  cityName,
  placeholder = "e.g. DHA Phase 6, Bahria Town Sector C, Lake City M-7",
  required = false,
  className = "",
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (s: Suggestion) => void;
  citySlug?: string;
  cityName?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  const reactId = useId();
  const inputId = id ?? `loc-${reactId}`;
  const listId = `${inputId}-list`;
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const skipNext = useRef(false);

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    const q = value.trim();
    if (q.length < 2) {
      setItems([]);
      setOpen(false);
      return;
    }
    const controller = new AbortController();
    const t = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q, city: citySlug ?? "", cityName: cityName ?? "" });
        const res = await fetch(`/api/geocode?${params}`, { signal: controller.signal });
        const data = (await res.json()) as { results?: Suggestion[] };
        setItems(data.results ?? []);
        setOpen((data.results ?? []).length > 0);
        setActive(-1);
      } catch {
        if (!controller.signal.aborted) setItems([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 220);
    return () => {
      controller.abort();
      window.clearTimeout(t);
    };
  }, [value, citySlug, cityName]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(s: Suggestion) {
    skipNext.current = true;
    onChange(s.label);
    onSelect?.(s);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          id={inputId}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => items.length > 0 && setOpen(true)}
          onKeyDown={(e) => {
            if (!open) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(items.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(0, a - 1));
            } else if (e.key === "Enter" && active >= 0) {
              e.preventDefault();
              pick(items[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          className="field pl-9"
          placeholder={placeholder}
        />
        {loading && <span className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-soft border-t-forest-600" aria-hidden="true" />}
      </div>

      {open && items.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 z-40 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-soft bg-white p-1.5 shadow-lift"
        >
          {items.map((s, i) => (
            <li key={`${s.label}-${s.lat}-${s.lng}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(s)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${i === active ? "bg-mist" : "hover:bg-mist"}`}
              >
                <IconPin className="h-4 w-4 shrink-0 text-forest-600" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.875rem] font-semibold text-navy-900">{s.label}</span>
                  <span className="block text-[0.6875rem] text-ink-muted">{s.source === "estatewx" ? "Pak Property society index" : "OpenStreetMap"}</span>
                </span>
                {s.kind && KIND_LABEL[s.kind] && (
                  <span className="shrink-0 rounded-md bg-mist px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-ink-muted">{KIND_LABEL[s.kind]}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
