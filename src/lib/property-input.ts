import type { properties } from "@/db/schema";

export type PropertyInsert = typeof properties.$inferInsert;

const CITY_NAMES: Record<string, string> = {
  lahore: "Lahore",
  islamabad: "Islamabad",
  karachi: "Karachi",
  rawalpindi: "Rawalpindi",
  faisalabad: "Faisalabad",
  multan: "Multan",
  gujranwala: "Gujranwala",
  peshawar: "Peshawar",
};

const AGENT_BY_CITY: Record<string, string> = {
  lahore: "hassan-rizvi",
  islamabad: "ayesha-noor",
  rawalpindi: "ayesha-noor",
  karachi: "bilal-shaikh",
  multan: "sana-ali",
  faisalabad: "sana-ali",
  gujranwala: "hassan-rizvi",
  peshawar: "sana-ali",
};

const CATEGORY_TYPES: Record<string, string> = {
  house: "House",
  apartment: "Apartment",
  plot: "Plot",
  office: "Office",
  shop: "Shop",
  building: "Commercial Building",
  warehouse: "Warehouse",
  farmhouse: "Farmhouse",
  penthouse: "Penthouse",
};

export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "property"
  );
}

function num(value: unknown, fallback = 0): number {
  const parsed = typeof value === "string" ? Number(value) : (value as number);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function list(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean).slice(0, 40);
  if (typeof value === "string") return value.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean).slice(0, 40);
  return [];
}

function validImage(url: string): boolean {
  return /^https?:\/\//i.test(url) || /^\/api\/media\/\d+$/.test(url) || /^\/images\//.test(url);
}

export type ValidatedProperty = { ok: true; data: Omit<PropertyInsert, "slug"> } | { ok: false; error: string };

/** Validates and normalises an admin property payload (create or edit). */
export function validatePropertyPayload(body: Record<string, unknown>): ValidatedProperty {
  const title = String(body.title ?? "").trim();
  const locationArea = String(body.locationArea ?? "").trim();
  const citySlug = slugify(String(body.citySlug ?? "lahore")) || "lahore";
  const cityName = String(body.cityName ?? "").trim() || CITY_NAMES[citySlug] || "Lahore";
  const purpose = body.purpose === "rent" ? "rent" : "buy";
  const category = String(body.category ?? "house").trim() || "house";
  const propertyType = String(body.propertyType ?? "").trim() || CATEGORY_TYPES[category] || "House";
  const price = Math.max(0, Math.round(num(body.price)));
  const lat = num(body.lat, 31.5204);
  const lng = num(body.lng, 74.3587);
  const images = list(body.images).filter(validImage).slice(0, 12);

  if (title.length < 6) return { ok: false, error: "Title must be at least 6 characters." };
  if (!locationArea) return { ok: false, error: "Society / area is required." };
  if (!price) return { ok: false, error: "Price is required." };
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return { ok: false, error: "Map location is invalid." };
  if (images.length === 0) return { ok: false, error: "At least one property image is required." };

  const areaValue = Math.max(0, num(body.areaValue));
  const areaUnitRaw = String(body.areaUnit ?? "marla").toLowerCase();
  const areaUnit = ["sqft", "marla", "kanal"].includes(areaUnitRaw) ? areaUnitRaw : "marla";
  const areaSqft =
    areaUnit === "marla" ? Math.round(areaValue * 225) : areaUnit === "kanal" ? Math.round(areaValue * 4500) : Math.round(areaValue);

  return {
    ok: true,
    data: {
      title,
      purpose,
      category,
      propertyType,
      citySlug,
      cityName,
      locationArea,
      address: String(body.address ?? "").trim(),
      lat,
      lng,
      price,
      priceUnit: purpose === "rent" ? "month" : "total",
      negotiable: Boolean(body.negotiable),
      bedrooms: Math.max(0, Math.round(num(body.bedrooms))),
      bathrooms: Math.max(0, Math.round(num(body.bathrooms))),
      areaValue,
      areaUnit,
      areaSqft,
      parking: Math.max(0, Math.round(num(body.parking))),
      furnishing: String(body.furnishing ?? "Unfurnished").trim() || "Unfurnished",
      possession: String(body.possession ?? "Available").trim() || "Available",
      description: String(body.description ?? "").trim().slice(0, 5000),
      features: list(body.features),
      amenities: list(body.amenities),
      coverImage: images[0],
      images,
      featured: Boolean(body.featured),
      verified: Boolean(body.verified),
      isNewProject: Boolean(body.isNewProject),
      projectSlug: String(body.projectSlug ?? "").trim() || null,
      agentSlug: String(body.agentSlug ?? "").trim() || AGENT_BY_CITY[citySlug] || "hassan-rizvi",
      listedByName: String(body.listedByName ?? "").trim(),
      listedByEmail: String(body.listedByEmail ?? "").trim(),
      listedByPhone: String(body.listedByPhone ?? "").trim(),
      listedByWhatsapp: String(body.listedByWhatsapp ?? body.listedByPhone ?? "").trim(),
    },
  };
}
