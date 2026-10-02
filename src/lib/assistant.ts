import type { Property } from "@/db/schema";
import { formatArea, formatPrice } from "@/lib/format";

/**
 * The Properties Pak assistant brain.
 *
 * A small, dependency-free intent parser: it reads a visitor's question in
 * English or Roman Urdu, works out what they want, and either answers from the
 * site's own pages or hands back a live listing search. No external model is
 * called — every answer is grounded in this website's inventory and tools, so
 * nothing is invented.
 */

export type AssistantLink = { label: string; href: string; note?: string };

export type AssistantListing = Pick<
  Property,
  "id" | "slug" | "title" | "price" | "priceUnit" | "cityName" | "locationArea" | "coverImage" | "propertyType" | "bedrooms" | "areaValue" | "areaUnit"
>;

export type AssistantReply = {
  text: string;
  links?: AssistantLink[];
  listings?: AssistantListing[];
  moreHref?: string;
  moreLabel?: string;
};

export type AssistantFilters = {
  city?: string;
  purpose?: "buy" | "rent";
  type?: string;
  category?: string;
  beds?: number;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  /** The area as the visitor wrote it ("5 marla"), so replies read naturally. */
  areaLabel?: string;
};

export type AssistantPlan =
  | { kind: "reply"; reply: AssistantReply }
  | { kind: "search"; text: string; query: string; filters: AssistantFilters; summary: string };

const CITY_ALIASES: Record<string, string> = {
  lahore: "lahore",
  lahori: "lahore",
  lhr: "lahore",
  islamabad: "islamabad",
  isb: "islamabad",
  isl: "islamabad",
  karachi: "karachi",
  khi: "karachi",
  rawalpindi: "rawalpindi",
  pindi: "rawalpindi",
  rwp: "rawalpindi",
  faisalabad: "faisalabad",
  fsd: "faisalabad",
  lyallpur: "faisalabad",
  multan: "multan",
  gujranwala: "gujranwala",
  gujrat: "gujranwala",
  gjw: "gujranwala",
  peshawar: "peshawar",
  peshawer: "peshawar",
  psh: "peshawar",
};

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

const PURPOSE_ALIASES: Record<string, "buy" | "rent"> = {
  rent: "rent",
  rental: "rent",
  kiraya: "rent",
  kiraye: "rent",
  kirayey: "rent",
  lease: "rent",
  leasing: "rent",
  tenants: "rent",
  buy: "buy",
  buying: "buy",
  kharid: "buy",
  kharidna: "buy",
  purchase: "buy",
  purchasing: "buy",
  sale: "buy",
};

const TYPE_RULES: { test: RegExp; type?: string; category?: string }[] = [
  { test: /\b(farm ?house|farm houses)\b/, type: "Farmhouse" },
  { test: /\b(penthouse|penthouses)\b/, type: "Penthouse" },
  { test: /\b(apartment|apartments|flat|flats)\b/, type: "Apartment" },
  { test: /\b(house|houses|home|homes|villa|villas|bungalow|ghar|makan)\b/, type: "House" },
  { test: /\b(plot|plots|file|files|land|zameen|zamin)\b/, type: "Plot" },
  { test: /\b(commercial|office|offices|shop|shops|retail|warehouse|factory|building)\b/, category: "commercial" },
];

const UNIT_FACTORS: Record<string, number> = {
  arab: 1_000_000_000,
  arabs: 1_000_000_000,
  crore: 10_000_000,
  crores: 10_000_000,
  cr: 10_000_000,
  million: 1_000_000,
  millions: 1_000_000,
  mn: 1_000_000,
  lakh: 100_000,
  lakhs: 100_000,
  lac: 100_000,
  lacs: 100_000,
  thousand: 1_000,
  thousands: 1_000,
  hazar: 1_000,
  k: 1_000,
};

