import { CITY_PPSF_BENCHMARK } from "@/lib/score";
import type { PropertyFilters } from "@/lib/queries";

export type LandingKind = "city-sale" | "city-rent" | "type-city" | "guide";

export type LandingContent = {
  slug: string;
  kind: LandingKind;
  eyebrow: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  intro: string[];
  filters: PropertyFilters;
  alternatives?: PropertyFilters;
  facets: { label: string; href: string; note?: string }[];
  societies: { name: string; href: string; note: string }[];
  priceBands: { label: string; range: string; note: string }[];
  insightNotes: { title: string; copy: string }[];
  faqs: { question: string; answer: string }[];
  relatedLinks: { label: string; href: string }[];
};

type CityMarket = {
  slug: string;
  name: string;
  province: string;
  saleBand: string;
  rentBand: string;
  keyAreas: string[];
  character: string;
  saleSupply: string;
  rentTenants: string;
  investorAngle: string;
  accessNote: string;
  ppsf: string;
};

export const CITY_MARKETS: CityMarket[] = [
  {
    slug: "lahore",
    name: "Lahore",
    province: "Punjab",
    saleBand: "PKR 1.4 Crore – PKR 45 Crore+",
    rentBand: "PKR 45,000 – PKR 6 Lakh per month",
    keyAreas: ["DHA Lahore", "Bahria Town Lahore", "Gulberg", "Johar Town", "Model Town", "Askari"],
    character:
      "Lahore carries the widest spread of residential inventory in Pakistan: planned DHA phases, large private schemes such as Bahria Town, and established central districts including Gulberg, Model Town and Johar Town.",
    saleSupply:
      "Sale supply ranges from 5 Marla family houses in Johar Town and Wapda Town to 1 Kanal and 2 Kanal villas in DHA Phase 5, Phase 6 and Phase 8. Newer schemes on Bedian Road and the Ring Road belt add plot and file options with instalment plans.",
    rentTenants:
      "Lahore's rental market is driven by families relocating for work and schooling, corporate tenants leasing near Gulberg and MM Alam Road, and students around Johar Town and the Canal Road belt.",
    investorAngle:
      "DHA phases generally offer the most liquid resale market, while Bahria Town delivers lifestyle-led demand at a lower entry point. Plot-heavy schemes carry longer appreciation horizons but usually smaller carrying costs.",
    accessNote:
      "The Ring Road, Lahore-Islamabad Motorway link, Orange Line and the Main Boulevard network make commuting practical between central Lahore and the southern and eastern housing belts.",
    ppsf: "≈ PKR 9,000 – 13,500 per sq ft in developed DHA and Gulberg sectors",
  },
  {
    slug: "islamabad",
    name: "Islamabad",
    province: "Islamabad Capital Territory",
    saleBand: "PKR 1.8 Crore – PKR 60 Crore+",
    rentBand: "PKR 55,000 – PKR 8 Lakh per month",
    keyAreas: ["DHA Islamabad", "Blue Area", "Bahria Enclave", "Gulberg Greens", "F-sectors", "E-11"],
    character:
      "Islamabad is Pakistan's most deliberately planned property market — sector grids, protected green belts and regulated commercial zoning keep the capital's premium stable relative to other cities.",
    saleSupply:
      "Supply is split between sector houses in the F, G, E and D series, detached villas in DHA Phase 1 and Phase 2, and newer apartment and farmhouse formats in Gulberg Greens and Bahria Enclave.",
    rentTenants:
      "Tenants here are largely institutional: diplomatic missions, development-sector organisations, universities, hospitals and corporate offices leasing near Blue Area, F-11 and G-11 for long tenures.",
    investorAngle:
      "Plots and sector houses tend to deliver smoother capital preservation; purpose-built apartments near employment hubs produce steadier rental income. Institutional tenancies reduce vacancy risk but often negotiate longer payment cycles.",
    accessNote:
      "The Kashmir Highway, Islamabad Expressway, Srinagar Highway and Metro Bus corridor connect the capital with Rawalpindi, the airport and the northern housing schemes.",
    ppsf: "≈ PKR 10,500 – 16,000 per sq ft in DHA and developed sectors",
  },
  {
    slug: "karachi",
    name: "Karachi",
    province: "Sindh",
    saleBand: "PKR 1.6 Crore – PKR 90 Crore+",
    rentBand: "PKR 50,000 – PKR 10 Lakh per month",
    keyAreas: ["DHA Karachi", "Clifton", "Bahria Town Karachi", "Shahrah-e-Faisal", "PECHS", "Gulshan"],
    character:
      "Karachi is Pakistan's most commercially active property market. Apartment towers, high-street retail and office floors dominate supply, and rental yields for commercial assets generally lead the country.",
    saleSupply:
      "Sale inventory covers 2–4 bedroom apartments in DHA and Clifton, builder-floor units in PECHS and Gulshan, sea-facing penthouses, and multi-floor commercial buildings along Shahrah-e-Faisal and main arteries.",
    rentTenants:
      "Corporate leasing is the backbone of Karachi's rental market — banks, logistics firms, BPOs and multinationals lease offices and furnished apartments, usually on multi-year terms with annual escalation.",
    investorAngle:
      "Commercial and serviced apartment assets produce the strongest income, while DHA and Clifton apartments offer better liquidity than many other formats. Verify building maintenance charges and utility arrangements before committing.",
    accessNote:
      "Shahrah-e-Faisal, the Northern Bypass, Lyari Expressway and the Port Qasim corridor anchor commercial and logistics demand across the city.",
    ppsf: "≈ PKR 9,500 – 18,000 per sq ft depending on corridor and building age",
  },
  {
    slug: "rawalpindi",
    name: "Rawalpindi",
    province: "Punjab",
    saleBand: "PKR 90 Lakh – PKR 22 Crore",
    rentBand: "PKR 30,000 – PKR 3 Lakh per month",
    keyAreas: ["Bahria Town Phase 8", "Gulraiz", "Askari", "Adiala Road", "Chaklala Scheme 3"],
    character:
      "Rawalpindi gives buyers Islamabad access at a lower entry point. Family housing in established schemes and rental demand from the twin-city workforce drive most transactions.",
    saleSupply:
      "Typical inventory includes 5 and 10 Marla houses, 1 Kanal family homes in Gulraiz and Bahria Town Phase 8, and builder-floor apartments near Chaklala and the expressway.",
    rentTenants:
      "Tenants are mostly families working in Islamabad, serving personnel and students, which keeps smaller units and upper portions in consistent demand.",
    investorAngle:
      "Rental yields are comparatively healthy because purchase prices are lower, but resale liquidity depends heavily on scheme management quality and distance from the expressway.",
    accessNote:
      "The Islamabad Expressway, GT Road, Adiala Road and the Ring Road link Rawalpindi's schemes to the capital and the motorway network.",
    ppsf: "≈ PKR 6,800 – 10,500 per sq ft in developed schemes",
  },
  {
    slug: "faisalabad",
    name: "Faisalabad",
    province: "Punjab",
    saleBand: "PKR 65 Lakh – PKR 12 Crore",
    rentBand: "PKR 22,000 – PKR 1.8 Lakh per month",
    keyAreas: ["Eden Valley", "Wapda City", "D-Ground", "Madina Town", "Canal Road"],
    character:
      "Faisalabad's property market is closely tied to textile and manufacturing wealth. End-user demand dominates, with comparatively fewer speculative transactions than Lahore.",
    saleSupply:
      "Supply is concentrated in 5 and 10 Marla houses across Eden Valley, Wapda City and Madina Town, alongside plots in newer schemes off Canal Road and Jaranwala Road.",
    rentTenants:
      "Rental demand comes from factory management staff, medical professionals and families upgrading within the same neighbourhood.",
    investorAngle:
      "Longer tenancy cycles and moderate price growth make Faisalabad better suited to income-focused buyers than to short-horizon trading.",
    accessNote:
      "The M-4 Motorway connection, Canal Road and Jhang Road keep the industrial belt and housing schemes reasonably linked.",
    ppsf: "≈ PKR 6,000 – 9,000 per sq ft in established areas",
  },
  {
    slug: "multan",
    name: "Multan",
    province: "Punjab",
    saleBand: "PKR 55 Lakh – PKR 18 Crore",
    rentBand: "PKR 20,000 – PKR 2 Lakh per month",
    keyAreas: ["DHA Multan", "Buch Villas", "Shah Rukn-e-Alam", "Gulgasht Colony", "Wapda Town"],
    character:
      "South Punjab's most actively planned market. DHA Multan and Buch Villas are reshaping the city's housing map away from the older central colonies.",
    saleSupply:
      "Inventory spans 1 Kanal villas in Buch Villas, balloted plots in DHA Multan, and renovated houses in Gulgasht Colony and Shah Rukn-e-Alam.",
    rentTenants:
      "Medical, agriculture and education professionals form the core tenant base, with newer schemes attracting families moving out of dense central areas.",
    investorAngle:
      "Plot-focused investment in DHA Multan suits longer horizons; constructed villas in Buch Villas appeal to buyers wanting immediate occupancy and steady rents.",
    accessNote:
      "The Multan-Vehari Road, Bosan Road, Northern Bypass and the M-5 Motorway interchange anchor accessibility across the city.",
    ppsf: "≈ PKR 6,300 – 9,500 per sq ft in newer schemes",
  },
  {
    slug: "gujranwala",
    name: "Gujranwala",
    province: "Punjab",
    saleBand: "PKR 45 Lakh – PKR 9 Crore",
    rentBand: "PKR 18,000 – PKR 1.2 Lakh per month",
    keyAreas: ["Satellite Town", "Wapda Town", "Master City", "Peoples Colony", "GT Road"],
    character:
      "Gujranwala's market is steady and family-oriented, supported by the city's manufacturing base and its position between Lahore and the northern industrial corridor.",
    saleSupply:
      "Most transactions involve 5 and 10 Marla houses, 1 Kanal family homes in Satellite Town and plots in newer schemes on GT Road and Sialkot Road.",
    rentTenants:
      "Tenants are typically working families and personnel posted in the industrial belt who prefer gated schemes with security and backup power.",
    investorAngle:
      "Entry pricing is low and rental demand is reliable, but appreciation depends on infrastructure delivery in the newer schemes rather than on speculative trading.",
    accessNote:
      "The GT Road, Sialkot Road and the Lahore-Sialkot Motorway link the city to Lahore, Sialkot and the export-processing belt.",
    ppsf: "≈ PKR 5,600 – 8,200 per sq ft across established areas",
  },
  {
    slug: "peshawar",
    name: "Peshawar",
    province: "Khyber Pakhtunkhwa",
    saleBand: "PKR 50 Lakh – PKR 15 Crore",
    rentBand: "PKR 20,000 – PKR 1.5 Lakh per month",
    keyAreas: ["Hayatabad", "Regi Model Town", "University Town", "DHA Peshawar", "Warsak Road"],
    character:
      "Peshawar's demand is concentrated in gated, secure schemes with completed infrastructure — Hayatabad and Regi Model Town set the tone for how buyers evaluate newer supply.",
    saleSupply:
      "Supply includes 5 and 10 Marla houses in Hayatabad phases, plots in Regi Model Town and DHA Peshawar, and older bungalows in University Town requiring renovation.",
    rentTenants:
      "University staff, hospital professionals, development-sector employees and returning families form the tenant base, favouring units close to the university belt.",
    investorAngle:
      "Security of tenure and scheme management matter more here than headline pricing. Plots in approved phases suit patient investors seeking steady, low-volatility growth.",
    accessNote:
      "The Ring Road, University Road and the Motorway interchange at Charsadda Road connect the city's schemes to the wider corridor.",
    ppsf: "≈ PKR 5,900 – 8,800 per sq ft in developed phases",
  },
];

