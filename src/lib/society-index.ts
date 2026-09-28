/**
 * Pakistan society / sector / phase / block index used for instant location
 * suggestions while a user types a listing address. Each entry has a centroid
 * so the map can jump straight to it. Sub-areas (phases, sectors, blocks) are
 * generated around the parent centroid with small offsets so pins land in
 * plausibly distinct spots inside the same society.
 */

export type SocietyPlace = {
  label: string;
  citySlug: string;
  cityName: string;
  lat: number;
  lng: number;
  kind: "society" | "phase" | "sector" | "block" | "area" | "city";
  parent?: string;
};

type Society = {
  name: string;
  citySlug: string;
  cityName: string;
  lat: number;
  lng: number;
  phases?: string[];
  sectors?: string[];
  blocks?: string[];
  aliases?: string[];
};

const SOCIETIES: Society[] = [
  {
    name: "DHA Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    lat: 31.4715,
    lng: 74.4105,
    aliases: ["Defence Lahore", "DHA"],
    phases: ["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5", "Phase 6", "Phase 7", "Phase 8", "Phase 9 Prism", "Phase 9 Town", "Phase 10", "Phase 11 Rahbar", "Phase 12 EME", "Phase 13"],
    blocks: ["Block A", "Block B", "Block C", "Block D", "Block E", "Block F", "Block G", "Block H", "Block J", "Block K", "Block L", "Block M", "Block N", "Block P", "Block Q", "Block R", "Block S", "Block T", "Block U", "Block V", "Block W", "Block X", "Block Y", "Block Z"],
  },
  {
    name: "Bahria Town Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    lat: 31.3627,
    lng: 74.184,
    sectors: ["Sector A", "Sector B", "Sector C", "Sector D", "Sector E", "Sector F", "Sector G", "Sector H", "Sector J", "Sector K", "Sector M"],
    blocks: ["Overseas Block", "Jasmine Block", "Tulip Block", "Iris Block", "Gulbahar Block", "Chambeli Block", "Umar Block", "Usman Block", "Ali Block", "Awais Qarni Block", "Shaheen Block", "Janiper Block", "Quaid Block", "Nishtar Block", "Rafi Block", "Ghaznavi Block", "Tipu Sultan Block", "Jinnah Block", "Iqbal Block", "Johar Block"],
  },
  {
    name: "Bahria Orchard Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    lat: 31.3618,
    lng: 74.1994,
    phases: ["Phase 1", "Phase 2", "Phase 3", "Phase 4"],
    blocks: ["Block A", "Block B", "Block C", "Block D", "Block E", "Block F", "Block G", "Block H", "Block J", "Block K", "Southern Block", "Eastern Block", "Central Block", "Northern Block", "OLC Block"],
  },
  {
    name: "Lake City Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    lat: 31.3524,
    lng: 74.2611,
    sectors: ["Sector M-1", "Sector M-2", "Sector M-3", "Sector M-3A", "Sector M-4", "Sector M-5", "Sector M-6", "Sector M-7", "Sector M-7A", "Sector M-7B", "Sector M-7C", "Sector M-8"],
  },
  {
    name: "Gulberg Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    lat: 31.5168,
    lng: 74.3472,
    phases: ["Gulberg I", "Gulberg II", "Gulberg III", "Gulberg IV", "Gulberg V"],
    blocks: ["Block A", "Block B", "Block C", "Block D", "Block E", "Block F", "Block H", "Block L", "Block M", "Block N", "Block P"],
  },
  {
    name: "Johar Town Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    lat: 31.4697,
    lng: 74.2728,
    phases: ["Phase 1", "Phase 2"],
    blocks: ["Block A", "Block B", "Block C", "Block D", "Block E", "Block F", "Block G", "Block H", "Block J", "Block K", "Block L", "Block M", "Block N", "Block P", "Block Q", "Block R"],
  },
  {
    name: "Model Town Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    lat: 31.4805,
    lng: 74.3239,
    blocks: ["Block A", "Block B", "Block C", "Block D", "Block E", "Block F", "Block G", "Block H", "Block J", "Block K", "Block L", "Block M", "Block N", "Block P", "Block Q", "Block R", "Block S"],
  },
  {
    name: "Wapda Town Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    lat: 31.4305,
    lng: 74.2565,
    phases: ["Phase 1", "Phase 2"],
    blocks: ["Block A", "Block B", "Block C", "Block D", "Block E", "Block F", "Block G", "Block H", "Block J", "Block K"],
  },
  {
    name: "Park View City Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    lat: 31.4102,
    lng: 74.2116,
    blocks: ["Tulip Block", "Rose Block", "Jasmine Block", "Topaz Block", "Diamond Block", "Platinum Block", "Gold Block", "Silver Block", "Crystal Block", "Pearl Block", "Executive Block", "Overseas Block"],
  },
  {
    name: "Al-Kabir Town Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    lat: 31.3808,
    lng: 74.2051,
    phases: ["Phase 1", "Phase 2"],
    blocks: ["Block A", "Block B", "Block C", "Block D", "Block E", "Umer Block", "Usman Block", "Ali Block", "Abu Bakar Block"],
  },
  {
    name: "Askari Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    lat: 31.4996,
    lng: 74.3862,
    phases: ["Askari 1", "Askari 5", "Askari 9", "Askari 10", "Askari 11"],
  },
  {
    name: "Cantt Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    lat: 31.5188,
    lng: 74.3886,
    aliases: ["Lahore Cantt", "Cantonment"],
  },
  {
    name: "Allama Iqbal Town Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    lat: 31.5077,
    lng: 74.2969,
    blocks: ["Nizam Block", "Neelum Block", "Ravi Block", "Sutlej Block", "Chenab Block", "Karim Block", "Huma Block", "Kamran Block", "Asif Block", "Zeenat Block", "Umar Block", "Mehran Block", "Muslim Block", "Raza Block", "Pak Block", "Nargis Block", "Gulshan Block", "Sikandar Block", "Rachna Block", "Jahanzeb Block"],
  },
  {
    name: "Valencia Town Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    lat: 31.4034,
    lng: 74.2508,
    blocks: ["Block A", "Block B", "Block C", "Block D", "Block E", "Block F", "Block G", "Block H", "Block J", "Block K", "Block L", "Block M", "Block N", "Block P"],
  },
  {
    name: "Central Park Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    lat: 31.3706,
    lng: 74.2276,
    blocks: ["Block A", "Block B", "Block C", "Block D", "Block E", "Block F", "Block G", "Block H"],
  },
  {
    name: "Etihad Town Lahore",
    citySlug: "lahore",
    cityName: "Lahore",
    lat: 31.3873,
    lng: 74.2231,
    phases: ["Phase 1", "Phase 2"],
    blocks: ["Block A", "Block B", "Block C", "Block D", "Block E"],
  },
  {
    name: "DHA Islamabad",
    citySlug: "islamabad",
    cityName: "Islamabad",
    lat: 33.532,
    lng: 73.1496,
    phases: ["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5", "Phase 6", "Phase 7"],
    sectors: ["Sector A", "Sector B", "Sector C", "Sector D", "Sector E", "Sector F", "Sector G", "Sector H", "Sector J"],
  },
  {
    name: "Bahria Town Islamabad",
    citySlug: "islamabad",
    cityName: "Islamabad",
    lat: 33.5124,
    lng: 73.1042,
    phases: ["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5", "Phase 6", "Phase 7", "Phase 8"],
    blocks: ["Safari Valley", "Umer Block", "Usman Block", "Ali Block", "Abu Bakar Block", "Awais Block", "Bilal Block", "Overseas Block", "Rafi Block", "Sector E", "Sector F", "Sector G", "Sector H", "Sector I", "Sector J", "Sector K", "Sector L", "Sector M", "Sector N"],
  },
  {
    name: "Bahria Enclave Islamabad",
    citySlug: "islamabad",
    cityName: "Islamabad",
    lat: 33.6312,
    lng: 73.2218,
    sectors: ["Sector A", "Sector B", "Sector B1", "Sector B2", "Sector C", "Sector C1", "Sector C2", "Sector C3", "Sector D", "Sector E", "Sector F", "Sector F1", "Sector G", "Sector H", "Sector I", "Sector J", "Sector K", "Sector L", "Sector M", "Sector N", "Sector O", "Sector P"],
  },
  {
    name: "Gulberg Greens Islamabad",
    citySlug: "islamabad",
    cityName: "Islamabad",
    lat: 33.6102,
    lng: 73.1101,
    blocks: ["Block A", "Block B", "Block C", "Block D", "Block E", "Executive Block"],
  },
  {
    name: "Gulberg Residencia Islamabad",
    citySlug: "islamabad",
    cityName: "Islamabad",
    lat: 33.5926,
    lng: 73.1287,
    blocks: ["Block A", "Block B", "Block C", "Block D", "Block E", "Block F", "Block G", "Block H", "Block I", "Block J", "Block K", "Block L", "Block M", "Block N", "Block O", "Block P", "Block Q", "Block R", "Block S", "Block T", "Block V"],
  },
  {
    name: "Blue Area Islamabad",
    citySlug: "islamabad",
    cityName: "Islamabad",
    lat: 33.715,
    lng: 73.069,
    aliases: ["Jinnah Avenue"],
  },
  {
    name: "Islamabad Sectors",
    citySlug: "islamabad",
    cityName: "Islamabad",
    lat: 33.6938,
    lng: 73.0652,
    aliases: ["CDA Sector", "Sector"],
    sectors: [
      "E-7", "E-11", "E-11/1", "E-11/2", "E-11/3", "E-11/4", "E-12",
      "F-6", "F-7", "F-8", "F-10", "F-11", "F-11/1", "F-11/2", "F-11/3", "F-11/4",
      "G-6", "G-7", "G-8", "G-9", "G-10", "G-11", "G-11/1", "G-11/2", "G-11/3", "G-11/4", "G-13", "G-13/1", "G-13/2", "G-13/3", "G-13/4", "G-14", "G-15", "G-16",
      "H-8", "H-9", "H-13", "I-8", "I-8/1", "I-8/2", "I-8/3", "I-8/4", "I-9", "I-10", "I-11", "I-12", "I-14", "I-15", "I-16",
      "B-17", "D-12", "D-17",
    ],
  },
  {
    name: "Park View City Islamabad",
    citySlug: "islamabad",
    cityName: "Islamabad",
    lat: 33.6786,
    lng: 73.1852,
    blocks: ["Block A", "Block B", "Block C", "Block D", "Block E", "Block F", "Block G", "Block H", "Block J", "Block K", "Overseas Block", "Golf Estate"],
  },
  {
    name: "Bahria Town Rawalpindi",
    citySlug: "rawalpindi",
    cityName: "Rawalpindi",
    lat: 33.5124,
    lng: 73.1042,
    phases: ["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5", "Phase 6", "Phase 7", "Phase 8", "Phase 8 Extension"],
    sectors: ["Sector A", "Sector B", "Sector C", "Sector D", "Sector E", "Sector F", "Sector G", "Sector H", "Sector I", "Sector J", "Sector K", "Sector L", "Sector M", "Sector N"],
  },
  {
    name: "Gulraiz Housing Scheme Rawalpindi",
    citySlug: "rawalpindi",
    cityName: "Rawalpindi",
    lat: 33.5651,
    lng: 73.0169,
    phases: ["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5", "Phase 6"],
  },
  {
    name: "Askari Rawalpindi",
    citySlug: "rawalpindi",
    cityName: "Rawalpindi",
    lat: 33.5836,
    lng: 73.1035,
    phases: ["Askari 1", "Askari 3", "Askari 5", "Askari 7", "Askari 10", "Askari 11", "Askari 13", "Askari 14"],
  },
  {
    name: "DHA Karachi",
    citySlug: "karachi",
    cityName: "Karachi",
    lat: 24.8009,
    lng: 67.0511,
    aliases: ["Defence Karachi"],
    phases: ["Phase 1", "Phase 2", "Phase 2 Extension", "Phase 3", "Phase 4", "Phase 5", "Phase 6", "Phase 7", "Phase 7 Extension", "Phase 8"],
  },
  {
    name: "DHA City Karachi",
    citySlug: "karachi",
    cityName: "Karachi",
    lat: 25.0966,
    lng: 67.4839,
    sectors: ["Sector 1", "Sector 2", "Sector 3", "Sector 4", "Sector 5", "Sector 6", "Sector 7", "Sector 8", "Sector 9", "Sector 10", "Sector 11", "Sector 12", "Sector 13", "Sector 14", "Sector 15", "Sector 16"],
  },
  {
    name: "Clifton Karachi",
    citySlug: "karachi",
    cityName: "Karachi",
    lat: 24.8138,
    lng: 67.03,
    blocks: ["Block 1", "Block 2", "Block 3", "Block 4", "Block 5", "Block 6", "Block 7", "Block 8", "Block 9"],
  },
  {
    name: "Bahria Town Karachi",
    citySlug: "karachi",
    cityName: "Karachi",
    lat: 25.0007,
    lng: 67.3142,
    sectors: Array.from({ length: 35 }, (_, i) => `Precinct ${i + 1}`),
  },
  {
    name: "Gulistan-e-Johar Karachi",
    citySlug: "karachi",
    cityName: "Karachi",
    lat: 24.9204,
    lng: 67.1322,
    blocks: Array.from({ length: 20 }, (_, i) => `Block ${i + 1}`),
  },
  {
    name: "Gulshan-e-Iqbal Karachi",
    citySlug: "karachi",
    cityName: "Karachi",
    lat: 24.9204,
    lng: 67.0967,
    blocks: Array.from({ length: 19 }, (_, i) => `Block ${i + 1}`),
  },
  {
    name: "Scheme 33 Karachi",
    citySlug: "karachi",
    cityName: "Karachi",
    lat: 24.9518,
    lng: 67.1834,
    sectors: Array.from({ length: 30 }, (_, i) => `Sector ${i + 20}-A`),
  },
  {
    name: "PECHS Karachi",
    citySlug: "karachi",
    cityName: "Karachi",
    lat: 24.8632,
    lng: 67.0631,
    blocks: ["Block 1", "Block 2", "Block 3", "Block 4", "Block 5", "Block 6"],
  },
  {
    name: "North Nazimabad Karachi",
    citySlug: "karachi",
    cityName: "Karachi",
    lat: 24.9394,
    lng: 67.0388,
    blocks: ["Block A", "Block B", "Block C", "Block D", "Block E", "Block F", "Block G", "Block H", "Block I", "Block J", "Block K", "Block L", "Block M", "Block N"],
  },
  {
    name: "DHA Multan",
    citySlug: "multan",
    cityName: "Multan",
    lat: 30.16,
    lng: 71.46,
    sectors: ["Sector A", "Sector B", "Sector B1", "Sector C", "Sector D", "Sector E", "Sector F", "Sector G", "Sector H", "Sector I", "Sector J", "Sector K", "Sector L", "Sector M", "Sector N", "Sector O", "Sector P", "Sector Q", "Sector R", "Sector S", "Sector T", "Sector U", "Sector V", "Sector W", "Sector X", "Sector Y", "Sector Z"],
  },
  {
    name: "Buch Villas Multan",
    citySlug: "multan",
    cityName: "Multan",
    lat: 30.22,
    lng: 71.52,
    blocks: ["Block A", "Block B", "Block C", "Block D", "Block E"],
  },
  {
    name: "Wapda Town Multan",
    citySlug: "multan",
    cityName: "Multan",
    lat: 30.2311,
    lng: 71.4625,
    phases: ["Phase 1", "Phase 2"],
  },
  {
    name: "Eden Valley Faisalabad",
    citySlug: "faisalabad",
    cityName: "Faisalabad",
    lat: 31.43,
    lng: 73.05,
    phases: ["Phase 1", "Phase 2", "Phase 3"],
  },
  {
    name: "Wapda City Faisalabad",
    citySlug: "faisalabad",
    cityName: "Faisalabad",
    lat: 31.4022,
    lng: 73.0218,
    blocks: ["Block A", "Block B", "Block C", "Block D", "Block E", "Block F", "Block G", "Block H", "Block J", "Block K", "Block L", "Block M"],
  },
  {
    name: "Citi Housing Faisalabad",
    citySlug: "faisalabad",
    cityName: "Faisalabad",
    lat: 31.4544,
    lng: 73.1497,
    phases: ["Phase 1", "Phase 2"],
    blocks: ["Block A", "Block B", "Block C", "Block D", "Block E", "Block F", "Block G", "Block H"],
  },
  {
    name: "Satellite Town Gujranwala",
    citySlug: "gujranwala",
    cityName: "Gujranwala",
    lat: 32.1617,
    lng: 74.1883,
    blocks: ["Block A", "Block B", "Block C", "Block D", "Block E"],
  },
  {
    name: "Wapda Town Gujranwala",
    citySlug: "gujranwala",
    cityName: "Gujranwala",
    lat: 32.1425,
    lng: 74.1412,
    phases: ["Phase 1", "Phase 2"],
  },
  {
    name: "Master City Gujranwala",
    citySlug: "gujranwala",
    cityName: "Gujranwala",
    lat: 32.1042,
    lng: 74.1166,
    blocks: ["Block A", "Block B", "Block C", "Block D", "Block E", "Block F"],
  },
  {
    name: "Hayatabad Peshawar",
    citySlug: "peshawar",
    cityName: "Peshawar",
    lat: 33.99,
    lng: 71.49,
    phases: ["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5", "Phase 6", "Phase 7"],
    sectors: ["Sector A", "Sector B", "Sector C", "Sector D", "Sector E", "Sector F", "Sector G", "Sector H", "Sector J", "Sector K"],
  },
  {
    name: "DHA Peshawar",
    citySlug: "peshawar",
    cityName: "Peshawar",
    lat: 33.9583,
    lng: 71.4278,
    sectors: ["Sector A", "Sector B", "Sector C", "Sector D", "Sector E", "Sector F", "Sector G"],
  },
  {
    name: "Regi Model Town Peshawar",
    citySlug: "peshawar",
    cityName: "Peshawar",
    lat: 34.0331,
    lng: 71.4527,
    sectors: ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5"],
  },
];

