import type { PropertyFilters } from "@/lib/queries";

export const SEARCH_CITIES = [
  { slug: "lahore", name: "Lahore" },
  { slug: "karachi", name: "Karachi" },
  { slug: "islamabad", name: "Islamabad" },
  { slug: "rawalpindi", name: "Rawalpindi" },
  { slug: "faisalabad", name: "Faisalabad" },
  { slug: "multan", name: "Multan" },
  { slug: "gujranwala", name: "Gujranwala" },
  { slug: "peshawar", name: "Peshawar" },
] as const;

export type SearchPurpose = "buy" | "rent";
export type SearchGroup = "all" | "homes" | "plot" | "commercial";
export type SearchAreaUnit = "marla" | "kanal" | "sqft";
export type PropertySearchState = {
  purpose: SearchPurpose;
  city: string;
  town: string;
  townExact: boolean;
  originalCategory: string;
  featured: boolean;
  newProjects: boolean;
  furnishing: string;
  possession: string;
  sort: string;
  group: SearchGroup;
  type: string;
  paymentType: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  areaUnit: SearchAreaUnit;
  beds: string;
  baths: string;
  verified: boolean;
  keyword: string;
  withImages: boolean;
  withVideos: boolean;
};

export const SEARCH_GROUPS: { value: SearchGroup; label: string }[] = [
  { value: "all", label: "All" },
  { value: "homes", label: "Homes" },
  { value: "plot", label: "Plots" },
  { value: "commercial", label: "Commercial" },
];
export const HOME_SEARCH_TYPES = ["House", "Upper Portion", "Farmhouse", "Penthouse", "Apartment", "Lower Portion", "Room"] as const;
export const PLOT_SEARCH_TYPES = ["Plot", "Agricultural Land", "Plot File", "Commercial Plot", "Industrial Land", "Plot Form"] as const;
export const COMMERCIAL_SEARCH_TYPES = ["Office", "Warehouse", "Commercial Building", "Shop", "Factory", "Other"] as const;
export function typesForGroup(group: SearchGroup) {
  if (group === "homes") return [...HOME_SEARCH_TYPES];
  if (group === "plot") return [...PLOT_SEARCH_TYPES];
  if (group === "commercial") return [...COMMERCIAL_SEARCH_TYPES];
  return [...HOME_SEARCH_TYPES, ...PLOT_SEARCH_TYPES, ...COMMERCIAL_SEARCH_TYPES];
}
export function searchTypeLabel(type: string) {
  if (type === "Apartment") return "Flat / Apartment";
  if (type === "Farmhouse") return "Farm House";
  if (type === "Plot") return "Residential Plot";
  if (type === "Commercial Building") return "Building";
  return type;
}
export function areaFactor(unit: SearchAreaUnit) {
  return unit === "marla" ? 225 : unit === "kanal" ? 4500 : 1;
}
export function defaultPropertySearch(purpose: SearchPurpose = "buy"): PropertySearchState {
  return {
    purpose, city: "", town: "", townExact: false, originalCategory: "", featured: false, newProjects: false, furnishing: "", possession: "", sort: "newest", group: "all", type: "", paymentType: "", minPrice: "", maxPrice: "",
    minArea: "", maxArea: "", areaUnit: "marla", beds: "", baths: "", verified: false,
    keyword: "", withImages: false, withVideos: false,
  };
}

type Params = Pick<URLSearchParams, "get">;
export function nonNegativeNumber(value: string | null | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= Number.MAX_SAFE_INTEGER ? number : undefined;
}

/** One URL contract for the full-screen search, listing pages, API and map. */
export function propertyQueryFromParams(params: Params): PropertyFilters {
  const payment = params.get("paymentType");
  return {
    purpose: ["buy", "rent"].includes(params.get("purpose") ?? "") ? params.get("purpose")! : undefined,
    city: params.get("city") || undefined,
    town: params.get("town") || undefined,
    townExact: params.get("townExact") === "1" || undefined,
    type: params.get("type") || undefined,
    category: params.get("category") || undefined,
    q: params.get("q") || undefined,
    beds: nonNegativeNumber(params.get("beds")),
    baths: nonNegativeNumber(params.get("baths")),
    minPrice: nonNegativeNumber(params.get("minPrice")),
    maxPrice: nonNegativeNumber(params.get("maxPrice")),
    minArea: nonNegativeNumber(params.get("minArea")),
    maxArea: nonNegativeNumber(params.get("maxArea")),
    paymentType: payment === "cash" || payment === "installments" ? payment : undefined,
    verified: params.get("verified") === "1" || undefined,
    withImages: params.get("withImages") === "1" || undefined,
    withVideos: params.get("withVideos") === "1" || undefined,
    featured: params.get("featured") === "1" || undefined,
    isNewProject: params.get("newProjects") === "1" || undefined,
    commercialOnly: params.get("commercial") === "1" || undefined,
    furnishing: params.get("furnishing") || undefined,
    possession: params.get("possession") || undefined,
    sort: params.get("sort") || "newest",
    page: Math.max(1, Math.floor(nonNegativeNumber(params.get("page")) ?? 1)),
    pageSize: Math.max(1, Math.min(48, Math.floor(nonNegativeNumber(params.get("pageSize")) ?? 12))),
  };
}

