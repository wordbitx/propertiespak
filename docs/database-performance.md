# Database performance

The app runs on Vercel Functions and talks to Postgres (e.g. Supabase) through a
**transaction pooler** (`...pooler.supabase.com:6543`). That setup is correct —
keep it. Switching database vendors does not make pages faster; what matters is
how many network round trips a request makes and how long each one takes.

## What the code does

| Layer | Behaviour |
| --- | --- |
| Boot (`src/db/seed.ts`) | Each cold start makes **one** query (`app_meta.seed_version`). The full seed/refresh only runs when the seed data or schema guard changes, inside one transaction guarded by `pg_advisory_xact_lock` (safe behind a transaction pooler). Previously ~50 sequential queries ran on every cold start. |
| Pool (`src/db/index.ts`) | One pool per instance, idle sockets kept 60 s (no TLS/auth handshake per request), closed cleanly before Fluid compute suspends via `attachDatabasePool`. |
| Reads (`src/lib/cache.ts`, `src/lib/queries.ts`) | Public, visitor-independent reads (listings, dealers, cities, posts, projects, stats) are served from the Next.js data cache. A warm homepage makes zero database queries instead of ~22. |
| Writes | Every route that changes public listings or dealer profiles calls `invalidateCatalog()`, so owners and admins see their change on the very next request. A 5-minute `revalidate` catches edits made outside the app. |

Per-user data (session user, favourites, account dashboard, admin screens) is
never cached and always reads the database.

Rule for new code: a new **public** read goes through `cachedQuery(...)` in
`src/lib/queries.ts`; a new **write** that affects public pages calls
`invalidateCatalog()` after it succeeds.

## Region: the setting that matters most

Every uncached query pays the network distance between the Vercel Function and
the database. If the database is in Mumbai and functions run in Washington
(Vercel's default `iad1`), each round trip is ~200 ms.

1. Supabase → Project Settings → General → note the **region** (e.g. `ap-south-1` Mumbai).
2. Vercel → Project → Settings → Functions → **Function Region** → pick the
   matching one (Mumbai = `bom1`, Singapore = `sin1`, Frankfurt = `fra1`,
   N. Virginia = `iad1`). Redeploy.

For visitors in Pakistan, Mumbai (`ap-south-1` / `bom1`) is the closest pair.

## Measured locally (100 ms simulated DB round trip)

| | Before | After |
| --- | --- | --- |
| Cold start, first page | 6.8 s | 0.3 s (0.9 s right after a deploy) |
| Homepage, warm | 0.44 s | 0.08 s |
| Listing / blog / dealer pages, warm | 0.13–0.17 s | 0.03–0.05 s |
