import { NextResponse } from "next/server";
import { CITY_CENTERS } from "@/lib/map-engine";
import { expandSubAreas, nearestSocietyPlace, searchSocietyIndex } from "@/lib/society-index";
import { TOWNS } from "@/lib/towns";

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
/** Shortens a verbose OSM display name to its first few meaningful parts. */
function shortenOsmLabel(displayName: string): string {
  return displayName
    .split(",")
    .slice(0, 3)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

/**
 * Reverse mode: coordinates → the area name at that point. Used when a user
 * drops the pin somewhere else on the listing map so the address field, the map
 * header and the pin popup all move to the new place instead of keeping the
 * previously selected society.
 */
/** Distance in metres between two coordinates (great-circle). */
function distanceM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Town / housing-scheme centroid nearest to the pin. Towns are the names buyers
 * actually type (Etihad Town, Valencia Town, Kings Town …), so they win over a
 * generic society when they are closer.
 */
function nearestTown(lat: number, lng: number, citySlug: string, maxM = 2500) {
  let best: (typeof TOWNS)[number] | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const town of TOWNS) {
    if (citySlug && town.citySlug !== citySlug) continue;
    const distance = distanceM(lat, lng, town.lat, town.lng);
    if (distance < bestDistance) {
      best = town;
      bestDistance = distance;
    }
  }
  if (!best || bestDistance > maxM) return null;
  return { town: best, distance: Math.round(bestDistance) };
}

/**
 * Index sub-area labels read like "DHA Block R, Lahore"; the pin only needs
 * "Block R". Strips both the full society name and its city-less stem, then the
 * trailing city name.
 */
function shortDetail(label: string, parent: string, cityName: string): string {
  let text = label.trim();
  const stem = parent.replace(/ Map$/, "");
  const stemWithoutCity = stem.replace(/\s+(Lahore|Islamabad|Karachi|Rawalpindi|Multan|Faisalabad|Gujranwala|Peshawar)$/, "");
  for (const prefix of [stem, stemWithoutCity]) {
    if (prefix && text.toLowerCase().startsWith(prefix.toLowerCase())) {
      text = text.slice(prefix.length);
      break;
    }
  }
  if (cityName) {
    text = text.replace(new RegExp(`,?\\s*${cityName}\\s*$`, "i"), "");
  }
  return text.replace(/^[,\s·-]+/, "").trim() || label;
}

async function reverseLookup(lat: number, lng: number, citySlug: string, cityName: string) {
  const nearest = nearestSocietyPlace(lat, lng, citySlug || undefined);
  const town = nearestTown(lat, lng, citySlug);

  // A named scheme beats a broad society whenever it sits closer to the pin.
  if (town && (!nearest || town.distance <= nearest.distanceM)) {
    const inner = nearest && nearest.distanceM <= 1500 ? nearest.detail : undefined;
    return {
      label: town.town.name,
      detail: inner ? shortDetail(inner.label, nearest!.area.label, town.town.cityName) : "",
      kind: inner?.kind ?? "society",
      source: "estatewx" as const,
      lat,
      lng,
      distanceM: town.distance,
    };
  }

  if (nearest) {
    return {
      label: nearest.area.label,
      detail: nearest.detail ? shortDetail(nearest.detail.label, nearest.area.label, nearest.area.cityName) : "",
      kind: nearest.detail?.kind ?? nearest.area.kind,
      source: "estatewx" as const,
      lat,
      lng,
      distanceM: nearest.distanceM,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("zoom", "16");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("accept-language", "en");
    const response = await fetch(url, {
      headers: { "User-Agent": "PropertiesPak/1.0 (+https://propertiespak.com; info@propertiespak.com)", Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (response.ok) {
      const data = (await response.json()) as {
        display_name?: string;
        address?: Record<string, string>;
      };
      const address = data.address ?? {};
      const place = address.neighbourhood || address.suburb || address.village || address.hamlet || address.town;
      const city = address.city || address.town || address.county || cityName;
      const label = [place, city].filter(Boolean).join(", ") || shortenOsmLabel(data.display_name ?? "");
      if (label) {
        return { label, detail: address.road ?? "", kind: "area", source: "openstreetmap" as const, lat, lng, distanceM: 0 };
      }
    }
  } catch {
    /* silent fallback — the client falls back to the city name */
  }

  if (citySlug && CITY_CENTERS[citySlug]) {
    return {
      label: cityName || citySlug,
      detail: "",
      kind: "city",
      source: "estatewx" as const,
      lat,
      lng,
      distanceM: 0,
    };
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();
  const citySlug = (searchParams.get("city") ?? "").trim().toLowerCase();
  const cityName = (searchParams.get("cityName") ?? "").trim();

  const rawLat = searchParams.get("lat");
  const rawLng = searchParams.get("lng");
  if (rawLat !== null && rawLng !== null) {
    const lat = Number(rawLat);
    const lng = Number(rawLng);
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      const reverse = await reverseLookup(lat, lng, citySlug, cityName);
      return NextResponse.json({ ok: true, reverse });
    }
  }

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
        headers: { "User-Agent": "PropertiesPak/1.0 (+https://propertiespak.com; info@propertiespak.com)", Accept: "application/json" },
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
            const label = shortenOsmLabel(item.display_name);
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
