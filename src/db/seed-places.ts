import type { SeedProperty } from "@/db/seed-data";
import { photos } from "@/lib/images";

/**
 * Shared listing generator for registry places (towns and flagship societies).
 * Content is derived from the structured place facts — belt, sizes, price band,
 * character note, developer — so no two places read alike. Deterministic hashes
 * keep the generated inventory stable across restarts.
 */
export type PlaceFacts = {
  slug: string;
  name: string;
  citySlug: string;
  cityName: string;
  sizes: string;
  priceBand: string;
  rentBand: string;
  character: string;
  belt: string;
  lat: number;
  lng: number;
};

const QUALIFIERS = [
  "Prime Location",
  "Near Main Boulevard",
  "Corner Unit",
  "Brand New",
  "Ideal Location",
  "Near Commercial",
  "West Open",
  "Family Friendly Street",
  "Near Park",
  "Investor Rate",
];

const HOUSE_FEATURES = [
  "Solid construction with quality finishing",
  "Drawing and dining on the ground floor",
  "Attached baths in all bedrooms",
  "Separate servant quarter with bath",
  "Car porch for two cars",
  "Kitchen with imported fittings",
  "Wiring for split air conditioners",
  "Terrace with boundary wall",
];

const PLOT_FEATURES = [
  "Level, ready-to-build plot",
  "Street lights and sewerage laid",
  "Clear dimensions on the ground",
  "Gas and electricity available",
  "Possession available for construction",
  "Approved layout, transfer in society office",
];

const AMENITY_POOL = [
  "Gated community",
  "24/7 security staff",
  "Carpeted roads",
  "Mosque nearby",
  "School inside the scheme",
  "Commercial market nearby",
  "Parks and playgrounds",
  "Maintenance by society",
  "Public transport on main road",
  "Hospital within 5 minutes",
];

