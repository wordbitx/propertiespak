import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

/**
 * One pool per server instance, reused across requests (and across hot
 * reloads in dev). Tuned for serverless + a transaction pooler such as
 * Supabase port 6543:
 *
 * - Opening a connection costs several network round trips (TCP + TLS +
 *   auth), so idle connections are kept for a minute instead of pg's default
 *   10 s — a request that arrives a few seconds after the last one reuses a
 *   warm socket instead of paying the handshake again.
 * - `attachDatabasePool` lets Vercel Fluid compute close idle clients right
 *   before the instance is suspended, so a long idle timeout never leaks
 *   connections. It is a no-op outside Vercel.
 * - Queries go through the extended protocol with unnamed statements, which
 *   transaction-mode poolers support; nothing here relies on session state.
 */
export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    idleTimeoutMillis: 60_000,
    connectionTimeoutMillis: 10_000,
    keepAlive: true,
  });

if (!globalForDb.__arenaNextJsPostgresqlPool) {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
  // A dropped idle socket must never crash the process.
  pool.on("error", (error) => console.error("[db] idle client error", error.message));
  attachDatabasePool(pool);
}

export const db = drizzle(pool);

/** Anything that can run queries: the shared `db` or a transaction handle. */
export type Executor = Pick<typeof db, "select" | "insert" | "update" | "delete" | "execute">;