export const CITY_BY_SLUG = new Map(CITY_MARKETS.map((city) => [city.slug, city]));

/* ------------------------------------------------------------------ */
/*  Society / location pages                                           */
/* ------------------------------------------------------------------ */

export type SocietyEntry = {
  slug: string;
  name: string;
  citySlug: string;
  cityName: string;
  match: string;
  matchKind: "query" | "category";
  heroNote: string;
  inventoryNote: string;
  priceNote: string;
  investmentNote: string;
  nearby: string[];
  faqs: { question: string; answer: string }[];
};

export const SOCIETIES: SocietyEntry[] = [
  {
    slug: "dha-lahore",
    name: "DHA Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "DHA Phase",
    matchKind: "query",
    heroNote:
      "DHA Lahore is the benchmark against which most other Lahore addresses are priced. Stricter building controls, disciplined development and a consistently active resale market make it the most liquid residential belt in the city.",
    inventoryNote:
      "Our demo inventory in DHA Lahore currently covers villas and houses in Phase 2 and Phase 5, with plot and commercial listings added as they are onboarded.",
    priceNote:
      "Indicative demo pricing: 10 Marla houses from around PKR 4.5 Crore, 1 Kanal villas from around PKR 10 Crore, depending on phase, road width and construction quality.",
    investmentNote:
      "DHA suits buyers who value exit certainty over the lowest possible entry price. Confirmed dues clearance and a documented transfer history are the two checks that matter most.",
    nearby: ["dha-phase-5-lahore", "dha-phase-6-lahore", "bahria-town-lahore"],
    faqs: [
      {
        question: "Which DHA Lahore phase should I choose?",
        answer:
          "Phase 2 and Phase 5 are fully developed with mature landscaping and immediate occupancy; Phase 6 and Phase 8 suit buyers with a longer horizon who want newer construction and larger plot options.",
      },
      {
        question: "Is DHA Lahore a good rental market?",
        answer:
          "Yes. Corporate families and expatriate tenants rent in DHA because of security, schooling and access to main boulevards, which keeps vacancy periods short for well-maintained houses.",
      },
      {
        question: "What documents should I check before buying in DHA Lahore?",
        answer:
          "Request the allotment and transfer letters, a written dues statement up to the transfer date, the approved building plan where a house exists, and confirmation of the current transfer procedure from the DHA office.",
      },
    ],
  },
  {
    slug: "dha-phase-5-lahore",
    name: "DHA Phase 5 Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "DHA Phase 5",
    matchKind: "query",
    heroNote:
      "Phase 5 is one of DHA Lahore's most established and sought-after sectors, known for wide boulevards, mature trees, proximity to commercial hubs and a consistently strong resale market.",
    inventoryNote:
      "Current demo inventory in Phase 5 includes a 1 Kanal modern villa with a full basement, alongside related DHA and Bahria Town options for comparison.",
    priceNote:
      "Indicative demo pricing: 1 Kanal houses typically PKR 10 Crore – 22 Crore; 10 Marla houses PKR 6 Crore – 11 Crore depending on block and elevation.",
    investmentNote:
      "Phase 5 liquidity is among the strongest in Lahore, which shortens exit timeframes. Buyers should still confirm dues, approved plans and any society notices on the specific plot.",
    nearby: ["dha-lahore", "dha-phase-6-lahore", "gulberg-lahore"],
    faqs: [
      {
        question: "What does a 1 Kanal house in DHA Phase 5 cost?",
        answer:
          "In our demo data, 1 Kanal houses in Phase 5 sit in a PKR 10 Crore to 22 Crore band, with older construction near the lower end and newer designer builds with basements at the upper end.",
      },
      {
        question: "Is Phase 5 better for living or investing?",
        answer:
          "It performs well for both: end users get mature infrastructure and immediate access to schools and commercial areas, while investors benefit from the deepest buyer pool in DHA Lahore.",
      },
    ],
  },
  {
    slug: "dha-phase-6-lahore",
    name: "DHA Phase 6 Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "DHA Phase 6",
    matchKind: "query",
    heroNote:
      "Phase 6 combines newer construction with the DHA management standards buyers rely on, and it is often the compromise phase between Phase 5 pricing and Phase 8 supply.",
    inventoryNote:
      "We do not have live demo listings in Phase 6 at the moment, so the listings below show comparable DHA Lahore inventory you can shortlist instead.",
    priceNote:
      "Indicative demo pricing: 10 Marla houses from around PKR 5.5 Crore and 1 Kanal houses from around PKR 11 Crore, subject to block and road width.",
    investmentNote:
      "Newer sectors in Phase 6 attract buyers who want modern construction and fewer renovation costs, though the buyer pool is thinner than Phase 5 in a slow market.",
    nearby: ["dha-lahore", "dha-phase-5-lahore", "bahria-town-lahore"],
    faqs: [
      {
        question: "Is DHA Phase 6 fully developed?",
        answer:
          "Most sectors have roads, utilities and sewerage in place, but development status varies block by block — always confirm the current position for the specific plot before paying a token.",
      },
      {
        question: "How does Phase 6 pricing compare with Phase 5?",
        answer:
          "Phase 6 generally trades at a modest discount to Phase 5 for equivalent size, which narrows as newer construction and commercial amenities come online.",
      },
    ],
  },
  {
    slug: "bahria-town-lahore",
    name: "Bahria Town Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Bahria Town",
    matchKind: "query",
    heroNote:
      "Bahria Town Lahore offers a complete, self-contained lifestyle: internal transport, schools, hospitals, themed commercial areas and its own security infrastructure, usually at a lower entry price than DHA.",
    inventoryNote:
      "Demo inventory includes ready residential plots with cleared dues, plus related Lahore houses and villas for buyers who prefer constructed options.",
    priceNote:
      "Indicative demo pricing: 5 Marla plots from around PKR 9 Crore, 10 Marla plots from around PKR 19 Crore, and constructed houses from around PKR 4 Crore depending on sector.",
    investmentNote:
      "Recurring society charges and maintenance levies form part of ownership cost here. Development charges and possession status should be confirmed in writing before transfer.",
    nearby: ["dha-lahore", "johar-town-lahore", "bahria-town-phase-8-rawalpindi"],
    faqs: [
      {
        question: "What are the recurring costs in Bahria Town Lahore?",
        answer:
          "Expect monthly or annual society maintenance charges plus utility and security contributions. Ask for the current rate card and whether any development charges remain outstanding on the specific plot.",
      },
      {
        question: "Are plots or houses better in Bahria Town Lahore?",
        answer:
          "Plots suit buyers who want to build to their own specification and can wait for possession and construction. Ready houses command a premium but deliver immediate occupancy and rental income.",
      },
      {
        question: "How does Bahria Town Lahore compare with DHA Lahore?",
        answer:
          "Bahria Town offers scale, amenities and a lower entry price; DHA offers stricter building controls and stronger resale liquidity. The right choice depends on whether you prioritise lifestyle cost or exit certainty.",
      },
    ],
  },
  {
    slug: "johar-town-lahore",
    name: "Johar Town",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Johar Town",
    matchKind: "query",
    heroNote:
      "Johar Town is a practical, well-connected district that appeals to families wanting central Lahore access without DHA pricing. Blocks vary noticeably in age, layout and rental demand.",
    inventoryNote:
      "Demo inventory includes newly built apartments in Johar Town, with houses and plots available in surrounding blocks as listings are onboarded.",
    priceNote:
      "Indicative demo pricing: 5 Marla houses from around PKR 2.2 Crore, 10 Marla houses from around PKR 3.8 Crore, and 2-bedroom apartments for rent from around PKR 90,000 per month.",
    investmentNote:
      "The Expo Centre, university belt and Ring Road access keep rental demand steady. Smaller units and apartments let fastest in this district.",
    nearby: ["gulberg-lahore", "dha-lahore", "model-town-lahore"],
    faqs: [
      {
        question: "Which Johar Town blocks have the strongest rental demand?",
        answer:
          "Blocks closest to the university belt, Expo Centre and main Ferozepur Road access generally let fastest, particularly furnished or newly built small units.",
      },
      {
        question: "Is Johar Town good for first-time buyers?",
        answer:
          "Yes. Pricing is more predictable than in premium societies, inventory is larger, and Ring Road access makes commuting to other parts of Lahore practical.",
      },
    ],
  },
  {
    slug: "gulberg-lahore",
    name: "Gulberg Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Gulberg",
    matchKind: "query",
    heroNote:
      "Gulberg is Lahore's business and hospitality heart. Main Boulevard, MM Alam Road and Liberty Market keep commercial demand high and residential values resilient.",
    inventoryNote:
      "Demo inventory in Gulberg includes a fitted corporate office floor on Main Boulevard and a retail unit in Liberty Market, with residential listings added as they are onboarded.",
    priceNote:
      "Indicative demo pricing: commercial floors in Gulberg III commonly PKR 3.5 Crore – 8 Crore, retail units from around PKR 2 Crore, and furnished apartments for rent from around PKR 4 Lakh per month.",
    investmentNote:
      "Commercial assets here are judged on frontage, footfall, parking and building services. Reliable backup power and lift redundancy decide tenant retention more than rate per square foot alone.",
    nearby: ["model-town-lahore", "johar-town-lahore", "dha-phase-5-lahore"],
    faqs: [
      {
        question: "What is a fitted office floor in Gulberg worth?",
        answer:
          "Fitted floors in Gulberg III on Ferozepur Road and Main Boulevard typically price from about PKR 3.5 Crore, with newer buildings with parking and backup power at the higher end.",
      },
      {
        question: "Why is Gulberg popular with corporate tenants?",
        answer:
          "Central location, walkable hospitality and retail, and strong parking availability for senior staff make it the first choice for head offices and client-facing businesses.",
      },
    ],
  },
  {
    slug: "model-town-lahore",
    name: "Model Town",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Model Town",
    matchKind: "query",
    heroNote:
      "Model Town is one of Lahore's oldest planned residential districts — generous plot sizes, tree-lined roads and low-density living close to the city centre.",
    inventoryNote:
      "We do not have live demo inventory in Model Town yet; the listings below show comparable mature-district and DHA inventory in Lahore.",
    priceNote:
      "Indicative demo pricing: 1 Kanal houses commonly PKR 9 Crore – 25 Crore depending on block, renovation status and road width.",
    investmentNote:
      "Scarcity of ready inventory keeps long-term value stable. Older construction usually requires renovation budgeting, and heritage or layout restrictions can apply.",
    nearby: ["gulberg-lahore", "johar-town-lahore", "dha-lahore"],
    faqs: [
      {
        question: "Why are Model Town plots larger than newer schemes?",
        answer:
          "It was planned as a low-density district decades ago, so plots are generally wider and roads more generous than modern housing schemes of comparable location.",
      },
      {
        question: "Is renovation required in Model Town?",
        answer:
          "Most inventory predates modern construction standards. Budget for rewiring, plumbing and insulation upgrades even where the structure is sound.",
      },
    ],
  },
  {
    slug: "dha-islamabad",
    name: "DHA Islamabad",
    citySlug: "islamabad",
    cityName: "Islamabad",
    match: "DHA Phase",
    matchKind: "query",
    heroNote:
      "DHA Islamabad brings the capital's sector discipline and a strong institutional tenant base. Phase 1 is largely developed; Phase 2 and Phase 5 add newer supply close to the expressway.",
    inventoryNote:
      "Demo inventory includes developed 10 Marla plots and new-project apartment units in DHA Phase 2, with houses added as they are onboarded.",
    priceNote:
      "Indicative demo pricing: 10 Marla plots from around PKR 3.5 Crore, houses from around PKR 8 Crore, and new-project apartments from around PKR 1.9 Crore with instalment plans.",
    investmentNote:
      "Institutional tenancies reduce vacancy risk. For off-plan units, confirm the developer's approval status, instalment escalation terms and the post-handover service charge structure.",
    nearby: ["blue-area-islamabad", "bahria-town-karachi", "dha-lahore"],
    faqs: [
      {
        question: "Is DHA Islamabad better for end users or investors?",
        answer:
          "Both, for different reasons: end users get planned infrastructure and security, while investors benefit from long-tenure tenants from embassies, development organisations and corporates.",
      },
      {
        question: "What should I verify in a DHA Islamabad off-plan project?",
        answer:
          "Confirm the project's approval with the relevant authority, match the project name on the approval to the marketing name, and read the payment plan for escalation clauses and transfer fees.",
      },
    ],
  },
  {
    slug: "blue-area-islamabad",
    name: "Blue Area Islamabad",
    citySlug: "islamabad",
    cityName: "Islamabad",
    match: "Blue Area",
    matchKind: "query",
    heroNote:
      "Blue Area along Jinnah Avenue is the capital's central business district — the most prestigious office address in Islamabad and the baseline for corporate leasing rates.",
    inventoryNote:
      "Demo inventory includes a fitted serviced office suite on Jinnah Avenue with meeting rooms, server room and dedicated parking.",
    priceNote:
      "Indicative demo pricing: fitted office suites from around PKR 3.5 Lakh per month, rising steeply with floor level, frontage and parking allocation.",
    investmentNote:
      "Office demand here is steady but building services are non-negotiable. Confirm backup power load, HVAC arrangements, lift redundancy and fire compliance before signing.",
    nearby: ["dha-islamabad", "dha-lahore", "blue-area-islamabad"],
    faqs: [
      {
        question: "What rent should I expect for a Blue Area office?",
        answer:
          "In our demo data, fitted suites on Jinnah Avenue start around PKR 3.5 Lakh per month, with pricing driven more by floor, view and parking than by area alone.",
      },
      {
        question: "Do Blue Area offices include backup power?",
        answer:
          "Most established buildings provide generator backup, but the guaranteed load varies. Ask for the sanctioned load per floor and the generator capacity in writing.",
      },
    ],
  },
  {
    slug: "bahria-town-islamabad",
    name: "Bahria Town Islamabad",
    citySlug: "islamabad",
    cityName: "Islamabad",
    match: "Bahria",
    matchKind: "query",
    heroNote:
      "Bahria Town Islamabad and the adjoining Rawalpindi phases form a major planned residential corridor for households working across the twin cities. Gated streets, commercial areas and motorway access drive end-user demand.",
    inventoryNote:
      "Pak Property presents comparable sample Islamabad and Rawalpindi inventory while dedicated Bahria Town Islamabad listings are added to the demonstration catalogue.",
    priceNote:
      "Indicative demo pricing varies materially by phase, block, possession, road width and development status; compare only like-for-like plots or constructed units.",
    investmentNote:
      "Before buying, independently confirm the exact phase authority, possession, dues, utility availability and transfer process. Rental demand is generally strongest in populated phases with direct commercial access.",
    nearby: ["dha-islamabad", "blue-area-islamabad", "bahria-town-phase-8-rawalpindi"],
    faqs: [
      {
        question: "Is Bahria Town Islamabad suitable for families?",
        answer:
          "Populated phases offer gated security, schools, commercial services and access toward Islamabad. Commute time and utility reliability should be checked for the exact block.",
      },
      {
        question: "What should I verify before buying in Bahria Town Islamabad?",
        answer:
          "Verify ownership, allotment and transfer records, all outstanding dues, possession status, approved location, utility connections and the applicable authority or society transfer procedure.",
      },
      {
        question: "Are returns guaranteed in Bahria Town Islamabad?",
        answer:
          "No. Prices and rental demand depend on development, occupancy, infrastructure, entry price and market conditions. No appreciation or rental return is guaranteed.",
      },
    ],
  },
  {
    slug: "bahria-town-karachi",
    name: "Bahria Town Karachi",
    citySlug: "karachi",
    cityName: "Karachi",
    match: "Bahria Town",
    matchKind: "query",
    heroNote:
      "Bahria Town Karachi is a planned satellite city with its own commercial boulevard, schools, hospital and internal transport, popular with families wanting organised living outside central Karachi.",
    inventoryNote:
      "Demo inventory includes a fully furnished three-bedroom apartment in Precinct 10A, with more apartment and plot options added as they are onboarded.",
    priceNote:
      "Indicative demo pricing: furnished 3-bedroom apartments for rent from around PKR 2.2 Lakh per month, and apartment purchases from around PKR 1.2 Crore.",
    investmentNote:
      "Serviced and furnished apartments attract corporate tenants but require active management. Compare society charges against achievable rent before pricing a unit.",
    nearby: ["dha-karachi", "clifton-karachi", "dha-phase-6-lahore"],
    faqs: [
      {
        question: "Is Bahria Town Karachi good for rental investment?",
        answer:
          "Furnished and serviced apartments in Bahria Town let consistently to corporate tenants, provided the unit is well maintained and management of utilities and housekeeping is in place.",
      },
      {
        question: "How far is Bahria Town from central Karachi?",
        answer:
          "It sits on the city's eastern edge along the M-9 corridor. Buyers should weigh the longer commute against lower entry pricing and larger unit sizes.",
      },
    ],
  },
  {
    slug: "dha-karachi",
    name: "DHA Karachi",
    citySlug: "karachi",
    cityName: "Karachi",
    match: "DHA Phase 6",
    matchKind: "query",
    heroNote:
      "DHA Karachi remains the city's most established premium address, with a strong resale market, dense commercial belts and consistent corporate rental demand.",
    inventoryNote:
      "Demo inventory includes well-maintained family apartments in DHA Phase 6 on Khayaban-e-Bukhari, with additional phases represented through similar listings.",
    priceNote:
      "Indicative demo pricing: 3-bedroom apartments from around PKR 4 Crore, houses from around PKR 12 Crore, subject to phase, plot size and road width.",
    investmentNote:
      "Apartment liquidity is strong but building quality and maintenance charges vary widely. Always review the society's maintenance history and any pending structural work.",
    nearby: ["clifton-karachi", "bahria-town-karachi", "dha-lahore"],
    faqs: [
      {
        question: "Which DHA Karachi phases are best for apartments?",
        answer:
          "Phases 5, 6 and 8 offer the deepest apartment inventory with good access to commercial areas, schools and hospitals, which supports rental demand.",
      },
      {
        question: "What are the hidden costs in DHA Karachi apartments?",
        answer:
          "Monthly maintenance, generator and water charges, and periodic facade or lift upgrades are the most commonly underestimated items. Ask for the last two years of maintenance records.",
      },
    ],
  },
  {
    slug: "clifton-karachi",
    name: "Clifton",
    citySlug: "karachi",
    cityName: "Karachi",
    match: "Clifton",
    matchKind: "query",
    heroNote:
      "Clifton combines sea-facing living, high-end retail and hospitality. Inventory skews towards larger apartments, penthouses and purpose-built towers with concierge services.",
    inventoryNote:
      "Demo inventory includes a sea-facing penthouse in Clifton Block 5 with a wrap-around terrace and private lift lobby.",
    priceNote:
      "Indicative demo pricing: 4-bedroom penthouses from around PKR 15 Crore, with premium sea-facing floors considerably higher.",
    investmentNote:
      "Prestige addresses support higher rents but fewer comparable transactions, so valuations move less predictably. Verify building maintenance, lift and generator arrangements closely.",
    nearby: ["dha-karachi", "bahria-town-karachi", "dha-phase-5-lahore"],
    faqs: [
      {
        question: "What premium does sea-facing inventory command in Clifton?",
        answer:
          "Sea-facing floors typically trade at a meaningful premium over inward-facing units in the same tower. Compare recent transactions in the specific building rather than street averages.",
      },
      {
        question: "Is Clifton suitable for rental income?",
        answer:
          "Yes, for larger furnished units and penthouses targeting executives and relocating families, though tenant pools are smaller and vacancy periods can be longer.",
      },
    ],
  },
  {
    slug: "dha-multan",
    name: "DHA Multan",
    citySlug: "multan",
    cityName: "Multan",
    match: "DHA Multan",
    matchKind: "query",
    heroNote:
      "DHA Multan is the most credible new society in South Punjab, with trunk infrastructure delivered across developed sectors and an established resale market for balloted plots.",
    inventoryNote:
      "Demo inventory includes a balloted 1 Kanal plot in Sector A with an up-to-date instalment record.",
    priceNote:
      "Indicative demo pricing: 1 Kanal plots from around PKR 1.8 Crore, with commercial frontage plots priced substantially higher.",
    investmentNote:
      "Confirm instalment status, transfer procedure and whether any development charges remain. In new societies, documentation quality drives resale more than location alone.",
    nearby: ["buch-villas-multan", "dha-lahore", "bahria-town-lahore"],
    faqs: [
      {
        question: "Which DHA Multan sectors are most in demand?",
        answer:
          "Sectors with completed trunk infrastructure and proximity to the main entrance and commercial belts see the strongest demand and the most activity on resale.",
      },
      {
        question: "Can I buy a plot on instalments in DHA Multan?",
        answer:
          "DHA plans are available on selected inventory, but a cash purchase of a cleared plot usually negotiates a better effective price than the plan's headline rate.",
      },
    ],
  },
  {
    slug: "buch-villas-multan",
    name: "Buch Villas Multan",
    citySlug: "multan",
    cityName: "Multan",
    match: "Buch Villas",
    matchKind: "query",
    heroNote:
      "Buch Villas is one of Multan's most organised addresses, with generous plot sizes, a controlled layout and constructed villas suited to immediate family occupation.",
    inventoryNote:
      "Demo inventory includes a 1 Kanal designer villa with high ceilings and pool plumbing already laid.",
    priceNote:
      "Indicative demo pricing: 1 Kanal villas from around PKR 2.4 Crore, with premium corner and main-road units priced higher.",
    investmentNote:
      "Constructed villas here appeal to end users and long-hold investors. Confirm society maintenance charges and utility arrangements before transfer.",
    nearby: ["dha-multan", "eden-valley-faisalabad", "dha-lahore"],
    faqs: [
      {
        question: "Is Buch Villas fully developed?",
        answer:
          "The layout, roads and utilities are in place across developed villas, with remaining inventory varying block by block. Confirm the current development position for the exact plot.",
      },
      {
        question: "Are villas in Buch Villas good for rental income?",
        answer:
          "Larger furnished villas rent to professional families and medical staff, though the tenant pool is smaller than in Lahore or Karachi. Longer void periods should be factored into yield.",
      },
    ],
  },
  {
    slug: "eden-valley-faisalabad",
    name: "Eden Valley Faisalabad",
    citySlug: "faisalabad",
    cityName: "Faisalabad",
    match: "Eden Valley",
    matchKind: "query",
    heroNote:
      "Eden Valley is a well-established gated scheme on Canal Road with a mix of built-up houses and plot inventory, popular with families upgrading within Faisalabad.",
    inventoryNote:
      "Demo inventory includes a newly built 5 Marla house with modern elevation and standard construction quality.",
    priceNote:
      "Indicative demo pricing: 5 Marla houses from around PKR 1.3 Crore, 10 Marla houses from around PKR 2.4 Crore.",
    investmentNote:
      "Rental demand comes from factory management and professionals; longer tenancy cycles make this better suited to income than short-term trading.",
    nearby: ["dha-multan", "satellite-town-gujranwala", "dha-lahore"],
    faqs: [
      {
        question: "Is Eden Valley good for first-time buyers?",
        answer:
          "Yes. Entry pricing, gated security and proximity to Canal Road make it practical for families buying their first house in Faisalabad.",
      },
      {
        question: "What rent can a 5 Marla house achieve in Faisalabad?",
        answer:
          "In our demo data, well-maintained 5 Marla houses in gated Faisalabad schemes sit in a PKR 45,000 to PKR 75,000 per month range, depending on furnishing and location.",
      },
    ],
  },
  {
    slug: "bahria-town-phase-8-rawalpindi",
    name: "Bahria Town Phase 8 Rawalpindi",
    citySlug: "rawalpindi",
    cityName: "Rawalpindi",
    match: "Bahria Town",
    matchKind: "query",
    heroNote:
      "Bahria Town Phase 8 offers organised living within reach of Islamabad, with shuttle services, security and a broad mix of house and portion inventory.",
    inventoryNote:
      "Demo inventory includes an independent upper portion with its own entrance and terrace in Sector C.",
    priceNote:
      "Indicative demo pricing: upper portions for rent from around PKR 75,000 per month, houses from around PKR 2.2 Crore.",
    investmentNote:
      "Portions and smaller units let fastest here. Confirm separate utility meters and society charges, which materially affect net rental income.",
    nearby: ["dha-islamabad", "blue-area-islamabad", "dha-lahore"],
    faqs: [
      {
        question: "Are portions in Bahria Town Phase 8 a good rental option?",
        answer:
          "Upper portions with independent entrances and separate meters let consistently to smaller families and working couples, often with less turnover than full houses.",
      },
      {
        question: "How is access to Islamabad from Bahria Town Phase 8?",
        answer:
          "The Islamabad Expressway and GT Road provide direct access to the capital, which is why many tenants here commute daily.",
      },
    ],
  },
  {
    slug: "satellite-town-gujranwala",
    name: "Satellite Town Gujranwala",
    citySlug: "gujranwala",
    cityName: "Gujranwala",
    match: "Satellite Town",
    matchKind: "query",
    heroNote:
      "Satellite Town is a settled residential district in Gujranwala with wide roads, mature trees and larger plots, close to GT Road and the city's commercial spine.",
    inventoryNote:
      "Demo inventory includes an established 1 Kanal house with a mature garden and separate servants' block.",
    priceNote:
      "Indicative demo pricing: 1 Kanal houses from around PKR 2.1 Crore, with renovated stock at a premium.",
    investmentNote:
      "Entry pricing is low and demand is stable, but older construction often needs modernisation. Budget for renovation rather than assuming immediate occupancy.",
    nearby: ["eden-valley-faisalabad", "dha-lahore", "bahria-town-lahore"],
    faqs: [
      {
        question: "Is Satellite Town a good long-term hold?",
        answer:
          "Yes, for patient buyers. Low entry pricing and established infrastructure support steady, low-volatility growth rather than rapid repricing.",
      },
      {
        question: "What renovation budget should I plan for older Gujranwala houses?",
        answer:
          "As a working rule, allocate 10–20% of the purchase price for wiring, plumbing, roofing and finishes on houses built before 2010.",
      },
    ],
  },
  {
    slug: "hayatabad-peshawar",
    name: "Hayatabad Peshawar",
    citySlug: "peshawar",
    cityName: "Peshawar",
    match: "Hayatabad",
    matchKind: "query",
    heroNote:
      "Hayatabad is Peshawar's most established planned residential area, valued for security, wide roads and proximity to universities and hospitals.",
    inventoryNote:
      "Demo inventory includes a four-bedroom family house for rent in Phase 4 with a covered porch and guest room.",
    priceNote:
      "Indicative demo pricing: 10 Marla houses for rent from around PKR 1.2 Lakh per month, purchases from around PKR 2.6 Crore.",
    investmentNote:
      "Reinforced security and scheme management support tenant confidence. Long-tenure institutional tenants are common in this belt.",
    nearby: ["dha-islamabad", "dha-lahore", "bahria-town-lahore"],
    faqs: [
      {
        question: "Which Hayatabad phases are most in demand?",
        answer:
          "Phases close to universities, hospitals and the main boulevard see the strongest demand from institutional tenants and families relocating to Peshawar.",
      },
      {
        question: "Is Hayatabad suitable for corporate leasing?",
        answer:
          "Yes. Development organisations, hospitals and university staff frequently lease houses here for multi-year tenures, which reduces turnover.",
      },
    ],
  },
];

