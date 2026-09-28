import { NextResponse } from "next/server";
import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { inquiries, projects, properties } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { INQUIRY_STATUSES, INQUIRY_TYPES } from "@/lib/inquiry-options";

export const dynamic = "force-dynamic";
const PRIVATE_HEADERS = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
function json(data: unknown, status = 200) { return NextResponse.json(data, { status, headers: PRIVATE_HEADERS }); }

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) return json({ ok: false, error: "Admin sign-in required." }, 401);
  try {
    await ensureSeeded();
    const params = new URL(request.url).searchParams;
    const q = (params.get("q") ?? "").trim().slice(0, 200);
    const type = params.get("type") ?? "";
    const status = params.get("status") ?? "";
    const requestedPage = Number(params.get("page") || 1);
    const page = Number.isSafeInteger(requestedPage) ? Math.max(1, Math.min(100000, requestedPage)) : 1;
    const pageSize = 20;
    const conditions: SQL[] = [];
    if (type) {
      if (!INQUIRY_TYPES.includes(type as (typeof INQUIRY_TYPES)[number])) return json({ ok: false, error: "Invalid enquiry type." }, 400);
      conditions.push(eq(inquiries.type, type));
    }
    if (status) {
      if (!INQUIRY_STATUSES.includes(status as (typeof INQUIRY_STATUSES)[number])) return json({ ok: false, error: "Invalid status." }, 400);
      conditions.push(eq(inquiries.status, status));
    }
    if (q) {
      const term = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
      conditions.push(or(ilike(inquiries.name, term), ilike(inquiries.email, term), ilike(inquiries.phone, term), ilike(inquiries.propertyTitle, term), ilike(inquiries.message, term))!);
    }
    const where = conditions.length ? and(...conditions) : undefined;
    const [rows, counts, stats] = await Promise.all([
      db.select({ inquiry: inquiries, propertySlug: properties.slug, projectSlug: projects.slug })
        .from(inquiries)
        .leftJoin(properties, eq(inquiries.propertySlug, properties.slug))
        .leftJoin(projects, eq(inquiries.projectSlug, projects.slug))
        .where(where).orderBy(desc(inquiries.createdAt), desc(inquiries.id)).limit(pageSize).offset((page - 1) * pageSize),
      db.select({ total: sql<number>`count(*)::int` }).from(inquiries).where(where),
      db.select({
        total: sql<number>`count(*)::int`,
        new: sql<number>`(count(*) filter (where ${inquiries.status} = 'new'))::int`,
        contacted: sql<number>`(count(*) filter (where ${inquiries.status} = 'contacted'))::int`,
        closed: sql<number>`(count(*) filter (where ${inquiries.status} = 'closed'))::int`,
        visits: sql<number>`(count(*) filter (where ${inquiries.type} = 'visit'))::int`,
      }).from(inquiries),
    ]);
    const total = counts[0]?.total ?? 0;
    return json({
      ok: true,
      items: rows.map((row) => ({
        ...row.inquiry,
        propertyUrl: row.propertySlug ? `/property/${row.propertySlug}` : null,
        projectUrl: row.projectSlug ? `/projects/${row.projectSlug}` : null,
      })),
      total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)), stats: stats[0],
    });
  } catch (error) {
    console.error("Admin inbox load failed", error);
    return json({ ok: false, error: "Could not load client enquiries." }, 500);
  }
}
