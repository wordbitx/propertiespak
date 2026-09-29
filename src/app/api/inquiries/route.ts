import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { inquiries, projects, properties } from "@/db/schema";
import { contactDigits, INQUIRY_TYPES } from "@/lib/inquiry-options";

export const dynamic = "force-dynamic";

function text(body: Record<string, unknown>, key: string, limit = 300): string {
  return typeof body[key] === "string" ? body[key].trim().slice(0, limit) : "";
}
function fail(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 16000) return fail("Your message is too long. Please keep it under 4,000 characters.", 413);
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return fail("Invalid enquiry details.");
      body = parsed as Record<string, unknown>;
    } catch { return fail("Invalid enquiry details."); }

    const type = text(body, "type", 30) || "property";
    if (!INQUIRY_TYPES.includes(type as (typeof INQUIRY_TYPES)[number])) return fail("Please choose a valid request type.");
    const email = text(body, "email", 254).toLowerCase();
    const name = text(body, "name", 120);
    const phone = text(body, "phone", 50);
    const phoneDigits = contactDigits(phone);
    if (!name) return fail("Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Please enter a valid email address.");
    if (type !== "newsletter" && (phoneDigits.length < 8 || phoneDigits.length > 15)) return fail("Please enter a valid phone or WhatsApp number.");
    const preferredDate = text(body, "preferredDate", 10);
    if (type === "visit" && !preferredDate) return fail("Please select your preferred visit date.");
    if (preferredDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) return fail("Please select a valid date.");
      const parsedDate = new Date(`${preferredDate}T12:00:00Z`);
      if (!Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== preferredDate) return fail("Please select a valid date.");
    }

    await ensureSeeded();
    const propertySlug = text(body, "propertySlug", 180);
    const projectSlug = text(body, "projectSlug", 180);
    let propertyTitle = text(body, "propertyTitle", 240);
    let cityName = text(body, "city", 100);
    if (propertySlug) {
      const [property] = await db.select({ title: properties.title, cityName: properties.cityName })
        .from(properties).where(eq(properties.slug, propertySlug)).limit(1);
      if (!property) return fail("This property is no longer available. Please choose another listing.", 404);
      propertyTitle = property.title;
      cityName = property.cityName;
    }
    if (projectSlug) {
      const [project] = await db.select({ name: projects.name, cityName: projects.cityName })
        .from(projects).where(eq(projects.slug, projectSlug)).limit(1);
      if (!project) return fail("This project is no longer available.", 404);
      propertyTitle ||= project.name;
      cityName ||= project.cityName;
    }

    const extra = (type === "list" || type === "valuation") ? [
      ["Purpose", text(body, "purpose", 60)], ["Property type", text(body, "propertyKind", 80)],
      ["Area", text(body, "area", 200)], ["Expected price", text(body, "expectedPrice", 100)],
    ].filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`) : [];
    const message = [text(body, "message", 4000), ...extra].filter(Boolean).join("\n");
    const [inserted] = await db.insert(inquiries).values({
      type, name, email, phone, message,
      budget: text(body, "budget", 120), preferredDate, cityName,
      propertySlug, propertyTitle, projectSlug,
      source: text(body, "source", 180) || "website",
      status: "new",
    }).returning({ id: inquiries.id });

    return NextResponse.json({ ok: true, id: inserted.id, reference: `PP-ENQ-${String(inserted.id).padStart(6, "0")}` }, { status: 201 });
  } catch (error) {
    console.error("Could not save enquiry", error);
    return fail("Could not save your request. Please try again.", 500);
  }
}
