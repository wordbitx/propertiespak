import { NextResponse } from "next/server";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { listingSubmissions } from "@/db/schema";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "string" ? Number(value) : (value as number);
  return Number.isFinite(n) ? n : fallback;
}

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 30);
  if (typeof value === "string") {
    return value.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean).slice(0, 30);
  }
  return [];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const title = String(body.title ?? "").trim();
    const locationArea = String(body.locationArea ?? "").trim();

    if (!name) return NextResponse.json({ ok: false, error: "Please enter your name." }, { status: 400 });
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!phone) return NextResponse.json({ ok: false, error: "Please add a phone or WhatsApp number." }, { status: 400 });
    if (!title || title.length < 8) {
      return NextResponse.json({ ok: false, error: "Please add a clear property title (min 8 characters)." }, { status: 400 });
    }
    if (!locationArea) {
      return NextResponse.json({ ok: false, error: "Please add the society / area name." }, { status: 400 });
    }

    const lat = toNumber(body.lat, 31.5204);
    const lng = toNumber(body.lng, 74.3587);
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ ok: false, error: "Please pin the property location on the map." }, { status: 400 });
    }

    const price = Math.max(0, Math.round(toNumber(body.price, 0)));
    if (!price) return NextResponse.json({ ok: false, error: "Please enter the expected price." }, { status: 400 });

    const citySlug = slugify(String(body.citySlug ?? body.cityName ?? "lahore")) || "lahore";
    const cityName = String(body.cityName ?? "").trim() || "Lahore";
    const areaValue = Math.max(0, toNumber(body.areaValue, 0));
    const areaUnitRaw = String(body.areaUnit ?? "marla").toLowerCase();
    const areaUnit = ["sqft", "marla", "kanal"].includes(areaUnitRaw) ? areaUnitRaw : "marla";
    const areaSqft =
      areaUnit === "marla"
        ? Math.round(areaValue * 225)
        : areaUnit === "kanal"
          ? Math.round(areaValue * 4500)
          : Math.round(areaValue);

    const purpose = body.purpose === "rent" ? "rent" : "buy";
    const category = String(body.category ?? "house").trim() || "house";
    const propertyType = String(body.propertyType ?? "").trim() || "House";
    const imageUrls = toStringList(body.imageUrls)
      .filter((url) => /^https?:\/\//i.test(url) || /^\/api\/media\/\d+$/.test(url))
      .slice(0, 12);
    if (imageUrls.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Please upload at least one clear photo of the property." },
        { status: 400 },
      );
    }

    await ensureSeeded();

    const inserted = await db
      .insert(listingSubmissions)
      .values({
        name,
        email,
        phone,
        title,
        purpose,
        category,
        propertyType,
        citySlug,
        cityName,
        locationArea,
        address: String(body.address ?? "").trim(),
        lat,
        lng,
        price,
        priceUnit: purpose === "rent" ? "month" : "total",
        negotiable: Boolean(body.negotiable),
        bedrooms: Math.max(0, Math.round(toNumber(body.bedrooms, 0))),
        bathrooms: Math.max(0, Math.round(toNumber(body.bathrooms, 0))),
        areaValue,
        areaUnit,
        areaSqft,
        parking: Math.max(0, Math.round(toNumber(body.parking, 0))),
        furnishing: String(body.furnishing ?? "Unfurnished").trim() || "Unfurnished",
        possession: String(body.possession ?? "Available").trim() || "Available",
        description: String(body.description ?? "").trim().slice(0, 4000),
        features: toStringList(body.features),
        amenities: toStringList(body.amenities),
        imageUrls,
      })
      .returning({ id: listingSubmissions.id });

    return NextResponse.json({ ok: true, id: inserted[0]?.id ?? null });
  } catch (error) {
    console.error("submission failed", error);
    return NextResponse.json({ ok: false, error: "Could not save your listing. Please try again." }, { status: 500 });
  }
}