/** Deterministic small offset so each sub-area gets its own plausible centroid. */
function offset(index: number, total: number): { dLat: number; dLng: number } {
  const angle = (index / Math.max(1, total)) * Math.PI * 2;
  const radius = 0.006 + (index % 3) * 0.004; // ~0.6–1.4 km
  return { dLat: Math.sin(angle) * radius, dLng: Math.cos(angle) * radius };
}

const CITIES: { slug: string; name: string; lat: number; lng: number }[] = [
  { slug: "lahore", name: "Lahore", lat: 31.5204, lng: 74.3587 },
  { slug: "islamabad", name: "Islamabad", lat: 33.6844, lng: 73.0479 },
  { slug: "karachi", name: "Karachi", lat: 24.8607, lng: 67.0011 },
  { slug: "rawalpindi", name: "Rawalpindi", lat: 33.5651, lng: 73.0169 },
  { slug: "faisalabad", name: "Faisalabad", lat: 31.4187, lng: 73.0791 },
  { slug: "multan", name: "Multan", lat: 30.1575, lng: 71.5249 },
  { slug: "gujranwala", name: "Gujranwala", lat: 32.1877, lng: 74.1945 },
  { slug: "peshawar", name: "Peshawar", lat: 34.0151, lng: 71.5249 },
];

