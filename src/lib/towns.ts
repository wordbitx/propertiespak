import { CITY_PPSF_BENCHMARK } from "@/lib/score";
import { CITY_MARKETS, SOCIETIES, type LandingContent } from "@/lib/landing-pages";
import type { PropertyFilters } from "@/lib/queries";

/**
 * Town, housing-scheme and sector registry.
 *
 * Two things depend on this file:
 *  1. the city → town cascade in the search filters (every entry is a real
 *     town buyers type into portals), and
 *  2. one indexable guide page per town at `/property-for-sale/<slug>`
 *     (unique copy, price band, nearby towns and FAQs per town).
 *
 * `match` is the substring compared against a listing's area name, so a town
 * entry and live inventory stay linked even when the owner types a phase or
 * block after the society name.
 */
export type Town = {
  slug: string;
  name: string;
  citySlug: string;
  cityName: string;
  /** ILIKE substring matched against `properties.location_area`. */
  match: string;
  aliases?: string[];
  /** Developer / authority behind the scheme. */
  authority: string;
  /** Geography: road, corridor or direction within the city. */
  belt: string;
  sizes: string;
  priceBand: string;
  rentBand: string;
  character: string;
  buyers: string;
  verification: string;
  nearby: string[];
  lat: number;
  lng: number;
  /** Highlighted on the homepage town strip and city pages. */
  featured?: boolean;
};

