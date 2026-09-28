import type { Property } from "@/db/schema";

export type ScoreDimension = {
  key: string;
  label: string;
  score: number;
  note: string;
};

export type PropertyScore = {
  overall: number;
  label: string;
  disclaimer: string;
  dimensions: ScoreDimension[];
};

/** Illustrative PKR-per-sq-ft benchmarks per market (demo reference values). */
export const CITY_PPSF_BENCHMARK: Record<string, number> = {
  lahore: 9500,
  islamabad: 11500,
  karachi: 9800,
  rawalpindi: 7200,
  faisalabad: 6500,
  multan: 6800,
  gujranwala: 6000,
  peshawar: 6200,
};

/** Illustrative rental-demand index (1–10) used by the demo scoring model. */
const RENTAL_DEMAND: Record<string, number> = {
  lahore: 8.6,
  islamabad: 8.9,
  karachi: 9.1,
  rawalpindi: 7.4,
  faisalabad: 6.8,
  multan: 6.6,
  gujranwala: 5.9,
  peshawar: 6.1,
};

/** Society / area tiers drive the location and accessibility pillars. */
const AREA_TIERS: { match: string; location: number; access: number }[] = [
  { match: "dha phase 5", location: 9.4, access: 9.1 },
  { match: "dha phase 6", location: 9.2, access: 8.8 },
  { match: "dha phase 2", location: 8.9, access: 8.9 },
  { match: "dha phase 1", location: 8.7, access: 8.6 },
  { match: "dha", location: 8.8, access: 8.5 },
  { match: "clifton", location: 9.1, access: 8.4 },
  { match: "bahria town", location: 8.2, access: 7.8 },
  { match: "gulberg", location: 8.9, access: 9.3 },
  { match: "blue area", location: 9.3, access: 9.5 },
  { match: "johar town", location: 7.9, access: 8.4 },
  { match: "model town", location: 8.4, access: 8.6 },
  { match: "gulraiz", location: 7.4, access: 7.6 },
  { match: "eden valley", location: 6.9, access: 6.6 },
  { match: "buch villas", location: 7.6, access: 7.1 },
  { match: "satellite town", location: 6.8, access: 7.4 },
  { match: "hayatabad", location: 7.2, access: 7.0 },
  { match: "port qasim", location: 6.4, access: 7.8 },
  { match: "liberty market", location: 8.6, access: 9.0 },
];

function clamp(value: number, min = 1, max = 10) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function tier(area: string) {
  const normalised = area.toLowerCase();
  return (
    AREA_TIERS.find((entry) => normalised.includes(entry.match)) ?? {
      location: 7.2,
      access: 7.4,
    }
  );
}

export function pricePerSqft(property: Pick<Property, "price" | "areaSqft">): number {
  if (!property.areaSqft) return 0;
  return Math.round(property.price / property.areaSqft);
}

/**
 * Pak Property Property Score — a transparent, illustrative demo rating built only
 * from the listing's own attributes plus published demo market benchmarks.
 * It is not an official market valuation and is always labelled as a demo score.
 */
export function computePropertyScore(property: Property): PropertyScore {
  const benchmark = CITY_PPSF_BENCHMARK[property.citySlug] ?? 8000;
  const demand = RENTAL_DEMAND[property.citySlug] ?? 7;
  const { location, access } = tier(property.locationArea);

  const ppsf = pricePerSqft(property);
  const ratio = ppsf > 0 ? ppsf / benchmark : 1;
  // Lower price per sq ft versus the market benchmark scores better on value.
  const value = clamp(10 - (ratio - 0.82) * 7.4, 2.5, 10);

  const amenityCount = property.features.length + property.amenities.length;
  const amenities = clamp(4.4 + amenityCount * 0.52, 3, 10);

  const investment = clamp(
    location * 0.34 + value * 0.28 + demand * 0.26 + (property.isNewProject ? 0.7 : 0) + (property.verified ? 0.25 : 0),
    3,
    10,
  );

  const locationScore = clamp(location + (property.purpose === "rent" ? 0.2 : 0));

  const dimensions: ScoreDimension[] = [
    { key: "location", label: "Location", score: round(locationScore), note: `Society weighting for ${property.locationArea}` },
    {
      key: "value",
      label: "Value",
      score: round(value),
      note: ppsf > 0 ? `≈ PKR ${ppsf.toLocaleString("en-PK")} per sq ft` : "Area not supplied",
    },
    { key: "accessibility", label: "Accessibility", score: round(access), note: "Access to main roads and services" },
    { key: "rental", label: "Rental demand", score: round(demand), note: `Tenant demand index for ${property.cityName}` },
    { key: "amenities", label: "Amenities", score: round(amenities), note: `${amenityCount} listed features and amenities` },
    { key: "investment", label: "Investment potential", score: round(investment), note: "Composite of location, value and demand" },
  ];

  const weight: Record<string, number> = {
    location: 0.26,
    value: 0.22,
    accessibility: 0.12,
    rental: 0.16,
    amenities: 0.1,
    investment: 0.14,
  };

  const overall =
    dimensions.reduce((total, dimension) => total + dimension.score * (weight[dimension.key] ?? 0), 0) /
    Object.values(weight).reduce((total, item) => total + item, 0);

  return {
    overall: round(overall),
    label: "Illustrative Demo Score",
    disclaimer:
      "The Pak Property Property Score is an illustrative demo rating generated from the listing's own attributes and sample market benchmarks. It is not a valuation, a market rating or investment advice.",
    dimensions,
  };
}

export function scoreTone(score: number): string {
  if (score >= 8.5) return "bg-forest-600 text-white";
  if (score >= 7.5) return "bg-navy-800 text-white";
  return "bg-navy-600 text-white";
}

/** Indicative gross rental yield used in the comparison table (demo estimate). */
export function indicativeYield(property: Property): number | null {
  const benchmark = CITY_PPSF_BENCHMARK[property.citySlug] ?? 8000;
  const ppsf = pricePerSqft(property);
  if (!ppsf || property.purpose === "rent") return null;
  const monthlyRentPerSqft = (benchmark * 0.0068) / 1; // ~0.68% of benchmark value per month
  const annualRent = monthlyRentPerSqft * 12 * property.areaSqft;
  return Math.round((annualRent / property.price) * 1000) / 10;
}
