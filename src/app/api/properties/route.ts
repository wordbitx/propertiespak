import { NextResponse } from "next/server";
import { searchProperties, getPropertiesByIds, getMapProperties } from "@/lib/queries";
import { propertyQueryFromParams } from "@/lib/property-search";
import { townMatchFor } from "@/lib/towns";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");
    if (idsParam) {
      const ids = [...new Set(idsParam.split(",").map(Number).filter((id) => Number.isSafeInteger(id) && id > 0))].slice(0, 100);
      const items = await getPropertiesByIds(ids);
      return NextResponse.json({ ok: true, total: items.length, items });
    }

    const filters = propertyQueryFromParams(searchParams);
    if (filters.town && !filters.townExact) filters.town = townMatchFor(filters.town);
    if (searchParams.get("view") === "map") {
      const [rows, result] = await Promise.all([
        getMapProperties(filters, 200),
        searchProperties({ ...filters, page: 1, pageSize: 1 }),
      ]);
      // Do not send descriptions, galleries or contact details just to draw pins.
      const items = rows.map((row) => ({
        id: row.id, slug: row.slug, title: row.title, citySlug: row.citySlug, cityName: row.cityName,
        locationArea: row.locationArea, price: row.price, priceUnit: row.priceUnit, lat: row.lat, lng: row.lng,
        coverImage: row.coverImage, propertyType: row.propertyType, bedrooms: row.bedrooms,
        bathrooms: row.bathrooms, areaValue: row.areaValue, areaUnit: row.areaUnit,
      }));
      return NextResponse.json({ ok: true, items, total: result.total, mapped: items.length });
    }

    const result = await searchProperties(filters);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("property search failed", error);
    return NextResponse.json({ ok: false, error: "Unable to load properties" }, { status: 500 });
  }
}