export const SOCIETY_BY_SLUG = new Map(SOCIETIES.map((society) => [society.slug, society]));

/* ------------------------------------------------------------------ */
/*  Property-type landing pages                                        */
/* ------------------------------------------------------------------ */

type TypeCopy = {
  noun: string;
  plural: string;
  bullets: string[];
  verification: string;
  pitfalls: string;
};

const TYPE_COPY: Record<string, TypeCopy> = {
  houses: {
    noun: "House",
    plural: "houses",
    bullets: [
      "Confirm covered area against the approved building plan, not just the marketed number.",
      "Check road width, plot dimensions and any setback or height restrictions on the specific street.",
      "Verify utilities: sanctioned electricity load, gas connection, water source and sewerage.",
      "Inspect drainage, roofing and waterproofing — monsoon leaks are the most common post-purchase repair.",
    ],
    verification:
      "For constructed houses, ask for the completion certificate where the society issues one, plus the latest property tax and utility bills.",
    pitfalls:
      "Beware of unapproved additional floors and covered areas that breach the approved plan; these complicate future transfers and financing.",
  },
  apartments: {
    noun: "Apartment",
    plural: "apartments",
    bullets: [
      "Review maintenance charges, generator costs and water arrangements in writing before you book.",
      "Check the building's lift condition, fire safety systems and reserve fund history.",
      "Confirm dedicated parking allocation — not simply 'available parking'.",
      "Assess sound insulation and cross ventilation, especially for inward-facing units.",
    ],
    verification:
      "Ask for the last two years of maintenance records and the association's minutes to identify pending structural or lift expenditure.",
    pitfalls:
      "Underestimated maintenance and one-time upgrade levies are the most common hidden cost in apartment ownership.",
  },
  plots: {
    noun: "Plot",
    plural: "plots",
    bullets: [
      "Confirm the plot is balloted with possession where the society has reached that stage.",
      "Request a written dues statement showing everything cleared up to the transfer date.",
      "Verify exact dimensions on the ground against the layout plan and check road width.",
      "Check whether development charges, utility charges or betterment levies remain outstanding.",
    ],
    verification:
      "Match the file number, allotted name and current transfer chain before paying any token amount.",
    pitfalls:
      "Uncleared dues and informal transfers are the leading causes of disputed plot purchases in Pakistan.",
  },
  commercial: {
    noun: "Commercial unit",
    plural: "commercial properties",
    bullets: [
      "Measure frontage and visibility from the main road, not just carpet area.",
      "Confirm permitted use for your business category with the authority or society.",
      "Check parking bays, loading access and signage rights.",
      "Verify sanctioned electrical load, backup generator capacity and HVAC arrangements.",
    ],
    verification:
      "For leased assets, request the current lease agreements, escalation clauses and tenant payment history.",
    pitfalls:
      "A high headline rent can be undermined by weak frontage, restricted signage or inadequate parking. Model net yield, not gross rent.",
  },
};

