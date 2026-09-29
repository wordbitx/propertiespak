import type { SeedProperty } from "@/db/seed-data";
import { TOWNS } from "@/lib/towns";
import { buildPlaceListing, seedHashOf } from "@/db/seed-places";

/**
 * Marketplace inventory generated for every town in the town registry so the
 * cascading town filter and each town guide page show live, size-appropriate
 * listings instead of an empty state.
 */
export const townPropertySeed: SeedProperty[] = TOWNS.flatMap((town) => [
  buildPlaceListing(town, "sale", 0),
  buildPlaceListing(
    town,
    /plot|scheme|town|city|avenue|garden|cap/i.test(town.slug) && seedHashOf(town.slug) % 2 === 0 ? "plot" : "sale",
    1,
  ),
  buildPlaceListing(town, "rent", 2),
]);
