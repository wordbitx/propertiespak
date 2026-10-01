import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { listingSubmissions, properties, users } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { photo, submissionFallbackPhotos } from "@/lib/images";
import { invalidateCatalog } from "@/lib/cache";

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
const FALLBACK_BY_CATEGORY = submissionFallbackPhotos;

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
        paymentType: submission.paymentType,
        videoUrl: submission.videoUrl,
        negotiable: submission.negotiable,
        bedrooms: submission.bedrooms,
        bathrooms: submission.bathrooms,
        areaValue: submission.areaValue,
        areaUnit: submission.areaUnit,
        areaSqft: submission.areaSqft,
        parking: submission.parking,
        furnishing: submission.furnishing,
        possession: submission.possession,
        description: submission.description || `${submission.title} in ${submission.locationArea}, ${submission.cityName}. Contact Properties Pak for details and a site visit.`,
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
        listedByUserId: submission.userId ?? null,
        views: 0,
      })
      .returning({ id: properties.id, slug: properties.slug });

    // Publishing under an account promotes it to a dealer profile so the
    // public page at /dealers/<slug> lists the new property immediately.
    if (submission.userId) {
      const owner = await db
        .select({ id: users.id, slug: users.slug, role: users.role })
        .from(users)
        .where(eq(users.id, submission.userId))
        .limit(1);
      if (owner[0]) {
        await db
          .update(users)
          .set({
            role: owner[0].role === "member" ? "dealer" : owner[0].role,
            slug: owner[0].slug || slugify(submission.name),
          })
          .where(eq(users.id, owner[0].id));
      }
    }

    await db
      .update(listingSubmissions)
      .set({
        status: "approved",
        adminNote,
        propertyId: inserted[0]?.id ?? null,
        reviewedAt: new Date(),
      })
      .where(eq(listingSubmissions.id, submissionId));

    invalidateCatalog();
    return NextResponse.json({ ok: true, status: "approved", propertySlug: inserted[0]?.slug ?? null });
  } catch (error) {
    console.error("admin review failed", error);
    return NextResponse.json({ ok: false, error: "Could not update the submission." }, { status: 500 });
  }
}
