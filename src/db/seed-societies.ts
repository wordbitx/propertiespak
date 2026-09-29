import type { SeedProperty } from "@/db/seed-data";
import { SOCIETIES, CITY_BY_SLUG } from "@/lib/landing-pages";
import { searchSocietyIndex } from "@/lib/society-index";
import { buildPlaceListing, parseBand, type PlaceFacts } from "@/db/seed-places";

/**
 * Top-up inventory for society landing pages whose live stock is thin, so the
 * society filter option and the guide page never open on an empty grid.
 * Facts are derived from the society entry (hero note, city bands) and the
 * society index (centroid), keeping every generated listing place-specific.
 */

const SOCIETY_SEED_SLUGS = [
  "model-town-lahore",
  "johar-town-lahore",
  "dha-phase-5-lahore",
  "blue-area-islamabad",
  "clifton-karachi",
  "dha-multan",
  "buch-villas-multan",
  "eden-valley-faisalabad",
  "satellite-town-gujranwala",
  "hayatabad-peshawar",
] as const;

const SIZE_HINTS: Record<string, string> = {
  "blue-area-islamabad": "office suites, shops and apartments",
  "clifton-karachi": "3 and 4 bedroom apartments, bungalows and 1 Kanal houses",
  "buch-villas-multan": "1 Kanal villas, 10 Marla houses and residential plots",
  "dha-multan": "5 and 10 Marla plots, 1 Kanal plots and built villas",
  "satellite-town-gujranwala": "5 and 10 Marla houses, 1 Kanal homes and plots",
  "eden-valley-faisalabad": "5 and 10 Marla houses, 1 Kanal homes and plots",
};

function formatPKR(amount: number): string {
  if (amount >= 10_000_000) {
    const crore = amount / 10_000_000;
    return `PKR ${(Math.round(crore * 100) / 100).toLocaleString("en-PK")} Crore`;
  }
  if (amount >= 100_000) {
    const lakh = amount / 100_000;
    return `PKR ${(Math.round(lakh * 10) / 10).toLocaleString("en-PK")} Lakh`;
  }
  return `PKR ${Math.round(amount).toLocaleString("en-PK")}`;
}

/**
 * Society price bands come from the society's own price note: rent figures are
 * dropped, a single sale figure is widened, and only a note with no sale figure
 * at all falls back to the city band. Rent is derived as a realistic monthly
 * fraction of the sale band so a 10 Marla home never rents like a bungalow.
 */
function bandsFor(note: string, citySaleBand: string, cityRentBand: string): { priceBand: string; rentBand: string } {
  const saleAmounts: number[] = [];
  const re = /(\d+(?:\.\d+)?)\s*(Crore|Lakh|Arab)/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(note))) {
    const tail = note.slice(match.index + match[0].length, match.index + match[0].length + 14).toLowerCase();
    if (tail.includes("per month") || tail.includes("/month")) continue;
    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    saleAmounts.push(Math.round(unit === "crore" ? value * 10_000_000 : unit === "arab" ? value * 1_000_000_000 : value * 100_000));
  }
  const cityAmounts = parseBand(citySaleBand);

  let low = saleAmounts[0];
  let high = saleAmounts[saleAmounts.length - 1];
  if (!low || !high || high < low) {
    if (saleAmounts.length === 1) {
      low = Math.round((saleAmounts[0] * 0.85) / 100_000) * 100_000;
      high = Math.round((saleAmounts[0] * 1.3) / 100_000) * 100_000;
    } else if (cityAmounts.length >= 2) {
      low = cityAmounts[0];
      high = Math.round((cityAmounts[0] + (cityAmounts[1] - cityAmounts[0]) * 0.5) / 100_000) * 100_000;
    } else {
      return { priceBand: citySaleBand, rentBand: cityRentBand };
    }
  }
  const rentLow = Math.round((low * 0.0025) / 5_000) * 5_000;
  const rentHigh = Math.round((high * 0.005) / 5_000) * 5_000;
  return {
    priceBand: `${formatPKR(low)} – ${formatPKR(high)}`,
    rentBand: `${formatPKR(rentLow)} – ${formatPKR(rentHigh)} per month`,
  };
}

function factsFor(slug: string): PlaceFacts | null {
  const society = SOCIETIES.find((entry) => entry.slug === slug);
  if (!society) return null;
  const city = CITY_BY_SLUG.get(society.citySlug);
  const centroid = searchSocietyIndex(society.name, society.citySlug, 1)[0];
  const firstSentence = society.heroNote.split(". ")[0].trim();
  const bands = bandsFor(society.priceNote, city?.saleBand ?? "PKR 80 Lakh – PKR 8 Crore", city?.rentBand ?? "PKR 35,000 – PKR 2 Lakh per month");
  return {
    slug: society.slug,
    name: society.name,
    citySlug: society.citySlug,
    cityName: society.cityName,
    sizes: SIZE_HINTS[society.slug] ?? "5 and 10 Marla houses, 1 Kanal homes and residential plots",
    priceBand: bands.priceBand,
    rentBand: bands.rentBand,
    character: firstSentence.endsWith(".") ? firstSentence : `${firstSentence}.`,
    belt: `${society.name} main boulevard and commercial market, ${society.cityName}`,
    lat: centroid?.lat ?? 31.5204,
    lng: centroid?.lng ?? 74.3587,
  };
}

/** Two sale listings (one of them often a plot) and one rental per society. */
export const societyPropertySeed: SeedProperty[] = SOCIETY_SEED_SLUGS.flatMap((slug) => {
  const facts = factsFor(slug);
  if (!facts) return [];
  return [
    buildPlaceListing(facts, "sale", 0),
    buildPlaceListing(facts, /blue-area|clifton/i.test(slug) ? "sale" : "plot", 1),
    buildPlaceListing(facts, "rent", 2),
  ];
});
