"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "estatewx:compare";
export const MAX_COMPARE = 3;

type CompareContextValue = {
  ids: number[];
  ready: boolean;
  full: boolean;
  has: (id: number) => boolean;
  toggle: (id: number) => void;
  remove: (id: number) => void;
  clear: () => void;
};

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setIds(parsed.filter((value): value is number => typeof value === "number").slice(0, MAX_COMPARE));
        }
      }
    } catch {
      /* ignore malformed storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* storage may be unavailable */
    }
  }, [ids, ready]);

  const toggle = useCallback((id: number) => {
    setIds((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id);
      if (current.length >= MAX_COMPARE) return [...current.slice(1), id];
      return [...current, id];
    });
  }, []);

  const remove = useCallback((id: number) => {
    setIds((current) => current.filter((value) => value !== id));
  }, []);

  const clear = useCallback(() => setIds([]), []);

  const value = useMemo<CompareContextValue>(
    () => ({
      ids,
      ready,
      full: ids.length >= MAX_COMPARE,
      has: (id: number) => ids.includes(id),
      toggle,
      remove,
      clear,
    }),
    [ids, ready, toggle, remove, clear],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const context = useContext(CompareContext);
  if (!context) {
    return {
      ids: [],
      ready: false,
      full: false,
      has: () => false,
      toggle: () => {},
      remove: () => {},
      clear: () => {},
    };
  }
  return context;
}
