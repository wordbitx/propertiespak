import { photos } from "@/lib/images";
import { listingPhotos, premiumListingPhotos } from "@/lib/listing-photos";
import type { SeedProperty } from "./seed-data";

type Kind = "house" | "rental" | "apartment" | "plot" | "commercial";
type PoolName = "exteriors" | "living" | "kitchens" | "bedrooms" | "apartments" | "land" | "commercial";

const COMMERCIAL = new Set(["office", "shop", "building", "warehouse", "commercial"]);

function kindOf(property: SeedProperty): Kind {
  const category = property.category.toLowerCase();
  if (category === "plot") return "plot";
  if (COMMERCIAL.has(category)) return "commercial";
  if (category === "apartment" || category === "penthouse") return "apartment";
  return property.purpose === "rent" ? "rental" : "house";
}

/** Where each kind of listing looks for a cover, in order of preference. */
const COVER_POOLS: Record<Kind, PoolName[]> = {
  house: ["exteriors", "living", "kitchens", "bedrooms"],
  plot: ["land", "exteriors"],
  commercial: ["commercial", "apartments"],
  apartment: ["apartments", "living", "kitchens", "bedrooms"],
  rental: ["exteriors", "living", "kitchens", "bedrooms"],
};

/** Room sequence used for the rest of the gallery after the cover. */
const GALLERY_PATTERN: Record<Kind, PoolName[]> = {
  house: ["living", "kitchens", "bedrooms", "living", "bedrooms"],
  rental: ["living", "kitchens", "bedrooms", "living", "bedrooms"],
  apartment: ["living", "kitchens", "bedrooms", "living", "bedrooms"],
  plot: ["land", "land", "land"],
  commercial: ["commercial", "apartments", "apartments"],
};

/** Covers are handed out in this order so houses get first pick of exteriors. */
const KIND_ORDER: Kind[] = ["house", "plot", "commercial", "apartment", "rental"];

function hashOf(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function buildPools(exclude: ReadonlySet<number>): Record<PoolName, number[]> {
  const pool = (...lists: ReadonlyArray<readonly number[]>) => [...new Set(lists.flat())].filter((id) => !exclude.has(id));
  return {
    exteriors: pool(listingPhotos.exteriors, photos.villas),
    living: pool(listingPhotos.living, photos.interiors),
    kitchens: pool(listingPhotos.kitchens),
    bedrooms: pool(listingPhotos.bedrooms, photos.bedrooms),
    apartments: pool(listingPhotos.apartments),
    land: pool(listingPhotos.land, photos.dev),
    commercial: pool(listingPhotos.commercial, photos.commercial, photos.retail),
  };
}

/**
 * Gives every seeded listing its own cover photo — no two listings share a
 * cover — and fills the rest of each gallery with the least-used room shots,
 * steering away from combinations another listing already shows.
 *
 * Deterministic: the same seed data always produces the same galleries, so the
 * seed fingerprint only changes when listings or pools change. `exclude` holds
 * photos used elsewhere on the site (hero, city tiles, projects, guides) so a
 * listing never repeats one of them.
 */
export function assignSeedGalleries(list: SeedProperty[], exclude: ReadonlySet<number>): SeedProperty[] {
  const pools = buildPools(exclude);
  const allIds = [...new Set(Object.values(pools).flat())];
  const takenCovers = new Set<number>();
  const covers = new Map<string, number>();

  // Featured listings go first (newest first — the homepage shows the newest
  // featured) and take the premium shots; everyone else follows by kind.
  const featured = list.filter((property) => property.featured).sort((a, b) => a.daysAgo - b.daysAgo);
  const ordered = [
    ...featured,
    ...KIND_ORDER.flatMap((kind) => list.filter((property) => !property.featured && kindOf(property) === kind)),
  ];
  const usable = new Set(allIds);
  const premiumFor: Partial<Record<Kind, readonly number[]>> = {
    house: premiumListingPhotos.homes,
    rental: premiumListingPhotos.homes,
    apartment: premiumListingPhotos.apartments,
  };
  const premiumInteriors = new Set<number>(premiumListingPhotos.interiors);
  for (const property of ordered) {
    const kind = kindOf(property);
    let cover: number | undefined;
    if (property.featured) {
      cover = premiumFor[kind]?.find((id) => usable.has(id) && !takenCovers.has(id));
    }
    for (const name of cover === undefined ? COVER_POOLS[kind] : []) {
      cover = pools[name].find((id) => !takenCovers.has(id));
      if (cover !== undefined) break;
    }
    cover ??= allIds.find((id) => !takenCovers.has(id));
    if (cover === undefined) throw new Error(`Listing photo pools are exhausted at "${property.slug}". Add more photos to listing-photos.ts.`);
    takenCovers.add(cover);
    covers.set(property.slug, cover);
  }

  const galleryUses = new Map<number, number>();
  // Which listings already show each photo, so two listings never end up
  // with near-identical galleries.
  const shownIn = new Map<number, Set<string>>();
  const show = (id: number, slug: string) => {
    const set = shownIn.get(id) ?? new Set<string>();
    set.add(slug);
    shownIn.set(id, set);
  };
  for (const [slug, id] of covers) show(id, slug);

  return list.map((property) => {
    const kind = kindOf(property);
    const cover = covers.get(property.slug)!;
    const length = Math.min(5, Math.max(3, property.images.length));
    const gallery = [cover];
    const seed = hashOf(property.slug);
    for (const name of GALLERY_PATTERN[kind]) {
      if (gallery.length >= length) break;
      const candidates = pools[name].filter((id) => !gallery.includes(id));
      if (candidates.length === 0) continue;
      let best = candidates[0];
      let bestScore = Infinity;
      for (const id of candidates) {
        // Least-used photos first; a photo that is another listing's cover
        // counts as a little extra use, and pairing it with a photo this
        // gallery already shares with some other listing is avoided hard.
        const others = shownIn.get(id);
        let overlap = 0;
        if (others) {
          for (const picked of gallery) {
            for (const slug of shownIn.get(picked) ?? []) if (slug !== property.slug && others.has(slug)) overlap++;
          }
        }
        const score =
          overlap * 100 +
          (galleryUses.get(id) ?? 0) * 10 +
          (takenCovers.has(id) ? 5 : 0) -
          (property.featured && premiumInteriors.has(id) ? 25 : 0) +
          (hashOf(`${seed}:${id}`) % 10) / 10;
        if (score < bestScore) {
          bestScore = score;
          best = id;
        }
      }
      gallery.push(best);
      galleryUses.set(best, (galleryUses.get(best) ?? 0) + 1);
      show(best, property.slug);
    }
    return { ...property, images: gallery };
  });
}