type TypeCityLanding = {
  slug: string;
  typeKey: keyof typeof TYPE_COPY;
  citySlug: string;
  metaTitle: string;
  h1: string;
  introExtra?: string;
  filters: PropertyFilters;
};

const TYPE_LANDINGS: TypeCityLanding[] = [
  {
    slug: "houses-for-sale-in-lahore",
    typeKey: "houses",
    citySlug: "lahore",
    metaTitle: "Houses for Sale in Lahore | DHA, Bahria Town & Family Homes | Pak Property",
    h1: "Houses for Sale in Lahore",
    filters: { purpose: "buy", city: "lahore", category: "house" },
  },
  {
    slug: "apartments-for-sale-in-lahore",
    typeKey: "apartments",
    citySlug: "lahore",
    metaTitle: "Apartments for Sale in Lahore | Gulberg, Johar Town & New Projects",
    h1: "Apartments for Sale in Lahore",
    filters: { purpose: "buy", city: "lahore", category: "apartment" },
  },
  {
    slug: "plots-for-sale-in-lahore",
    typeKey: "plots",
    citySlug: "lahore",
    metaTitle: "Plots for Sale in Lahore | Bahria Town & New Societies | Pak Property",
    h1: "Residential Plots for Sale in Lahore",
    filters: { purpose: "buy", city: "lahore", category: "plot" },
    introExtra:
      "Plot purchases in Lahore usually involve a slower decision than houses but a larger long-term payoff, particularly where a society's infrastructure delivery is already visible on the ground.",
  },
  {
    slug: "commercial-property-in-lahore",
    typeKey: "commercial",
    citySlug: "lahore",
    metaTitle: "Commercial Property in Lahore | Offices, Shops & Buildings",
    h1: "Commercial Property in Lahore",
    filters: { city: "lahore", commercialOnly: true },
    introExtra:
      "Gulberg, Main Boulevard, Liberty Market and DHA's commercial belts carry the deepest demand. Retail works on footfall and visibility; offices work on services and parking.",
  },
  {
    slug: "commercial-property-in-islamabad",
    typeKey: "commercial",
    citySlug: "islamabad",
    metaTitle: "Commercial Property in Islamabad | Offices & Retail | Pak Property",
    h1: "Commercial Property in Islamabad",
    filters: { city: "islamabad", commercialOnly: true },
    introExtra:
      "Blue Area, F-11 and DHA Phase 2 are the capital's commercial anchors. Institutional tenants here sign longer leases, which supports more predictable income.",
  },
  {
    slug: "commercial-property-in-karachi",
    typeKey: "commercial",
    citySlug: "karachi",
    metaTitle: "Commercial Property in Karachi | Offices, Shops & Warehouses",
    h1: "Commercial Property in Karachi",
    filters: { city: "karachi", commercialOnly: true },
    introExtra:
      "Karachi offers the country's strongest commercial yields, spanning Shahrah-e-Faisal offices, high-street retail and Port Qasim warehousing on the industrial corridor.",
  },
  {
    slug: "houses-for-sale-in-islamabad",
    typeKey: "houses",
    citySlug: "islamabad",
    metaTitle: "Houses for Sale in Islamabad | DHA & Sector Homes | Pak Property",
    h1: "Houses for Sale in Islamabad",
    filters: { purpose: "buy", city: "islamabad", category: "house" },
  },
  {
    slug: "apartments-for-sale-in-islamabad",
    typeKey: "apartments",
    citySlug: "islamabad",
    metaTitle: "Apartments for Sale in Islamabad | DHA & New Projects",
    h1: "Apartments for Sale in Islamabad",
    filters: { purpose: "buy", city: "islamabad", category: "apartment" },
    introExtra:
      "Islamabad's apartment market is driven by institutional tenants. Instalment-based new projects add entry options, provided the developer's approval status is confirmed first.",
  },
];