const AREA_FACTORS: Record<string, number> = {
  marla: 225,
  marlas: 225,
  marle: 225,
  kanal: 4_500,
  kanals: 4_500,
  sqft: 1,
  "sq ft": 1,
  "square feet": 1,
  "square foot": 1,
  yard: 9,
  yards: 9,
  "sq yd": 9,
};

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  ek: 1, do: 2, teen: 3, char: 4, chaar: 4, paanch: 5, panch: 5, chhe: 6, che: 6, saat: 7, aath: 8, nau: 9, das: 10,
};

const QUICK_REPLIES = [
  "3 bedroom houses for sale in Lahore under 2 crore",
  "Apartments for rent in Islamabad",
  "5 marla plots in Karachi",
  "New housing projects",
  "Mortgage calculator",
  "Talk to a human",
];

/** Phrases that answer a question without touching the catalogue. */
const KNOWLEDGE_RULES: { test: RegExp; reply: () => AssistantReply }[] = [
  {
    test: /\b(hi|hey|hello|salam|assalam|aoa|salaam|good (morning|afternoon|evening)|kia haal|kaise ho)\b/,
    reply: () => ({
      text: "Assalam-o-Alaikum! I'm the Properties Pak assistant. Tell me what you're looking for — a city, a property type, your budget or how many bedrooms — and I'll pull up live listings. You can also ask about our calculators or new projects.",
      links: [{ label: "Browse all properties", href: "/properties" }],
    }),
  },
  {
    test: /\b(thank|thanks|shukriya|shukria|jazak|bohot acha|great|perfect|nice)\b/,
    reply: () => ({ text: "Khushi hui! Anything else you'd like to check — more listings, a calculator, or a society guide?" }),
  },
  {
    test: /\b(bye|goodbye|see you|khuda hafiz)\b/,
    reply: () => ({ text: "Allah Hafiz! I'm here whenever you want to pick the search back up." }),
  },
  {
    test: /\b(new project|new projects|new launch|off ?plan|upcoming|payment plan|installment scheme)\b/,
    reply: () => ({
      text: "Here are the new housing projects on Properties Pak — each one has its payment plan, handover details and location guide.",
      links: [
        { label: "New housing projects", href: "/projects", note: "Payment plans & handover dates" },
        { label: "New project listings", href: "/properties/new-projects" },
      ],
    }),
  },
  {
    test: /\b(mortgag|instal|emi|loan|financ|kist|monthly payment)/,
    reply: () => ({
      text: "Our mortgage calculator works out the monthly instalment, total interest and total payable for a financed purchase.",
      links: [
        { label: "Mortgage calculator", href: "/tools/mortgage-calculator" },
        { label: "Affordability calculator", href: "/tools/affordability-calculator", note: "Start from your monthly budget" },
      ],
    }),
  },
  {
    test: /\b(yield|roi|invest|appreciat|capital gain|return on|returns)/,
    reply: () => ({
      text: "For investment maths, these two tools cover most questions: rental yield (gross vs net) and total return including capital gains.",
      links: [
        { label: "Rental yield calculator", href: "/tools/rental-yield-calculator" },
        { label: "ROI calculator", href: "/tools/roi-calculator" },
        { label: "All investment tools", href: "/tools" },
      ],
    }),
  },
  {
    test: /\b(construction|grey structure|build cost|build a house|construction rate)/,
    reply: () => ({
      text: "The construction cost calculator budgets a build per square foot across economy to luxury tiers, with contingency and consultant fees.",
      links: [{ label: "Construction cost calculator", href: "/tools/construction-cost-calculator" }],
    }),
  },
  {
    test: /\b(tax|stamp duty|transfer fee|holding cost)/,
    reply: () => ({
      text: "Transaction, holding and disposal charges are easy to underestimate — the property tax calculator estimates them for you.",
      links: [{ label: "Property tax calculator", href: "/tools/property-tax-calculator" }],
    }),
  },
  {
    test: /\b(societ|area guide|town|scheme|block guide)/,
    reply: () => ({
      text: "Every town, scheme and sector we cover has its own guide with prices, plot sizes and live listings.",
      links: [
        { label: "Towns & societies directory", href: "/towns" },
        { label: "Explore by city", href: "/properties" },
      ],
    }),
  },
  {
    test: /\b(compare|comparison|side by side)\b/,
    reply: () => ({
      text: "Add listings to the compare tray and open the comparison page to line them up side by side.",
      links: [{ label: "Compare properties", href: "/compare" }],
    }),
  },
  {
    test: /\b(list my property|sell my|post property|advertise|list a property|i want to sell|bechna|list property)\b/,
    reply: () => ({
      text: "You can publish your own listing in a few minutes — photos, price and location, then our team reviews it.",
      links: [
        { label: "List your property", href: "/list-property" },
        { label: "Advertising options", href: "/advertise" },
      ],
    }),
  },
  {
    test: /\b(dealer|dealers|agent|agents|agency|agencies|verified dealer|consultant|broker)\b/,
    reply: () => ({
      text: "Every dealer and agency on Properties Pak has a public profile with their live inventory. Accounts with a blue tick have had their identity and phone confirmed by our team.",
      links: [
        { label: "Dealers & agencies", href: "/dealers" },
        { label: "Verified listings", href: "/properties?verified=1" },
      ],
    }),
  },
  {
    test: /\b(blog|guide|news|market update|market insight|advice|tips)/,
    reply: () => ({
      text: "Our property guides cover buying, renting, documentation and market insight for the major cities.",
      links: [
        { label: "Property guides", href: "/blog" },
        { label: "Pakistan investment guide", href: "/property-investment-in-pakistan" },
      ],
    }),
  },
  {
    test: /\b(human|real person|call me|phone|whatsapp|contact|support|talk to someone|team|office|email)\b/,
    reply: () => ({
      text: "Of course — our team answers on WhatsApp and phone during office hours, and the contact page lists every channel.",
      links: [
        { label: "Contact Properties Pak", href: "/contact" },
        { label: "Chat on WhatsApp", href: "https://wa.me/923251888841" },
      ],
    }),
  },
  {
    test: /\b(what can you do|help|how do you work|options|menu|capabilit)/,
    reply: () => ({
      text: "I can search live listings, run the numbers on a purchase, and point you to the right guide. Try one of these:",
      links: [
        { label: "Search properties", href: "/properties" },
        { label: "Investment tools", href: "/tools" },
        { label: "New projects", href: "/projects" },
        { label: "Towns & societies", href: "/towns" },
      ],
    }),
  },
];