export const TOWNS: Town[] = [
  /* ---------------------------------------------------------------- */
  /*  Lahore                                                          */
  /* ---------------------------------------------------------------- */
  {
    slug: "lake-city-lahore",
    name: "Lake City Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Lake City",
    aliases: ["Lake City", "Lake City M-3"],
    authority: "Lake City Holdings (LDA-approved)",
    belt: "Ring Road / Adda Plot side, south Lahore",
    sizes: "3, 5 and 10 Marla plots, 1 Kanal homes and apartments",
    priceBand: "PKR 95 Lakh – PKR 5.5 Crore",
    rentBand: "PKR 55,000 – PKR 1.8 Lakh per month",
    character:
      "Lake City is one of the few Lahore schemes that delivers a golf course, mall, hospital and school campus inside the same boundary. Sector M-1 to M-8 are fully developed with carpeted roads and functioning utilities, so possession plots can be built on immediately.",
    buyers:
      "Families moving out of central Lahore for a managed environment, and investors who want an apartment or 5 Marla plot with built-in resale demand from the Ring Road corridor.",
    verification:
      "Confirm the sector's transfer NOC, latest maintenance and development charges, and whether the specific plot carries any pending utility instalment before paying a token.",
    nearby: ["bahria-town-lahore", "al-kabir-town-lahore", "awt-housing-scheme-lahore"],
    lat: 31.3478,
    lng: 74.2406,
    featured: true,
  },
  {
    slug: "etihad-town-lahore",
    name: "Etihad Town Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Etihad Town",
    aliases: ["Etihad Town", "Etihad Town Phase 1"],
    authority: "Etihad Group (approved housing scheme)",
    belt: "Main Ferozepur Road, near Kamahan, south Lahore",
    sizes: "3, 5 and 10 Marla residential plots, built houses",
    priceBand: "PKR 60 Lakh – PKR 3.2 Crore",
    rentBand: "PKR 35,000 – PKR 95,000 per month",
    character:
      "Etihad Town sits directly on Main Ferozepur Road, which gives it the shortest commute in the southern belt towards Kalma Chowk and Gulberg. Phase 1 is populated with family homes around a commercial spine, and later phases continue the same grid with fresh construction.",
    buyers:
      "First-time buyers and middle-income families who want a gated address without moving far from the city centre, plus rental investors targeting Ferozepur Road commuters.",
    verification:
      "Ask for the approval letter, the current development status of the phase you are buying in, and written confirmation that utilities and sewerage are live on the street.",
    nearby: ["khayaban-e-amin-lahore", "state-life-housing-society-lahore", "dream-gardens-lahore"],
    lat: 31.4382,
    lng: 74.2872,
    featured: true,
  },
  {
    slug: "al-kabir-town-lahore",
    name: "Al-Kabir Town Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Al-Kabir Town",
    aliases: ["Al Kabir Town", "Al-Kabir Town Phase 2"],
    authority: "Al-Kabir Developers",
    belt: "Main Raiwind Road, south-west Lahore",
    sizes: "3, 5 and 10 Marla plots, 1 Kanal villas",
    priceBand: "PKR 55 Lakh – PKR 4.5 Crore",
    rentBand: "PKR 30,000 – PKR 1.5 Lakh per month",
    character:
      "Al-Kabir Town is a long-running Raiwind Road scheme that grew into a full town with its own commercial market, schools and mosque network. Entry pricing is moderate for Lahore, which keeps both resale and rental demand active across phases.",
    buyers:
      "Budget-conscious end users, overseas Pakistanis buying plots on instalments, and investors who want Raiwind Road exposure with a lower ticket size than Bahria Town.",
    verification:
      "Check which phase the plot falls in, whether the instalment plan is clear, and the society's written position on transfer fees and possession timing.",
    nearby: ["valencia-town-lahore", "green-cap-housing-society-lahore", "ahmad-housing-society-lahore"],
    lat: 31.4065,
    lng: 74.1876,
  },
  {
    slug: "kings-town-lahore",
    name: "Kings Town Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Kings Town",
    aliases: ["Kings Town", "Kings Town Phase 1", "Kings Town Phase 2"],
    authority: "Kings Developers",
    belt: "Raiwind Road belt near Bahria Town Lahore",
    sizes: "3, 5 and 10 Marla plots with built-house options",
    priceBand: "PKR 50 Lakh – PKR 3.6 Crore",
    rentBand: "PKR 28,000 – PKR 1.1 Lakh per month",
    character:
      "Kings Town offers Bahria-adjacent living at roughly half the entry cost. Roads, street lights and a functioning commercial area are in place in the earlier phases, and the newer blocks are still on instalment plans for plot buyers.",
    buyers:
      "Young families upgrading from a portion, and plot investors who want a low carrying cost while infrastructure in the surrounding belt matures.",
    verification:
      "Confirm the phase's completion timeline, the exact width of the street your plot opens on, and any outstanding development charges at transfer.",
    nearby: ["bahria-town-lahore", "green-cap-housing-society-lahore", "lahore-state-housing-society-lahore"],
    lat: 31.3737,
    lng: 74.1827,
  },
  {
    slug: "new-lahore-city",
    name: "New Lahore City",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "New Lahore City",
    aliases: ["New Lahore City", "NLC"],
    authority: "Private developers, LDA-approved layout",
    belt: "Raiwind Road, opposite Bahria Town Lahore",
    sizes: "3, 5 and 10 Marla plots",
    priceBand: "PKR 45 Lakh – PKR 2.8 Crore",
    rentBand: "PKR 25,000 – PKR 85,000 per month",
    character:
      "New Lahore City is a cluster of approved blocks on Raiwind Road that has matured quickly because of its position opposite Bahria Town. Commercial activity along the main road keeps daily-need shopping inside the scheme.",
    buyers:
      "Plot buyers with a three to five year horizon, and small builders who construct 5 Marla homes for resale in the Raiwind belt.",
    verification:
      "Verify the specific block's approval status, the demarcated plot dimensions on the ground, and the transfer procedure before releasing funds.",
    nearby: ["bahria-town-lahore", "kings-town-lahore", "al-kabir-town-lahore"],
    lat: 31.3866,
    lng: 74.1815,
  },
  {
    slug: "jubilee-town-lahore",
    name: "Jubilee Town Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Jubilee Town",
    aliases: ["Jubilee Town"],
    authority: "Jubilee Town management (LDA layout)",
    belt: "Canal Bank Road near Thokar Niaz Baig, south Lahore",
    sizes: "5 and 10 Marla plots, 1 Kanal homes",
    priceBand: "PKR 1.4 Crore – PKR 9 Crore",
    rentBand: "PKR 70,000 – PKR 2.5 Lakh per month",
    character:
      "Jubilee Town's value comes from location: it touches both Canal Bank Road and the Ferozepur Road junction, so residents reach Gulberg, DHA or the motorway interchange quickly. Construction is largely complete on the older blocks.",
    buyers:
      "End users who prioritise commute time over plot size, and investors who expect steady rental demand from families working in central Lahore.",
    verification:
      "Confirm the plot is on a sanctioned layout, ask for the latest dues statement, and check that the house plan matches the society's approved by-laws.",
    nearby: ["dream-gardens-lahore", "khayaban-e-amin-lahore", "formanites-housing-scheme-lahore"],
    lat: 31.4718,
    lng: 74.2897,
    featured: true,
  },
  {
    slug: "valencia-town-lahore",
    name: "Valencia Town Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Valencia Town",
    aliases: ["Valencia Town", "Valencia Housing Scheme"],
    authority: "Valencia Housing Scheme management",
    belt: "Main Raiwind Road, near Defence Road junction",
    sizes: "5, 10 Marla plots and 1 Kanal houses",
    priceBand: "PKR 1.3 Crore – PKR 8.5 Crore",
    rentBand: "PKR 65,000 – PKR 2.2 Lakh per month",
    character:
      "Valencia Town is one of the more established Raiwind Road schemes, with completed blocks, mature plantations and a busy commercial strip on the main road. Plot sizes start at 5 Marla, which keeps the entry point accessible for the belt.",
    buyers:
      "Families already working in the Raiwind Road corridor, plus investors comparing it directly against Bahria Town and Lake City on value per Marla.",
    verification:
      "Ask for the transfer letter, the dues clearance up to the transfer date and confirmation of the current by-laws on storeys and commercial use.",
    nearby: ["al-kabir-town-lahore", "bahria-town-lahore", "awt-housing-scheme-lahore"],
    lat: 31.4062,
    lng: 74.1666,
  },
  {
    slug: "lda-avenue-lahore",
    name: "LDA Avenue Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "LDA Avenue",
    aliases: ["LDA Avenue 1", "LDA Avenue One"],
    authority: "Lahore Development Authority",
    belt: "Raiwind Road, adjacent to Bahria Town Lahore",
    sizes: "5 Marla, 10 Marla, 1 Kanal and 2 Kanal plots",
    priceBand: "PKR 1.1 Crore – PKR 9.5 Crore",
    rentBand: "PKR 50,000 – PKR 2.4 Lakh per month",
    character:
      "LDA Avenue 1 is an authority-developed scheme, which gives buyers a documented layout and a predictable transfer route through LDA. Development has been uneven across blocks, so infrastructure status varies from street to street.",
    buyers:
      "Buyers who want an authority file rather than a private society allotment, and investors comfortable evaluating block-level development status.",
    verification:
      "Check the block number and its development stage, confirm the LDA file position, and clear any outstanding dues or notices before transfer.",
    nearby: ["bahria-town-lahore", "green-cap-housing-society-lahore", "valencia-town-lahore"],
    lat: 31.3684,
    lng: 74.2062,
  },
  {
    slug: "dream-gardens-lahore",
    name: "Dream Gardens Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Dream Gardens",
    aliases: ["Dream Gardens", "Dream Garden Housing Scheme"],
    authority: "Dream Gardens Housing Scheme",
    belt: "Barki Road, near DHA Phase 5 and Phase 6",
    sizes: "5 and 10 Marla plots, 1 Kanal houses",
    priceBand: "PKR 1.5 Crore – PKR 8 Crore",
    rentBand: "PKR 70,000 – PKR 2 Lakh per month",
    character:
      "Dream Gardens benefits from sitting alongside the DHA Phase 5 and Phase 6 belt, so residents use DHA's commercial and security infrastructure without paying DHA prices. Most blocks are built up and the scheme runs its own maintenance system.",
    buyers:
      "Families who want a Barki Road address next to DHA, and landlords renting to tenants who work in the DHA and airport corridor.",
    verification:
      "Confirm the maintenance charges, the block's commercial zoning status, and whether the plot has a clear building plan approval.",
    nearby: ["jubilee-town-lahore", "paragon-city-lahore", "etihad-town-lahore"],
    lat: 31.4932,
    lng: 74.4108,
    featured: true,
  },
  {
    slug: "khayaban-e-amin-lahore",
    name: "Khayaban-e-Amin Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Khayaban-e-Amin",
    aliases: ["Khayaban-e-Amin", "Khayaban e Amin"],
    authority: "Khayaban-e-Amin Housing Scheme",
    belt: "Main Ferozepur Road near Wapda Town, south Lahore",
    sizes: "5 and 10 Marla plots, 1 Kanal houses",
    priceBand: "PKR 1.2 Crore – PKR 7 Crore",
    rentBand: "PKR 55,000 – PKR 1.9 Lakh per month",
    character:
      "Khayaban-e-Amin is a mature Ferozepur Road scheme with wide streets, established plantations and a settled family population. Its blocks connect easily to Wapda Town, Johar Town and the Canal Road interchange.",
    buyers:
      "End users who want a mid-market Ferozepur Road address, and investors comparing rental yield against Johar Town and Wapda Town.",
    verification:
      "Ask for the allotment and transfer record, current dues, and written confirmation that street development is complete for the plot on offer.",
    nearby: ["etihad-town-lahore", "state-life-housing-society-lahore", "jubilee-town-lahore"],
    lat: 31.4519,
    lng: 74.2697,
  },
  {
    slug: "green-cap-housing-society-lahore",
    name: "Green Cap Housing Society Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Green Cap",
    aliases: ["Green Cap", "Green Cap Housing"],
    authority: "Green Cap Housing Scheme management",
    belt: "Raiwind Road belt, south-west Lahore",
    sizes: "3, 5 and 10 Marla plots",
    priceBand: "PKR 42 Lakh – PKR 2.6 Crore",
    rentBand: "PKR 22,000 – PKR 80,000 per month",
    character:
      "Green Cap is a value play in the Raiwind budget belt: entry pricing sits below the neighbouring Bahria and Valencia schemes, and development is progressing block by block with commercial plots fronting the main access road.",
    buyers:
      "First-time plot buyers and small investors who want to enter the Lahore market at the lowest workable ticket size and hold for infrastructure to complete.",
    verification:
      "Confirm the block's layout approval, the development timeline in writing, and the society's policy on delayed possession or refunds.",
    nearby: ["kings-town-lahore", "al-kabir-town-lahore", "new-lahore-city"],
    lat: 31.3611,
    lng: 74.1762,
  },
  {
    slug: "awt-housing-scheme-lahore",
    name: "AWT Housing Scheme Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "AWT Housing",
    aliases: ["AWT Housing Scheme", "AWT"],
    authority: "Army Welfare Trust",
    belt: "Raiwind Road, south-west Lahore",
    sizes: "5, 10 Marla plots and 1 Kanal houses",
    priceBand: "PKR 1.1 Crore – PKR 7.5 Crore",
    rentBand: "PKR 55,000 – PKR 1.9 Lakh per month",
    character:
      "AWT Housing Scheme is run on welfare-trust discipline: gated access, controlled construction and maintained roads. That management standard is the main reason its resale values hold up against larger private societies nearby.",
    buyers:
      "Owner-occupiers who want predictable maintenance and security, plus investors targeting defence-linked tenants in the Raiwind belt.",
    verification:
      "Confirm your eligibility category for the scheme, the transfer charges, and the current construction by-laws before negotiating price.",
    nearby: ["valencia-town-lahore", "lake-city-lahore", "bahria-town-lahore"],
    lat: 31.3749,
    lng: 74.1602,
  },
  {
    slug: "pine-avenue-lahore",
    name: "Pine Avenue Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Pine Avenue",
    aliases: ["Pine Avenue", "Pine Villas", "Pine Avenue Villas"],
    authority: "Private developers (approved layout)",
    belt: "Southern villa belt off Bedian Road / Ring Road side",
    sizes: "5 and 10 Marla homes, townhouses and villas",
    priceBand: "PKR 1.4 Crore – PKR 6.5 Crore",
    rentBand: "PKR 65,000 – PKR 1.8 Lakh per month",
    character:
      "Pine Avenue is a boutique villa development rather than a large scheme: fewer streets, consistent elevations and a smaller resident community. That suits buyers who want low-rise living close to the Bedian Road corridor without a large-society crowd.",
    buyers:
      "DHA and Bedian Road buyers looking for a ready villa at a lower ticket, and overseas families who want a managed low-density address.",
    verification:
      "Verify the developer's completion track record on earlier phases, the maintenance arrangement, and whether utilities are connected at the unit boundary.",
    nearby: ["dream-gardens-lahore", "bahria-orchard-lahore", "paragon-city-lahore"],
    lat: 31.4869,
    lng: 74.4277,
  },
  {
    slug: "fazaia-housing-scheme-lahore",
    name: "Fazaia Housing Scheme Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Fazaia",
    aliases: ["Fazaia Housing Scheme", "Fazaia Lahore"],
    authority: "Fazaia Housing Scheme (PAF welfare) ",
    belt: "Ferozepur Road corridor near Kahna, south-east Lahore",
    sizes: "5, 10 Marla plots and 1 Kanal houses",
    priceBand: "PKR 90 Lakh – PKR 5.5 Crore",
    rentBand: "PKR 45,000 – PKR 1.6 Lakh per month",
    character:
      "Fazaia offers a disciplined, low-density environment on the Ferozepur Road and Ring Road side of the city, where land is still comparatively affordable. Streets are laid out to a fixed grid and construction follows strict elevation rules.",
    buyers:
      "Serving and retired personnel buying within the welfare framework, and civilian investors comparing the south-eastern belt against Kahna and Bedian Road options.",
    verification:
      "Confirm your eligibility category, the file or allotment position, and the exact charges payable at the time of transfer.",
    nearby: ["khayaban-e-amin-lahore", "central-park-housing-scheme-lahore", "paragon-city-lahore"],
    lat: 31.4139,
    lng: 74.3452,
  },
  {
    slug: "askari-10-lahore",
    name: "Askari 10 Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Askari 10",
    aliases: ["Askari 10", "Askari-X"],
    authority: "Army Welfare Trust (Askari)",
    belt: "Airport Road / Walton side, south-east Lahore",
    sizes: "5, 10 Marla plots, apartments and 1 Kanal houses",
    priceBand: "PKR 1.8 Crore – PKR 12 Crore",
    rentBand: "PKR 85,000 – PKR 3.5 Lakh per month",
    character:
      "Askari 10 combines tight security with genuine proximity to Cantt, the airport and the Walton Road business district. Apartments and houses share the same managed estate, so tenant demand stays broad across formats.",
    buyers:
      "Corporate tenants and families seeking a secured estate near the airport, and investors targeting rental income rather than short-term flipping.",
    verification:
      "Check the maintenance charges for the block, the transfer procedure through the Askari office, and any restriction on renting to non-members.",
    nearby: ["cavalry-ground-lahore", "sui-gas-society-lahore", "paragon-city-lahore"],
    lat: 31.5107,
    lng: 74.4039,
  },
  {
    slug: "wapda-town-lahore",
    name: "Wapda Town Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Wapda Town",
    aliases: ["Wapda Town", "Wapda Town Phase 1"],
    authority: "Wapda Employees Cooperative Housing Society",
    belt: "Main Ferozepur Road near Khayaban-e-Amin, south Lahore",
    sizes: "5 and 10 Marla plots, 1 Kanal houses",
    priceBand: "PKR 1.6 Crore – PKR 8.5 Crore",
    rentBand: "PKR 75,000 – PKR 2.3 Lakh per month",
    character:
      "Wapda Town is a settled, grid-planned scheme with wide roads, schools and a residential character that has stayed consistent for two decades. Its location between Johar Town and Ferozepur Road keeps both commute and rental demand strong.",
    buyers:
      "Families who want a fully developed Ferozepur Road location, and landlords renting to university and hospital staff nearby.",
    verification:
      "Confirm the plot number on the society layout, the dues position and the current transfer fee before making an offer.",
    nearby: ["khayaban-e-amin-lahore", "jubilee-town-lahore", "state-life-housing-society-lahore"],
    lat: 31.4489,
    lng: 74.2794,
  },
  {
    slug: "paragon-city-lahore",
    name: "Paragon City Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Paragon City",
    aliases: ["Paragon City"],
    authority: "Paragon City Developers",
    belt: "Burki Road / Ring Road junction, north-east Lahore",
    sizes: "5, 10 Marla plots, 1 Kanal and 2 Kanal homes",
    priceBand: "PKR 1.3 Crore – PKR 12 Crore",
    rentBand: "PKR 60,000 – PKR 3 Lakh per month",
    character:
      "Paragon City is planned around a broad boulevard with separate residential and commercial components, plus its own security and waste-management system. Access to the Ring Road and Airport makes it a practical base for people working across the city.",
    buyers:
      "Airport and Ring Road corridor professionals, plus investors who want a mixed plot-and-commercial portfolio inside one scheme.",
    verification:
      "Confirm the block, the development charges applicable at possession, and the society's written position on commercial conversion of residential plots.",
    nearby: ["dream-gardens-lahore", "cavalry-ground-lahore", "pine-avenue-lahore"],
    lat: 31.5272,
    lng: 74.4404,
  },
  {
    slug: "sui-gas-society-lahore",
    name: "Sui Gas Housing Society Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Sui Gas",
    aliases: ["Sui Gas Housing Society", "Sui Gas Society"],
    authority: "Sui Northern Gas Employees Cooperative Housing Society",
    belt: "Opposite DHA Phase 5, Phase 4 and 5 side, Lahore",
    sizes: "10 Marla and 1 Kanal plots and houses",
    priceBand: "PKR 3.5 Crore – PKR 16 Crore",
    rentBand: "PKR 1.2 Lakh – PKR 4 Lakh per month",
    character:
      "Sui Gas Society is a small, sought-after scheme directly across from DHA Phase 5, with 10 Marla and 1 Kanal plots on a quiet street grid. Supply is limited because residents rarely sell, which supports long-term pricing.",
    buyers:
      "DHA-adjacent buyers who want a smaller community, and investors looking for a low-turnover residential asset with premium tenant appeal.",
    verification:
      "Confirm the plot's approved size, the dues position, and that the transfer is executed through the society office with a written clearance.",
    nearby: ["askari-10-lahore", "dream-gardens-lahore", "dha-phase-6-lahore"],
    lat: 31.4805,
    lng: 74.3873,
  },
  {
    slug: "state-life-housing-society-lahore",
    name: "State Life Housing Society Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "State Life Housing",
    aliases: ["State Life Housing Society", "State Life Society"],
    authority: "State Life Insurance Corporation employees' society",
    belt: "Ferozepur Road, near Khayaban-e-Amin, south Lahore",
    sizes: "5, 10 Marla plots and 1 Kanal houses",
    priceBand: "PKR 1.3 Crore – PKR 7 Crore",
    rentBand: "PKR 55,000 – PKR 1.9 Lakh per month",
    character:
      "State Life Housing Society has the calm, low-rise feel of a scheme built for its own members, with wide streets and very little commercial intrusion. Ferozepur Road access keeps it connected to Johar Town and the city centre.",
    buyers:
      "Families wanting a quiet, established neighbourhood on Ferozepur Road, and long-hold investors attracted by limited turnover.",
    verification:
      "Ask for the society's dues statement, the transfer procedure and confirmation that the plot is free of any mortgage or lien.",
    nearby: ["wapda-town-lahore", "khayaban-e-amin-lahore", "etihad-town-lahore"],
    lat: 31.4441,
    lng: 74.2571,
  },
  {
    slug: "central-park-housing-scheme-lahore",
    name: "Central Park Housing Scheme Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Central Park",
    aliases: ["Central Park Housing Scheme", "Central Park Lahore"],
    authority: "Central Park Housing Scheme management",
    belt: "Ferozepur Road near Kahna Nau, south-east Lahore",
    sizes: "3, 5 and 10 Marla plots, 1 Kanal homes",
    priceBand: "PKR 50 Lakh – PKR 4.2 Crore",
    rentBand: "PKR 28,000 – PKR 1.3 Lakh per month",
    character:
      "Central Park targets the affordable end of the Ferozepur Road market with a park-and-street plan and its own commercial area. The scheme is popular with buyers who need Lahore access but cannot stretch to the DHA or Johar Town bands.",
    buyers:
      "First-time buyers, small builders and overseas investors buying plots on instalment plans.",
    verification:
      "Confirm the block's approval, the possession timeline and the exact instalment schedule in writing before signing.",
    nearby: ["fazaia-housing-scheme-lahore", "khayaban-e-amin-lahore", "paragon-city-lahore"],
    lat: 31.4092,
    lng: 74.3855,
  },
  {
    slug: "formanites-housing-scheme-lahore",
    name: "Formanites Housing Scheme Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Formanites",
    aliases: ["Formanites Housing Scheme", "Formanites"],
    authority: "Formanites Housing Scheme management",
    belt: "Canal Bank Road near Thokar Niaz Baig, south Lahore",
    sizes: "1 Kanal and 2 Kanal plots and houses",
    priceBand: "PKR 5 Crore – PKR 20 Crore",
    rentBand: "PKR 1.8 Lakh – PKR 5 Lakh per month",
    character:
      "Formanites is a low-density scheme of mostly 1 Kanal and larger plots on the Canal Road side, a short drive from Johar Town and DHA. Large plot sizes and a stable resident profile keep it in the premium segment.",
    buyers:
      "Buyers who want plot area and privacy within city limits, and tenants looking for large family homes close to Canal Road schools.",
    verification:
      "Confirm approved plot dimensions, the building by-laws for the block and the dues position before negotiating on price.",
    nearby: ["jubilee-town-lahore", "wapda-town-lahore", "dream-gardens-lahore"],
    lat: 31.4673,
    lng: 74.2845,
  },
  {
    slug: "cavalry-ground-lahore",
    name: "Cavalry Ground Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Cavalry Ground",
    aliases: ["Cavalry Ground", "Cavalry Ground Cantt"],
    authority: "Cantonment Board Lahore",
    belt: "Gulberg and Airport Road side, central Lahore",
    sizes: "1 Kanal, 2 Kanal bungalows, apartments",
    priceBand: "PKR 6 Crore – PKR 30 Crore",
    rentBand: "PKR 2 Lakh – PKR 8 Lakh per month",
    character:
      "Cavalry Ground is central Lahore at its most established: tree-lined streets, large bungalows and strict Cantt building controls. Its commercial strip on Main Boulevard serves the surrounding neighbourhoods.",
    buyers:
      "Executives, diplomats and families who need Gulberg and airport access, plus investors targeting long-term commercial and rental assets.",
    verification:
      "Confirm Cantt Board approval for any construction or commercial use, and review the property tax and utility records before transfer.",
    nearby: ["askari-10-lahore", "sui-gas-society-lahore", "paragon-city-lahore"],
    lat: 31.5052,
    lng: 74.3685,
  },
  {
    slug: "bahria-orchard-lahore",
    name: "Bahria Orchard Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Bahria Orchard",
    aliases: ["Bahria Orchard", "Bahria Orchard Phase 4"],
    authority: "Bahria Town (Pvt) Ltd",
    belt: "Raiwind Road, south-west Lahore",
    sizes: "5, 10 Marla plots and 1 Kanal villas",
    priceBand: "PKR 1.2 Crore – PKR 7.5 Crore",
    rentBand: "PKR 55,000 – PKR 2.2 Lakh per month",
    character:
      "Bahria Orchard delivers the Bahria management model — gated phases, maintained roads, security patrols and community facilities — at a lower entry point than Bahria Town Lahore itself. Phase 4 is the most active resale market.",
    buyers:
      "Families who want Bahria facilities on a smaller budget, and investors comparing Orchard yields against Valencia and Lake City.",
    verification:
      "Confirm the phase, the maintenance charge cycle and the transfer fee structure with the Bahria office before committing.",
    nearby: ["bahria-town-lahore", "lake-city-lahore", "lda-avenue-lahore"],
    lat: 31.3618,
    lng: 74.1994,
  },
  {
    slug: "ahmad-housing-society-lahore",
    name: "Ahmad Housing Society Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Ahmad Housing",
    aliases: ["Ahmad Housing Society"],
    authority: "Ahmad Housing Society management",
    belt: "Raiwind Road belt, south-west Lahore",
    sizes: "3, 5 and 10 Marla plots",
    priceBand: "PKR 40 Lakh – PKR 2.4 Crore",
    rentBand: "PKR 22,000 – PKR 75,000 per month",
    character:
      "Ahmad Housing Society is a smaller Raiwind Road scheme with a straightforward plot inventory and a lower entry ticket than its larger neighbours. It suits buyers who need a compact, gated layout rather than resort-style amenities.",
    buyers:
      "Budget buyers, small investors and overseas Pakistanis adding a low-cost plot to their portfolio.",
    verification:
      "Confirm the layout approval, the current development status of the block and the society's transfer charges.",
    nearby: ["al-kabir-town-lahore", "green-cap-housing-society-lahore", "new-lahore-city"],
    lat: 31.3992,
    lng: 74.1556,
  },
  {
    slug: "lahore-state-housing-society-lahore",
    name: "Lahore State Housing Society",
    citySlug: "lahore",
    cityName: "Lahore",
    match: "Lahore State Housing",
    aliases: ["Lahore State Housing Society"],
    authority: "Lahore State Housing Society management",
    belt: "Raiwind Road belt, south-west Lahore",
    sizes: "5 and 10 Marla plots",
    priceBand: "PKR 70 Lakh – PKR 3 Crore",
    rentBand: "PKR 32,000 – PKR 95,000 per month",
    character:
      "Lahore State Housing Society offers mid-market plots a short drive from Bahria Town and Kings Town, with a compact street grid and an active commercial frontage. Rental demand comes mostly from the surrounding Raiwind workforce.",
    buyers:
      "Middle-income families and investors who want Raiwind Road exposure with 5 Marla entry pricing.",
    verification:
      "Ask for the dues statement and confirm the block's street development status before making a booking.",
    nearby: ["kings-town-lahore", "al-kabir-town-lahore", "bahria-town-lahore"],
    lat: 31.3808,
    lng: 74.1696,
  },

  /* ---------------------------------------------------------------- */
  /*  Islamabad                                                       */
  /* ---------------------------------------------------------------- */
  {
    slug: "bahria-enclave-islamabad",
    name: "Bahria Enclave Islamabad",
    citySlug: "islamabad",
    cityName: "Islamabad",
    match: "Bahria Enclave",
    aliases: ["Bahria Enclave", "Bahria Enclave Sector C"],
    authority: "Bahria Town (Pvt) Ltd",
    belt: "Park Road, south-east Islamabad",
    sizes: "5, 8, 10 Marla, 1 Kanal plots and villas",
    priceBand: "PKR 1.6 Crore – PKR 14 Crore",
    rentBand: "PKR 70,000 – PKR 3 Lakh per month",
    character:
      "Bahria Enclave is the capital's most active gated scheme, with hillside sectors, a large commercial concourse and a maintained security perimeter. Sector C and the villa precincts carry the strongest resale activity.",
    buyers:
      "Families working in Islamabad who want gated amenities, and investors who value Bahria's management record and rental pool.",
    verification:
      "Confirm the sector and street width, current maintenance charges, and the transfer procedure through the Bahria office.",
    nearby: ["gulberg-greens-islamabad", "park-view-city-islamabad", "top-city-islamabad"],
    lat: 33.6272,
    lng: 73.1725,
    featured: true,
  },
  {
    slug: "gulberg-greens-islamabad",
    name: "Gulberg Greens Islamabad",
    citySlug: "islamabad",
    cityName: "Islamabad",
    match: "Gulberg Greens",
    aliases: ["Gulberg Greens", "Gulberg Residencia"],
    authority: "Gulberg Greens (private scheme)",
    belt: "Islamabad Expressway, south-east Islamabad",
    sizes: "5, 10 Marla, 1 Kanal and 4 Kanal farmhouse plots",
    priceBand: "PKR 1.9 Crore – PKR 22 Crore",
    rentBand: "PKR 90,000 – PKR 4 Lakh per month",
    character:
      "Gulberg Greens mixes residential blocks with farmhouse plots and a commercial district on the Expressway, which gives it both lifestyle appeal and investor liquidity. Its proximity to the airport is a consistent demand driver.",
    buyers:
      "Buyers wanting farmhouse living near the capital, and investors targeting commercial plots along the Expressway frontage.",
    verification:
      "Check the plot category (residential, farmhouse or commercial), the by-laws for construction, and any pending dues before transfer.",
    nearby: ["bahria-enclave-islamabad", "top-city-islamabad", "park-view-city-islamabad"],
    lat: 33.6017,
    lng: 73.1508,
    featured: true,
  },
  {
    slug: "park-view-city-islamabad",
    name: "Park View City Islamabad",
    citySlug: "islamabad",
    cityName: "Islamabad",
    match: "Park View City",
    aliases: ["Park View City", "PVC Islamabad"],
    authority: "Vision Group",
    belt: "Malot Road, off Islamabad Expressway",
    sizes: "5, 8, 10 Marla, 1 Kanal plots and apartments",
    priceBand: "PKR 1.7 Crore – PKR 16 Crore",
    rentBand: "PKR 75,000 – PKR 3 Lakh per month",
    character:
      "Park View City is built around its downtown commercial spine and a hilltop residential section, with CDA-aligned planning. The scheme has moved quickly from files to possession in several blocks.",
    buyers:
      "Investors attracted by the downtown commercial yield story, and families wanting a planned, amenity-rich address close to the Expressway.",
    verification:
      "Confirm which block your plot falls in, its development stage, and the schedule of charges payable at possession.",
    nearby: ["bahria-enclave-islamabad", "top-city-islamabad", "gulberg-greens-islamabad"],
    lat: 33.6383,
    lng: 73.2081,
  },
  {
    slug: "top-city-islamabad",
    name: "Top City-1 Islamabad",
    citySlug: "islamabad",
    cityName: "Islamabad",
    match: "Top City",
    aliases: ["Top City", "Top City-1"],
    authority: "Top City Developers",
    belt: "Main Srinagar Highway / Motorway link, north Islamabad",
    sizes: "5, 10 Marla, 1 Kanal plots and apartments",
    priceBand: "PKR 1.4 Crore – PKR 15 Crore",
    rentBand: "PKR 65,000 – PKR 3 Lakh per month",
    character:
      "Top City-1 sits beside the Srinagar Highway and motorway interchange, which makes it a convenient base for buyers commuting to both Islamabad and Rawalpindi. The scheme includes a large commercial and apartment component.",
    buyers:
      "Twin-city commuters and apartment investors, along with buyers who want airport and motorway access within minutes.",
    verification:
      "Confirm the block's layout plan, the current possession status and the transfer charges held by the developer.",
    nearby: ["bahria-enclave-islamabad", "g-13-islamabad", "park-view-city-islamabad"],
    lat: 33.6327,
    lng: 72.9892,
  },
  {
    slug: "g-13-islamabad",
    name: "G-13 Islamabad",
    citySlug: "islamabad",
    cityName: "Islamabad",
    match: "G-13",
    aliases: ["G-13", "Sector G-13"],
    authority: "Capital Development Authority (CDA)",
    belt: "Srinagar Highway / Kashmir Highway side, west Islamabad",
    sizes: "1 Kanal, 10 Marla plots, apartments",
    priceBand: "PKR 3.5 Crore – PKR 22 Crore",
    rentBand: "PKR 1.3 Lakh – PKR 4.5 Lakh per month",
    character:
      "G-13 is a CDA sector with full infrastructure, a metro bus corridor and the fruit and vegetable market nearby. Conversion from plots to apartments happens steadily because of the metro access.",
    buyers:
      "Public-sector employees, families wanting an official sector address, and apartment developers buying 1 Kanal plots for redevelopment.",
    verification:
      "Verify the allotment and transfer record at CDA, the building by-laws for the plot size and any outstanding property tax.",
    nearby: ["top-city-islamabad", "e-11-islamabad", "f-11-islamabad"],
    lat: 33.6562,
    lng: 73.0301,
  },
  {
    slug: "e-11-islamabad",
    name: "E-11 Islamabad",
    citySlug: "islamabad",
    cityName: "Islamabad",
    match: "E-11",
    aliases: ["E-11", "Sector E-11"],
    authority: "Capital Development Authority (CDA)",
    belt: "Kashmir Highway, north-west Islamabad",
    sizes: "10 Marla and 1 Kanal plots, apartments",
    priceBand: "PKR 4 Crore – PKR 24 Crore",
    rentBand: "PKR 1.5 Lakh – PKR 5 Lakh per month",
    character:
      "E-11 offers CDA-approved plots next to the M-1 motorway interchange, and it is one of the few sectors where apartment towers and independent houses sit side by side. Site visits are easy because the sector is fully developed.",
    buyers:
      "Families who want a sector address with motorway access, and investors buying plots for vertical development.",
    verification:
      "Confirm the plot's size category, the CDA transfer route and whether any building plan approval is already on record.",
    nearby: ["g-13-islamabad", "f-11-islamabad", "top-city-islamabad"],
    lat: 33.6969,
    lng: 72.9905,
  },
  {
    slug: "f-11-islamabad",
    name: "F-11 Islamabad",
    citySlug: "islamabad",
    cityName: "Islamabad",
    match: "F-11",
    aliases: ["F-11", "Sector F-11"],
    authority: "Capital Development Authority (CDA)",
    belt: "Kashmir Highway, central-west Islamabad",
    sizes: "1 Kanal and 2 Kanal plots, apartment floors",
    priceBand: "PKR 6 Crore – PKR 45 Crore",
    rentBand: "PKR 2 Lakh – PKR 7 Lakh per month",
    character:
      "F-11 is a premium CDA sector with wide roads, hospital and commercial access, and a deep resident rental market. Demand from institutions and diplomatic staff keeps large houses occupied on long leases.",
    buyers:
      "Senior professionals and institutional tenants, plus long-term investors holding 1 Kanal and 2 Kanal plots.",
    verification:
      "Check CDA records for the allotment chain, outstanding dues and any approved change of land use before payment.",
    nearby: ["e-11-islamabad", "g-13-islamabad", "bahria-enclave-islamabad"],
    lat: 33.6866,
    lng: 73.0102,
    featured: true,
  },

  /* ---------------------------------------------------------------- */
  /*  Karachi                                                         */
  /* ---------------------------------------------------------------- */
  {
    slug: "gulshan-e-iqbal-karachi",
    name: "Gulshan-e-Iqbal Karachi",
    citySlug: "karachi",
    cityName: "Karachi",
    match: "Gulshan-e-Iqbal",
    aliases: ["Gulshan-e-Iqbal", "Gulshan"],
    authority: "Karachi Metropolitan Corporation / KDA blocks",
    belt: "University Road / Rashid Minhas Road, central Karachi",
    sizes: "120 sq yd, 240 sq yd plots, flats and builder floors",
    priceBand: "PKR 1.2 Crore – PKR 18 Crore",
    rentBand: "PKR 45,000 – PKR 3 Lakh per month",
    character:
      "Gulshan-e-Iqbal is Karachi's largest middle-class residential district, organised by blocks with universities, hospitals and major markets inside it. Flats and builder floors dominate supply, and rental demand is constant.",
    buyers:
      "Families who want an established block address, and investors buying flats for rental income near the universities.",
    verification:
      "Confirm the block's lease status with KDA or the KMC, the building's maintenance position and any pending society charges.",
    nearby: ["pechs-karachi", "north-nazimabad-karachi", "scheme-33-karachi"],
    lat: 24.9206,
    lng: 67.0972,
    featured: true,
  },
  {
    slug: "pechs-karachi",
    name: "PECHS Karachi",
    citySlug: "karachi",
    cityName: "Karachi",
    match: "PECHS",
    aliases: ["PECHS", "P.E.C.H.S"],
    authority: "Pakistan Employees Cooperative Housing Society",
    belt: "Shahrah-e-Quaideen / Tariq Road, central Karachi",
    sizes: "120, 240 and 400 sq yd plots, flats, commercial floors",
    priceBand: "PKR 2.5 Crore – PKR 30 Crore",
    rentBand: "PKR 80,000 – PKR 4 Lakh per month",
    character:
      "PECHS holds some of Karachi's most valuable inner-city land, with Tariq Road retail, hospitals and offices within walking distance. Old bungalows are steadily being replaced by apartment towers and commercial plazas.",
    buyers:
      "Commercial and mixed-use investors, medical and professional tenants, and developers assembling plots for vertical projects.",
    verification:
      "Confirm the plot's sanctioned use, the building potential with the relevant authority and the clear title chain before negotiation.",
    nearby: ["gulshan-e-iqbal-karachi", "north-nazimabad-karachi", "dha-phase-6-karachi"],
    lat: 24.8717,
    lng: 67.0578,
    featured: true,
  },
  {
    slug: "north-nazimabad-karachi",
    name: "North Nazimabad Karachi",
    citySlug: "karachi",
    cityName: "Karachi",
    match: "North Nazimabad",
    aliases: ["North Nazimabad", "Nazimabad"],
    authority: "Karachi Metropolitan Corporation blocks",
    belt: "Shahrah-e-Pakistan / SITE side, north Karachi",
    sizes: "120 and 240 sq yd plots, flats",
    priceBand: "PKR 1.3 Crore – PKR 12 Crore",
    rentBand: "PKR 40,000 – PKR 2 Lakh per month",
    character:
      "North Nazimabad is a dense, well-connected district of blocks running along Shahrah-e-Pakistan, with strong neighbourhood retail and quick access to SITE and Nazimabad. Rental demand is broad and entry prices remain lower than PECHS or DHA.",
    buyers:
      "Small investors buying 120 sq yd plots and flats, and families who need an established inner-city location on a mid budget.",
    verification:
      "Check the block's lease documents, any shop or commercial conversion in the building, and the society's maintenance position.",
    nearby: ["gulshan-e-iqbal-karachi", "pechs-karachi", "scheme-33-karachi"],
    lat: 24.9422,
    lng: 67.0409,
  },
  {
    slug: "scheme-33-karachi",
    name: "Scheme 33 Karachi",
    citySlug: "karachi",
    cityName: "Karachi",
    match: "Scheme 33",
    aliases: ["Scheme 33", "Scheme-33"],
    authority: "KDA Scheme 33 and sub-schemes",
    belt: "Super Highway / Abul Hassan Isphahani Road, north-east Karachi",
    sizes: "120, 240 sq yd plots, bungalows and flats",
    priceBand: "PKR 1.1 Crore – PKR 14 Crore",
    rentBand: "PKR 38,000 – PKR 2.4 Lakh per month",
    character:
      "Scheme 33 covers a wide band of Karachi's north-east, from Gulshan-adjacent blocks to the Super Highway side subschemes. Newer gated projects inside it have raised the area's profile and average ticket size.",
    buyers:
      "Middle-income families and investors comparing established blocks with newer gated projects on the Super Highway belt.",
    verification:
      "Confirm the exact subscheme, the plot's lease position with KDA, and whether the sub-scheme has its own maintenance body.",
    nearby: ["gulshan-e-iqbal-karachi", "korangi-creek-karachi", "north-nazimabad-karachi"],
    lat: 24.9707,
    lng: 67.1302,
  },
  {
    slug: "korangi-creek-karachi",
    name: "Korangi Creek Karachi",
    citySlug: "karachi",
    cityName: "Karachi",
    match: "Korangi Creek",
    aliases: ["Korangi Creek", "Korangi"],
    authority: "Defence Housing Authority / industrial zones",
    belt: "Korangi Creek Road, south-east Karachi",
    sizes: "240 sq yd, 500 sq yd plots, bungalows, industrial sheds",
    priceBand: "PKR 2 Crore – PKR 25 Crore",
    rentBand: "PKR 70,000 – PKR 3.5 Lakh per month",
    character:
      "Korangi Creek pairs DHA-managed residential enclaves with Karachi's largest industrial belt, which keeps both rental and commercial demand structurally strong. University and hospital campuses further south add to the tenant pool.",
    buyers:
      "Industrialists and logistics businesses leasing nearby, and investors targeting staff-housing and commercial rentals.",
    verification:
      "Confirm the lease or allotment category (residential, commercial or industrial) and any authority NOC needed for your intended use.",
    nearby: ["scheme-33-karachi", "pechs-karachi", "gulshan-e-iqbal-karachi"],
    lat: 24.8062,
    lng: 67.1607,
  },
  {
    slug: "dha-phase-6-karachi",
    name: "DHA Phase 6 Karachi",
    citySlug: "karachi",
    cityName: "Karachi",
    match: "DHA Phase 6",
    aliases: ["DHA Phase 6 Karachi", "Phase 6 DHA"],
    authority: "Defence Housing Authority Karachi",
    belt: "Khayaban-e-Bukhari / Korangi Road side, south Karachi",
    sizes: "500, 1000 sq yd plots, apartments and commercial floors",
    priceBand: "PKR 5 Crore – PKR 60 Crore",
    rentBand: "PKR 2 Lakh – PKR 8 Lakh per month",
    character:
      "DHA Phase 6 runs along the Khayaban-e-Bukhari spine with high-street commercial, apartment towers and large bungalow plots. It is one of the strongest rental markets in the city for corporate tenants.",
    buyers:
      "Corporate tenants and executives, plus investors buying commercial floors and apartments for income.",
    verification:
      "Verify DHA transfer clearance, the maintenance charge status and any restriction on commercial use of the plot.",
    nearby: ["pechs-karachi", "korangi-creek-karachi", "gulshan-e-iqbal-karachi"],
    lat: 24.8,
    lng: 67.0703,
  },

  /* ---------------------------------------------------------------- */
  /*  Rawalpindi                                                      */
  /* ---------------------------------------------------------------- */
  {
    slug: "gulraiz-housing-scheme-rawalpindi",
    name: "Gulraiz Housing Scheme Rawalpindi",
    citySlug: "rawalpindi",
    cityName: "Rawalpindi",
    match: "Gulraiz",
    aliases: ["Gulraiz", "Gulraiz Housing Scheme", "Gulraiz Phase 1"],
    authority: "Gulraiz Housing Scheme management",
    belt: "Adiala Road / Airport Road side, south Rawalpindi",
    sizes: "5, 10 Marla, 1 Kanal plots and houses",
    priceBand: "PKR 85 Lakh – PKR 6 Crore",
    rentBand: "PKR 40,000 – PKR 2 Lakh per month",
    character:
      "Gulraiz is one of Rawalpindi's better-established schemes, with a full street grid, commercial markets and quick links to Adiala Road and the Islamabad Expressway. Families working in the capital rent here because the price gap is significant.",
    buyers:
      "Twin-city commuters, serving personnel and investors who want a developed scheme at Rawalpindi pricing.",
    verification:
      "Confirm the phase, the plot's dues position and the management's current transfer charges before paying any advance.",
    nearby: ["bahria-town-phase-8-rawalpindi", "chaklala-scheme-3-rawalpindi", "adiala-road-rawalpindi"],
    lat: 33.5414,
    lng: 73.0737,
    featured: true,
  },
  {
    slug: "chaklala-scheme-3-rawalpindi",
    name: "Chaklala Scheme 3 Rawalpindi",
    citySlug: "rawalpindi",
    cityName: "Rawalpindi",
    match: "Chaklala Scheme",
    aliases: ["Chaklala Scheme 3", "Chaklala Scheme III"],
    authority: "Chaklala Scheme 3 management",
    belt: "Airport Road, near Chaklala, central Rawalpindi",
    sizes: "1 Kanal, 10 Marla plots and apartments",
    priceBand: "PKR 3 Crore – PKR 16 Crore",
    rentBand: "PKR 1.2 Lakh – PKR 4 Lakh per month",
    character:
      "Chaklala Scheme 3 is a premium, central Rawalpindi address with mature streets and easy access to the airport, Cantt and Islamabad. Large bungalows and newer apartment projects sit side by side.",
    buyers:
      "Senior professionals, diplomats and families needing airport access, plus investors buying apartments for institutional tenants.",
    verification:
      "Check the plot's approval and building by-laws, the property tax record and any structural work carried out on the property.",
    nearby: ["gulraiz-housing-scheme-rawalpindi", "askari-14-rawalpindi", "airport-housing-society-rawalpindi"],
    lat: 33.5858,
    lng: 73.0583,
  },
  {
    slug: "askari-14-rawalpindi",
    name: "Askari 14 Rawalpindi",
    citySlug: "rawalpindi",
    cityName: "Rawalpindi",
    match: "Askari 14",
    aliases: ["Askari 14", "Askari-14"],
    authority: "Army Welfare Trust (Askari)",
    belt: "Adiala Road / Chakri Road junction, south Rawalpindi",
    sizes: "5, 10 Marla plots, 1 Kanal houses",
    priceBand: "PKR 1.5 Crore – PKR 9 Crore",
    rentBand: "PKR 65,000 – PKR 2.4 Lakh per month",
    character:
      "Askari 14 is a planned estate with wide roads, dedicated commercial zones and disciplined construction standards. Its position on the Adiala Road side gives access to both the motorway and Rawalpindi city.",
    buyers:
      "Members buying within the Askari framework, plus investors attracted by the estate's management standards.",
    verification:
      "Confirm eligibility requirements, the transfer procedure through the Askari office and the maintenance charge cycle.",
    nearby: ["bahria-town-phase-8-rawalpindi", "gulraiz-housing-scheme-rawalpindi", "adiala-road-rawalpindi"],
    lat: 33.4747,
    lng: 73.0886,
  },
  {
    slug: "adiala-road-rawalpindi",
    name: "Adiala Road Rawalpindi",
    citySlug: "rawalpindi",
    cityName: "Rawalpindi",
    match: "Adiala Road",
    aliases: ["Adiala Road"],
    authority: "Multiple approved schemes along Adiala Road",
    belt: "Adiala Road corridor, south Rawalpindi",
    sizes: "5, 10 Marla plots and 1 Kanal houses",
    priceBand: "PKR 80 Lakh – PKR 6 Crore",
    rentBand: "PKR 35,000 – PKR 1.8 Lakh per month",
    character:
      "The Adiala Road corridor has become Rawalpindi's primary growth belt, with new gated schemes lining both sides and consistent construction activity. Buyers here trade a longer commute to Islamabad for a materially lower price per Marla.",
    buyers:
      "First-time buyers, investors buying early in new schemes, and families working at the Adiala Road industrial and institutional establishments.",
    verification:
      "Verify the specific scheme's approval, the developer's delivery record and whether utilities are already laid in your street.",
    nearby: ["askari-14-rawalpindi", "gulraiz-housing-scheme-rawalpindi", "bahria-town-phase-8-rawalpindi"],
    lat: 33.4652,
    lng: 73.0194,
  },
  {
    slug: "airport-housing-society-rawalpindi",
    name: "Airport Housing Society Rawalpindi",
    citySlug: "rawalpindi",
    cityName: "Rawalpindi",
    match: "Airport Housing",
    aliases: ["Airport Housing Society"],
    authority: "Airport Housing Society management",
    belt: "Airport Road near Islamabad International Airport",
    sizes: "5, 10 Marla plots and 1 Kanal houses",
    priceBand: "PKR 1.2 Crore – PKR 7 Crore",
    rentBand: "PKR 50,000 – PKR 2 Lakh per month",
    character:
      "Airport Housing Society is a compact, gated scheme close to the new Islamabad airport, with a settled street pattern and a well-kept central market. Demand comes from airline, airport and logistics staff.",
    buyers:
      "Airport and aviation-sector employees, and investors targeting steady rental demand from airport staff.",
    verification:
      "Confirm the society's approval, the plot's dues clearance and the current charges for transfer and possession.",
    nearby: ["chaklala-scheme-3-rawalpindi", "gulraiz-housing-scheme-rawalpindi", "askari-14-rawalpindi"],
    lat: 33.5941,
    lng: 72.9385,
  },

  /* ---------------------------------------------------------------- */
  /*  Faisalabad                                                      */
  /* ---------------------------------------------------------------- */
  {
    slug: "wapda-city-faisalabad",
    name: "Wapda City Faisalabad",
    citySlug: "faisalabad",
    cityName: "Faisalabad",
    match: "Wapda City",
    aliases: ["Wapda City", "Wapda City Faisalabad"],
    authority: "Wapda Employees Cooperative Housing Society",
    belt: "Canal Road / Jaranwala Road side, Faisalabad",
    sizes: "5, 10 Marla and 1 Kanal plots",
    priceBand: "PKR 60 Lakh – PKR 4.5 Crore",
    rentBand: "PKR 28,000 – PKR 1.4 Lakh per month",
    character:
      "Wapda City is Faisalabad's most recognised planned scheme, with a grid layout, its own commercial centre and steady build-out by resident families. Infrastructure is complete across the developed blocks.",
    buyers:
      "Faisalabad families upgrading to a planned scheme, and investors who want a developed plot with immediate construction potential.",
    verification:
      "Confirm the block, the dues statement and the society's transfer procedure before releasing any payment.",
    nearby: ["green-valley-faisalabad", "peoples-colony-faisalabad", "canal-road-faisalabad"],
    lat: 31.4187,
    lng: 73.1476,
    featured: true,
  },
  {
    slug: "green-valley-faisalabad",
    name: "Green Valley Faisalabad",
    citySlug: "faisalabad",
    cityName: "Faisalabad",
    match: "Green Valley",
    aliases: ["Green Valley", "Green Valley City"],
    authority: "Green Valley scheme management",
    belt: "Jhang Road / Canal Road belt, Faisalabad",
    sizes: "3, 5 and 10 Marla plots",
    priceBand: "PKR 40 Lakh – PKR 2.6 Crore",
    rentBand: "PKR 20,000 – PKR 90,000 per month",
    character:
      "Green Valley gives Faisalabad buyers a mid-budget gated option with an on-site school, mosque and commercial strip. Plot pricing is accessible and construction is spreading block by block.",
    buyers:
      "First-time buyers and small investors looking for entry-level Faisalabad plots close to the Jhang Road corridor.",
    verification:
      "Verify the scheme's approval status, the development stage of your block and the instalment schedule if buying on plan.",
    nearby: ["wapda-city-faisalabad", "canal-road-faisalabad", "peoples-colony-faisalabad"],
    lat: 31.4103,
    lng: 73.0504,
  },
  {
    slug: "canal-road-faisalabad",
    name: "Canal Road Faisalabad",
    citySlug: "faisalabad",
    cityName: "Faisalabad",
    match: "Canal Road",
    aliases: ["Canal Road Faisalabad"],
    authority: "Multiple approved schemes along Canal Road",
    belt: "Canal Road corridor, Faisalabad",
    sizes: "5, 10 Marla plots, 1 Kanal houses",
    priceBand: "PKR 70 Lakh – PKR 5 Crore",
    rentBand: "PKR 30,000 – PKR 1.6 Lakh per month",
    character:
      "Canal Road is the spine of Faisalabad's new housing growth, connecting the city to Jhang Road and the industrial estates. Both plotted schemes and built houses are available along it.",
    buyers:
      "Industrial-sector employees and business owners who want a well-connected address, plus plot investors following the corridor's growth.",
    verification:
      "Confirm which scheme the property belongs to, its approval status and the canal-side setback rules before construction.",
    nearby: ["wapda-city-faisalabad", "green-valley-faisalabad", "peoples-colony-faisalabad"],
    lat: 31.4473,
    lng: 73.1082,
  },
  {
    slug: "peoples-colony-faisalabad",
    name: "Peoples Colony Faisalabad",
    citySlug: "faisalabad",
    cityName: "Faisalabad",
    match: "Peoples Colony",
    aliases: ["Peoples Colony", "People's Colony"],
    authority: "Peoples Colony management",
    belt: "Jaranwala Road / Old city side, Faisalabad",
    sizes: "5, 10 Marla plots, 1 Kanal houses, commercial",
    priceBand: "PKR 1.2 Crore – PKR 8 Crore",
    rentBand: "PKR 45,000 – PKR 2.2 Lakh per month",
    character:
      "Peoples Colony is a settled Faisalabad neighbourhood with wide roads, schools and a busy commercial frontage on Jaranwala Road, making it a preferred address for established business families.",
    buyers:
      "Business families and professionals, plus investors buying commercial frontage for rental income.",
    verification:
      "Check the commercial or residential zoning of the plot, the dues position and the current building by-laws.",
    nearby: ["wapda-city-faisalabad", "canal-road-faisalabad", "green-valley-faisalabad"],
    lat: 31.4295,
    lng: 73.1173,
  },

  /* ---------------------------------------------------------------- */
  /*  Multan                                                          */
  /* ---------------------------------------------------------------- */
  {
    slug: "gulgasht-colony-multan",
    name: "Gulgasht Colony Multan",
    citySlug: "multan",
    cityName: "Multan",
    match: "Gulgasht",
    aliases: ["Gulgasht Colony", "Gulgasht"],
    authority: "Multan Development Authority area",
    belt: "Bosan Road / Gulgasht side, central Multan",
    sizes: "10 Marla, 1 Kanal plots and houses",
    priceBand: "PKR 1.8 Crore – PKR 12 Crore",
    rentBand: "PKR 65,000 – PKR 2.8 Lakh per month",
    character:
      "Gulgasht is Multan's established premium neighbourhood, with wide roads, mature trees and easy access to Bosan Road and the city's best schools. House quality here sets the benchmark for the city.",
    buyers:
      "Professionals and business owners buying a central address, and investors targeting long-lease family rentals.",
    verification:
      "Confirm the plot's approval status with the development authority, the property tax record and the dues position.",
    nearby: ["bosan-road-multan", "shah-rukn-e-alam-multan", "wapda-town-multan"],
    lat: 30.2237,
    lng: 71.4756,
    featured: true,
  },
  {
    slug: "bosan-road-multan",
    name: "Bosan Road Multan",
    citySlug: "multan",
    cityName: "Multan",
    match: "Bosan Road",
    aliases: ["Bosan Road", "Bosan Road Multan"],
    authority: "Multiple approved schemes along Bosan Road",
    belt: "Bosan Road corridor, west Multan",
    sizes: "5, 10 Marla plots, 1 Kanal houses, commercial",
    priceBand: "PKR 1.1 Crore – PKR 9 Crore",
    rentBand: "PKR 40,000 – PKR 2.4 Lakh per month",
    character:
      "Bosan Road is where Multan's retail, education and new housing meet, with universities and hospitals along a single corridor. Commercial plots here consistently outperform residential on rental yield.",
    buyers:
      "Students, university staff and business owners, plus investors buying commercial plots for rent or resale.",
    verification:
      "Confirm the plot's sanctioned use, the frontage width and any authority approval needed for commercial construction.",
    nearby: ["gulgasht-colony-multan", "wapda-town-multan", "shah-rukn-e-alam-multan"],
    lat: 30.2535,
    lng: 71.4593,
  },
  {
    slug: "shah-rukn-e-alam-multan",
    name: "Shah Rukn-e-Alam Multan",
    citySlug: "multan",
    cityName: "Multan",
    match: "Shah Rukn",
    aliases: ["Shah Rukn-e-Alam", "Shah Rukn Alam"],
    authority: "Multan Development Authority area",
    belt: "Shah Rukn-e-Alam / old city belt, Multan",
    sizes: "5, 10 Marla plots, 1 Kanal houses",
    priceBand: "PKR 1 Crore – PKR 6.5 Crore",
    rentBand: "PKR 32,000 – PKR 1.8 Lakh per month",
    character:
      "The Shah Rukn-e-Alam belt gives buyers an inner-city Multan address with established markets and schools within walking distance, at a lower ticket than Gulgasht.",
    buyers:
      "Local families wanting a central location and investors who prefer an older, fully built-up neighbourhood with steady rents.",
    verification:
      "Check the plot's inheritance or mutation record, the exact dimensions on the ground and any pending municipal dues.",
    nearby: ["gulgasht-colony-multan", "bosan-road-multan", "wapda-town-multan"],
    lat: 30.1998,
    lng: 71.4689,
  },
  {
    slug: "wapda-town-multan",
    name: "Wapda Town Multan",
    citySlug: "multan",
    cityName: "Multan",
    match: "Wapda Town",
    aliases: ["Wapda Town Multan"],
    authority: "Wapda employees' housing society",
    belt: "Bosan Road side, Multan",
    sizes: "5, 10 Marla plots and 1 Kanal houses",
    priceBand: "PKR 1.3 Crore – PKR 8 Crore",
    rentBand: "PKR 45,000 – PKR 2.1 Lakh per month",
    character:
      "Wapda Town is a planned Multan scheme with a consistent street grid, a functioning market and a settled resident base of serving and retired employees alongside private buyers.",
    buyers:
      "Families who want a structured scheme near Bosan Road, and investors targeting stable long-term tenants.",
    verification:
      "Confirm the society's transfer rules, the dues position and any restriction on resale to non-members.",
    nearby: ["bosan-road-multan", "gulgasht-colony-multan", "royal-orchard-multan"],
    lat: 30.2359,
    lng: 71.4453,
  },
  {
    slug: "royal-orchard-multan",
    name: "Royal Orchard Multan",
    citySlug: "multan",
    cityName: "Multan",
    match: "Royal Orchard",
    aliases: ["Royal Orchard", "Royal Orchard Multan"],
    authority: "Royal Orchard Developers",
    belt: "Southern Bypass / Jalalpur Road side, Multan",
    sizes: "4, 5, 8 and 10 Marla plots, 1 Kanal",
    priceBand: "PKR 45 Lakh – PKR 5 Crore",
    rentBand: "PKR 22,000 – PKR 1.2 Lakh per month",
    character:
      "Royal Orchard is a newer Multan scheme built around landscaped avenues and a commercial centre, offering modern amenities that older city neighbourhoods cannot match.",
    buyers:
      "Buyers wanting a modern gated scheme on instalments, and investors positioning early in a growing part of Multan.",
    verification:
      "Verify the developer's delivery record, the phase timeline and the charges payable at possession.",
    nearby: ["wapda-town-multan", "bosan-road-multan", "shah-rukn-e-alam-multan"],
    lat: 30.1435,
    lng: 71.5108,
  },

  /* ---------------------------------------------------------------- */
  /*  Gujranwala                                                      */
  /* ---------------------------------------------------------------- */
  {
    slug: "dc-colony-gujranwala",
    name: "DC Colony Gujranwala",
    citySlug: "gujranwala",
    cityName: "Gujranwala",
    match: "DC Colony",
    aliases: ["DC Colony", "D.C. Colony"],
    authority: "DC Colony management",
    belt: "Sialkot Road, north Gujranwala",
    sizes: "10 Marla, 1 Kanal and 2 Kanal plots",
    priceBand: "PKR 1.6 Crore – PKR 12 Crore",
    rentBand: "PKR 55,000 – PKR 2.6 Lakh per month",
    character:
      "DC Colony is Gujranwala's most prestigious address, with large plots, disciplined construction and Sialkot Road access. The city's business families and professionals are concentrated in its streets.",
    buyers:
      "Business owners and professionals buying the city's premier address, plus investors holding large plots long term.",
    verification:
      "Confirm the plot's approval, the building by-laws for the block and the dues position at transfer.",
    nearby: ["model-town-gujranwala", "peoples-colony-gujranwala", "satellite-town-gujranwala"],
    lat: 32.1877,
    lng: 74.1901,
    featured: true,
  },
  {
    slug: "model-town-gujranwala",
    name: "Model Town Gujranwala",
    citySlug: "gujranwala",
    cityName: "Gujranwala",
    match: "Model Town",
    aliases: ["Model Town Gujranwala"],
    authority: "Model Town society management",
    belt: "GT Road / Model Town side, Gujranwala",
    sizes: "5, 10 Marla plots and 1 Kanal houses",
    priceBand: "PKR 1.1 Crore – PKR 7 Crore",
    rentBand: "PKR 38,000 – PKR 1.9 Lakh per month",
    character:
      "Model Town balances GT Road connectivity with a settled residential grid, and its commercial markets serve the wider city. House sizes range from compact 5 Marla family homes to 1 Kanal builds.",
    buyers:
      "Families wanting a central Gujranwala location and investors buying commercial plots along the main roads.",
    verification:
      "Check the plot's zoning, the society's dues statement and any pending municipal or transfer charges.",
    nearby: ["dc-colony-gujranwala", "peoples-colony-gujranwala", "satellite-town-gujranwala"],
    lat: 32.1506,
    lng: 74.1826,
  },
  {
    slug: "peoples-colony-gujranwala",
    name: "Peoples Colony Gujranwala",
    citySlug: "gujranwala",
    cityName: "Gujranwala",
    match: "Peoples Colony",
    aliases: ["Peoples Colony Gujranwala"],
    authority: "Peoples Colony management",
    belt: "Sialkot Road side, Gujranwala",
    sizes: "5 and 10 Marla plots, 1 Kanal houses",
    priceBand: "PKR 90 Lakh – PKR 6 Crore",
    rentBand: "PKR 32,000 – PKR 1.7 Lakh per month",
    character:
      "Peoples Colony gives buyers a mid-market Gujranwala address with established streets, schools and shops inside the neighbourhood, a short drive from both Sialkot Road and the city centre.",
    buyers:
      "Middle-income families and small investors looking for a fully developed plot in an established colony.",
    verification:
      "Confirm the plot dimensions on site, the transfer record with the society and the property tax position.",
    nearby: ["dc-colony-gujranwala", "model-town-gujranwala", "satellite-town-gujranwala"],
    lat: 32.1614,
    lng: 74.2074,
  },

  /* ---------------------------------------------------------------- */
  /*  Peshawar                                                        */
  /* ---------------------------------------------------------------- */
  {
    slug: "regi-model-town-peshawar",
    name: "Regi Model Town Peshawar",
    citySlug: "peshawar",
    cityName: "Peshawar",
    match: "Regi Model Town",
    aliases: ["Regi Model Town", "Regi Lalma"],
    authority: "Provincial Housing Authority / PDA",
    belt: "Ring Road, south-west Peshawar",
    sizes: "5, 10 Marla, 1 Kanal and 2 Kanal plots",
    priceBand: "PKR 60 Lakh – PKR 8 Crore",
    rentBand: "PKR 28,000 – PKR 1.8 Lakh per month",
    character:
      "Regi Model Town is Peshawar's largest planned development, organised into numbered zones along the Ring Road. Development has reached most zones, and construction activity has picked up strongly in the last few years.",
    buyers:
      "Families moving into a planned zone and investors buying plots in zones where roads and utilities have just landed.",
    verification:
      "Confirm your plot's zone number, the development status of its street and any instalment or development charges outstanding.",
    nearby: ["hayatabad-peshawar", "university-town-peshawar", "warsak-road-peshawar"],
    lat: 33.9886,
    lng: 71.4514,
    featured: true,
  },
  {
    slug: "university-town-peshawar",
    name: "University Town Peshawar",
    citySlug: "peshawar",
    cityName: "Peshawar",
    match: "University Town",
    aliases: ["University Town", "Uni Town"],
    authority: "Peshawar Development Authority area",
    belt: "University Road, central Peshawar",
    sizes: "1 Kanal and 2 Kanal plots, houses",
    priceBand: "PKR 4 Crore – PKR 25 Crore",
    rentBand: "PKR 1.5 Lakh – PKR 5 Lakh per month",
    character:
      "University Town is Peshawar's premium central neighbourhood, with large plots, embassies and consulates nearby, and strict building controls that preserve its character.",
    buyers:
      "Senior professionals, diplomats and institutional tenants, plus investors holding property for long-term capital preservation.",
    verification:
      "Check the plot's approval record, the building controls that apply and any tenancy or mortgage encumbrance on the property.",
    nearby: ["hayatabad-peshawar", "regi-model-town-peshawar", "dha-peshawar"],
    lat: 34.0089,
    lng: 71.4996,
  },
  {
    slug: "dha-peshawar",
    name: "DHA Peshawar",
    citySlug: "peshawar",
    cityName: "Peshawar",
    match: "DHA Peshawar",
    aliases: ["DHA Peshawar", "DHA Peshawar Phase 1"],
    authority: "Defence Housing Authority",
    belt: "Charsadda Road / Ring Road side, north Peshawar",
    sizes: "5, 10 Marla, 1 Kanal plots and villas",
    priceBand: "PKR 1.5 Crore – PKR 12 Crore",
    rentBand: "PKR 65,000 – PKR 3 Lakh per month",
    character:
      "DHA Peshawar brings the authority's planning standards to the northern side of the city, with phased development, wide boulevards and a commercial district planned alongside residential sectors.",
    buyers:
      "Families who want DHA-standard infrastructure in Peshawar, and investors buying early in phases that are still developing.",
    verification:
      "Confirm the phase, the development timeline in writing and the society's dues and transfer schedule.",
    nearby: ["regi-model-town-peshawar", "university-town-peshawar", "hayatabad-peshawar"],
    lat: 34.0863,
    lng: 71.5182,
  },
  {
    slug: "warsak-road-peshawar",
    name: "Warsak Road Peshawar",
    citySlug: "peshawar",
    cityName: "Peshawar",
    match: "Warsak Road",
    aliases: ["Warsak Road"],
    authority: "Multiple approved schemes along Warsak Road",
    belt: "Warsak Road corridor, north-west Peshawar",
    sizes: "5, 10 Marla plots, 1 Kanal houses",
    priceBand: "PKR 1.1 Crore – PKR 7 Crore",
    rentBand: "PKR 35,000 – PKR 2 Lakh per month",
    character:
      "Warsak Road is Peshawar's established northern corridor, combining older residential colonies with newer schemes and easy access to the Hayatabad and University Road belts.",
    buyers:
      "Families wanting a northern Peshawar base and investors comparing Warsak Road plots with Regi and DHA phases.",
    verification:
      "Verify which scheme or colony the plot sits in, its approval status and the exact dues outstanding.",
    nearby: ["regi-model-town-peshawar", "university-town-peshawar", "hayatabad-peshawar"],
    lat: 34.0324,
    lng: 71.4713,
  },
];