export const TYPE_LANDING_BY_SLUG = new Map(TYPE_LANDINGS.map((item) => [item.slug, item]));

/* ------------------------------------------------------------------ */
/*  Builders                                                           */
/* ------------------------------------------------------------------ */

function cityFacets(city: CityMarket) {
  return [
    { label: `Property for sale in ${city.name}`, href: `/property-for-sale-in-${city.slug}`, note: "All sale listings" },
    { label: `Property for rent in ${city.name}`, href: `/property-for-rent-in-${city.slug}`, note: "All rental listings" },
    { label: `Houses in ${city.name}`, href: `/properties/for-sale?city=${city.slug}&category=house`, note: "Detached and semi-detached" },
    { label: `Apartments in ${city.name}`, href: `/properties/for-sale?city=${city.slug}&category=apartment`, note: "Flats and penthouses" },
    { label: `Plots in ${city.name}`, href: `/properties/for-sale?city=${city.slug}&category=plot`, note: "Files and possession plots" },
    { label: `Commercial in ${city.name}`, href: `/properties/commercial?city=${city.slug}`, note: "Offices, shops and buildings" },
  ];
}

function relatedCityLinks(city: CityMarket): { label: string; href: string }[] {
  const others = CITY_MARKETS.filter((item) => item.slug !== city.slug).slice(0, 5);
  return [
    { label: `Property for rent in ${city.name}`, href: `/property-for-rent-in-${city.slug}` },
    ...others.map((item) => ({ label: `Property for sale in ${item.name}`, href: `/property-for-sale-in-${item.slug}` })),
    { label: "Pakistan property investment guide", href: "/property-investment-in-pakistan" },
    { label: `${city.name} listings on the map`, href: `/city/${city.slug}` },
  ];
}

