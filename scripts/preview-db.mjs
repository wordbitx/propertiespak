// Sandbox-only helper: serves a PGlite (WASM Postgres) database over the
// Postgres wire protocol on 127.0.0.1:5432 so the Next.js app can connect
// with a normal DATABASE_URL. There is no system Postgres in this sandbox and
// only the npm registry is reachable, so PGlite is used instead.
import { PGlite } from "/home/user/propertiespak/node_modules/@electric-sql/pglite/dist/index.js";
import { PGLiteSocketServer } from "/home/user/propertiespak/node_modules/@electric-sql/pglite-socket/dist/index.js";

const dataDir = process.env.PGLITE_DATA_DIR ?? "/tmp/pgdata";
const port = Number(process.env.PGLITE_PORT ?? 5432);

const db = await PGlite.create({ dataDir });
const server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 25 });

await server.start();
console.log(`pglite listening on ${server.getServerConn()} (data: ${dataDir})`);

const shutdown = async () => {
  console.log("shutting down pglite server");
  await server.stop();
  await db.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