function words(message: string): string[] {
  return message.toLowerCase().replace(/[^a-z0-9.\s-]/g, " ").split(/\s+/).filter(Boolean);
}

function findCity(message: string): string | undefined {
  for (const word of words(message)) {
    const slug = CITY_ALIASES[word];
    if (slug) return slug;
  }
  return undefined;
}

function findPurpose(message: string): "buy" | "rent" | undefined {
  for (const word of words(message)) {
    const purpose = PURPOSE_ALIASES[word];
    if (purpose) return purpose;
  }
  return undefined;
}

function findType(message: string): { type?: string; category?: string } | undefined {
  for (const rule of TYPE_RULES) {
    if (rule.test.test(message.toLowerCase())) return { type: rule.type, category: rule.category };
  }
  return undefined;
}

function findBeds(message: string): number | undefined {
  const digits = message.toLowerCase().match(/(\d+)\s*(?:bed|beds|bedroom|bedrooms|bhk)\b/);
  if (digits) return Number(digits[1]);
  for (const [word, value] of Object.entries(NUMBER_WORDS)) {
    if (new RegExp(`\\b${word}\\s*(bed|beds|bedroom|bedrooms|bhk)\\b`).test(message.toLowerCase())) return value;
  }
  return undefined;
}

function findArea(message: string): number | undefined {
  const match = message.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(marla|marlas|marle|kanal|kanals|sqft|sq ft|square feet|square foot|yards?|sq yd)\b/);
  if (!match) return undefined;
  const factor = AREA_FACTORS[match[2]!] ?? 1;
  return Math.round(Number(match[1]) * factor);
}

