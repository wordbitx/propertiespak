import { CITY_MARKETS, SOCIETIES } from "@/lib/landing-pages";
import { TOWNS } from "@/lib/towns";
import { getMatrixKeywordCount } from "@/lib/keyword-matrix";

/**
 * Keyword catalog — every search phrase Properties Pak targets, mapped to the
 * page that answers it.
 *
 * This is the internal-linking and metadata source of truth for search terms.
 * Each entry points at a route that really exists: a curated landing page, a
 * generated city × property-type page from `keyword-matrix.ts`, an area guide,
 * a tool, a blog guide, or a filtered search URL on `/properties`. Nothing is
 * a hidden keyword tag — the directory page renders these as real links so
 * crawlers can follow every cluster from one hub.
 *
 * Phrases are grouped by search intent. Where several phrasings target the same
 * page (for example "flats for rent in Karachi" and "flat on rent in Karachi"),
 * both are listed — that is exactly how the query set behaves in search, and the
 * page itself ranks for the cluster.
 */

export type KeywordLink = { label: string; href: string; note?: string };
export type KeywordGroup = {
  id: string;
  title: string;
  description: string;
  links: KeywordLink[];
};

const CITY_LABEL: Record<string, string> = Object.fromEntries(
  CITY_MARKETS.map((city) => [city.slug, city.name]),
);

const BLOG_GUIDES: { label: string; href: string; note: string }[] = [
  { label: "Property documentation checklist Pakistan", href: "/blog/property-documentation-checklist-pakistan", note: "Transfer papers and checks" },
  { label: "Property prices in Lahore", href: "/blog/property-prices-in-lahore", note: "Price per square foot by area" },
  { label: "Best areas to buy property in Lahore", href: "/blog/best-areas-to-buy-property-in-lahore", note: "Area-by-area buying guide" },
  { label: "Best areas to buy property in Karachi", href: "/blog/best-areas-to-buy-property-in-karachi", note: "Karachi buying corridors" },
  { label: "Karachi rental property guide", href: "/blog/karachi-rental-property-guide", note: "Rents, deposits and tenancy" },
  { label: "House vs plot investment in Pakistan", href: "/blog/house-vs-plot-investment-pakistan", note: "Which asset performs" },
  { label: "Real estate investment mistakes in Pakistan", href: "/blog/real-estate-investment-mistakes-pakistan", note: "Avoid the common errors" },
  { label: "FBR property tax guide Pakistan", href: "/blog/fbr-property-tax-guide-pakistan", note: "Taxes on buying and holding" },
  { label: "Rent vs buy in Pakistan", href: "/blog/rent-vs-buy-in-pakistan", note: "Cost of renting against owning" },
  { label: "Construction cost guide Pakistan", href: "/blog/construction-cost-guide-pakistan", note: "Per square foot build costs" },
  { label: "Bahria Town vs DHA Islamabad", href: "/blog/bahria-town-vs-dha-islamabad", note: "Two capital markets compared" },
  { label: "DHA vs Bahria Town comparison", href: "/blog/dha-vs-bahria-town-comparison", note: "Cost, security, resale" },
  { label: "Property investment in Islamabad guide", href: "/blog/property-investment-islamabad-guide", note: "Capital market drivers" },
];

const TOOL_LINKS: KeywordLink[] = [
  { label: "Mortgage calculator Pakistan", href: "/tools/mortgage-calculator", note: "Instalments on a home loan" },
  { label: "Rental yield calculator", href: "/tools/rental-yield-calculator", note: "Gross and net yield" },
  { label: "Property ROI calculator", href: "/tools/roi-calculator", note: "Total return on a property" },
  { label: "Affordability calculator", href: "/tools/affordability-calculator", note: "What budget is realistic" },
  { label: "Construction cost calculator", href: "/tools/construction-cost-calculator", note: "Build cost by area" },
  { label: "Property tax calculator", href: "/tools/property-tax-calculator", note: "FBR and provincial tax" },
  { label: "Rent vs buy calculator", href: "/tools/rent-vs-buy-calculator", note: "Compare both routes" },
  { label: "All property tools", href: "/tools", note: "Every calculator in one place" },
];

const HUB_LINKS: KeywordLink[] = [
  { label: "All properties in Pakistan", href: "/properties", note: "Search every listing" },
  { label: "Property for sale in Pakistan", href: "/property-for-sale-in-pakistan", note: "National sale inventory" },
  { label: "Property for rent in Pakistan", href: "/property-for-rent-in-pakistan", note: "National rentals" },
  { label: "New property projects in Pakistan", href: "/new-property-projects-in-pakistan", note: "Launches and off-plan" },
  { label: "Property investment in Pakistan", href: "/property-investment-in-pakistan", note: "Investment guide" },
  { label: "Pakistan real estate keywords", href: "/keywords-for-pakistan", note: "This directory" },
  { label: "Directory of every page", href: "/sitemap", note: "Full site index" },
  { label: "Compare properties", href: "/compare", note: "Shortlist side by side" },
  { label: "Verified property dealers", href: "/dealers", note: "Blue-tick dealer directory" },
  { label: "Towns and societies", href: "/towns", note: "Township-level guides" },
  { label: "Commercial property in Pakistan", href: "/commercial", note: "Offices, shops, warehouses" },
  { label: "New developments", href: "/projects", note: "Project profiles" },
];