function citySocieties(city: CityMarket) {
  return SOCIETIES.filter((society) => society.citySlug === city.slug).map((society) => ({
    name: society.name,
    href: `/property-for-sale/${society.slug}`,
    note: society.priceNote,
  }));
}

export function buildCityLanding(citySlug: string, purpose: "sale" | "rent"): LandingContent | null {
  const city = CITY_BY_SLUG.get(citySlug);
  if (!city) return null;

  const isSale = purpose === "sale";
  const slug = isSale ? `property-for-sale-in-${city.slug}` : `property-for-rent-in-${city.slug}`;
  const intent = isSale ? "for Sale" : "for Rent";

  return {
    slug,
    kind: isSale ? "city-sale" : "city-rent",
    eyebrow: `${city.name} · ${city.province}`,
    h1: `Property ${intent} in ${city.name}`,
    metaTitle: isSale
      ? `Property for Sale in ${city.name} | Houses, Apartments & Plots | Pak Property`
      : `Property for Rent in ${city.name} | Houses, Apartments & Portions | Pak Property`,
    metaDescription: isSale
      ? `Browse property for sale in ${city.name}: houses, apartments, plots and commercial space across ${city.keyAreas.slice(0, 4).join(", ")}. Filter by area, budget and size on Pak Property.`
      : `Looking for property for rent in ${city.name}? Compare houses, apartments, portions and commercial units by area, rent and furnishing on Pak Property.`,
    keywords: [
      `property for sale in ${city.name}`,
      `property for rent in ${city.name}`,
      `houses for sale in ${city.name}`,
      `real estate ${city.name}`,
      `plots for sale in ${city.name}`,
    ],
    intro: [
      city.character,
      isSale
        ? city.saleSupply
        : `${city.rentTenants} Most rental listings show monthly rent, furnishing status and what is included, so you can compare like with like before arranging visits.`,
      isSale
        ? `${city.investorAngle} Indicative demo price bands for ${city.name} currently run ${city.saleBand}, and our sample benchmark is ${city.ppsf}.`
        : `Selecting a rental also means selecting a landlord relationship. Confirm maintenance responsibility, utility arrangements, escalation terms and the notice period in the tenancy agreement before you commit.`,
    ],
    filters: isSale
      ? { purpose: "buy", city: city.slug }
      : { purpose: "rent", city: city.slug },
    alternatives: { city: city.slug },
    facets: cityFacets(city),
    societies: citySocieties(city),
    priceBands: isSale
      ? [
          { label: "Entry level", range: city.saleBand.split("–")[0]?.trim() ?? "—", note: "Smaller plots and older construction" },
          { label: "Mid market", range: "Family houses and modern apartments", note: "Most end-user transactions sit here" },
          { label: "Premium", range: city.saleBand.split("–")[1]?.trim() ?? "—", note: "Prime locations, larger plots, newer builds" },
        ]
      : [
          { label: "Budget", range: city.rentBand.split("–")[0]?.trim() ?? "—", note: "Portions and smaller apartments" },
          { label: "Mid market", range: "Family houses and furnished units", note: "Most tenancies sit here" },
          { label: "Premium", range: city.rentBand.split("–")[1]?.trim() ?? "—", note: "Large houses and serviced apartments" },
        ],
    insightNotes: [
      { title: "Documentation", copy: `Always confirm the transfer procedure and dues position in writing before paying a token in ${city.name}.` },
      { title: "Accessibility", copy: city.accessNote },
      { title: "What to inspect", copy: "Visit at a working hour, not only in the evening, and inspect water pressure, drainage, wiring and structural condition in person." },
    ],
    faqs: [
      {
        question: `Is ${city.name} a good market for property ${isSale ? "buying" : "renting"}?`,
        answer: isSale
          ? `${city.name} suits buyers looking for ${city.keyAreas.slice(0, 3).join(", ")} and similar established areas. Comparative pricing, documentation quality and the specific society's management standards matter more than city-wide averages.`
          : `Demand in ${city.name} is steady across ${city.keyAreas.slice(0, 3).join(", ")}, driven by families and professionals relocating within the city. Well-maintained, correctly priced units let fastest.`,
      },
      {
        question: `What are indicative ${isSale ? "sale prices" : "rents"} in ${city.name}?`,
        answer: isSale
          ? `Our demo reference band for ${city.name} is ${city.saleBand} and ${city.ppsf}. These are illustrative sample figures, not verified market transactions.`
          : `Our demo reference band for rentals in ${city.name} is ${city.rentBand}, depending on area, unit size and furnishing.`,
      },
      {
        question: `Which areas of ${city.name} should I shortlist first?`,
        answer: `${city.keyAreas.join(", ")} are the most active areas in our demo inventory. Use the area pages and map view to compare access, schooling and commute before booking visits.`,
      },
    ],
    relatedLinks: relatedCityLinks(city),
  };
}

