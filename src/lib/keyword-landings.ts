import type { LandingContent } from "@/lib/landing-pages";
import type { PropertyFilters } from "@/lib/queries";

type LandingSpec = {
  slug: string;
  h1: string;
  eyebrow: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  filters: PropertyFilters;
  alternatives?: PropertyFilters;
  intro: [string, string, string];
  facets: { label: string; href: string; note: string }[];
  priceBands: { label: string; range: string; note: string }[];
  notes: { title: string; copy: string }[];
  faqs: { question: string; answer: string }[];
  related: { label: string; href: string }[];
};

const PAKISTAN_CITIES = [
  { label: "Lahore", href: "/property-for-sale-in-lahore", note: "DHA, Bahria Town, Gulberg and Johar Town" },
  { label: "Islamabad", href: "/property-for-sale-in-islamabad", note: "DHA, capital sectors and Blue Area" },
  { label: "Karachi", href: "/property-for-sale-in-karachi", note: "DHA, Clifton, Scheme 33 and commercial corridors" },
  { label: "Rawalpindi", href: "/property-for-sale-in-rawalpindi", note: "Bahria Town, Gulraiz and Askari" },
  { label: "Faisalabad", href: "/property-for-sale-in-faisalabad", note: "Wapda City, Eden Valley and Canal Road" },
  { label: "Multan", href: "/property-for-sale-in-multan", note: "DHA Multan, Buch Villas and Bosan Road" },
  { label: "Gujranwala", href: "/property-for-sale-in-gujranwala", note: "Satellite Town and growing schemes" },
  { label: "Peshawar", href: "/property-for-sale-in-peshawar", note: "Hayatabad and planned communities" },
];

const PAKISTAN_RENT_CITIES = PAKISTAN_CITIES.map((city) => ({
  ...city,
  href: city.href.replace("property-for-sale", "property-for-rent"),
}));

const CORE_TOOLS = [
  { label: "Mortgage calculator", href: "/tools/mortgage-calculator" },
  { label: "Rental yield calculator", href: "/tools/rental-yield-calculator" },
  { label: "Property ROI calculator", href: "/tools/roi-calculator" },
  { label: "Affordability calculator", href: "/tools/affordability-calculator" },
];

