import { photo, photos } from "@/lib/images";

export type PostLink = { label: string; href: string };

export type ExtraPost = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string[];
  author: string;
  readMinutes: number;
  tags: string[];
  image: number;
  links: PostLink[];
};

/** Internal links for the original article set — builds the topical SEO network. */
export const POST_LINKS: Record<string, PostLink[]> = {
  "best-areas-to-buy-property-in-lahore": [
    { label: "Property for sale in Lahore", href: "/property-for-sale-in-lahore" },
    { label: "Houses for sale in Lahore", href: "/houses-for-sale-in-lahore" },
    { label: "Apartments for sale in Lahore", href: "/apartments-for-sale-in-lahore" },
    { label: "DHA Lahore property guide", href: "/property-for-sale/dha-lahore" },
    { label: "Bahria Town Lahore guide", href: "/property-for-sale/bahria-town-lahore" },
    { label: "Gulberg Lahore", href: "/property-for-sale/gulberg-lahore" },
    { label: "Affordability calculator", href: "/tools/affordability-calculator" },
  ],
  "property-investment-islamabad-guide": [
    { label: "Property for sale in Islamabad", href: "/property-for-sale-in-islamabad" },
    { label: "Apartments for sale in Islamabad", href: "/apartments-for-sale-in-islamabad" },
    { label: "DHA Islamabad guide", href: "/property-for-sale/dha-islamabad" },
    { label: "Blue Area offices", href: "/property-for-sale/blue-area-islamabad" },
    { label: "Investment projection tool", href: "/tools/investment-calculator" },
  ],
  "dha-vs-bahria-town-comparison": [
    { label: "DHA Lahore", href: "/property-for-sale/dha-lahore" },
    { label: "Bahria Town Lahore", href: "/property-for-sale/bahria-town-lahore" },
    { label: "DHA Karachi", href: "/property-for-sale/dha-karachi" },
    { label: "Bahria Town Karachi", href: "/property-for-sale/bahria-town-karachi" },
    { label: "Property documentation checklist", href: "/blog/property-documentation-checklist-pakistan" },
  ],
  "commercial-property-investment-pakistan": [
    { label: "Commercial property in Lahore", href: "/commercial-property-in-lahore" },
    { label: "Commercial property in Islamabad", href: "/commercial-property-in-islamabad" },
    { label: "Commercial property in Karachi", href: "/commercial-property-in-karachi" },
    { label: "Rental yield calculator", href: "/tools/rental-yield-calculator" },
    { label: "ROI calculator", href: "/tools/roi-calculator" },
  ],
  "rental-property-guide-pakistan": [
    { label: "Property for rent in Lahore", href: "/property-for-rent-in-lahore" },
    { label: "Property for rent in Karachi", href: "/property-for-rent-in-karachi" },
    { label: "Rental yield calculator", href: "/tools/rental-yield-calculator" },
    { label: "Property for rent in Islamabad", href: "/property-for-rent-in-islamabad" },
  ],
  "buying-property-in-pakistan-checklist": [
    { label: "Property documentation checklist", href: "/blog/property-documentation-checklist-pakistan" },
    { label: "Mortgage calculator", href: "/tools/mortgage-calculator" },
    { label: "Property for sale in Lahore", href: "/property-for-sale-in-lahore" },
    { label: "Property for sale in Karachi", href: "/property-for-sale-in-karachi" },
    { label: "Rent vs buy calculator", href: "/tools/rent-vs-buy-calculator" },
  ],
};