function search(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  return `/properties${query ? `?${query}` : ""}`;
}

/** City-level head terms, each pointing at the curated city pages. */
function cityHeadTerms(): KeywordLink[] {
  const links: KeywordLink[] = [];
  for (const city of CITY_MARKETS) {
    links.push(
      { label: `Property for sale in ${city.name}`, href: `/property-for-sale-in-${city.slug}`, note: city.keyAreas.slice(0, 3).join(", ") },
      { label: `Property for rent in ${city.name}`, href: `/property-for-rent-in-${city.slug}`, note: `Rentals in ${city.name}` },
      { label: `${city.name} property market`, href: `/city/${city.slug}`, note: "City market overview" },
      { label: `Property dealers in ${city.name}`, href: `/dealers?city=${city.slug}`, note: "Verified dealer profiles" },
      { label: `Towns in ${city.name}`, href: `/towns/${city.slug}`, note: "Society-level guides" },
      { label: `Property files for sale in ${city.name}`, href: `/files-for-sale-in-${city.slug}`, note: "Instalment files" },
      { label: `Land for sale in ${city.name}`, href: `/land-for-sale-in-${city.slug}`, note: "Plots and development parcels" },
      { label: `Property investment in ${city.name}`, href: `/property-investment-in-${city.slug}`, note: "Yield and appreciation" },
    );
  }
  return links;
}

/** Property-type × city terms — the long-tail engine of the site. */
function typeCityTerms(): KeywordLink[] {
  const links: KeywordLink[] = [];
  for (const city of CITY_MARKETS) {
    const typePages: { plural: string; singular: string }[] = [
      { plural: "houses", singular: "house" },
      { plural: "flats", singular: "flat" },
      { plural: "apartments", singular: "apartment" },
      { plural: "plots", singular: "plot" },
      { plural: "villas", singular: "villa" },
      { plural: "shops", singular: "shop" },
      { plural: "offices", singular: "office" },
      { plural: "warehouses", singular: "warehouse" },
    ];
    for (const type of typePages) {
      links.push({
        label: `${type.plural.replace(/^./, (c) => c.toUpperCase())} for sale in ${city.name}`,
        href: `/${type.plural}-for-sale-in-${city.slug}`,
        note: `${city.name} ${type.plural}`,
      });
      links.push({
        label: `${type.plural.replace(/^./, (c) => c.toUpperCase())} for rent in ${city.name}`,
        href: `/${type.plural}-for-rent-in-${city.slug}`,
        note: `${type.singular} rentals in ${city.name}`,
      });
    }
    for (const size of ["5-marla", "10-marla", "1-kanal", "2-kanal"]) {
      links.push({
        label: `${size.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} house for sale in ${city.name}`,
        href: `/${size}-house-for-sale-in-${city.slug}`,
        note: "Size-specific price bands",
      });
    }
  }
  return links;
}

/** Area guides: societies first, then township registry. */
function areaTerms(): KeywordLink[] {
  const societyLinks = SOCIETIES.map((society) => ({
    label: `Property for sale in ${society.name}`,
    href: `/property-for-sale/${society.slug}`,
    note: `${society.cityName} area guide`,
  }));
  const townLinks = TOWNS.map((town) => ({
    label: `Property for sale in ${town.name}`,
    href: `/property-for-sale/${town.slug}`,
    note: `${town.cityName} township guide`,
  }));
  return [...societyLinks, ...townLinks];
}

/** Budget-led searches, phrased the way buyers actually type them. */
function budgetTerms(): KeywordLink[] {
  const links: KeywordLink[] = [];
  const bands = [
    { label: "under 1 crore", max: "10000000" },
    { label: "under 2 crore", max: "20000000" },
    { label: "under 5 crore", max: "50000000" },
    { label: "over 5 crore", min: "50000000" },
  ];
  for (const city of CITY_MARKETS) {
    for (const band of bands) {
      links.push({
        label: `Houses ${band.label} in ${city.name}`,
        href: search({ purpose: "buy", city: city.slug, category: "house", ...(band.max ? { maxPrice: band.max } : {}), ...(band.min ? { minPrice: band.min } : {}) }),
        note: "Filtered by budget",
      });
    }
    links.push(
      { label: `Plots for sale in ${city.name} under 1 crore`, href: search({ purpose: "buy", city: city.slug, category: "plot", maxPrice: "10000000" }) },
      { label: `Affordable apartments for sale in ${city.name}`, href: search({ purpose: "buy", city: city.slug, category: "apartment", sort: "price-asc" }) },
      { label: `Cheapest houses for rent in ${city.name}`, href: search({ purpose: "rent", city: city.slug, category: "house", sort: "price-asc" }) },
      { label: `Latest property listings in ${city.name}`, href: search({ purpose: "buy", city: city.slug, sort: "newest" }) },
    );
  }
  return links;
}

