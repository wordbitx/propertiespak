import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { listingSubmissions, properties } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { photo } from "@/lib/images";

export const dynamic = "force-dynamic";

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "property"
  );
}

const AGENT_BY_CITY: Record<string, string> = {
  lahore: "hassan-rizvi",
  islamabad: "ayesha-noor",
  rawalpindi: "ayesha-noor",
  karachi: "bilal-shaikh",
  multan: "sana-ali",
  faisalabad: "sana-ali",
  gujranwala: "hassan-rizvi",
  peshawar: "sana-ali",
};

/** Fallback gallery when the owner did not attach photo URLs. */
const FALLBACK_BY_CATEGORY: Record<string, number[]> = {
  house: [36676879, 8082227, 6585757, 7546213],
  apartment: [8082227, 6585757, 7546213, 7031879],
  plot: [36422828, 30505108, 31249549, 11680715],
  office: [1313534, 267501, 13437132, 8310949],
  shop: [30929605, 31573705, 15054264, 12547325],
  building: [2040476, 4534504, 18468708, 1313534],
  warehouse: [7937746, 11680715, 38524594, 25310909],
  farmhouse: [36394726, 28915352, 19075392, 8135496],
  penthouse: [7546321, 8141959, 7045919, 34818802],
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;
  const submissionId = Number(id);
  if (!Number.isFinite(submissionId)) {
    return NextResponse.json({ ok: false, error: "Invalid submission id." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as { action?: string; adminNote?: string };
    const action = body.action === "reject" ? "reject" : body.action === "approve" ? "approve" : null;
    if (!action) {
      return NextResponse.json({ ok: false, error: "Action must be approve or reject." }, { status: 400 });
    }

    await ensureSeeded();

    const rows = await db
      .select()
      .from(listingSubmissions)
      .where(eq(listingSubmissions.id, submissionId))
      .limit(1);
    const submission = rows[0];
    if (!submission) {
      return NextResponse.json({ ok: false, error: "Submission not found." }, { status: 404 });
    }
    if (submission.status !== "pending") {
      return NextResponse.json({ ok: false, error: `Already ${submission.status}.` }, { status: 409 });
    }

    const adminNote = String(body.adminNote ?? "").trim().slice(0, 1000);

    if (action === "reject") {
      await db
        .update(listingSubmissions)
        .set({ status: "rejected", adminNote, reviewedAt: new Date() })
        .where(eq(listingSubmissions.id, submissionId));
      return NextResponse.json({ ok: true, status: "rejected" });
    }

    // Approve → publish as a live property.
    const slug = `${slugify(`${submission.title} ${submission.locationArea} ${submission.cityName}`)}-${submissionId}`;
    const fallback = FALLBACK_BY_CATEGORY[submission.category] ?? FALLBACK_BY_CATEGORY.house;
    const images =
      submission.imageUrls.length > 0
        ? submission.imageUrls
        : fallback.map((photoId) => photo(photoId, 1600, 1050));

    const inserted = await db
      .insert(properties)
      .values({
        slug,
        title: submission.title,
        purpose: submission.purpose,
        category: submission.category,
        propertyType: submission.propertyType,
        citySlug: submission.citySlug,
        cityName: submission.cityName,
        locationArea: submission.locationArea,
        address: submission.address,
        lat: submission.lat,
        lng: submission.lng,
        price: submission.price,
        priceUnit: submission.priceUnit,
        negotiable: submission.negotiable,
        bedrooms: submission.bedrooms,
        bathrooms: submission.bathrooms,
        areaValue: submission.areaValue,
        areaUnit: submission.areaUnit,
        areaSqft: submission.areaSqft,
        parking: submission.parking,
        furnishing: submission.furnishing,
        possession: submission.possession,
        description: submission.description || `${submission.title} in ${submission.locationArea}, ${submission.cityName}. Contact Pak Property for details and a site visit.`,
        features: submission.features,
        amenities: submission.amenities,
        coverImage: submission.imageUrls[0] ?? photo(fallback[0], 1200, 800),
        images,
        featured: false,
        verified: false,
        isNewProject: false,
        projectSlug: null,
        agentSlug: AGENT_BY_CITY[submission.citySlug] ?? "hassan-rizvi",
        listedByName: submission.name,
        listedByEmail: submission.email,
        listedByPhone: submission.phone,
        listedByWhatsapp: submission.phone,
        views: 0,
      })
      .returning({ id: properties.id, slug: properties.slug });

    await db
      .update(listingSubmissions)
      .set({
        status: "approved",
        adminNote,
        propertyId: inserted[0]?.id ?? null,
        reviewedAt: new Date(),
      })
      .where(eq(listingSubmissions.id, submissionId));

    return NextResponse.json({ ok: true, status: "approved", propertySlug: inserted[0]?.slug ?? null });
  } catch (error) {
    console.error("admin review failed", error);
    return NextResponse.json({ ok: false, error: "Could not update the submission." }, { status: 500 });
  }
}
