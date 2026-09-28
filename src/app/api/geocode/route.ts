import { NextResponse } from "next/server";
import { CITY_CENTERS } from "@/lib/map-engine";
import { expandSubAreas, searchSocietyIndex } from "@/lib/society-index";

export const dynamic = "force-dynamic";

type Candidate = {
  label: string;
  lat: number;
  lng: number;
  source: "estatewx" | "openstreetmap";
  kind?: string;
};

/**
 * Location suggestions for the listing address field.
 * 1. Instant results from the built-in Pakistan society index (sectors, phases, blocks).
 * 2. If the query ends with a keyword like "sector" / "phase" / "block", every
 *    sub-area of the matched society is listed (Sector A, Sector B, …).
 * 3. OpenStreetMap results are appended for streets / landmarks not in the index.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();
  const citySlug = (searchParams.get("city") ?? "").trim().toLowerCase();
  const cityName = (searchParams.get("cityName") ?? "").trim();
  if (query.length < 2) return NextResponse.json({ ok: true, results: [] });

  const results: Candidate[] = [];

  // 1 + 2: local index
  const expanded = expandSubAreas(query, citySlug || undefined);
  const local = expanded.length > 0 ? expanded : searchSocietyIndex(query, citySlug || undefined, 12);
  for (const place of local) {
    results.push({ label: place.label, lat: place.lat, lng: place.lng, source: "estatewx", kind: place.kind });
  }

  // 3: OpenStreetMap enrichment (skipped when we already have a full sub-area expansion)
  if (expanded.length === 0 && query.length >= 3) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("limit", "5");
      url.searchParams.set("countrycodes", "pk");
      const needsCity = cityName && !query.toLowerCase().includes(cityName.toLowerCase());
      url.searchParams.set("q", needsCity ? `${query}, ${cityName}, Pakistan` : `${query}, Pakistan`);
      const response = await fetch(url, {
        headers: { "User-Agent": "EstateWX-Demo/1.0 (info@wordbitxtech.com)", Accept: "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (response.ok) {
        const data = (await response.json()) as { display_name: string; lat: string; lon: string; type?: string }[];
        for (const item of data) {
          const lat = Number(item.lat);
          const lng = Number(item.lon);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            // Shorten verbose OSM names to the first 3 comma parts.
            const label = item.display_name.split(",").slice(0, 3).map((s) => s.trim()).join(", ");
            results.push({ label, lat, lng, source: "openstreetmap", kind: item.type });
          }
        }
      }
    } catch {
      /* silent fallback */
    }
  }

  if (results.length === 0 && citySlug && CITY_CENTERS[citySlug]) {
    const preset = CITY_CENTERS[citySlug];
    results.push({ label: `${cityName || citySlug} city centre`, lat: preset.lat, lng: preset.lng, source: "estatewx", kind: "city" });
  }

  const unique = results.filter(
    (item, index, list) =>
      list.findIndex((o) => Math.abs(o.lat - item.lat) < 1e-5 && Math.abs(o.lng - item.lng) < 1e-5 && o.label === item.label) === index,
  );

  return NextResponse.json({ ok: true, results: unique.slice(0, 40), expanded: expanded.length > 0 });
}