let cache: SocietyPlace[] | null = null;

export function getSocietyIndex(): SocietyPlace[] {
  if (cache) return cache;
  const out: SocietyPlace[] = [];
  for (const c of CITIES) {
    out.push({ label: c.name, citySlug: c.slug, cityName: c.name, lat: c.lat, lng: c.lng, kind: "city" });
  }
  for (const s of SOCIETIES) {
    out.push({ label: s.name, citySlug: s.citySlug, cityName: s.cityName, lat: s.lat, lng: s.lng, kind: "society" });
    const subs: { list: string[]; kind: SocietyPlace["kind"] }[] = [
      { list: s.phases ?? [], kind: "phase" },
      { list: s.sectors ?? [], kind: "sector" },
      { list: s.blocks ?? [], kind: "block" },
    ];
    for (const { list, kind } of subs) {
      list.forEach((sub, i) => {
        const o = offset(i, list.length);
        // For CDA sectors ("Islamabad Sectors") the label should be the sector itself + city.
        const label = s.name === "Islamabad Sectors" ? `${sub}, Islamabad` : `${s.name.replace(/ (Lahore|Islamabad|Karachi|Rawalpindi|Multan|Faisalabad|Gujranwala|Peshawar)$/, "")} ${sub}, ${s.cityName}`;
        out.push({ label, citySlug: s.citySlug, cityName: s.cityName, lat: s.lat + o.dLat, lng: s.lng + o.dLng, kind, parent: s.name });
      });
    }
  }
  cache = out;
  return out;
}

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Ranks index entries against the query. Matches society names, aliases,
 * phases, sectors and blocks; prefers the selected city; supports partial
 * tokens so "sec" → sectors, "pha" → phases, "blo" → blocks.
 */