export function buildTypeLanding(slug: string): LandingContent | null {
  const config = TYPE_LANDING_BY_SLUG.get(slug);
  if (!config) return null;
  const city = CITY_BY_SLUG.get(config.citySlug);
  if (!city) return null;
  const copy = TYPE_COPY[config.typeKey];
  const isRent = config.filters.purpose === "rent";

  return {
    slug: config.slug,
    kind: "type-city",
    eyebrow: `${copy.plural} · ${city.name}`,
    h1: config.h1,
    metaTitle: config.metaTitle,
    metaDescription: `Explore ${copy.plural} for sale in ${city.name} across ${city.keyAreas.slice(0, 4).join(", ")}. Compare price, size, bedrooms and price per square foot with Pak Property filters and comparison tools.`,
    keywords: [
      `${copy.plural} for sale ${city.name}`,
      `${copy.plural} in ${city.name}`,
      `${city.name} property`,
    ],
    intro: [
      `${city.character}`,
      config.introExtra ?? city.saleSupply,
      `Indicative demo bands for ${city.name} currently run ${isRent ? city.rentBand : city.saleBand}. Use the filters below to narrow by area, budget and size, then add two or three shortlisted ${copy.plural} to the comparison view.`,
    ],
    filters: config.filters,
    alternatives: { city: city.slug },
    facets: [
      { label: `Property for sale in ${city.name}`, href: `/property-for-sale-in-${city.slug}`, note: "All sale inventory" },
      { label: `Property for rent in ${city.name}`, href: `/property-for-rent-in-${city.slug}`, note: "All rentals" },
      ...citySocieties(city).map((society) => ({ label: society.name, href: society.href, note: society.note })),
    ],
    societies: citySocieties(city),
    priceBands: [
      { label: "Entry level", range: city.saleBand.split("–")[0]?.trim() ?? "—", note: `Compact ${copy.plural} and older stock` },
      { label: "Mid market", range: "Most end-user transactions", note: "Established areas with completed infrastructure" },
      { label: "Premium", range: city.saleBand.split("–")[1]?.trim() ?? "—", note: "Prime locations and newer construction" },
    ],
    insightNotes: [
      { title: `Evaluating ${copy.plural}`, copy: copy.verification },
      { title: "Common pitfalls", copy: copy.pitfalls },
      { title: "Useful checks", copy: copy.bullets[0] },
    ],
    faqs: [
      {
        question: `What should I check when buying ${copy.plural} in ${city.name}?`,
        answer: copy.bullets.join(" "),
      },
      {
        question: `How do I compare ${copy.plural} in ${city.name} quickly?`,
        answer:
          "Use the price per square foot shown on each listing, then add up to three shortlisted properties to the Pak Property comparison view to line up price, area, amenities and the illustrative property score side by side.",
      },
      {
        question: `What is an indicative price range for ${copy.plural} in ${city.name}?`,
        answer: `Our demo reference band runs ${city.saleBand}, with ${city.ppsf}. These are illustrative figures created for this product demo, not verified transactions.`,
      },
    ],
    relatedLinks: [
      { label: `Property for sale in ${city.name}`, href: `/property-for-sale-in-${city.slug}` },
      { label: `Property for rent in ${city.name}`, href: `/property-for-rent-in-${city.slug}` },
      ...SOCIETIES.filter((society) => society.citySlug === city.slug)
        .slice(0, 4)
        .map((society) => ({ label: society.name, href: `/property-for-sale/${society.slug}` })),
      { label: "Mortgage calculator", href: "/tools/mortgage-calculator" },
      { label: "Rental yield calculator", href: "/tools/rental-yield-calculator" },
    ],
  };
}

