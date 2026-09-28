"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "estatewx:favorites";

type FavoritesContextValue = {
  ids: number[];
  count: number;
  ready: boolean;
  has: (id: number) => boolean;
  toggle: (id: number) => void;
  clear: () => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setIds(parsed.filter((value): value is number => typeof value === "number"));
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
    setIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  }, []);

  const clear = useCallback(() => setIds([]), []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      ids,
      count: ids.length,
      ready,
      has: (id: number) => ids.includes(id),
      toggle,
      clear,
    }),
    [ids, ready, toggle, clear],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    return {
      ids: [],
      count: 0,
      ready: false,
      has: () => false,
      toggle: () => {},
      clear: () => {},
    };
  }
  return context;
}