export function searchSocietyIndex(query: string, citySlug?: string, limit = 12): SocietyPlace[] {
  const q = normalise(query);
  if (q.length < 2) return [];
  const tokens = q.split(" ").filter(Boolean);
  const index = getSocietyIndex();

  const scored: { place: SocietyPlace; score: number }[] = [];
  for (const place of index) {
    const haystack = normalise(`${place.label} ${place.parent ?? ""}`);
    const society = SOCIETIES.find((s) => s.name === (place.parent ?? place.label));
    const aliasText = normalise((society?.aliases ?? []).join(" "));
    let score = 0;
    let allTokensMatch = true;
    for (const token of tokens) {
      const inLabel = haystack.includes(token);
      const inAlias = aliasText.includes(token);
      if (!inLabel && !inAlias) {
        // generic type words map to kinds
        if (token.startsWith("sec") && place.kind === "sector") { score += 2; continue; }
        if (token.startsWith("pha") && place.kind === "phase") { score += 2; continue; }
        if (token.startsWith("blo") && place.kind === "block") { score += 2; continue; }
        if (token.startsWith("pre") && place.kind === "sector" && place.label.includes("Precinct")) { score += 2; continue; }
        allTokensMatch = false;
        break;
      }
      score += inLabel ? 3 : 1;
      if (haystack.startsWith(token)) score += 2;
    }
    if (!allTokensMatch) continue;
    if (citySlug && place.citySlug === citySlug) score += 4;
    if (place.kind === "society") score += 1; // show parent first when tied
    if (place.kind === "city") score += 3; // cities float to the top
    scored.push({ place, score });
  }

  scored.sort((a, b) => b.score - a.score || a.place.label.localeCompare(b.place.label, undefined, { numeric: true }));
  return scored.slice(0, limit).map((s) => s.place);
}

