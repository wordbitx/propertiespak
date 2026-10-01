"use client";

import { useSyncExternalStore } from "react";

export const RECENT_PROPERTIES_KEY = "propertiespak:recent-properties";
const SEARCH_INTENT_KEY = "propertiespak:recent-search-intent";
const LIMIT = 24;
const EMPTY: number[] = [];
let snapshot: number[] = EMPTY;
let initialized = false;
let pendingSearch = "";
const listeners = new Set<() => void>();

function validIds(value: unknown): number[] {
  return Array.isArray(value) ? [...new Set(value.filter((id): id is number => typeof id === "number" && Number.isSafeInteger(id) && id > 0))].slice(0, LIMIT) : [];
}
function emit() { for (const listener of listeners) listener(); }
function initialize() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try { snapshot = validIds(JSON.parse(localStorage.getItem(RECENT_PROPERTIES_KEY) || "[]")); } catch { snapshot = EMPTY; }
}
function readStorage(event: StorageEvent) {
  if (event.key !== RECENT_PROPERTIES_KEY && event.key !== null) return;
  try { snapshot = validIds(JSON.parse(event.newValue || "[]")); } catch { snapshot = EMPTY; }
  emit();
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", readStorage);
  initialize();
  return () => { listeners.delete(listener); if (!listeners.size) window.removeEventListener("storage", readStorage); };
}

/** Browser-local IDs only: no contact details, search keywords or account data in history. */
export function recordRecentProperties(ids: number[]) {
  initialize();
  const next = validIds([...validIds(ids), ...snapshot]);
  if (next.join(",") === snapshot.join(",")) return;
  snapshot = next;
  try { localStorage.setItem(RECENT_PROPERTIES_KEY, JSON.stringify(next)); } catch { /* private browsing / storage quota */ }
  emit();
}
export function clearRecentProperties() {
  initialize();
  snapshot = EMPTY;
  pendingSearch = "";
  try { localStorage.removeItem(RECENT_PROPERTIES_KEY); sessionStorage.removeItem(SEARCH_INTENT_KEY); } catch { /* still clear this visit */ }
  emit();
}
export function useRecentProperties() {
  const ids = useSyncExternalStore(subscribe, () => snapshot, () => EMPTY);
  return { ids, clear: clearRecentProperties };
}

function normalizedHref(href: string) {
  const url = new URL(href, window.location.origin);
  url.searchParams.sort();
  const value = `${url.pathname}?${url.searchParams}`;
  // Match an intent without retaining personal search terms in browser storage.
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return (hash >>> 0).toString(16);
}
/** Includes an explicitly submitted blank/all-properties search, without adding tracking URL parameters. */
export function beginRecentSearch(href: string) {
  pendingSearch = normalizedHref(href);
  try { sessionStorage.setItem(SEARCH_INTENT_KEY, pendingSearch); } catch { /* in-memory intent still works */ }
}
export function consumeRecentSearch(href: string) {
  const key = normalizedHref(href);
  let stored = pendingSearch;
  try { stored = sessionStorage.getItem(SEARCH_INTENT_KEY) || stored; } catch { /* unavailable storage */ }
  if (stored !== key) return false;
  pendingSearch = "";
  try { sessionStorage.removeItem(SEARCH_INTENT_KEY); } catch { /* unavailable storage */ }
  return true;
}
