export const SITE = {
  name: "Properties Pak",
  /** Brand name with the country suffix used in titles and structured data. */
  fullName: "Properties Pak — Pakistan Real Estate Marketplace",
  tagline: "Buy · Sell · Rent in Pakistan",
  url: "https://propertiespak.com",
  /** Apex host is canonical; www and legacy hosts 301 to it (see next.config.ts). */
  host: "propertiespak.com",
  description:
    "Properties Pak is Pakistan's property marketplace for verified listings — search houses, apartments, plots, luxury villas, commercial property and new housing projects for sale and rent in Lahore, Islamabad, Karachi, Rawalpindi, Faisalabad, Multan, Gujranwala and Peshawar.",
  company: "WordbitX Software Company",
  companyUrl: "https://wordbitxtech.com/",
  companyEmail: "info@propertiespak.com",
  companyPhone: "+92 325 1888841",
  companyPhoneUs: "+1 (929) 619-7699",
  /**
   * Public-facing location for the company. Only the city and country are
   * published — the street/office address is deliberately not displayed.
   */
  companyAddress: {
    city: "Lahore",
    country: "Pakistan",
  },
  /** Company (not site) location for the vendor credit line. */
  companyAddressLine: "Lahore, Pakistan",
  locale: "en_PK",
  language: "en-PK",
  platformLabel: "Official real estate platform by WordbitX Software Company",
  social: {
    facebook: "https://www.facebook.com/propertiespak",
    instagram: "https://www.instagram.com/propertiespak",
    linkedin: "https://www.linkedin.com/company/propertiespak",
    youtube: "https://www.youtube.com/@propertiespak",
    x: "https://x.com/propertiespak",
  },
  /**
   * Social profiles for the parent company, WordbitX. The footer renders a
   * "Follow WordbitX" row containing whichever platforms have a URL below
   * (see SITE.companySocialLinks); leave a value empty to hide that platform.
   * Handles verified against the company's own GitHub organisation
   * (github.com/wordbitx) and X profile.
   */
  companySocial: {
    facebook: "",
    instagram: "https://www.instagram.com/wordbitx",
    linkedin: "https://www.linkedin.com/company/wordbitx",
    youtube: "https://www.youtube.com/@wordbitx",
    x: "https://x.com/wordbitx",
    tiktok: "https://www.tiktok.com/@wordbitx",
  },
  backlinks: {
    wordbitxHome: "https://wordbitxtech.com/",
    wordbitxServices: "https://wordbitxtech.com/",
    wordbitxContact: "https://wordbitxtech.com/",
    officialPlatform: "https://propertiespak.com",
  },
};

/**
 * Published WordbitX profile URLs — platforms without a link are omitted, so
 * the footer row and structured data only ever reference live accounts.
 */