const SPECS: LandingSpec[] = [
  {
    slug: "property-for-sale-in-pakistan",
    h1: "Property for Sale in Pakistan",
    eyebrow: "Pakistan property market",
    metaTitle: "Property for Sale in Pakistan | Houses, Apartments & Plots | Pak Property",
    metaDescription:
      "Explore property for sale in Pakistan across Lahore, Islamabad, Karachi, Rawalpindi, Faisalabad, Multan, Gujranwala and Peshawar. Compare houses, apartments, plots, villas, commercial property and new projects.",
    keywords: [
      "property for sale in Pakistan",
      "houses for sale in Pakistan",
      "apartments for sale in Pakistan",
      "plots for sale in Pakistan",
      "commercial property Pakistan",
      "Pakistan real estate",
    ],
    filters: { purpose: "buy" },
    intro: [
      "Pakistan’s property market is a collection of distinct city and society markets rather than one national price curve. Lahore offers the broadest residential inventory, Islamabad combines planned sectors with institutional rental demand, and Karachi leads in apartments and commercial real estate.",
      "Pak Property brings sample houses, apartments, residential plots, villas, offices, shops and new-project inventory into one structured discovery experience. Use the city and society guides to understand local context, then compare price, area and indicative property signals before arranging a viewing.",
      "All inventory and price references on this WordbitX demonstration platform are illustrative. For a real transaction, independently verify title, authority approval, dues, possession and the seller’s right to transfer before paying any token amount.",
    ],
    facets: [
      { label: "Houses for sale in Pakistan", href: "/houses-for-sale-in-pakistan", note: "Family homes and luxury villas" },
      { label: "Apartments for sale in Pakistan", href: "/apartments-for-sale-in-pakistan", note: "Flats, penthouses and vertical living" },
      { label: "Plots for sale in Pakistan", href: "/plots-for-sale-in-pakistan", note: "Possession plots and documented files" },
      { label: "Commercial property in Pakistan", href: "/commercial-property-in-pakistan", note: "Offices, retail and income assets" },
      { label: "New property projects in Pakistan", href: "/new-property-projects-in-pakistan", note: "Developments and payment plans" },
      { label: "Property for rent in Pakistan", href: "/property-for-rent-in-pakistan", note: "Houses, apartments and commercial rentals" },
    ],
    priceBands: [
      { label: "Entry market", range: "Plots, portions and compact apartments", note: "Lower entry cost; documentation and development status matter" },
      { label: "Family market", range: "5–10 Marla houses and 2–3 bed apartments", note: "Largest end-user demand segment" },
      { label: "Premium market", range: "1 Kanal villas, penthouses and prime commercial", note: "Location, construction and liquidity drive value" },
    ],
    notes: [
      { title: "Choose the market first", copy: "Start with commute, schools, infrastructure and local resale activity before comparing individual listings." },
      { title: "Compare like with like", copy: "Use price per square foot and compare properties in the same society, block and development stage." },
      { title: "Verify documentation", copy: "Review the ownership chain, dues statement, approval status and transfer procedure with qualified local professionals." },
      { title: "Model total ownership cost", copy: "Include transfer charges, maintenance, society fees, vacancy and financing—not only the advertised price." },
    ],
    faqs: [
      { question: "Where can I find property for sale in Pakistan?", answer: "Pak Property organizes illustrative property inventory by city, property type and society across Lahore, Islamabad, Karachi, Rawalpindi, Faisalabad, Multan, Gujranwala and Peshawar." },
      { question: "Which property types are available in Pakistan?", answer: "Common categories include houses, apartments, villas, residential plots, offices, shops, warehouses, farmhouses, commercial buildings and units in new developments." },
      { question: "What should I check before buying property in Pakistan?", answer: "Confirm ownership, transfer history, dues, authority approval, possession, approved building plans where relevant, and all taxes and transfer charges before payment." },
      { question: "Are Pak Property listings real transactions?", answer: "No. Pak Property is an official WordbitX product demonstration. Its inventory, price bands and property signals are illustrative and should not be treated as transaction evidence or investment advice." },
    ],
    related: [
      { label: "Pakistan real estate keyword guide", href: "/keywords-for-pakistan" },
      { label: "Property investment in Pakistan", href: "/property-investment-in-pakistan" },
      { label: "Property documentation checklist", href: "/blog/property-documentation-checklist-pakistan" },
      ...CORE_TOOLS,
    ],
  },
  {
    slug: "property-for-rent-in-pakistan",
    h1: "Property for Rent in Pakistan",
    eyebrow: "Pakistan rental market",
    metaTitle: "Property for Rent in Pakistan | Houses, Apartments & Commercial | Pak Property",
    metaDescription:
      "Explore property for rent in Pakistan including houses, apartments, portions, offices, shops and commercial rentals across major cities. Compare monthly rent, size, furnishing and location.",
    keywords: ["property for rent in Pakistan", "houses for rent Pakistan", "apartments for rent Pakistan", "commercial property for rent Pakistan"],
    filters: { purpose: "rent" },
    intro: [
      "Rental property demand in Pakistan is concentrated around employment districts, universities, hospitals, schools and well-managed housing societies. Lahore has broad family and corporate demand, Islamabad attracts institutional tenants, and Karachi combines apartment leasing with the country’s deepest commercial rental market.",
      "This page brings illustrative houses, apartments, upper portions, offices, shops, warehouses and furnished rentals together. Compare monthly rent, deposit expectations, furnishing, parking and maintenance responsibilities before building a shortlist.",
      "A clear tenancy agreement matters as much as the property itself. Record the rent escalation, security deposit, notice period, utility responsibility, maintenance scope and inventory of furnished items in writing.",
    ],
    facets: [
      { label: "Property for rent in Lahore", href: "/property-for-rent-in-lahore", note: "Houses, apartments and portions" },
      { label: "Houses for rent in Lahore", href: "/houses-for-rent-in-lahore", note: "Family houses and farmhouses" },
      { label: "Apartments for rent in Lahore", href: "/apartments-for-rent-in-lahore", note: "Furnished and unfurnished units" },
      { label: "Property for rent in Islamabad", href: "/property-for-rent-in-islamabad", note: "Capital sectors and planned societies" },
      { label: "Property for rent in Karachi", href: "/property-for-rent-in-karachi", note: "Apartments and corporate rentals" },
      { label: "Commercial rentals", href: "/properties/commercial", note: "Offices, shops and warehouses" },
    ],
    priceBands: [
      { label: "Residential", range: "Apartments, portions and houses", note: "Monthly rent varies by city, location and furnishing" },
      { label: "Corporate", range: "Furnished homes and serviced apartments", note: "Management and utilities affect the effective rent" },
      { label: "Commercial", range: "Offices, shops and warehouses", note: "Parking, frontage and lease structure drive value" },
    ],
    notes: [
      { title: "Tenant due diligence", copy: "Inspect water, electricity backup, ventilation, security and maintenance response during a working hour." },
      { title: "Agreement terms", copy: "Put escalation, deposit refund, notice, repair responsibility and subletting rules in the tenancy agreement." },
      { title: "Landlord planning", copy: "Model vacancy, annual maintenance and management cost before treating gross rent as investment yield." },
      { title: "Commercial leases", copy: "Confirm permitted use, signage, electrical load, parking allocation and fit-out responsibility in writing." },
    ],
    faqs: [
      { question: "What property can I rent in Pakistan?", answer: "Rental inventory commonly includes houses, apartments, upper portions, furnished units, farmhouses, offices, shops and warehouses across major cities." },
      { question: "What should a tenancy agreement include?", answer: "It should state parties, property, rent, security deposit, escalation, duration, notice, utility and maintenance responsibility, use restrictions and handover condition." },
      { question: "How can landlords estimate rental yield?", answer: "Divide annual rent by purchase price for gross yield, then subtract vacancy, maintenance, society charges, management and taxes to estimate net yield." },
    ],
    related: [
      { label: "Pakistan real estate keyword guide", href: "/keywords-for-pakistan" },
      { label: "Rental yield calculator", href: "/tools/rental-yield-calculator" },
      { label: "Rent vs buy calculator", href: "/tools/rent-vs-buy-calculator" },
      { label: "Rental property guide", href: "/blog/rental-property-guide-pakistan" },
      { label: "Property for sale in Pakistan", href: "/property-for-sale-in-pakistan" },
    ],
  },
  {
    slug: "houses-for-sale-in-pakistan",
    h1: "Houses for Sale in Pakistan",
    eyebrow: "Pakistan houses",
    metaTitle: "Houses for Sale in Pakistan | Family Homes & Villas | Pak Property",
    metaDescription: "Explore sample houses and villas for sale across Lahore, Islamabad, Karachi, Rawalpindi, Faisalabad, Multan, Gujranwala and Peshawar.",
    keywords: ["houses for sale in Pakistan", "home for sale Pakistan", "villas for sale Pakistan"],
    filters: { purpose: "buy", category: "house" },
    intro: [
      "House markets in Pakistan are shaped by plot size, construction age, road width and society management. A 10 Marla house in Lahore, an Islamabad sector home and a Karachi bungalow may serve similar families but carry very different maintenance and liquidity profiles.",
      "Use this national house directory to compare illustrative family homes and villas across major cities, then move into a city or society guide for more relevant local context.",
      "For constructed property, inspect structure, waterproofing, wiring, plumbing, utility connections and approved building plans in addition to title and transfer documentation.",
    ],
    facets: [
      { label: "Houses for sale in Lahore", href: "/houses-for-sale-in-lahore", note: "DHA, Bahria and family districts" },
      { label: "Houses for sale in Islamabad", href: "/houses-for-sale-in-islamabad", note: "Sectors and planned societies" },
      { label: "Houses for sale in Karachi", href: "/houses-for-sale-in-karachi", note: "DHA, Scheme 33 and family areas" },
      { label: "5 Marla houses in Lahore", href: "/5-marla-house-for-sale-in-lahore", note: "Compact family homes" },
      { label: "10 Marla houses in Lahore", href: "/10-marla-house-for-sale-in-lahore", note: "Mid-size family inventory" },
      { label: "1 Kanal houses in Lahore", href: "/1-kanal-house-for-sale-in-lahore", note: "Premium houses and villas" },
    ],
    priceBands: [
      { label: "Compact", range: "5 Marla houses", note: "Efficient layouts and lower maintenance" },
      { label: "Family", range: "10 Marla houses", note: "Most popular multi-bedroom segment" },
      { label: "Premium", range: "1 Kanal and larger", note: "Basements, lawns and staff accommodation" },
    ],
    notes: [
      { title: "Structure", copy: "Inspect foundations, roof, dampness, drainage and major alterations with a qualified professional." },
      { title: "Approved plan", copy: "Compare the built form with the society or authority-approved building plan." },
      { title: "Running cost", copy: "Estimate utilities, maintenance, security and repair reserves for the full covered area." },
    ],
    faqs: [
      { question: "Which house sizes are common in Pakistan?", answer: "5 Marla, 10 Marla and 1 Kanal are common residential plot sizes, although actual square-foot definitions and covered area vary by city and scheme." },
      { question: "How should I compare two houses?", answer: "Compare plot and covered area, construction age, road width, condition, utilities, approved plans, society charges and recent comparable supply—not only total price." },
    ],
    related: [{ label: "All property for sale in Pakistan", href: "/property-for-sale-in-pakistan" }, ...CORE_TOOLS],
  },
  {
    slug: "apartments-for-sale-in-pakistan",
    h1: "Apartments for Sale in Pakistan",
    eyebrow: "Pakistan apartments",
    metaTitle: "Apartments for Sale in Pakistan | Flats & Penthouses | Pak Property",
    metaDescription: "Compare sample apartments, flats and penthouses for sale across Lahore, Islamabad, Karachi and other major Pakistan property markets.",
    keywords: ["apartments for sale in Pakistan", "flats for sale Pakistan", "penthouses Pakistan"],
    filters: { purpose: "buy", category: "apartment" },
    intro: [
      "Apartment ownership is expanding across Pakistan as central land becomes more expensive and managed buildings improve. Karachi has the deepest apartment tradition, Islamabad’s market is supported by institutional tenants, and Lahore’s vertical supply is growing around Gulberg and new developments.",
      "Compare sample units by usable area, floor, parking, ventilation, maintenance charges, power backup and possession status. A lower asking price can be offset by weak building management or large one-time repair levies.",
      "Before purchase, review title or allotment documents, completion approvals, association records, service charges, utility arrangements and the exact parking allocation.",
    ],
    facets: [
      { label: "Apartments for sale in Lahore", href: "/apartments-for-sale-in-lahore", note: "Gulberg, Johar Town and projects" },
      { label: "Apartments for sale in Islamabad", href: "/apartments-for-sale-in-islamabad", note: "DHA and capital developments" },
      { label: "Apartments for sale in Karachi", href: "/apartments-for-sale-in-karachi", note: "DHA, Clifton and Bahria Town" },
      { label: "Property for rent in Pakistan", href: "/property-for-rent-in-pakistan", note: "Compare rents before investing" },
    ],
    priceBands: [
      { label: "Entry", range: "Studios and compact apartments", note: "Lower ticket; management quality remains critical" },
      { label: "Family", range: "2–3 bedroom apartments", note: "Broadest owner-occupier and tenant demand" },
      { label: "Premium", range: "Penthouses and serviced residences", note: "Views, amenities and private access add value" },
    ],
    notes: [
      { title: "Building management", copy: "Review maintenance records, lift condition, backup power and the reserve fund." },
      { title: "Usable area", copy: "Distinguish net usable area from gross marketed area before calculating price per square foot." },
      { title: "Rental demand", copy: "Compare achievable rent and vacancy in the same building or micro-location." },
    ],
    faqs: [
      { question: "What should apartment buyers check in Pakistan?", answer: "Check title, approvals, actual usable area, parking, maintenance history, service charges, power backup, water and fire-safety arrangements." },
      { question: "Are apartments suitable for rental investment?", answer: "They can produce regular rent, especially near employment and education hubs, but net yield must account for service charges, repairs, furnishing and vacancy." },
    ],
    related: [{ label: "All property for sale in Pakistan", href: "/property-for-sale-in-pakistan" }, { label: "Rental yield calculator", href: "/tools/rental-yield-calculator" }, { label: "Apartment investment guide", href: "/blog/house-vs-plot-investment-pakistan" }],
  },
  {
    slug: "plots-for-sale-in-pakistan",
    h1: "Plots for Sale in Pakistan",
    eyebrow: "Pakistan plots",
    metaTitle: "Plots for Sale in Pakistan | Residential & Commercial Land | Pak Property",
    metaDescription: "Explore sample residential and commercial plots across DHA, Bahria Town and developing property markets in Pakistan. Compare size, possession and documentation status.",
    keywords: ["plots for sale in Pakistan", "residential plots Pakistan", "commercial plots Pakistan"],
    filters: { purpose: "buy", category: "plot" },
    intro: [
      "Plot investment remains a major part of Pakistan’s real-estate market because it offers lower maintenance than constructed property and flexibility over when to build. Outcomes depend heavily on approval, development delivery, possession and transfer documentation.",
      "This directory brings illustrative possession plots and documented file-style inventory together across major cities. Use local society guides to understand infrastructure, road access and development stage.",
      "Never treat a file, ballot or map location as proof of title. Verify the allotment, payment history, transfer chain, authority approval and outstanding development charges independently.",
    ],
    facets: [
      { label: "Plots for sale in Lahore", href: "/plots-for-sale-in-lahore", note: "DHA, Bahria and Lake City" },
      { label: "Plots for sale in Islamabad", href: "/plots-for-sale-in-islamabad", note: "DHA and capital schemes" },
      { label: "Plots for sale in Karachi", href: "/plots-for-sale-in-karachi", note: "Residential and commercial land" },
      { label: "DHA Lahore plots", href: "/property-for-sale/dha-lahore", note: "DHA society guide" },
      { label: "DHA Multan", href: "/property-for-sale/dha-multan", note: "South Punjab plot market" },
    ],
    priceBands: [
      { label: "Files", range: "Pre-ballot or allocation interests", note: "Highest documentation and delivery risk" },
      { label: "Balloted", range: "Numbered plots without full possession", note: "Location known; infrastructure may be incomplete" },
      { label: "Possession", range: "Construction-ready plots", note: "Higher entry cost, lower development uncertainty" },
    ],
    notes: [
      { title: "Authority approval", copy: "Confirm the approved layout and the project’s status with the relevant development authority." },
      { title: "Dues and charges", copy: "Obtain a written statement of instalments, development charges and transfer fees." },
      { title: "Physical location", copy: "Visit the site and match plot dimensions, road width and orientation to the approved map." },
    ],
    faqs: [
      { question: "What is the difference between a plot file and possession plot?", answer: "A file records an allocation or interest; a possession plot has a defined location and is generally ready for construction subject to society requirements." },
      { question: "Are plots guaranteed to appreciate?", answer: "No. Value depends on approvals, infrastructure delivery, demand, liquidity and entry price. No appreciation or return is guaranteed." },
    ],
    related: [{ label: "All property for sale in Pakistan", href: "/property-for-sale-in-pakistan" }, { label: "House vs plot investment", href: "/blog/house-vs-plot-investment-pakistan" }, { label: "Documentation checklist", href: "/blog/property-documentation-checklist-pakistan" }],
  },
  {
    slug: "commercial-property-in-pakistan",
    h1: "Commercial Property in Pakistan",
    eyebrow: "Pakistan commercial real estate",
    metaTitle: "Commercial Property in Pakistan | Offices, Shops & Warehouses | Pak Property",
    metaDescription: "Explore sample commercial property across Pakistan including offices, shops, retail, warehouses and commercial buildings in Lahore, Islamabad and Karachi.",
    keywords: ["commercial property in Pakistan", "offices for sale Pakistan", "shops for sale Pakistan", "warehouse Pakistan"],
    filters: { commercialOnly: true },
    intro: [
      "Commercial real estate in Pakistan is valued through income potential, tenant demand and operational suitability. Lahore and Islamabad lead in office and retail demand, while Karachi has the deepest corporate, industrial and logistics market.",
      "Compare illustrative offices, shops, commercial buildings and warehouses by frontage, parking, sanctioned use, electrical load, building services and lease terms—not only advertised price.",
      "For an income asset, review the tenancy, escalation, payment history, fit-out ownership and recurring maintenance before calculating net yield.",
    ],
    facets: [
      { label: "Commercial property in Lahore", href: "/commercial-property-in-lahore", note: "Gulberg, DHA and retail corridors" },
      { label: "Commercial property in Islamabad", href: "/commercial-property-in-islamabad", note: "Blue Area and planned sectors" },
      { label: "Commercial property in Karachi", href: "/commercial-property-in-karachi", note: "Offices, buildings and warehouses" },
      { label: "All commercial listings", href: "/commercial", note: "Commercial marketplace hub" },
    ],
    priceBands: [
      { label: "Retail", range: "Shops and ground-floor units", note: "Footfall, visibility and signage drive rent" },
      { label: "Office", range: "Suites and corporate floors", note: "Parking, power and HVAC drive demand" },
      { label: "Industrial", range: "Warehouses and logistics", note: "Access, clear height and loading define utility" },
    ],
    notes: [
      { title: "Permitted use", copy: "Confirm land use and whether the intended business activity is allowed." },
      { title: "Net income", copy: "Deduct vacancy, fit-out, maintenance, tax and management from gross rent." },
      { title: "Tenant concentration", copy: "A single-tenant asset may produce stable income but creates rollover risk." },
    ],
    faqs: [
      { question: "What types of commercial property are common in Pakistan?", answer: "Common types include offices, shops, retail units, commercial plots, buildings, warehouses and business-centre units." },
      { question: "How is commercial property compared?", answer: "Compare net operating income, lease quality, frontage, parking, building services, permitted use and replacement-tenant demand." },
    ],
    related: [{ label: "Commercial marketplace", href: "/commercial" }, { label: "Commercial investment guide", href: "/blog/commercial-property-investment-pakistan" }, { label: "ROI calculator", href: "/tools/roi-calculator" }],
  },
  {
    slug: "new-property-projects-in-pakistan",
    h1: "New Property Projects in Pakistan",
    eyebrow: "New developments",
    metaTitle: "New Property Projects in Pakistan | Developments & Payment Plans | Pak Property",
    metaDescription: "Explore sample new property projects in Pakistan with locations, unit types, development status, starting prices and investment considerations.",
    keywords: ["new property projects Pakistan", "new housing projects Pakistan", "off plan property Pakistan"],
    filters: { isNewProject: true },
    alternatives: { purpose: "buy" },
    intro: [
      "New property projects can offer phased payments and modern amenities, but they introduce development, approval and handover risk that completed property does not carry.",
      "Pak Property presents illustrative project pages with location, developer, project type, status, starting price and sample units so users can understand how a structured project marketplace works.",
      "Before booking, independently confirm the authority approval, land title, developer track record, payment schedule, escalation clauses, transfer policy and realistic completion plan.",
    ],
    facets: [
      { label: "All new projects", href: "/projects", note: "Project cards and development details" },
      { label: "New-project inventory", href: "/properties/new-projects", note: "Sample units within developments" },
      { label: "Property investment guide", href: "/property-investment-in-pakistan", note: "Risk and return framework" },
    ],
    priceBands: [
      { label: "Early launch", range: "Initial allocation and launch pricing", note: "Higher delivery uncertainty" },
      { label: "Under construction", range: "Progress-linked instalments", note: "Inspect physical development milestones" },
      { label: "Ready", range: "Completed or possession-stage units", note: "Lower delivery risk, higher entry cost" },
    ],
    notes: [
      { title: "Approval", copy: "Match the marketed project name and layout with the authority-approved record." },
      { title: "Payment plan", copy: "Read down payment, instalments, escalation, late fees and cancellation terms together." },
      { title: "Handover", copy: "Compare the proposed date with the developer’s completed project history and current site progress." },
    ],
    faqs: [
      { question: "What should I verify before booking a new project?", answer: "Verify authority approval, land control, developer history, payment terms, transfer policy, service charges, construction progress and the handover mechanism." },
      { question: "Are off-plan returns guaranteed?", answer: "No. Pricing and completion depend on development delivery, demand, market conditions and documentation. No return or handover date should be treated as guaranteed without binding evidence." },
    ],
    related: [{ label: "Projects hub", href: "/projects" }, { label: "Investment projection", href: "/tools/investment-calculator" }, { label: "Documentation checklist", href: "/blog/property-documentation-checklist-pakistan" }],
  },
];

