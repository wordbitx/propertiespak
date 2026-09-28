/**
 * DHA society plot-layout overlays (yellow plot grids), following the exact
 * Leaflet setup used by DHA Plus: Google "s,h" hybrid base + one PNG tile layer
 * per sector, clipped to its bounds. Tiles © ioi Technologies / DHA Plus.
 * Bounds are [north, east, south, west] as published by the source map.
 */

export type SocietyLayer = { name: string; tiles: string; bounds: [number, number, number, number]; minZoom: number; maxZoom: number };
export type SocietyMapDef = { slug: string; name: string; citySlug: string; center: [number, number] | null; zoom: number | null; match: RegExp; layers: SocietyLayer[] };

export const SOCIETY_MAPS: SocietyMapDef[] = [
  {
    slug: "dha-bahawalpur-bahawalpur",
    name: "DHA Bahawalpur Bahawalpur Map",
    citySlug: "bahawalpur",
    center: null,
    zoom: null,
    match: /\bdha\b/i,
    layers: [
      { name: "Sector A", tiles: "https://maps-cdn.bahriaplus.com/global/bahawalpur/dha-bahawalpur/{z}/{x}/{y}.png", bounds: [29.30293301, 71.61954148, 29.34539271, 71.70802874], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "dha-defence-karachi",
    name: "DHA Karachi Karachi Map",
    citySlug: "karachi",
    center: null,
    zoom: null,
    match: /\b(dha|defence)\b/i,
    layers: [
      { name: "Phase 8 - Zone A", tiles: "https://maps-cdn.bahriaplus.com/global/karachi/dha-phase-8/{z}/{x}/{y}.png", bounds: [24.80239618, 67.10698128, 24.745662064798, 67.051019668579], minZoom: 12, maxZoom: 19 },
      { name: "Phase 1", tiles: "https://maps-cdn.bahriaplus.com/global/karachi/dha-phase-1/{z}/{x}/{y}.png", bounds: [24.8481474, 67.0737648, 24.834867309634, 67.054796218872], minZoom: 12, maxZoom: 19 },
      { name: "Phase 2", tiles: "https://maps-cdn.bahriaplus.com/global/karachi/dha-phase-2/{z}/{x}/{y}.png", bounds: [24.84274888, 67.07415104, 24.827423412873, 67.047414779663], minZoom: 12, maxZoom: 19 },
      { name: "Phase 6", tiles: "https://maps-cdn.bahriaplus.com/global/karachi/dha-phase-6/{z}/{x}/{y}.png", bounds: [24.82050978, 67.07870007, 24.775707876968, 67.044839859009], minZoom: 12, maxZoom: 19 },
      { name: "Phase 4", tiles: "https://maps-cdn.bahriaplus.com/global/karachi/dha-phase-4/{z}/{x}/{y}.png", bounds: [24.83077298, 67.06994534, 24.815543409545, 67.046985626221], minZoom: 12, maxZoom: 19 },
      { name: "Phase 5", tiles: "https://maps-cdn.bahriaplus.com/global/karachi/dha-phase-5/{z}/{x}/{y}.png", bounds: [24.82265207, 67.06912994, 24.785838418512, 67.030420303345], minZoom: 12, maxZoom: 19 },
      { name: "Phase 7", tiles: "https://maps-cdn.bahriaplus.com/global/karachi/dha-phase-7/{z}/{x}/{y}.png", bounds: [24.83309036, 67.08732605, 24.800682064221, 67.06449508667], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "dha-multan-multan",
    name: "DHA Multan Multan Map",
    citySlug: "multan",
    center: null,
    zoom: null,
    match: /\bdha\b/i,
    layers: [
      { name: "Sector A", tiles: "https://maps.bahriaplus.com/global/multan/dha-2510/{z}/{x}/{y}.png", bounds: [30.24650653, 71.50221382, 30.33323555, 71.61333815], minZoom: 12, maxZoom: 19 },
      { name: "Sector B-2", tiles: "https://maps-cdn.bahriaplus.com/global/multan/dha-0925-1/{z}/{x}/{y}.png", bounds: [30.33391676, 71.61334991, 30.27033534305, 71.501598358154], minZoom: 12, maxZoom: 19 },
      { name: "Rumanza Golf Community", tiles: "https://maps-cdn.bahriaplus.com/global/multan/dha-2510/{z}/{x}/{y}.png", bounds: [30.24650653, 71.50221382, 30.33323555, 71.61333815], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "emaar-canyon-views-islamabad",
    name: "Emaar Canyon Views Islamabad Map",
    citySlug: "islamabad",
    center: null,
    zoom: null,
    match: /emaar|canyon[\s-]*views/i,
    layers: [
      { name: "Mirador 1", tiles: "https://maps-cdn.bahriaplus.com/global/islamabad/dha-phase-5/{z}/{x}/{y}.png", bounds: [33.5452576, 73.2350778, 33.5013952, 73.1790304], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "phase-1-islamabad",
    name: "DHA Phase 1 Islamabad Map",
    citySlug: "islamabad",
    center: null,
    zoom: null,
    match: /(dha|defence)[\s-]*(phase[\s-]*)?1\b(?![\s-]*(?:ex|ivy|park|air|town|prism))/i,
    layers: [
      { name: "Sector A", tiles: "https://maps.bahriaplus.com/global/dha/isb/phase-1-isb/{z}/{x}/{y}.png", bounds: [33.52205905, 73.08356736, 33.55630083, 73.11263544], minZoom: 12, maxZoom: 19 },
      { name: "Sector F", tiles: "https://maps.bahriaplus.com/global/dha/2023/isb/phase1sector-f/{z}/{x}/{y}.png", bounds: [33.5256413, 73.11233997, 33.503636322329, 73.083329200745], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "phase-1-lahore",
    name: "DHA Phase 1 Lahore Map",
    citySlug: "lahore",
    center: null,
    zoom: null,
    match: /(dha|defence)[\s-]*(phase[\s-]*)?1\b(?![\s-]*(?:ex|ivy|park|air|town|prism))/i,
    layers: [
      { name: "Sector A", tiles: "https://maps-cdn.bahriaplus.com/global/dha/lhr/phase1/{z}/{x}/{y}.png", bounds: [31.49088142, 74.40855503, 31.469923911446, 74.379587173462], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "phase-11-rahbar-lahore",
    name: "DHA Phase 11 Rahbar Lahore Map",
    citySlug: "lahore",
    center: null,
    zoom: null,
    match: /((dha|defence)[\s-]*(phase[\s-]*)?11\b.*rahbar|rahbar.*(dha|defence)[\s-]*(phase[\s-]*)?11\b)/i,
    layers: [
      { name: "Phase 1 - Sector A", tiles: "https://maps-cdn.bahriaplus.com/global/dha/2023/lhr/rahbar-1/{z}/{x}/{y}.png", bounds: [31.39405155, 74.26066875, 31.384178510009, 74.242622852325], minZoom: 12, maxZoom: 19 },
      { name: "Phase 2 - Sector F", tiles: "https://maps-cdn.bahriaplus.com/global/dha/2023/lhr/rahbar-2/{z}/{x}/{y}.png", bounds: [31.39115752, 74.28064585, 31.379653781037, 74.260196685791], minZoom: 12, maxZoom: 19 },
      { name: "Halloki Sector A", tiles: "https://maps-cdn.bahriaplus.com/global/dha/2023/lhr/rahbar-3/{z}/{x}/{y}.png", bounds: [31.39504063, 74.27942276, 31.374913573114, 74.242515563965], minZoom: 12, maxZoom: 19 },
      { name: "Phase 4 - Sector Q", tiles: "https://maps-cdn.bahriaplus.com/global/dha/2023/lhr/rahbar-4/{z}/{x}/{y}.png", bounds: [31.3754606, 74.28378553, 31.39744752, 74.30393504], minZoom: 12, maxZoom: 19 },
      { name: "Phase 5 - Sector T", tiles: "https://maps-cdn.bahriaplus.com/global/lahore/dha-rahbar-p5/{z}/{x}/{y}.png", bounds: [31.3884236, 74.2838537, 31.3708143, 74.2712383], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "phase-12-eme-lahore",
    name: "DHA Phase 12 EME Lahore Map",
    citySlug: "lahore",
    center: null,
    zoom: null,
    match: /((dha|defence)[\s-]*(phase[\s-]*)?12\b.*eme|eme.*(dha|defence)[\s-]*(phase[\s-]*)?12\b)/i,
    layers: [
      { name: "Sector A", tiles: "https://maps-cdn.bahriaplus.com/global/dha/lhr/phase12/{z}/{x}/{y}.png", bounds: [31.45431138, 74.22393322, 31.424561673213, 74.198398590088], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "phase-2-islamabad",
    name: "DHA Phase 2 Islamabad Map",
    citySlug: "islamabad",
    center: null,
    zoom: null,
    match: /(dha|defence)[\s-]*(phase[\s-]*)?2\b(?![\s-]*(?:ex|ivy|park|air|town|prism))/i,
    layers: [
      { name: "Sector A", tiles: "https://maps.bahriaplus.com/global/dha/isb/phase2final/{z}/{x}/{y}.png", bounds: [33.54339773, 73.18061829, 33.513606341894, 73.125944137573], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "phase-2-lahore",
    name: "DHA Phase 2 Lahore Map",
    citySlug: "lahore",
    center: null,
    zoom: null,
    match: /(dha|defence)[\s-]*(phase[\s-]*)?2\b(?![\s-]*(?:ex|ivy|park|air|town|prism))/i,
    layers: [
      { name: "Sector Q", tiles: "https://maps-cdn.bahriaplus.com/global/dha/lhr/phase2/{z}/{x}/{y}.png", bounds: [31.48533255, 74.41353321, 31.46787411475, 74.388942718506], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "phase-3-lahore",
    name: "DHA Phase 3 Lahore Map",
    citySlug: "lahore",
    center: null,
    zoom: null,
    match: /(dha|defence)[\s-]*(phase[\s-]*)?3\b(?![\s-]*(?:ex|ivy|park|air|town|prism))/i,
    layers: [
      { name: "Sector W", tiles: "https://maps-cdn.bahriaplus.com/global/dha/lhr/phase3/{z}/{x}/{y}.png", bounds: [31.48449082, 74.38907146, 31.462786032563, 74.355683326721], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "phase-4-islamabad",
    name: "DHA Phase 4 Islamabad Map",
    citySlug: "islamabad",
    center: null,
    zoom: null,
    match: /(dha|defence)[\s-]*(phase[\s-]*)?4\b(?![\s-]*(?:ex|ivy|park|air|town|prism))/i,
    layers: [
      { name: "Sector A", tiles: "https://maps-cdn.bahriaplus.com/global/islamabad/dha-phase-4/{z}/{x}/{y}.png", bounds: [33.51003428, 73.05301057, 33.53288563, 73.09009939], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "phase-4-lahore",
    name: "DHA Phase 4 Lahore Map",
    citySlug: "lahore",
    center: null,
    zoom: null,
    match: /(dha|defence)[\s-]*(phase[\s-]*)?4\b(?![\s-]*(?:ex|ivy|park|air|town|prism))/i,
    layers: [
      { name: "Sector AA", tiles: "https://maps-cdn.bahriaplus.com/global/dha/lhr/phase4/{z}/{x}/{y}.png", bounds: [31.47050956, 74.39370632, 31.451863109428, 74.365553855896], minZoom: 12, maxZoom: 19 },
      { name: "Sector KK", tiles: "https://maps-cdn.bahriaplus.com/global/lahore/dha-phase-4-kk/{z}/{x}/{y}.png", bounds: [31.46221864, 74.38497305, 31.453981899172, 74.377527236938], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "phase-5-islamabad",
    name: "DHA Phase 5 Islamabad Map",
    citySlug: "islamabad",
    center: null,
    zoom: null,
    match: /(dha|defence)[\s-]*(phase[\s-]*)?5\b(?![\s-]*(?:ex|ivy|park|air|town|prism))/i,
    layers: [
      { name: "Sector A", tiles: "https://maps-cdn.bahriaplus.com/global/islamabad/dha-phase-5/{z}/{x}/{y}.png", bounds: [33.5452576, 73.2350778, 33.5013952, 73.1790304], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "phase-5-lahore",
    name: "DHA Phase 5 Lahore Map",
    citySlug: "lahore",
    center: null,
    zoom: null,
    match: /(dha|defence)[\s-]*(phase[\s-]*)?5\b(?![\s-]*(?:ex|ivy|park|air|town|prism))/i,
    layers: [
      { name: "Sector A", tiles: "https://maps-cdn.bahriaplus.com/global/lahore/dha-phase-5-2024/{z}/{x}/{y}.png", bounds: [31.47691484, 74.433918, 31.444893188655, 74.392032623291], minZoom: 12, maxZoom: 19 },
      { name: "Sector M", tiles: "https://maps-cdn.bahriaplus.com/global/lahore/dha-phase-5-m-2024/{z}/{x}/{y}.png", bounds: [31.47691484, 74.433918, 31.444893188655, 74.392032623291], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "phase-6-lahore",
    name: "DHA Phase 6 Lahore Map",
    citySlug: "lahore",
    center: null,
    zoom: null,
    match: /(dha|defence)[\s-]*(phase[\s-]*)?6\b(?![\s-]*(?:ex|ivy|park|air|town|prism))/i,
    layers: [
      { name: "Sector A", tiles: "https://maps-cdn.bahriaplus.com/global/lahore/dha-6-2510/1/{z}/{x}/{y}.png", bounds: [31.48716239, 74.46129799, 31.450412420128, 74.429712295532], minZoom: 12, maxZoom: 19 },
      { name: "Sector E", tiles: "https://maps-cdn.bahriaplus.com/global/lahore/dha-6-2510/5/{z}/{x}/{y}.png", bounds: [31.49532302, 74.48060989, 31.440307311247, 74.452114105225], minZoom: 12, maxZoom: 19 },
      { name: "Sector M", tiles: "https://maps-cdn.bahriaplus.com/global/lahore/dha-6-2510/3/{z}/{x}/{y}.png", bounds: [31.48198386, 74.47832465, 31.477207647256, 74.468679428101], minZoom: 12, maxZoom: 19 },
      { name: "Sector MB Commercial", tiles: "https://maps-cdn.bahriaplus.com/global/lahore/dha-6-2510/2/{z}/{x}/{y}.png", bounds: [31.48716239, 74.46129799, 31.450412420128, 74.429712295532], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "phase-7-lahore",
    name: "DHA Phase 7 Lahore Map",
    citySlug: "lahore",
    center: null,
    zoom: null,
    match: /(dha|defence)[\s-]*(phase[\s-]*)?7\b(?![\s-]*(?:ex|ivy|park|air|town|prism))/i,
    layers: [
      { name: "Sector P", tiles: "https://maps-cdn.bahriaplus.com/global/lahore/dha-7-2510/{z}/{x}/{y}.png", bounds: [31.50099479, 74.50764656, 31.429761688006, 74.462413787842], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "phase-8-ex-air-avenue-lahore",
    name: "DHA Phase 8 - Ex Air Avenue Lahore Map",
    citySlug: "lahore",
    center: null,
    zoom: null,
    match: /((dha|defence)[\s-]*(phase[\s-]*)?8\b.*air[\s-]*avenue|air[\s-]*avenue.*(dha|defence)[\s-]*(phase[\s-]*)?8\b)/i,
    layers: [
      { name: "Sector L", tiles: "https://maps.bahriaplus.com/global/dha/2023/lhr/phase8airavenue/{z}/{x}/{y}.png", bounds: [31.5157032, 74.44880962, 31.499494552734, 74.435420036316], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "phase-8-ex-park-view-lahore",
    name: "DHA Phase 8 - Ex Park View Lahore Map",
    citySlug: "lahore",
    center: null,
    zoom: null,
    match: /((dha|defence)[\s-]*(phase[\s-]*)?8\b.*park[\s-]*view|park[\s-]*view.*(dha|defence)[\s-]*(phase[\s-]*)?8\b)/i,
    layers: [
      { name: "Sector A", tiles: "https://maps.bahriaplus.com/global/dha/2023/lhr/phase8parkview/{z}/{x}/{y}.png", bounds: [31.53428663, 74.4512558, 31.513142202377, 74.42310333252], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "phase-8-ivy-green-lahore",
    name: "DHA Phase 8 - Ivy Green Lahore Map",
    citySlug: "lahore",
    center: null,
    zoom: null,
    match: /((dha|defence)[\s-]*(phase[\s-]*)?8\b.*ivy[\s-]*green|ivy[\s-]*green.*(dha|defence)[\s-]*(phase[\s-]*)?8\b)/i,
    layers: [
      { name: "Sector Z-1", tiles: "https://maps-cdn.bahriaplus.com/global/lahore/dha-phase-8-ivy/{z}/{x}/{y}.png", bounds: [31.53957199, 74.50140238, 31.511605569264, 74.484729766846], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "phase-8-lahore",
    name: "DHA Phase 8 Lahore Map",
    citySlug: "lahore",
    center: null,
    zoom: null,
    match: /(dha|defence)[\s-]*(phase[\s-]*)?8\b(?![\s-]*(?:ex|ivy|park|air|town|prism))/i,
    layers: [
      { name: "Sector S", tiles: "https://maps-cdn.bahriaplus.com/global/lahore/dha-phase-8-oct-2024/{z}/{x}/{y}.png", bounds: [31.51292268, 74.47425842, 31.463444936489, 74.419240951538], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "phase-9-prism-lahore",
    name: "DHA Phase 9 Prism Lahore Map",
    citySlug: "lahore",
    center: null,
    zoom: null,
    match: /((dha|defence)[\s-]*(phase[\s-]*)?9\b.*prism|prism.*(dha|defence)[\s-]*(phase[\s-]*)?9\b)/i,
    layers: [
      { name: "Sector G", tiles: "https://maps.bahriaplus.com/global/lahore/dha-prism-2510/{z}/{x}/{y}.png", bounds: [31.45224294, 74.46318626, 31.398557274284, 74.372034072876], minZoom: 12, maxZoom: 19 },
    ],
  },
  {
    slug: "phase-9-town-lahore",
    name: "DHA Phase 9 Town Lahore Map",
    citySlug: "lahore",
    center: null,
    zoom: null,
    match: /((dha|defence)[\s-]*(phase[\s-]*)?9\b.*town|town.*(dha|defence)[\s-]*(phase[\s-]*)?9\b)/i,
    layers: [
      { name: "Sector A", tiles: "https://maps-cdn.bahriaplus.com/global/lahore/dha-phase-9-town-2024/{z}/{x}/{y}.png", bounds: [31.45407342, 74.45198536, 31.430860245781, 74.430913925171], minZoom: 12, maxZoom: 19 },
    ],
  },
];

/** Find the society overlay set for a listing based on its area text / city. */
export function findSocietyMap(areaText: string, citySlug?: string): SocietyMapDef | null {
  const text = areaText.toLowerCase();
  const candidates = SOCIETY_MAPS.filter((s) => s.match.test(text) && (!citySlug || s.citySlug === citySlug));
  if (candidates.length === 0) return null;
  // Prefer the most specific match (longest slug), e.g. "phase-8-ex-park-view" over "phase-8".
  return candidates.sort((a, b) => b.slug.length - a.slug.length)[0];
}

/** Whether a lat/lng falls inside any layer of the society (used to auto-pick the layer). */
export function layersContaining(def: SocietyMapDef, lat: number, lng: number): SocietyLayer[] {
  return def.layers.filter(({ bounds: [north, east, south, west] }) => lat <= north && lat >= south && lng <= east && lng >= west);
}