/** Bedroom-led searches for family and rental demand. */
function bedroomTerms(): KeywordLink[] {
  const links: KeywordLink[] = [];
  for (const city of CITY_MARKETS) {
    for (const beds of ["2", "3", "4", "5"]) {
      links.push({
        label: `${beds} bedroom house for sale in ${city.name}`,
        href: search({ purpose: "buy", city: city.slug, category: "house", beds }),
      });
      links.push({
        label: `${beds} bedroom flat for rent in ${city.name}`,
        href: search({ purpose: "rent", city: city.slug, category: "apartment", beds }),
      });
    }
  }
  return links;
}

/** Commercial searches by format, split sale / rent. */
function commercialTerms(): KeywordLink[] {
  const links: KeywordLink[] = [];
  const formats = [
    { key: "Shop", label: "shops" },
    { key: "Office", label: "offices" },
    { key: "Warehouse", label: "warehouses" },
  ];
  for (const city of CITY_MARKETS) {
    for (const format of formats) {
      links.push({
        label: `${format.label.replace(/^./, (c) => c.toUpperCase())} for sale in ${city.name}`,
        href: search({ purpose: "buy", city: city.slug, type: format.key }),
        note: "Commercial inventory",
      });
      links.push({
        label: `${format.label.replace(/^./, (c) => c.toUpperCase())} for rent in ${city.name}`,
        href: search({ purpose: "rent", city: city.slug, type: format.key }),
      });
    }
    links.push({
      label: `Commercial property in ${city.name}`,
      href: `/commercial?city=${city.slug}`,
      note: "Offices, retail and warehouses",
    });
  }
  return links;
}

/** Informational and research intent, mapped to published guides and tools. */
function researchTerms(): KeywordLink[] {
  const links: KeywordLink[] = [...BLOG_GUIDES.map((guide) => ({ label: guide.label, href: guide.href, note: guide.note })), ...TOOL_LINKS];
  for (const city of CITY_MARKETS) {
    links.push(
      { label: `Cost of construction per square foot in ${city.name}`, href: "/tools/construction-cost-calculator", note: "Build cost estimate" },
      { label: `Rental yield for property in ${city.name}`, href: "/tools/rental-yield-calculator", note: "Yield on a specific property" },
      { label: `Mortgage instalment for a house in ${city.name}`, href: "/tools/mortgage-calculator", note: "Monthly payment estimate" },
      { label: `Property tax on buying in ${city.name}`, href: "/tools/property-tax-calculator", note: "Tax estimate" },
      { label: `Should I rent or buy in ${city.name}`, href: "/tools/rent-vs-buy-calculator", note: "Compare both routes" },
    );
  }
  return links;
}

/** National head terms plus the property-type national pages. */
function nationalTerms(): KeywordLink[] {
  return [
    ...HUB_LINKS,
    { label: "Houses for sale in Pakistan", href: "/houses-for-sale-in-pakistan", note: "Family homes nationwide" },
    { label: "Apartments for sale in Pakistan", href: "/apartments-for-sale-in-pakistan", note: "Flats and high-rise living" },
    { label: "Plots for sale in Pakistan", href: "/plots-for-sale-in-pakistan", note: "Residential plots and files" },
    { label: "Commercial property in Pakistan", href: "/commercial-property-in-pakistan", note: "Offices, retail and warehousing" },
    { label: "Real estate in Pakistan", href: "/property-for-sale-in-pakistan", note: "Buy across all cities" },
    { label: "Land for sale in Pakistan", href: search({ purpose: "buy", category: "plot" }), note: "Plots nationwide" },
    { label: "Property for sale in Lahore", href: "/property-for-sale-in-lahore", note: "Largest sale market" },
    { label: "Property for sale in Islamabad", href: "/property-for-sale-in-islamabad", note: "Capital market" },
    { label: "Property for sale in Karachi", href: "/property-for-sale-in-karachi", note: "Commercial capital" },
    { label: "Overseas Pakistani property investment", href: "/property-investment-in-pakistan", note: "Remote buying checks" },
    { label: "Property for sale for overseas Pakistanis", href: "/property-for-sale-in-pakistan", note: "Documented inventory" },
    { label: "Property rates in Pakistan", href: "/property-for-sale-in-pakistan", note: "Asking price bands" },
  ];
}