export const COMPANY_SOCIAL_LINKS: string[] = Object.values(SITE.companySocial).filter(
  (url) => url.trim().length > 0,
);

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Buy", href: "/properties/for-sale" },
  { label: "Sell", href: "/list-property" },
  { label: "Rent", href: "/properties/for-rent" },
  { label: "New Projects", href: "/projects" },
  { label: "Towns", href: "/towns" },
  { label: "Dealers", href: "/dealers" },
  { label: "Commercial", href: "/commercial" },
  { label: "Insights", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const PURPOSES = [
  { value: "buy", label: "Buy", href: "/properties/for-sale" },
  { value: "rent", label: "Rent", href: "/properties/for-rent" },
  { value: "new-projects", label: "New Projects", href: "/properties/new-projects" },
  { value: "commercial", label: "Commercial", href: "/commercial" },
] as const;

/** Property types shown in search selects and filter bars. */
export const PROPERTY_TYPES = [
  "House",
  "Villa",
  "Apartment",
  "Penthouse",
  "Upper Portion",
  "Lower Portion",
  "Room",
  "Plot",
  "Farmhouse",
  "Office",
  "Shop",
  "Commercial Building",
  "Warehouse",
] as const;

export const CATEGORIES = [
  { value: "house", label: "Houses", types: ["House", "Villa"] },
  { value: "apartment", label: "Apartments", types: ["Apartment", "Penthouse", "Upper Portion", "Lower Portion", "Room"] },
  { value: "plot", label: "Plots", types: ["Plot"] },
  { value: "commercial", label: "Commercial", types: ["Commercial Building", "Warehouse"] },
  { value: "office", label: "Offices", types: ["Office"] },
  { value: "shop", label: "Shops", types: ["Shop"] },
  { value: "farmhouse", label: "Farmhouses", types: ["Farmhouse"] },
] as const;

export const BUDGETS_BUY = [
  { label: "Up to 1 Crore", value: "0-10000000" },
  { label: "1 – 3 Crore", value: "10000000-30000000" },
  { label: "3 – 8 Crore", value: "30000000-80000000" },
  { label: "8 – 20 Crore", value: "80000000-200000000" },
  { label: "20 Crore +", value: "200000000-" },
] as const;

export const BUDGETS_RENT = [
  { label: "Up to 50,000", value: "0-50000" },
  { label: "50,000 – 1.5 Lakh", value: "50000-150000" },
  { label: "1.5 – 4 Lakh", value: "150000-400000" },
  { label: "4 Lakh +", value: "400000-" },
] as const;

export const POPULAR_AREAS = [
  "DHA Phase 5, Lahore",
  "DHA Phase 2, Lahore",
  "Bahria Town Lahore",
  "Gulberg III, Lahore",
  "DHA Phase 2, Islamabad",
  "Bahria Town Karachi",
  "Clifton Block 5, Karachi",
  "Gulraiz Housing Scheme, Rawalpindi",
  "Eden Valley, Faisalabad",
  "Buch Villas, Multan",
  "Satellite Town, Gujranwala",
  "Hayatabad, Peshawar",
] as const;

/**
 * High-intent searches surfaced in the header search panel and on listing pages.
 * Every entry points at a real, indexable internal landing page. The homepage
 * hero deliberately stays free of them — the market hub and keyword layers below
 * carry the internal links instead.
 */
export const POPULAR_SEARCHES = [
  { label: "Houses for Sale in Lahore", href: "/houses-for-sale-in-lahore" },
  { label: "Apartments for Sale in Lahore", href: "/apartments-for-sale-in-lahore" },
  { label: "Property for Sale in Islamabad", href: "/property-for-sale-in-islamabad" },
  { label: "Property for Rent in Lahore", href: "/property-for-rent-in-lahore" },
  { label: "DHA Lahore Property", href: "/property-for-sale/dha-lahore" },
  { label: "Bahria Town Lahore Property", href: "/property-for-sale/bahria-town-lahore" },
  { label: "Commercial Property in Islamabad", href: "/commercial-property-in-islamabad" },
  { label: "Karachi Property for Sale", href: "/property-for-sale-in-karachi" },
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "area-desc", label: "Largest area" },
  { value: "popular", label: "Most viewed" },
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  house: "Houses",
  apartment: "Apartments",
  plot: "Plots",
  commercial: "Commercial",
  office: "Offices",
  shop: "Shops",
  farmhouse: "Farmhouses",
  penthouse: "Penthouses",
  building: "Commercial Buildings",
  warehouse: "Warehouses",
};

/** City landing pages generated with unique market content. */
export const CITY_LANDING_CITIES = [
  "lahore",
  "islamabad",
  "karachi",
  "rawalpindi",
  "faisalabad",
  "multan",
  "gujranwala",
  "peshawar",
] as const;

export const TOOL_LINKS = [
  { label: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
  { label: "Affordability Calculator", href: "/tools/affordability-calculator" },
  { label: "Rental Yield Calculator", href: "/tools/rental-yield-calculator" },
  { label: "ROI Calculator", href: "/tools/roi-calculator" },
  { label: "Investment Projection", href: "/tools/investment-calculator" },
  { label: "Construction Cost Calculator", href: "/tools/construction-cost-calculator" },
  { label: "Property Tax Calculator", href: "/tools/property-tax-calculator" },
  { label: "Rent vs Buy Calculator", href: "/tools/rent-vs-buy-calculator" },
] as const;