/** Topic-cluster articles added in the upgrade. */
export const EXTRA_POSTS: ExtraPost[] = [
  {
    slug: "property-documentation-checklist-pakistan",
    title: "Property Documentation Checklist for Pakistan",
    category: "Guides",
    excerpt:
      "The exact paperwork sequence to work through before releasing a token payment — allotment letters, dues statements, chain of title, NOCs and the transfer itself.",
    body: [
      "Most property disputes in Pakistan trace back to paperwork, not to price. Before any token payment, establish that the seller can actually transfer clean title, and that no charge, mortgage or society restriction sits on the property.",
      "Start with the primary document. In a society, that means the allotment letter in the current owner's name, plus every transfer letter in the chain. In older city areas it may be a registry, mutation (intiqal) or a court-decree-backed title. Compare the document description of the property against the physical plot: size, dimensions, road width and corner status should match exactly.",
      "Next, request dues clearance in writing. A society dues statement should show all charges cleared up to the intended transfer date and should state whether development, utility or betterment charges remain payable. In older areas, confirm municipal property tax and any outstanding utility arrears on the specific meter or connection.",
      "Then confirm authority position. For private housing schemes, check the approval status with the relevant development authority and confirm there is no layout or land-use conflict affecting your plot. For constructed property, keep the approved building plan on file, because unapproved covered area or extra floors can complicate both transfer and financing.",
      "Draft the agreement precisely. Record the property description, total price, payment schedule against documented milestones, possession date, and who bears transfer fees, taxes and documentation charges. Ambiguity here is what creates later disputes.",
      "Finally, complete the transfer at the authorised office with both parties present or represented under a written authority, and keep certified copies of everything you sign. If you cannot explain your own file from first page to last, you are not ready to pay.",
    ],
    author: "Pak Property Research",
    readMinutes: 7,
    tags: ["Documentation", "Buying Guide", "Legal"],
    image: photos.dev[7],
    links: [
      { label: "Buying property in Pakistan checklist", href: "/blog/buying-property-in-pakistan-checklist" },
      { label: "Property for sale in Lahore", href: "/property-for-sale-in-lahore" },
      { label: "Property for sale in Islamabad", href: "/property-for-sale-in-islamabad" },
      { label: "Property for sale in Karachi", href: "/property-for-sale-in-karachi" },
      { label: "Mortgage calculator", href: "/tools/mortgage-calculator" },
    ],
  },
  {
    slug: "property-prices-in-lahore",
    title: "Property Prices in Lahore: How to Read the Market",
    category: "Lahore",
    excerpt:
      "How to interpret Lahore price per square foot across DHA phases, Bahria Town, Gulberg and Johar Town — and why two seemingly similar houses can differ by 40%.",
    body: [
      "Lahore does not have one property market. It has a dozen, each with its own buyer pool, liquidity and pricing logic. Comparing a 10 Marla house in DHA Phase 6 with one in Johar Town on price alone will always mislead, because you are buying different things: access, society management, and the depth of the resale market.",
      "Start with price per square foot rather than headline price. It normalises plot size and highlights whether a property is priced in line with its neighbours. In our illustrative demo benchmark we use around PKR 9,000 to 13,500 per square foot for developed DHA and Gulberg sectors, materially higher than outer schemes.",
      "Within DHA, phase and block matter more than most buyers expect. A 1 Kanal plot on a wide boulevard inside Phase 5 can trade well above an equivalent plot at the edge of a newer phase, purely because of frontage, road width and the depth of demand in that specific block.",
      "Bahria Town prices on lifestyle and amenity access. Buyers pay for organisation, internal transport, schooling and security. The trade-off appears in recurring society charges and in distance from central Lahore, both of which affect net yield and resale speed.",
      "Gulberg and Model Town price on centrality and scarcity. Inventory is limited, plots are larger and older construction is common, so renovation budgets decide whether a purchase works. Johar Town and Wapda Town sit at a more predictable entry point with larger supply and consistent family demand.",
      "Practical method: pick three genuinely comparable properties in the same society, calculate price per square foot for each, then adjust for road width, construction age, orientation and possession status. You will usually find your answer within that band rather than from a city-wide average.",
    ],
    author: "Pak Property Research",
    readMinutes: 6,
    tags: ["Lahore", "Market Insight", "Pricing"],
    image: photos.cities.lahore,
    links: [
      { label: "Property for sale in Lahore", href: "/property-for-sale-in-lahore" },
      { label: "Houses for sale in Lahore", href: "/houses-for-sale-in-lahore" },
      { label: "Plots for sale in Lahore", href: "/plots-for-sale-in-lahore" },
      { label: "DHA Lahore guide", href: "/property-for-sale/dha-lahore" },
      { label: "Johar Town guide", href: "/property-for-sale/johar-town-lahore" },
    ],
  },
  {
    slug: "best-areas-to-buy-property-in-karachi",
    title: "Best Areas to Buy Property in Karachi",
    category: "Karachi",
    excerpt:
      "DHA, Clifton, Bahria Town and PECHS compared on entry price, apartment vs house supply, rental demand and the maintenance costs buyers underestimate.",
    body: [
      "Karachi rewards buyers who understand sectors and corridors rather than city-wide averages. The city's transaction volume is concentrated in a handful of areas, and each behaves differently in an economic slowdown.",
      "DHA Karachi offers the deepest resale market and the widest apartment supply. Phases 5, 6 and 8 are the most liquid, with good access to commercial belts, schools and hospitals. Building quality varies significantly between towers, so maintenance history matters as much as location.",
      "Clifton skews towards larger apartments and penthouses with sea-facing premiums. Comparable transactions are fewer, which makes valuation less predictable and negotiation more important. Verify lift, generator and maintenance arrangements closely.",
      "Bahria Town Karachi provides scale and organisation on the city's eastern edge. Furnished and serviced apartments here let steadily to corporate tenants, provided management of utilities and housekeeping is properly in place. The commute is longer, and buyers should weigh that honestly.",
      "PECHS, Gulshan and North Nazimabad remain the value belt for builder-floor units and family flats. Entry prices are lower and demand is steady, particularly for well-maintained middle-floor units with parking.",
      "Whatever the area, ask three questions before committing: what are the recurring maintenance charges, what one-time upgrades are pending in the building, and how many comparable units traded in the last two quarters. Those three answers explain most of the difference between a comfortable purchase and an expensive one.",
    ],
    author: "Bilal Shaikh",
    readMinutes: 6,
    tags: ["Karachi", "Buying Guide", "Apartments"],
    image: photos.cities.karachi,
    links: [
      { label: "Property for sale in Karachi", href: "/property-for-sale-in-karachi" },
      { label: "DHA Karachi guide", href: "/property-for-sale/dha-karachi" },
      { label: "Clifton guide", href: "/property-for-sale/clifton-karachi" },
      { label: "Bahria Town Karachi guide", href: "/property-for-sale/bahria-town-karachi" },
      { label: "Commercial property in Karachi", href: "/commercial-property-in-karachi" },
    ],
  },
  {
    slug: "karachi-rental-property-guide",
    title: "Karachi Rental Property Guide for Landlords",
    category: "Karachi",
    excerpt:
      "How corporate leasing actually works in Karachi: lease terms, escalation, fit-out responsibility, maintenance expectations and how to price a unit accurately.",
    body: [
      "Karachi's rental market is unusual in Pakistan because so much of it is corporate. Banks, logistics companies, BPOs, airlines and multinationals lease office floors and furnished apartments, often on multi-year terms with negotiated escalation.",
      "Start pricing from comparable units in the same building or street, not from city averages. Corporate tenants compare systematically, and an above-market ask usually results in a longer void rather than a better rate.",
      "Understand what the tenant expects. Corporate leases normally require working air conditioning, reliable backup power, secure parking and functioning lifts. If any of these are unreliable, expect discounts or a short lease.",
      "Escalation clauses are standard, commonly 5–10% annually. Record clearly who handles maintenance, what constitutes fair wear and tear, and how utilities are billed. Ambiguity here is the most common source of end-of-tenancy disputes.",
      "Furnished and serviced units earn more per square foot but only where management is professional — housekeeping, appliance replacement and fast turnaround all need budgeting. Model those as costs, not as rent.",
      "Finally, keep a maintenance reserve of roughly one month's rent per year. Small repairs delayed become tenant complaints, and tenant complaints become vacancy in a competitive corporate market.",
    ],
    author: "Pak Property Research",
    readMinutes: 5,
    tags: ["Karachi", "Rental Guide", "Landlord"],
    image: photos.interiors[9],
    links: [
      { label: "Property for rent in Karachi", href: "/property-for-rent-in-karachi" },
      { label: "Bahria Town Karachi rentals", href: "/property-for-sale/bahria-town-karachi" },
      { label: "Rental yield calculator", href: "/tools/rental-yield-calculator" },
      { label: "Rental property guide", href: "/blog/rental-property-guide-pakistan" },
    ],
  },
  {
    slug: "house-vs-plot-investment-pakistan",
    title: "House vs Plot Investment in Pakistan",
    category: "Investment",
    excerpt:
      "A structured comparison of income, carrying cost, liquidity and documentation risk between constructed property and land in Pakistani cities.",
    body: [
      "The house-versus-plot question is really a question about what you want the asset to do. Appreciation, income and carrying cost pull in different directions, and the right answer depends on your horizon.",
      "Plots have the lowest carrying cost. There is no tenant, no maintenance and no fit-out. That makes them attractive for long holds, provided the society's development continues and dues stay cleared. The risk is documentation and delivery: a plot in a scheme that stalls takes a long time to recover its value.",
      "Constructed houses produce income. A rented house covers part of its own cost and provides a measurable yield, but maintenance, repairs and tenant turnover consume part of that rent. Older stock needs modernisation budgeting before it can be let competitively.",
      "Liquidity differs by format. In mature societies, houses trade more frequently than raw plots because end users drive demand. In newer schemes, plot and file trading usually dominates.",
      "Documentation risk is broadly comparable, but the failure modes differ. Plot disputes tend to involve dues, informal transfers and stalled development. House disputes tend to involve unapproved construction, boundary encroachment and incomplete utility connections.",
      "A practical middle path for many investors is a plot in a society whose infrastructure is already visibly delivered, held alongside one income-producing unit elsewhere. That combination gives you both low carrying cost and a real rental return, while spreading exposure across two different demand drivers.",
    ],
    author: "Pak Property Research",
    readMinutes: 6,
    tags: ["Investment", "Plots", "Houses"],
    image: photos.dev[5],
    links: [
      { label: "Plots for sale in Lahore", href: "/plots-for-sale-in-lahore" },
      { label: "Houses for sale in Lahore", href: "/houses-for-sale-in-lahore" },
      { label: "DHA Multan guide", href: "/property-for-sale/dha-multan" },
      { label: "Investment projection tool", href: "/tools/investment-calculator" },
      { label: "Pakistan property investment guide", href: "/property-investment-in-pakistan" },
    ],
  },
  {
    slug: "real-estate-investment-mistakes-pakistan",
    title: "Real Estate Investment Mistakes in Pakistan",
    category: "Investment",
    excerpt:
      "Nine recurring mistakes our desk sees in Pakistani property transactions — from relying on verbal dues clearance to ignoring carrying cost and exit liquidity.",
    body: [
      "Most investment losses in Pakistani property are not caused by picking the wrong city. They come from predictable process errors that are cheap to avoid and expensive to discover late.",
      "Relying on verbal dues clearance is the first. If the dues position is not documented in writing from the society or authority, assume it may become yours to resolve.",
      "Second is pricing from sentiment instead of comparables. A seller's expected price is not market evidence. Three genuinely comparable transactions or live listings in the same society are.",
      "Third is ignoring carrying cost. Society charges, municipal taxes, utilities and maintenance continue whether or not the property is earning. Over a five-year hold these can materially erode a return that looked attractive at entry.",
      "Fourth is under-estimating renovation. Older houses usually need rewiring, plumbing, waterproofing and finishing. Allocating 10–20% of purchase price is a working rule of thumb, not pessimism.",
      "Fifth is buying unapproved construction. Extra floors and covered areas that breach the approved plan complicate transfer, financing and future resale.",
      "Sixth is over-leveraging on an instalment plan. Compare the plan's effective cost against a negotiated cash price before assuming the plan is cheaper.",
      "Seventh is confusing amenities with fundamentals. A themed entrance does not fix a weak commute or thin resale demand.",
      "Eighth is ignoring exit liquidity — ask how many comparable units trade each quarter. Ninth is skipping independent advice. For high-value transactions, a lawyer experienced in that city's property practice and a qualified valuer cost far less than a disputed file.",
    ],
    author: "Pak Property Research",
    readMinutes: 7,
    tags: ["Investment", "Risk", "Guides"],
    image: photos.commercial[0],
    links: [
      { label: "Pakistan property investment guide", href: "/property-investment-in-pakistan" },
      { label: "Documentation checklist", href: "/blog/property-documentation-checklist-pakistan" },
      { label: "DHA vs Bahria Town", href: "/blog/dha-vs-bahria-town-comparison" },
      { label: "Rental yield calculator", href: "/tools/rental-yield-calculator" },
      { label: "Property tax calculator", href: "/tools/property-tax-calculator" },
    ],
  },
  {
    slug: "fbr-property-tax-guide-pakistan",
    title: "FBR Property Tax and Charges: A Practical Overview",
    category: "Tax & Costs",
    excerpt:
      "An orientation to the taxes and charges that typically apply when buying, holding and selling property in Pakistan — with tools to model them.",
    body: [
      "Tax rules in Pakistan change with each Finance Act, and treatment depends on your filer status, holding period and the nature of the transaction. This article is an orientation, not tax advice — confirm current rates with FBR or a tax practitioner before you transact.",
      "At purchase, buyers should budget for transfer-related charges, stamp duty and registration, plus any society transfer fee. The applicable rates and collection mechanism vary between provinces and societies, so ask for the current schedule rather than working from an older estimate.",
      "Where a property is income-producing, rental income falls within the tax framework, with withholding applied by certain tenants and adjustable against your annual liability. Keep documented records of rent, maintenance expenses and any management fees.",
      "On disposal, capital gains treatment generally depends on how long the property was held, with the rate structure changing across holding periods. Maintain evidence of your acquisition cost, improvement spending and the sale date — these determine how your gain is computed.",
      "Holding costs are often overlooked: municipal property tax, society maintenance, utilities on vacant property and insurance where applicable. Over a long hold, these collectively exceed the headline one-time transaction taxes.",
      "Use the Pak Property property tax calculator to get an illustrative estimate of purchase and disposal charges, then verify every figure against current FBR and provincial guidance.",
    ],
    author: "Pak Property Research",
    readMinutes: 6,
    tags: ["Tax & Costs", "Investment", "Guides"],
    image: photos.cities.islamabadAlt,
    links: [
      { label: "Property tax calculator", href: "/tools/property-tax-calculator" },
      { label: "ROI calculator", href: "/tools/roi-calculator" },
      { label: "Pakistan property investment guide", href: "/property-investment-in-pakistan" },
      { label: "Documentation checklist", href: "/blog/property-documentation-checklist-pakistan" },
    ],
  },
  {
    slug: "rent-vs-buy-in-pakistan",
    title: "Rent vs Buy in Pakistan: How to Decide",
    category: "Guides",
    excerpt:
      "When buying in Pakistan genuinely beats renting — and when it does not. A framework covering instalment load, opportunity cost, mobility and time horizon.",
    body: [
      "The rent-versus-buy question is usually framed emotionally. It is better handled arithmetically first, then adjusted for how long you actually plan to stay.",
      "Begin with the instalment load. If a financed purchase pushes housing outgoings beyond roughly 35–40% of net household income, the decision becomes fragile — a rate change or a job change can force a distressed sale.",
      "Then compare total cost of ownership against rent over your realistic horizon. Ownership carries transfer taxes, maintenance, society charges and the opportunity cost of your down payment. Renting carries none of those, but builds no equity and exposes you to rent escalation.",
      "Mobility matters. If your housing need may change materially within three years — a job move, a child's schooling, a change of city — renting is usually the cheaper option even when monthly rent exceeds a comparable instalment.",
      "In Pakistan there is one additional variable: currency and rate environment. Long-tenure financing at a floating rate behaves very differently from a fixed-rate assumption. Model both a base case and a stress case before committing.",
      "Use the rent vs buy calculator to see cumulative cost under your own assumptions, then sanity-check the output against the fact that property in Pakistan is relatively illiquid — selling can take months, not weeks.",
    ],
    author: "Pak Property Research",
    readMinutes: 6,
    tags: ["Guides", "Rent", "Buying Guide"],
    image: photos.interiors[3],
    links: [
      { label: "Rent vs buy calculator", href: "/tools/rent-vs-buy-calculator" },
      { label: "Affordability calculator", href: "/tools/affordability-calculator" },
      { label: "Mortgage calculator", href: "/tools/mortgage-calculator" },
      { label: "Property for rent in Lahore", href: "/property-for-rent-in-lahore" },
      { label: "Property for sale in Lahore", href: "/property-for-sale-in-lahore" },
    ],
  },
  {
    slug: "construction-cost-guide-pakistan",
    title: "Construction Cost Guide for Pakistan",
    category: "Guides",
    excerpt:
      "How grey structure, finishing and service costs stack up per square foot in Pakistan, and how to budget a build without under-allocating contingencies.",
    body: [
      "Building on a plot gives you exactly what you want, at the cost of time, supervision and price risk on materials. Budgeting accurately is the difference between a two-year project and a stalled one.",
      "Construction cost in Pakistan is best discussed per square foot of covered area, split into stages. Grey structure covers foundation, RCC frame, blockwork, plaster and roofing. Finishing covers flooring, doors, windows, kitchens and bathrooms. Services cover electrical, plumbing, HVAC provision and solar readiness.",
      "Rates move with material prices, so treat any per-square-foot figure as a range. In our construction cost calculator we use illustrative tiers from economy to luxury construction, and the spread between the lowest and highest tier is typically two to three times, not twenty per cent.",
      "Contingency is the most commonly under-budgeted line. Allocate 10–15% of the estimated build cost for design changes, site conditions and material price movement over the construction period.",
      "Add the costs that are not construction: consultant and architect fees, approval charges, utility connection fees and site security over the build period. On premium builds these can add meaningful amounts.",
      "If you are financing the build, model the interest during construction separately — an instalment that starts before the house is habitable is a common source of strain.",
    ],
    author: "Pak Property Research",
    readMinutes: 6,
    tags: ["Guides", "Construction", "Costs"],
    image: photos.dev[1],
    links: [
      { label: "Construction cost calculator", href: "/tools/construction-cost-calculator" },
      { label: "Plots for sale in Lahore", href: "/plots-for-sale-in-lahore" },
      { label: "Mortgage calculator", href: "/tools/mortgage-calculator" },
      { label: "Documentation checklist", href: "/blog/property-documentation-checklist-pakistan" },
    ],
  },
  {
    slug: "bahria-town-vs-dha-islamabad",
    title: "Choosing Between DHA and Bahria Enclave in Islamabad",
    category: "Islamabad",
    excerpt:
      "Two of the capital's most searched addresses compared on approvals, infrastructure delivery, pricing bands, tenant profile and recurring charges.",
    body: [
      "Islamabad buyers frequently narrow to DHA and Bahria Town developments, and the comparison is genuinely close. Both are organised, both carry recognised management, and both offer alternatives to older sector housing.",
      "DHA Islamabad brings the capital's sector discipline and a strong institutional tenant base. Phase 1 is largely developed, with Phase 2 and Phase 5 adding newer supply close to the expressway. Plots here are typically priced above comparable Bahria Town inventory.",
      "Bahria Enclave offers a hillside setting with a wide mix of plot and house inventory, priced lower at entry. Infrastructure and amenity delivery has varied by sector, so confirming current development status for the specific plot is essential rather than optional.",
      "Tenant profiles differ. DHA attracts embassy, development-sector and corporate tenants with longer tenures. Bahria Enclave sees a broader mix of families and professionals, with demand spread across more unit types.",
      "Recurring charges matter over a ten-year hold. Compare the current maintenance rate cards, and ask separately about development charges, water supply arrangements and any planned infrastructure levies.",
      "Neither area is straightforwardly better. Buy DHA for liquidity and institutional demand; buy Bahria for entry pricing and space, provided you have independently confirmed the delivery status of the exact sector.",
    ],
    author: "Ayesha Noor",
    readMinutes: 6,
    tags: ["Islamabad", "DHA", "Bahria Town"],
    image: photos.cities.islamabad,
    links: [
      { label: "Property for sale in Islamabad", href: "/property-for-sale-in-islamabad" },
      { label: "DHA Islamabad guide", href: "/property-for-sale/dha-islamabad" },
      { label: "Blue Area offices", href: "/property-for-sale/blue-area-islamabad" },
      { label: "DHA vs Bahria Town comparison", href: "/blog/dha-vs-bahria-town-comparison" },
      { label: "Affordability calculator", href: "/tools/affordability-calculator" },
    ],
  },
];