/** "5 marla" / "1 kanal", exactly as the visitor wrote it, for readable replies. */
function findAreaLabel(message: string): string | undefined {
  const match = message.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(marla|marlas|marle|kanal|kanals|sqft|sq ft|square feet|square foot|yards?|sq yd)\b/);
  return match ? `${match[1]} ${match[2]}`.replace(/\bmarle\b/, "marla").replace(/\bmarlas\b/, "marla") : undefined;
}

/** Money phrases: "under 2 crore", "between 80 lakh and 1.2 crore", "budget 1.5 cr". */
function findBudget(message: string): { minPrice?: number; maxPrice?: number } {
  const text = message.toLowerCase();
  const amount = /(\d+(?:\.\d+)?)\s*(arab|arabs|crore|crores|cr|million|millions|mn|lakh|lakhs|lac|lacs|thousand|thousands|hazar|k)\b/;
  const between = text.match(new RegExp(`between\\s+${amount.source}\\s+(?:and|to|-|–)\\s+${amount.source}`));
  if (between) {
    return { minPrice: toRupees(between[1]!, between[2]!), maxPrice: toRupees(between[3]!, between[4]!) };
  }
  const range = text.match(new RegExp(`${amount.source}\\s*(?:to|-|–|se)\\s*${amount.source}`));
  if (range && !/between/.test(text)) {
    return { minPrice: toRupees(range[1]!, range[2]!), maxPrice: toRupees(range[3]!, range[4]!) };
  }
  const found = text.match(amount);
  if (!found) return {};
  const value = toRupees(found[1]!, found[2]!);
  if (/under|below|less than|max|maximum|upto|up to|within|<=|at most|kam|neeche|tak\b/.test(text)) return { maxPrice: value };
  if (/above|over|more than|min|minimum|starting|from|at least|>=|zyada|upar|se zyada/.test(text)) return { minPrice: value };
  return { maxPrice: value };
}

function toRupees(amount: string, unit: string): number {
  const factor = UNIT_FACTORS[unit] ?? 1;
  return Math.round(Number(amount) * factor);
}

function describeFilters(filters: AssistantFilters): string {
  const parts: string[] = [];
  if (filters.beds) parts.push(`${filters.beds} bedroom`);
  if (filters.category === "commercial") parts.push("commercial");
  else if (filters.type) parts.push(filters.type.toLowerCase());
  if (filters.purpose === "rent") parts.push("for rent");
  else if (filters.purpose === "buy") parts.push("for sale");
  if (filters.city) parts.push(`in ${CITY_NAMES[filters.city] ?? filters.city}`);
  if (filters.minPrice && filters.maxPrice) parts.push(`between ${formatPrice(filters.minPrice)} and ${formatPrice(filters.maxPrice)}`);
  else if (filters.maxPrice) parts.push(`up to ${formatPrice(filters.maxPrice)}`);
  else if (filters.minPrice) parts.push(`from ${formatPrice(filters.minPrice)}`);
  if (filters.areaLabel) parts.push(`${filters.areaLabel} and above`);
  return parts.join(" ");
}

function searchQuery(filters: AssistantFilters): string {
  const params = new URLSearchParams();
  if (filters.city) params.set("city", filters.city);
  if (filters.purpose) params.set("purpose", filters.purpose);
  if (filters.type) params.set("type", filters.type);
  if (filters.category) params.set("category", filters.category);
  if (filters.beds) params.set("beds", String(filters.beds));
  if (filters.minPrice) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice));
  if (filters.minArea) params.set("minArea", String(filters.minArea));
  params.set("sort", "newest");
  return params.toString();
}

/** The browsing link that mirrors the same search on the listings page. */
function searchHref(filters: AssistantFilters): string {
  return `/properties?${searchQuery(filters).replace("&sort=newest", "")}`;
}