function buildGroups(): KeywordGroup[] {
  return [
    {
      id: "national",
      title: "Pakistan Property Searches",
      description: "National head terms and the directories that cover them — the searches most buyers start with.",
      links: nationalTerms(),
    },
    {
      id: "cities",
      title: "City Property Searches",
      description: "City-level terms for every market we cover, each linked to its market page and dealer directory.",
      links: cityHeadTerms(),
    },
    {
      id: "types",
      title: "Property Type, Size & City Combinations",
      description: "The long-tail layer: houses, flats, apartments, plots, villas, shops, offices and warehouses in each city, plus house-size searches.",
      links: typeCityTerms(),
    },
    {
      id: "areas",
      title: "Society, Town & Area Searches",
      description: "Area-level searches answered by our society and township guides, with local price bands.",
      links: areaTerms(),
    },
    {
      id: "budget",
      title: "Budget & Bedroom Searches",
      description: "Buyers often start from a budget or a bedroom count rather than a location — these searches open a filtered view.",
      links: [...budgetTerms(), ...bedroomTerms()],
    },
    {
      id: "commercial",
      title: "Commercial Property Searches",
      description: "Shops, offices and warehouse terms by city, for sale and on rent.",
      links: commercialTerms(),
    },
    {
      id: "research",
      title: "Guides, Yields & Calculator Searches",
      description: "Research-stage searches answered by our published guides and property calculators.",
      links: researchTerms(),
    },
  ];
}

export const KEYWORD_GROUPS: KeywordGroup[] = buildGroups();

export function getKeywordCount(): number {
  return KEYWORD_GROUPS.reduce((total, group) => total + group.links.length, 0);
}

export function getUniqueKeywordCount(): number {
  const seen = new Set<string>();
  for (const group of KEYWORD_GROUPS) {
    for (const link of group.links) seen.add(link.label.toLowerCase());
  }
  return seen.size;
}

/** Every keyword phrase that points at a given path (used for page metadata). */
export function keywordsForPath(path: string): string[] {
  const phrases: string[] = [];
  for (const group of KEYWORD_GROUPS) {
    for (const link of group.links) {
      if (link.href === path) phrases.push(link.label.toLowerCase());
    }
  }
  return phrases;
}

/** Related search phrases to surface under a landing page or guide. */
export function relatedKeywords(path: string, limit = 10): KeywordLink[] {
  const direct = KEYWORD_GROUPS.flatMap((group) => group.links).filter((link) => link.href === path);
  if (direct.length >= limit) return direct.slice(0, limit);

  // Fall back to sibling terms in the same cluster: same city or same topic.
  const citySlug = path.split("-in-").pop()?.split("?")[0] ?? "";
  const cityName = CITY_LABEL[citySlug];
  const siblings = KEYWORD_GROUPS.flatMap((group) => group.links).filter((link) => {
    if (direct.includes(link)) return false;
    if (cityName && link.label.includes(cityName)) return true;
    return false;
  });

  const combined: KeywordLink[] = [];
  const seen = new Set<string>();
  for (const link of [...direct, ...siblings]) {
    if (seen.has(link.href + link.label)) continue;
    seen.add(link.href + link.label);
    combined.push(link);
    if (combined.length >= limit) break;
  }
  return combined;
}

export function getMatrixPageCount(): number {
  return getMatrixKeywordCount();
}

const ALL_LINKS: KeywordLink[] = KEYWORD_GROUPS.flatMap((group) => group.links);

const STOPWORDS = new Set(["the", "and", "for", "with", "from", "your", "this", "that", "how", "what", "pakistan", "property"]);

/**
 * Keyword phrases that fit an article's tags — used to give every blog guide a
 * block of descriptive links into the matching search pages.
 */
export function keywordsForTags(tags: string[], limit = 12): KeywordLink[] {
  const words = tags
    .flatMap((tag) => tag.toLowerCase().split(/[^a-z0-9]+/))
    .filter((word) => word.length > 3 && !STOPWORDS.has(word));

  const scored = ALL_LINKS.map((link) => {
    const label = link.label.toLowerCase();
    const score = words.reduce((total, word) => (label.includes(word) ? total + 1 : total), 0);
    return { link, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const picked: KeywordLink[] = [];
  const seen = new Set<string>();
  for (const entry of scored) {
    const key = entry.link.label;
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(entry.link);
    if (picked.length >= limit) return picked;
  }

  // Pad with research-stage terms so every guide links onward to tools and hubs.
  const research = KEYWORD_GROUPS.find((group) => group.id === "research")?.links ?? [];
  for (const link of [...research, ...ALL_LINKS]) {
    if (picked.length >= limit) break;
    if (seen.has(link.label)) continue;
    seen.add(link.label);
    picked.push(link);
  }
  return picked;
}
