import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { inquiries } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { INQUIRY_STATUSES } from "@/lib/inquiry-options";

export const dynamic = "force-dynamic";
function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } });
}

/**
 * Permanently delete a client enquiry.
 *
 * Admin-only. Enquiries hold a client's name, phone number and message, so the
 * delete is explicit and confirmed in the inbox — nothing is removed in bulk.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return json({ ok: false, error: "Admin sign-in required." }, 401);
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id < 1) return json({ ok: false, error: "Invalid enquiry reference." }, 400);
  try {
    await ensureSeeded();
    const deleted = await db.delete(inquiries).where(eq(inquiries.id, id)).returning({ id: inquiries.id });
    if (!deleted[0]) return json({ ok: false, error: "Enquiry not found." }, 404);
    return json({ ok: true, deleted: deleted[0].id });
  } catch (error) {
    console.error("Admin enquiry delete failed", error);
    return json({ ok: false, error: "Could not delete this enquiry." }, 500);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return json({ ok: false, error: "Admin sign-in required." }, 401);
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id < 1) return json({ ok: false, error: "Invalid enquiry reference." }, 400);
  try {
    const body = await request.json() as { status?: unknown; adminNote?: unknown };
    if (typeof body.status !== "string" || !INQUIRY_STATUSES.includes(body.status as (typeof INQUIRY_STATUSES)[number])) return json({ ok: false, error: "Choose New, Contacted or Closed." }, 400);
    if (typeof body.adminNote !== "string" || body.adminNote.length > 3000) return json({ ok: false, error: "Notes must be under 3,000 characters." }, 400);
    await ensureSeeded();
    const [item] = await db.update(inquiries).set({ status: body.status, adminNote: body.adminNote.trim(), reviewedAt: new Date() })
      .where(eq(inquiries.id, id)).returning();
    if (!item) return json({ ok: false, error: "Enquiry not found." }, 404);
    return json({ ok: true, item });
  } catch (error) {
    console.error("Admin inbox update failed", error);
    return json({ ok: false, error: "Could not save follow-up details." }, 500);
  }
}