function cityIntentSpec(
  slug: string,
  h1: string,
  city: "lahore" | "islamabad" | "karachi",
  cityName: string,
  intent: "house-rent" | "apartment-rent" | "house-sale" | "apartment-sale" | "plot-sale" | "investment" | "size",
  filters: PropertyFilters,
  marketNote: string,
): LandingSpec {
  const isInvestment = intent === "investment";
  const isRent = intent.includes("rent");
  const typeLabel = intent.startsWith("house") ? "houses" : intent.startsWith("apartment") ? "apartments" : intent === "plot-sale" ? "plots" : "properties";
  const purposeWord = isRent ? "rent" : "sale";
  return {
    slug,
    h1,
    eyebrow: `${cityName} property ${isInvestment ? "investment" : purposeWord}`,
    metaTitle: isInvestment
      ? `Property Investment in ${cityName} | Market Guide & Tools | Pak Property`
      : `${h1} | Pak Property`,
    metaDescription: isInvestment
      ? `Explore property investment in ${cityName}, including residential, rental, plots, commercial opportunities, location factors, risk considerations and calculators.`
      : `Explore sample ${typeLabel} for ${purposeWord} in ${cityName}. Compare locations, prices, sizes and property details with market guides and Pak Property tools.`,
    keywords: isInvestment
      ? [`property investment in ${cityName}`, `real estate investment ${cityName}`, `best areas to invest ${cityName}`]
      : [h1.toLowerCase(), `${cityName} property`, `${typeLabel} in ${cityName}`],
    filters,
    alternatives: { city },
    intro: [
      marketNote,
      isInvestment
        ? `A sound ${cityName} investment case starts with location utility, comparable pricing, realistic rent and exit liquidity. Residential, plot and commercial assets respond to different demand drivers, so compare them as separate strategies.`
        : `This curated page presents illustrative ${typeLabel} in ${cityName}. Use the filters and comparison tools to evaluate asking price, area, furnishing, possession and location before moving into a society guide.`,
      isInvestment
        ? "Model rental yield, total ownership cost and downside scenarios before committing. No appreciation, rent or return is guaranteed, and every real purchase requires independent legal and financial verification."
        : "Inventory and price references are demonstration data. Independently verify title, dues, approvals, property condition and transfer requirements in any real transaction.",
    ],
    facets: [
      { label: `Property for sale in ${cityName}`, href: `/property-for-sale-in-${city}`, note: "All sample sale inventory" },
      { label: `Property for rent in ${cityName}`, href: `/property-for-rent-in-${city}`, note: "All sample rental inventory" },
      { label: `Commercial property in ${cityName}`, href: `/commercial-property-in-${city}`, note: "Offices, shops and income assets" },
      { label: "Pakistan property directory", href: "/property-for-sale-in-pakistan", note: "Compare other cities" },
    ],
    priceBands: isInvestment
      ? [
          { label: "Residential income", range: "Houses, portions and apartments", note: "Rent, vacancy and maintenance drive net yield" },
          { label: "Land strategy", range: "Plots and documented files", note: "Development and liquidity drive outcomes" },
          { label: "Commercial", range: "Offices, shops and buildings", note: "Lease quality and replacement demand matter" },
        ]
      : [
          { label: "Entry", range: `Compact ${typeLabel} and secondary locations`, note: "Condition and documentation remain critical" },
          { label: "Family", range: `Established ${cityName} neighbourhoods`, note: "Broadest end-user demand" },
          { label: "Premium", range: "Prime societies and newer inventory", note: "Higher entry price and stronger amenities" },
        ],
    notes: [
      { title: "Micro-location", copy: `Compare blocks and streets inside ${cityName}, not only city-wide averages.` },
      { title: isInvestment ? "Income assumptions" : "Property condition", copy: isInvestment ? "Use achievable net rent after vacancy, maintenance and management—not advertised gross rent." : "Inspect utilities, structure, ventilation, access and maintenance during a working hour." },
      { title: "Documentation", copy: "Verify ownership, dues, approval status and the current transfer process before payment." },
    ],
    faqs: [
      { question: `How should I compare ${typeLabel} in ${cityName}?`, answer: `Compare the same property type in the same micro-location using price per square foot, condition, access, amenities, documentation and likely resale or tenant demand.` },
      { question: isInvestment ? `Is property investment in ${cityName} guaranteed to appreciate?` : `Are these real ${cityName} listings?`, answer: isInvestment ? "No. Capital appreciation and rental income are uncertain and depend on entry price, infrastructure, demand, documentation and market conditions." : "No. Pak Property is a WordbitX demonstration platform, and the inventory and market figures are illustrative sample content." },
    ],
    related: [
      { label: "Pakistan real estate keyword guide", href: "/keywords-for-pakistan" },
      { label: "Property investment in Pakistan", href: "/property-investment-in-pakistan" },
      ...CORE_TOOLS,
    ],
  };
}