/** Towns that are safe to link from navigation and city hubs. */
export const FEATURED_TOWNS = TOWNS.filter((town) => town.featured);

export const TOWN_BY_SLUG = new Map(TOWNS.map((town) => [town.slug, town]));

export function townsForCity(citySlug: string): Town[] {
  return TOWNS.filter((town) => town.citySlug === citySlug);
}

export function getAllTownSlugs(): string[] {
  return TOWNS.map((town) => town.slug);
}

/**
 * Flagship society landing pages double as filter options, so the cascade also
 * covers DHA phases, Bahria Town, Gulberg, Model Town and the other addresses
 * buyers search by name. Value = society slug; `townMatchFor` resolves it.
 */
const SOCIETY_FILTER_BY_SLUG = new Map(SOCIETIES.map((society) => [society.slug, society.match]));

/** City → town options used by the cascading filter selects. */
export function townFilterOptions(): { citySlug: string; towns: { label: string; value: string }[] }[] {
  const citySlugs = Array.from(new Set([...TOWNS.map((town) => town.citySlug), ...SOCIETIES.map((society) => society.citySlug)]));
  return citySlugs.map((citySlug) => {
    const towns = townsForCity(citySlug).map((town) => ({ label: town.name, value: town.slug }));
    const seen = new Set(towns.map((town) => town.label.toLowerCase()));
    for (const society of SOCIETIES) {
      if (society.citySlug !== citySlug) continue;
      if (seen.has(society.name.toLowerCase())) continue;
      if (towns.some((town) => town.value === society.slug)) continue;
      towns.push({ label: society.name, value: society.slug });
      seen.add(society.name.toLowerCase());
    }
    return { citySlug, towns };
  });
}