export function buildSocietyLanding(slug: string): LandingContent | null {
  const society = SOCIETY_BY_SLUG.get(slug);
  if (!society) return null;
  const city = CITY_BY_SLUG.get(society.citySlug);
  if (!city) return null;

  const filters: PropertyFilters =
    society.matchKind === "query"
      ? { q: society.match, city: society.citySlug }
      : { city: society.citySlug };

  return {
    slug,
    kind: "type-city",
    eyebrow: `${society.cityName} · Location guide`,
    h1: `Property for Sale in ${society.name}`,
    metaTitle: `Property for Sale in ${society.name} | Prices, Listings & Guide | Pak Property`,
    metaDescription: `${society.name} property guide: live demo listings, indicative price bands, what to verify before buying and how the area compares with neighbouring ${society.cityName} locations.`,
    keywords: [
      `${society.name} property`,
      `property for sale ${society.name}`,
      `${society.name} ${society.cityName}`,
      `${society.cityName} property`,
    ],
    intro: [
      society.heroNote,
      society.inventoryNote,
      `${society.priceNote} These are illustrative demo figures created for the Pak Property product demonstration and are not verified market transactions.`,
    ],
    filters,
    alternatives: { city: society.citySlug },
    facets: [
      { label: `All property in ${society.cityName}`, href: `/property-for-sale-in-${society.citySlug}`, note: "Full city inventory" },
      { label: `Rentals in ${society.cityName}`, href: `/property-for-rent-in-${society.citySlug}`, note: "Monthly rent listings" },
      { label: `Commercial in ${society.cityName}`, href: `/properties/commercial?city=${society.citySlug}`, note: "Offices, shops, buildings" },
    ],
    societies: society.nearby
      .map((nearbySlug) => SOCIETY_BY_SLUG.get(nearbySlug))
      .filter((item): item is SocietyEntry => Boolean(item))
      .map((item) => ({ name: item.name, href: `/property-for-sale/${item.slug}`, note: item.priceNote })),
    priceBands: [
      { label: "Indicative pricing", range: society.priceNote.replace(/^Indicative demo pricing:\s*/i, ""), note: "Demo reference only" },
      { label: "Benchmark", range: city.ppsf, note: `Sample benchmark for ${city.name}` },
      { label: "City range", range: city.saleBand, note: "Across all areas" },
    ],
    insightNotes: [
      { title: "Documentation", copy: "Confirm dues clearance, the transfer chain and the current transfer procedure in writing before releasing any token payment." },
      { title: "Investor view", copy: society.investmentNote },
      { title: "Access & amenities", copy: city.accessNote },
    ],
    faqs: [...society.faqs].slice(0, 3),
    relatedLinks: [
      { label: `Property for sale in ${society.cityName}`, href: `/property-for-sale-in-${society.citySlug}` },
      { label: `Property for rent in ${society.cityName}`, href: `/property-for-rent-in-${society.citySlug}` },
      ...society.nearby
        .map((nearbySlug) => SOCIETY_BY_SLUG.get(nearbySlug))
        .filter((item): item is SocietyEntry => Boolean(item))
        .map((item) => ({ label: `Property in ${item.name}`, href: `/property-for-sale/${item.slug}` })),
      { label: "Pakistan property investment guide", href: "/property-investment-in-pakistan" },
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Investment guide (linkable asset)                                  */
/* ------------------------------------------------------------------ */

const INVESTMENT_GUIDE: LandingContent = {
  slug: "property-investment-in-pakistan",
  kind: "guide",
  eyebrow: "Investment guide",
  h1: "Property Investment in Pakistan",
  metaTitle: "Property Investment in Pakistan | Real Estate Investment Guide | Pak Property",
  metaDescription:
    "A practical guide to property investment in Pakistan: how to compare locations, model rental yield and capital growth, verify documentation and avoid common mistakes. Includes free calculators.",
  keywords: [
    "real estate investment in Pakistan",
    "property investment in Pakistan",
    "property investment guide Pakistan",
    "rental yield Pakistan",
  ],
  intro: [
    "Property in Pakistan is bought for two very different reasons: somewhere to live, and something to hold as an asset. The second requires a framework, because two properties on the same street can behave completely differently over five years.",
    "This guide sets out the framework our desk uses when comparing opportunities — location fundamentals, entry economics, income, documentation risk and exit liquidity. Nothing here is investment advice, and every figure on Pak Property is illustrative demo content.",
    "Use the calculators alongside the city and society guides, then shortlist two or three options and compare them side by side before you visit.",
  ],
  filters: { featured: true },
  alternatives: {},
  facets: [
    { label: "Property for sale in Lahore", href: "/property-for-sale-in-lahore", note: "Deepest inventory" },
    { label: "Property for sale in Islamabad", href: "/property-for-sale-in-islamabad", note: "Institutional tenants" },
    { label: "Property for sale in Karachi", href: "/property-for-sale-in-karachi", note: "Strongest commercial yields" },
    { label: "Commercial property in Karachi", href: "/commercial-property-in-karachi", note: "Offices and warehousing" },
  ],
  societies: SOCIETIES.slice(0, 6).map((society) => ({
    name: society.name,
    href: `/property-for-sale/${society.slug}`,
    note: society.priceNote,
  })),
  priceBands: [
    { label: "Paper assets", range: "Plots and files", note: "Longer horizon, lower carrying cost, documentation-sensitive" },
    { label: "Income assets", range: "Apartments and portions", note: "Steadier rent, higher management involvement" },
    { label: "Commercial assets", range: "Offices, retail, warehousing", note: "Highest yields, tenant-concentration risk" },
  ],
  insightNotes: [
    {
      title: "Location fundamentals",
      copy: "Judge infrastructure delivery, not marketing. Completed roads, utilities and sewerage support value; announced projects that have not broken ground usually do not.",
    },
    {
      title: "Entry economics",
      copy: "Work from price per square foot against comparable units in the same society. On any instalment plan, compare the effective cash discount against the plan's headline pricing.",
    },
    {
      title: "Income modelling",
      copy: "Use net yield, not gross rent. Deduct maintenance, society charges, management, vacancy and one-time fit-out before comparing two options.",
    },
    {
      title: "Documentation risk",
      copy: "In Pakistan, documentation quality is the single largest determinant of whether a purchase is comfortable or contested. Verify dues, chain of title and authority approvals.",
    },
    {
      title: "Exit liquidity",
      copy: "Ask how many comparable units trade in the society each quarter. A thin buyer pool lengthens exit timeframes regardless of headline price.",
    },
    {
      title: "Carrying cost",
      copy: "Factor in society charges, municipal taxes, utilities and maintenance even on vacant property. Long holding periods reward low carrying cost.",
    },
  ],
  faqs: [
    {
      question: "Is property a good investment in Pakistan?",
      answer:
        "Property can hold and grow value over long horizons, but outcomes differ sharply by location, documentation quality and entry price. There are no guaranteed returns, and rental or capital returns should be modelled as scenarios rather than certainties.",
    },
    {
      question: "Which is better in Pakistan: a plot or a house?",
      answer:
        "Plots generally have lower carrying costs and suit buyers with a longer horizon who can wait for area development. Houses produce rental income and allow immediate use, but require maintenance and attract tenants.",
    },
    {
      question: "How do I calculate rental yield on a property in Pakistan?",
      answer:
        "Divide annual rent by purchase price for gross yield, then subtract annual maintenance, society charges and a vacancy allowance for net yield. Our rental yield calculator performs both calculations.",
    },
    {
      question: "What documentation should I review before investing?",
      answer:
        "At minimum: allotment and transfer letters, dues statements, the chain of ownership, any authority NOC or approval, and the exact transfer procedure. For constructed property also review approved plans and utility connections.",
    },
    {
      question: "Does Pak Property provide investment advice?",
      answer:
        "No. Pak Property is a demonstration property discovery platform. The tools and guides here are educational and illustrative, and all sample figures are labelled as demo content.",
    },
  ],
  relatedLinks: [
    { label: "Mortgage calculator", href: "/tools/mortgage-calculator" },
    { label: "Rental yield calculator", href: "/tools/rental-yield-calculator" },
    { label: "ROI calculator", href: "/tools/roi-calculator" },
    { label: "Investment projection", href: "/tools/investment-calculator" },
    { label: "Construction cost calculator", href: "/tools/construction-cost-calculator" },
    { label: "Property tax calculator", href: "/tools/property-tax-calculator" },
    { label: "Rent vs buy calculator", href: "/tools/rent-vs-buy-calculator" },
    { label: "Property documentation checklist", href: "/blog/property-documentation-checklist-pakistan" },
    { label: "DHA vs Bahria Town comparison", href: "/blog/dha-vs-bahria-town-comparison" },
    { label: "Property investment mistakes", href: "/blog/real-estate-investment-mistakes-pakistan" },
  ],
};

/* ------------------------------------------------------------------ */
/*  Resolution                                                         */
/* ------------------------------------------------------------------ */

export function resolveLanding(slug: string): LandingContent | null {
  if (slug === INVESTMENT_GUIDE.slug) return INVESTMENT_GUIDE;
  for (const city of CITY_MARKETS) {
    const sale = buildCityLanding(city.slug, "sale");
    if (sale?.slug === slug) return sale;
    const rent = buildCityLanding(city.slug, "rent");
    if (rent?.slug === slug) return rent;
  }
  return buildTypeLanding(slug);
}

export function getAllLandingSlugs(): string[] {
  const slugs = [INVESTMENT_GUIDE.slug];
  for (const city of CITY_MARKETS) {
    slugs.push(`property-for-sale-in-${city.slug}`, `property-for-rent-in-${city.slug}`);
  }
  for (const landing of TYPE_LANDINGS) slugs.push(landing.slug);
  return slugs;
}

export function getAllSocietySlugs(): string[] {
  return SOCIETIES.map((society) => society.slug);
}

export { CITY_PPSF_BENCHMARK };