/**
 * Reads one message and decides what to do. `previous` carries the filters of
 * the last search so follow-ups like "in Islamabad instead" or "cheaper ones"
 * refine the current search instead of starting over.
 */
export function planFor(message: string, previous?: AssistantFilters): AssistantPlan {
  const text = message.trim();
  const lower = text.toLowerCase();

  for (const rule of KNOWLEDGE_RULES) {
    if (rule.test.test(lower)) return { kind: "reply", reply: rule.reply() };
  }

  const city = findCity(lower);
  const purpose = findPurpose(lower);
  const type = findType(lower);
  const beds = findBeds(lower);
  const budget = findBudget(lower);
  const area = findArea(lower);
  const areaLabel = findAreaLabel(lower);

  // Follow-ups on the current search: "cheaper ones", "something bigger".
  const cheaper = /\b(cheaper|cheap|lower|sasta|sasti|kam|less expensive|budget friendly)\b/.test(lower);
  const bigger = /\b(bigger|larger|higher|zyada|mehnga|more expensive|premium)\b/.test(lower);

  let minPrice = budget.minPrice ?? previous?.minPrice;
  let maxPrice = budget.maxPrice ?? previous?.maxPrice;
  if (cheaper && maxPrice) maxPrice = Math.round((maxPrice * 0.6) / 100_000) * 100_000;
  if (bigger && maxPrice) maxPrice = Math.round((maxPrice * 1.5) / 100_000) * 100_000;
  if (minPrice && maxPrice && minPrice >= maxPrice) minPrice = undefined;

  const filters: AssistantFilters = {
    city: city ?? previous?.city,
    purpose: purpose ?? previous?.purpose,
    type: type?.type ?? previous?.type,
    category: type?.category ?? previous?.category,
    beds: beds ?? previous?.beds,
    minPrice,
    maxPrice,
    minArea: area ?? previous?.minArea,
    areaLabel: areaLabel ?? previous?.areaLabel,
  };

  const asked = Boolean(city || purpose || type || beds || budget.minPrice || budget.maxPrice || area || cheaper || bigger);
  if (!asked) {
    return {
      kind: "reply",
      reply: {
        text: "I didn't quite catch that. Tell me a city and what you're after — for example “3 bedroom house in Lahore under 2 crore” or “flat for rent in Islamabad” — and I'll search the live inventory.",
      },
    };
  }

  const summary = describeFilters(filters);
  return {
    kind: "search",
    text: `Searching live listings ${summary}…`,
    query: searchQuery(filters),
    filters,
    summary,
  };
}

/** Turns the API result into the assistant's answer. */
export function searchReply(plan: Extract<AssistantPlan, { kind: "search" }>, listings: AssistantListing[], total: number): AssistantReply {
  if (listings.length === 0) {
    return {
      text: `No live listing matches ${plan.summary} right now. Widening the search usually helps — try a nearby city, a higher budget, or fewer bedrooms.`,
      links: [
        { label: "Browse all properties", href: "/properties" },
        { label: "Talk to our team", href: "/contact" },
      ],
    };
  }

  const heading = total === 1 ? "1 listing" : `${total.toLocaleString("en-PK")} listings`;
  return {
    text: `Here ${listings.length === 1 ? "is" : "are"} the best ${listings.length === 1 ? "match" : `matches`} for ${plan.summary} — ${heading} in total.`,
    listings,
    moreHref: searchHref(plan.filters),
    moreLabel: `View all ${heading}`,
  };
}

export function welcomeReply(): AssistantReply {
  return {
    text: "Assalam-o-Alaikum! I'm your Properties Pak assistant. Tell me the city, property type and budget you have in mind and I'll pull up live listings — or ask about a calculator, a new project or a society guide.",
    links: [
      { label: "Browse all properties", href: "/properties" },
      { label: "Investment tools", href: "/tools" },
    ],
  };
}

export const ASSISTANT_QUICK_REPLIES = QUICK_REPLIES;