const PPSF_NOTE: Record<string, string> = {
  lahore: "Developed sectors trade roughly 8–20% above the city benchmark.",
  islamabad: "Sector housing and gated schemes price above the capital average.",
  karachi: "Commercial floors and sea-facing units sit well above the average.",
  rawalpindi: "Scheme-adjacent stock prices below the twin-city average.",
  faisalabad: "Meeting the benchmark usually needs a completed, occupied house.",
  multan: "Central neighbourhoods price above the city average per sq ft.",
  gujranwala: "Prime colonies trade above the city average; outer belts below it.",
  peshawar: "Planned zones carry a premium over older colonies.",
};

/** Unique, indexable guide page for a single town. */
export function buildTownLanding(slug: string): LandingContent | null {
  const town = TOWN_BY_SLUG.get(slug);
  if (!town) return null;
  const city = CITY_MARKETS.find((item) => item.slug === town.citySlug);
  if (!city) return null;

  const nearby = town.nearby
    .map((nearbySlug) => TOWN_BY_SLUG.get(nearbySlug))
    .filter((item): item is Town => Boolean(item));

  const filters: PropertyFilters = { city: town.citySlug, town: town.match };

  const faqs = [
    {
      question: `What is the price of a plot in ${town.name}?`,
      answer: `Indicative asking prices in ${town.name} currently run from ${town.priceBand} depending on plot size, street width, corner position and how far along development is. Verify the specific unit's dues and possession status before making an offer.`,
    },
    {
      question: `Is ${town.name} good for rental income?`,
      answer: `Monthly rents in ${town.name} generally sit between ${town.rentBand}. Demand reflects the surrounding commute pattern, local schools and access, so ask our ${town.cityName} desk for an achievable-rent figure for the exact property you are considering.`,
    },
    {
      question: `What should I verify before buying in ${town.name}?`,
      answer: `${town.verification}`,
    },
    {
      question: `What sizes are available in ${town.name}?`,
      answer: `${town.sizes}. Availability changes daily — open the live listing list on this page, or filter the marketplace by city ${town.cityName} and town ${town.name}.`,
    },
  ];

  return {
    slug,
    kind: "type-city",
    eyebrow: `${town.cityName} · Town guide`,
    h1: `Property for Sale in ${town.name}`,
    metaTitle: `Property for Sale in ${town.name} | Prices, Plots & Houses | Properties Pak`,
    metaDescription: `${town.name} property guide: live listings, indicative price bands (${town.priceBand}), plot sizes, rental ranges and what to verify before buying in ${town.cityName}.`,
    keywords: [
      `property for sale in ${town.name}`,
      `${town.name} plots`,
      `${town.name} houses for sale`,
      `${town.name} property price`,
      `plot in ${town.name}`,
      `${town.cityName} property`,
    ],
    intro: [
      town.character,
      `${town.name} sits on ${town.belt} and is developed by ${town.authority.trim()}. Typical inventory covers ${town.sizes}, with asking prices from ${town.priceBand} and monthly rents from ${town.rentBand}.`,
      `This guide follows how our ${town.cityName} desk actually transacts in ${town.name}: what a fair price looks like, which documents matter, and how the town compares with neighbouring locations. ${town.buyers}`,
    ],
    filters,
    alternatives: { city: town.citySlug },
    facets: [
      { label: `All property in ${town.cityName}`, href: `/property-for-sale-in-${town.citySlug}`, note: "City-wide inventory" },
      { label: `Rentals in ${town.cityName}`, href: `/property-for-rent-in-${town.citySlug}`, note: "Monthly rent options" },
      { label: `${town.cityName} town directory`, href: `/towns/${town.citySlug}`, note: "Every town and scheme we cover" },
    ],
    societies: nearby.map((item) => ({
      name: item.name,
      href: `/property-for-sale/${item.slug}`,
      note: item.priceBand,
    })),
    priceBands: [
      { label: "Asking price band", range: town.priceBand, note: "Based on live asking prices" },
      { label: "Monthly rent band", range: town.rentBand, note: "For typical family units" },
      { label: "City benchmark", range: city.ppsf, note: PPSF_NOTE[town.citySlug] ?? "Indicative reference" },
    ],
    insightNotes: [
      { title: "Due diligence", copy: town.verification },
      { title: "Who buys here", copy: town.buyers },
      { title: "Access & surroundings", copy: `${town.name} is on ${town.belt}. ${city.accessNote}` },
    ],
    faqs,
    relatedLinks: [
      { label: `Property for sale in ${town.cityName}`, href: `/property-for-sale-in-${town.citySlug}` },
      { label: `Property for rent in ${town.cityName}`, href: `/property-for-rent-in-${town.citySlug}` },
      { label: `Houses for sale in ${town.cityName}`, href: `/houses-for-sale-in-${town.citySlug}` },
      ...nearby.map((item) => ({ label: `Property in ${item.name}`, href: `/property-for-sale/${item.slug}` })),
      { label: "Pakistan property investment guide", href: "/property-investment-in-pakistan" },
    ],
  };
}

/**
 * Filter values arrive either as a town slug or as a raw society name typed by
 * an owner. Both resolve to the fragment compared against `location_area`.
 */
export function townMatchFor(value: string): string {
  const key = value.trim();
  const town = TOWN_BY_SLUG.get(key.toLowerCase());
  if (town) return town.match;
  const society = SOCIETY_FILTER_BY_SLUG.get(key.toLowerCase());
  return society ?? key;
}

/** Benchmark lookup kept here so town pages and score panel stay consistent. */
export function cityPpsfBenchmark(citySlug: string): number {
  return CITY_PPSF_BENCHMARK[citySlug] ?? CITY_PPSF_BENCHMARK.lahore;
}