/**
 * When the user has typed a society and then a sub-area keyword (e.g.
 * "Bahria Town Sector"), return ALL sub-areas of that society so the list
 * reads Sector A, Sector B, … exactly like the requested UX.
 */
export function expandSubAreas(query: string, citySlug?: string, limit = 40): SocietyPlace[] {
  const q = normalise(query);
  const index = getSocietyIndex();
  const kindWord = /\b(sector|sectors|sec|phase|phases|pha|block|blocks|blo|precinct|precincts|zone|zones)\b/.exec(q)?.[1];
  if (!kindWord) return [];
  const kind: SocietyPlace["kind"] | "precinct" =
    kindWord.startsWith("sec") || kindWord.startsWith("zone") ? "sector" : kindWord.startsWith("pha") ? "phase" : kindWord.startsWith("pre") ? "precinct" : "block";
  const societyPart = q.replace(/\b(sector|sectors|sec|phase|phases|pha|block|blocks|blo|precinct|precincts|zone|zones)\b.*$/, "").trim();

  const parents = SOCIETIES.filter((s) => {
    if (!societyPart) return citySlug ? s.citySlug === citySlug : false;
    const name = normalise(s.name);
    const aliases = (s.aliases ?? []).map(normalise);
    return name.includes(societyPart) || aliases.some((a) => a.includes(societyPart) || societyPart.includes(a));
  });
  if (parents.length === 0) return [];

  const out: SocietyPlace[] = [];
  for (const parent of parents) {
    for (const place of index) {
      if (place.parent !== parent.name) continue;
      if (kind === "precinct" ? place.label.includes("Precinct") : place.kind === kind) out.push(place);
    }
  }
  return out.slice(0, limit);
}
