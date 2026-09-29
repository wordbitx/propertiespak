import { revalidateTag, unstable_cache } from "next/cache";
import { SEED_VERSION } from "@/db/seed";

/**
 * Shared data cache for public, visitor-independent reads (listings, dealers,
 * cities, blog posts…). A page that used to fire ~20 queries at the database
 * now usually fires none: results come from the Next.js data cache (Vercel's
 * regional Data Cache in production, `.next/cache` locally).
 *
 * Freshness rules:
 * - Every write that changes public inventory or dealer profiles calls
 *   `invalidateCatalog()`, so the next request re-reads the database. Owners
 *   and admins see their change immediately.
 * - `revalidate` is a safety net for anything written outside this app
 *   (e.g. an edit made straight in the database console).
 * - `SEED_VERSION` is part of every key, so a deploy that edits seed content
 *   starts from a clean cache.
 *
 * Never cache per-user data (sessions, favourites, dashboards, admin screens).
 */
export const CATALOG_TAG = "catalog";

const DEFAULT_REVALIDATE_SECONDS = 300;

type Boxed = { value: unknown; map?: boolean };

// Values are JSON-serialised inside the cache, which would turn Date columns
// into strings and drop Maps / `undefined`. These helpers restore them.
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
const DATE_KEY = /(At|Date)$/;

function reviveDates(value: unknown, key = ""): unknown {
  if (typeof value === "string") {
    return DATE_KEY.test(key) && ISO_DATE.test(value) ? new Date(value) : value;
  }
  if (Array.isArray(value)) return value.map((item) => reviveDates(item, key));
  // A fresh (not yet serialised) result still holds real Date objects.
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = reviveDates(v, k);
    return out;
  }
  return value;
}

function box(value: unknown): Boxed {
  return value instanceof Map ? { value: Array.from(value.entries()), map: true } : { value };
}

function unbox(boxed: Boxed): unknown {
  const value = reviveDates(boxed.value);
  return boxed.map ? new Map(value as [unknown, unknown][]) : value;
}

/**
 * Wraps a read-only query in the shared data cache. Arguments must be
 * JSON-serialisable (they become part of the cache key).
 */
export function cachedQuery<Args extends unknown[], Result>(
  name: string,
  fn: (...args: Args) => Promise<Result>,
  options: { revalidate?: number } = {},
): (...args: Args) => Promise<Result> {
  const cached = unstable_cache(async (...args: Args) => box(await fn(...args)), ["q", name, SEED_VERSION], {
    tags: [CATALOG_TAG],
    revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS,
  });
  return async (...args: Args) => unbox(await cached(...args)) as Result;
}

/** Call after any write that changes public listings or dealer profiles. */
export function invalidateCatalog() {
  try {
    revalidateTag(CATALOG_TAG, { expire: 0 });
  } catch (error) {
    // Outside a request scope (scripts, tests) there is nothing to invalidate.
    console.warn("[cache] could not invalidate catalog", (error as Error).message);
  }
}
