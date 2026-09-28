import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { listingSubmissions } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  await ensureSeeded();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const items =
    status && ["pending", "approved", "rejected"].includes(status)
      ? await db
          .select()
          .from(listingSubmissions)
          .where(eq(listingSubmissions.status, status))
          .orderBy(desc(listingSubmissions.createdAt))
          .limit(100)
      : await db.select().from(listingSubmissions).orderBy(desc(listingSubmissions.createdAt)).limit(100);

  const counts = await db
    .select({
      status: listingSubmissions.status,
      total: sql<number>`cast(count(*) as int)`,
    })
    .from(listingSubmissions)
    .groupBy(listingSubmissions.status);

  return NextResponse.json({ ok: true, items, counts });
}
