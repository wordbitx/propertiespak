import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { listingMedia } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Invalid media id" }, { status: 400 });
  }

  await ensureSeeded();
  const rows = await db
    .select({ mimeType: listingMedia.mimeType, dataBase64: listingMedia.dataBase64 })
    .from(listingMedia)
    .where(eq(listingMedia.id, id))
    .limit(1);
  const media = rows[0];
  if (!media) return NextResponse.json({ error: "Image not found" }, { status: 404 });

  const bytes = Buffer.from(media.dataBase64, "base64");
  return new Response(bytes, {
    headers: {
      "Content-Type": media.mimeType,
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