export function propertySearchFromParams(params: Params, fallbackPurpose: SearchPurpose = "buy"): PropertySearchState {
  const parsed = propertyQueryFromParams(params);
  const unit = params.get("areaUnit");
  const areaUnit: SearchAreaUnit = unit === "kanal" || unit === "sqft" ? unit : "marla";
  const factor = areaFactor(areaUnit);
  const category = parsed.category ?? (parsed.commercialOnly ? "commercial" : undefined);
  return {
    ...defaultPropertySearch(parsed.purpose === "rent" ? "rent" : parsed.purpose === "buy" ? "buy" : fallbackPurpose),
    city: parsed.city ?? "", town: parsed.town ?? "", townExact: !!parsed.townExact, type: parsed.type ?? "",
    originalCategory: category && !["homes", "plot", "commercial"].includes(category) ? category : "",
    featured: !!parsed.featured, newProjects: !!parsed.isNewProject, furnishing: parsed.furnishing ?? "", possession: parsed.possession ?? "", sort: parsed.sort ?? "newest",
    group: category === "plot" ? "plot" : ["commercial", "office", "shop", "building", "warehouse"].includes(category ?? "") ? "commercial" : ["homes", "house", "apartment", "farmhouse", "penthouse"].includes(category ?? "") ? "homes" : "all",
    paymentType: parsed.paymentType ?? "",
    minPrice: parsed.minPrice === undefined ? "" : String(parsed.minPrice),
    maxPrice: parsed.maxPrice === undefined ? "" : String(parsed.maxPrice),
    minArea: parsed.minArea === undefined ? "" : String(Number((parsed.minArea / factor).toFixed(3))),
    maxArea: parsed.maxArea === undefined ? "" : String(Number((parsed.maxArea / factor).toFixed(3))),
    areaUnit, beds: parsed.beds === undefined ? "" : String(parsed.beds),
    baths: parsed.baths === undefined ? "" : String(parsed.baths),
    verified: !!parsed.verified, keyword: parsed.q ?? "", withImages: !!parsed.withImages, withVideos: !!parsed.withVideos,
  };
}

export function propertySearchParams(state: PropertySearchState) {
  const params = new URLSearchParams();
  if (state.city) params.set("city", state.city);
  if (state.town.trim()) { params.set("town", state.town.trim()); if (state.townExact) params.set("townExact", "1"); }
  if (state.originalCategory) params.set("category", state.originalCategory);
  else if (state.group !== "all") params.set("category", state.group);
  if (state.featured) params.set("featured", "1");
  if (state.newProjects) params.set("newProjects", "1");
  if (state.furnishing) params.set("furnishing", state.furnishing);
  if (state.possession) params.set("possession", state.possession);
  if (state.sort !== "newest") params.set("sort", state.sort);
  if (state.type) params.set("type", state.type);
  if (state.paymentType) params.set("paymentType", state.paymentType);
  for (const key of ["minPrice", "maxPrice", "beds", "baths"] as const) {
    if (nonNegativeNumber(state[key]) !== undefined) params.set(key, state[key]);
  }
  for (const key of ["minArea", "maxArea"] as const) {
    const value = nonNegativeNumber(state[key]);
    if (value !== undefined) params.set(key, String(Math.round(value * areaFactor(state.areaUnit))));
  }
  if (state.minArea || state.maxArea) params.set("areaUnit", state.areaUnit);
  if (state.verified) params.set("verified", "1");
  if (state.withImages) params.set("withImages", "1");
  if (state.withVideos) params.set("withVideos", "1");
  if (state.keyword.trim()) params.set("q", state.keyword.trim());
  return params;
}
export function propertySearchHref(state: PropertySearchState) {
  const path = state.purpose === "rent" ? "/properties/for-rent" : "/properties/for-sale";
  const params = propertySearchParams(state);
  return params.size ? `${path}?${params}` : path;
}

export const SEARCH_FILTER_KEYS = [
  "purpose", "q", "city", "town", "townExact", "type", "category", "beds", "baths", "minPrice", "maxPrice",
  "minArea", "maxArea", "areaUnit", "paymentType", "verified", "withImages", "withVideos",
  "featured", "newProjects", "commercial", "furnishing", "possession", "sort", "page",
];
