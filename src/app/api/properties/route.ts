import { NextResponse } from "next/server";
import { searchProperties, getPropertiesByIds } from "@/lib/queries";

export const dynamic = "force-dynamic";

function numberParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const idsParam = searchParams.get("ids");
    if (idsParam) {
      const ids = idsParam
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isFinite(value) && value > 0);
      const items = await getPropertiesByIds(ids);
      return NextResponse.json({ ok: true, total: items.length, items });
    }

    const result = await searchProperties({
      purpose: searchParams.get("purpose") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      q: searchParams.get("q") ?? undefined,
      minPrice: numberParam(searchParams.get("minPrice")),
      maxPrice: numberParam(searchParams.get("maxPrice")),
      beds: numberParam(searchParams.get("beds")),
      minArea: numberParam(searchParams.get("minArea")),
      featured: searchParams.get("featured") === "1" ? true : undefined,
      verified: searchParams.get("verified") === "1" ? true : undefined,
      isNewProject: searchParams.get("newProjects") === "1" ? true : undefined,
      commercialOnly: searchParams.get("commercial") === "1" ? true : undefined,
      sort: searchParams.get("sort") ?? undefined,
      page: numberParam(searchParams.get("page")) ?? 1,
      pageSize: Math.min(48, numberParam(searchParams.get("pageSize")) ?? 12),
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("property search failed", error);
    return NextResponse.json({ ok: false, error: "Unable to load properties" }, { status: 500 });
  }
}