SPECS.push(
  cityIntentSpec(
    "houses-for-rent-in-lahore",
    "Houses for Rent in Lahore",
    "lahore",
    "Lahore",
    "house-rent",
    { purpose: "rent", city: "lahore", category: "house" },
    "Lahore’s house-rental market serves relocating families, corporate tenants and households seeking access to established schools, employment and secure societies.",
  ),
  cityIntentSpec(
    "apartments-for-rent-in-lahore",
    "Apartments for Rent in Lahore",
    "lahore",
    "Lahore",
    "apartment-rent",
    { purpose: "rent", city: "lahore", category: "apartment" },
    "Lahore apartment demand is strongest around Gulberg, Johar Town and employment corridors where furnished and managed units reduce commute and maintenance burden.",
  ),
  cityIntentSpec(
    "property-investment-in-lahore",
    "Property Investment in Lahore",
    "lahore",
    "Lahore",
    "investment",
    { city: "lahore", purpose: "buy" },
    "Lahore has Pakistan’s broadest mix of mature societies, family housing, commercial districts and developing plot markets, giving investors several distinct strategies rather than one city-wide trade.",
  ),
  cityIntentSpec(
    "5-marla-house-for-sale-in-lahore",
    "5 Marla House for Sale in Lahore",
    "lahore",
    "Lahore",
    "size",
    { city: "lahore", purpose: "buy", category: "house", q: "5 Marla" },
    "Five Marla houses are Lahore’s most accessible complete-home format, balancing multiple bedrooms with a manageable purchase and maintenance budget.",
  ),
  cityIntentSpec(
    "10-marla-house-for-sale-in-lahore",
    "10 Marla House for Sale in Lahore",
    "lahore",
    "Lahore",
    "size",
    { city: "lahore", purpose: "buy", category: "house", q: "10 Marla" },
    "Ten Marla houses sit at the centre of Lahore’s family market, providing larger living areas, two-car parking and flexible double-storey layouts across established societies.",
  ),
  cityIntentSpec(
    "1-kanal-house-for-sale-in-lahore",
    "1 Kanal House for Sale in Lahore",
    "lahore",
    "Lahore",
    "size",
    { city: "lahore", purpose: "buy", category: "house", q: "1 Kanal" },
    "One Kanal houses and villas form Lahore’s premium residential segment, where street, plot dimensions, construction quality and basement utility create major pricing differences.",
  ),
  cityIntentSpec(
    "plots-for-sale-in-islamabad",
    "Plots for Sale in Islamabad",
    "islamabad",
    "Islamabad",
    "plot-sale",
    { city: "islamabad", purpose: "buy", category: "plot" },
    "Islamabad’s plot market spans developed capital sectors and planned private communities, with approval, access and infrastructure delivery central to value.",
  ),
  cityIntentSpec(
    "property-investment-in-islamabad",
    "Property Investment in Islamabad",
    "islamabad",
    "Islamabad",
    "investment",
    { city: "islamabad", purpose: "buy" },
    "Islamabad combines planned infrastructure, constrained sector supply and institutional rental demand, supporting distinct plot, apartment and residential-income strategies.",
  ),
  cityIntentSpec(
    "houses-for-sale-in-karachi",
    "Houses for Sale in Karachi",
    "karachi",
    "Karachi",
    "house-sale",
    { city: "karachi", purpose: "buy", category: "house" },
    "Karachi’s house market ranges from premium DHA and Clifton addresses to family inventory in Scheme 33 and established neighbourhoods, with water, access and documentation critical.",
  ),
  cityIntentSpec(
    "apartments-for-sale-in-karachi",
    "Apartments for Sale in Karachi",
    "karachi",
    "Karachi",
    "apartment-sale",
    { city: "karachi", purpose: "buy", category: "apartment" },
    "Karachi has Pakistan’s deepest apartment market, spanning family flats, serviced residences and sea-facing premium towers across DHA, Clifton, Bahria Town and central districts.",
  ),
  cityIntentSpec(
    "plots-for-sale-in-karachi",
    "Plots for Sale in Karachi",
    "karachi",
    "Karachi",
    "plot-sale",
    { city: "karachi", purpose: "buy", category: "plot" },
    "Karachi plot decisions depend on approval, lease status, infrastructure, water and access to employment corridors; these factors vary significantly across schemes.",
  ),
  cityIntentSpec(
    "property-investment-in-karachi",
    "Property Investment in Karachi",
    "karachi",
    "Karachi",
    "investment",
    { city: "karachi", purpose: "buy" },
    "Karachi offers Pakistan’s broadest commercial tenant base and mature apartment demand, alongside higher building-management and infrastructure complexity.",
  ),
);

const LANDINGS = new Map<string, LandingContent>(
  SPECS.map((spec) => [
    spec.slug,
    {
      slug: spec.slug,
      kind: spec.slug.includes("investment") ? "guide" : "type-city",
      eyebrow: spec.eyebrow,
      h1: spec.h1,
      metaTitle: spec.metaTitle,
      metaDescription: spec.metaDescription,
      keywords: spec.keywords,
      intro: spec.intro,
      filters: spec.filters,
      alternatives: spec.alternatives,
      facets: spec.facets,
      societies: spec.slug.includes("pakistan") ? PAKISTAN_CITIES.slice(0, 6).map((item) => ({ name: item.label, href: item.href, note: item.note })) : [],
      priceBands: spec.priceBands,
      insightNotes: spec.notes,
      faqs: spec.faqs,
      relatedLinks: spec.related,
    },
  ]),
);

export function resolveKeywordLanding(slug: string): LandingContent | null {
  return LANDINGS.get(slug) ?? null;
}

export function getAllKeywordLandingSlugs(): string[] {
  return [...LANDINGS.keys()];
}

export { PAKISTAN_CITIES, PAKISTAN_RENT_CITIES };