/** Deterministic hash so generated inventory is stable across restarts. */
export function seedHashOf(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick<T>(items: readonly T[], hash: number, offset = 0): T {
  return items[(hash + offset * 7919) % items.length];
}

export function parseBand(band: string): number[] {
  const amounts = [...band.matchAll(/(\d+(?:\.\d+)?)\s*(Crore|Lakh|Arab)/gi)].map((match) => {
    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    if (unit === "crore") return Math.round(value * 10_000_000);
    if (unit === "arab") return Math.round(value * 1_000_000_000);
    return Math.round(value * 100_000);
  });
  return amounts.filter((amount) => amount > 0);
}

function priceBetween(hash: number, band: string): number {
  const [low, high] = parseBand(band);
  if (!low) return 15_000_000;
  if (!high || high <= low) return low;
  const ratio = 0.25 + ((hash % 55) / 100);
  const raw = low + (high - low) * ratio;
  const step = raw > 20_000_000 ? 500_000 : 250_000;
  return Math.round(raw / step) * step;
}

const LAKH = 100_000;

function rentBetween(hash: number, band: string): number {
  const [low, high] = parseBand(band);
  if (!low) return 65_000;
  if (!high || high <= low) return low;
  const ratio = 0.3 + ((hash % 50) / 100);
  const raw = low + (high - low) * ratio;
  return Math.round(raw / (5 * LAKH)) * (5 * LAKH) || Math.round(raw / 5000) * 5000;
}

function sizeFor(place: PlaceFacts, hash: number): { label: string; type: string; marla: number; sqft: number; beds: number } {
  const sizes = place.sizes;
  const hasApartment = /apartment|flat/i.test(sizes);
  const hasKanal = /kanal/i.test(sizes);
  const hasTenMarla = /10 Marla/i.test(sizes);
  const hasThreeMarla = /3 Marla/i.test(sizes);

  if (hasApartment && hash % 3 === 0) {
    const [beds, sqft] = pick([[2, 1100], [3, 1600], [4, 2200]] as const, hash, 3);
    return { label: `${beds} Bed Apartment`, type: "Apartment", marla: 0, sqft, beds };
  }
  if (hasKanal && hash % 4 === 0) {
    return { label: "1 Kanal", type: "House", marla: 20, sqft: 4500, beds: 6 };
  }
  if (hasTenMarla && hash % 2 === 0) {
    return { label: "10 Marla", type: "House", marla: 10, sqft: 2250, beds: 5 };
  }
  if (hasThreeMarla && hash % 3 === 0) {
    return { label: "3 Marla", type: "House", marla: 3, sqft: 675, beds: 3 };
  }
  return { label: "5 Marla", type: "House", marla: 5, sqft: 1125, beds: 4 };
}

export function buildPlaceListing(place: PlaceFacts, kind: "sale" | "rent" | "plot", index: number): SeedProperty {
  const hash = seedHashOf(`${place.slug}-${kind}-${index}`);
  const qualifier = pick(QUALIFIERS, hash, index);
  const isPlot = kind === "plot";
  const size = isPlot
    ? {
        label: /kanal/i.test(place.sizes) && hash % 3 === 0 ? "1 Kanal" : /3 Marla/i.test(place.sizes) && hash % 2 === 0 ? "3 Marla" : "5 Marla",
        type: "Plot",
        marla: 5,
        sqft: 1125,
        beds: 0,
      }
    : sizeFor(place, hash);

  const areaValue = isPlot
    ? size.label === "1 Kanal"
      ? 20
      : size.label === "3 Marla"
        ? 3
        : 5
    : size.marla;
  const areaUnit: SeedProperty["areaUnit"] = size.type === "Apartment" ? "sqft" : "marla";
  const areaSqft = areaUnit === "sqft" ? size.sqft : areaValue * 225;

  const purpose: SeedProperty["purpose"] = kind === "rent" ? "rent" : "buy";
  const price = kind === "rent" ? rentBetween(hash, place.rentBand) : priceBetween(hash, place.priceBand);

  const title =
    kind === "rent"
      ? `${size.label} ${size.type} for Rent in ${place.name}`
      : `${size.label} ${isPlot ? "Plot" : size.type} for Sale in ${place.name}`;

  const description = [
    `${qualifier} ${isPlot ? `${size.label} plot` : `${size.label} ${size.type.toLowerCase()}`} in ${place.name}, ${place.cityName}. ${place.character}`,
    `The location is on ${place.belt} and the surrounding inventory typically covers ${place.sizes}. ${isPlot ? "Dimensions, street width and dues are confirmed with the society office before transfer, and the plot is ready for construction." : "The property is connected to utilities and sits on a settled residential street with easy access to the main road."}`,
    kind === "rent"
      ? `Monthly demand in ${place.name} runs between ${place.rentBand}, driven by families working nearby. Viewings can be arranged on request through the Properties Pak ${place.cityName} desk.`
      : `Asking prices in ${place.name} currently run from ${place.priceBand}, depending on size, position and development stage. Documentation is shared for verification before any token payment.`,
  ].join(" ");

  const features = isPlot ? pick(PLOT_FEATURES, hash, index).length > 0 ? PLOT_FEATURES.slice(0, 5) : [] : HOUSE_FEATURES.slice(hash % 3, (hash % 3) + 5);
  const amenities = AMENITY_POOL.slice(hash % 4, (hash % 4) + 5);

  const gallery = isPlot
    ? [photos.dev[hash % photos.dev.length], photos.dev[(hash + 3) % photos.dev.length], photos.cities[place.citySlug as keyof typeof photos.cities] ?? photos.dev[0]]
    : [
        photos.villas[hash % photos.villas.length],
        photos.interiors[(hash + 2) % photos.interiors.length],
        photos.bedrooms[(hash + 5) % photos.bedrooms.length],
        photos.interiors[(hash + 7) % photos.interiors.length],
      ];

  const streetName = /Road/i.test(place.belt) ? place.belt.split(",")[0] : `${place.name} main boulevard`;

  return {
    slug: `${size.label.toLowerCase().replace(/\s+/g, "-")}-${isPlot ? "plot" : size.type.toLowerCase()}-for-${purpose === "rent" ? "rent" : "sale"}-in-${place.slug}${index > 0 ? `-${index + 1}` : ""}`,
    title: `${title} — ${qualifier}`,
    purpose,
    category: isPlot ? "plot" : size.type === "Apartment" ? "apartment" : "house",
    propertyType: size.type,
    citySlug: place.citySlug,
    cityName: place.cityName,
    locationArea: place.name,
    address: `${place.name}, ${streetName}, ${place.cityName}`,
    lat: Number((place.lat + ((hash % 21) - 10) / 900).toFixed(5)),
    lng: Number((place.lng + (((hash >> 3) % 21) - 10) / 900).toFixed(5)),
    price,
    priceUnit: kind === "rent" ? "month" : "total",
    negotiable: kind !== "rent",
    bedrooms: isPlot ? 0 : size.beds,
    bathrooms: isPlot ? 0 : Math.max(1, size.beds - 1),
    areaValue,
    areaUnit,
    areaSqft,
    parking: isPlot ? 0 : 1 + (hash % 2),
    furnishing: kind === "rent" && hash % 3 === 0 ? "Semi-Furnished" : "Unfurnished",
    possession: hash % 5 === 0 ? "Under Construction" : "Available",
    description,
    features,
    amenities,
    images: gallery,
    featured: kind === "sale" && hash % 11 === 0,
    verified: true,
    isNewProject: false,
    agentSlug: place.citySlug === "lahore" ? "hassan-rizvi" : place.citySlug === "karachi" ? "bilal-shaikh" : place.citySlug === "islamabad" || place.citySlug === "rawalpindi" ? "ayesha-noor" : "sana-ali",
    views: 210 + (hash % 2400),
    daysAgo: 1 + (hash % 40),
  };
}
