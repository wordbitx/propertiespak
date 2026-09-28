import { NextResponse } from "next/server";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { listingMedia } from "@/db/schema";

export const dynamic = "force-dynamic";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_FILES = 12;

/** Upload original listing photographs; exact bytes are persisted in PostgreSQL. */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const files = form
      .getAll("images")
      .filter((value): value is File => value instanceof File && value.size > 0)
      .slice(0, MAX_FILES);

    if (files.length === 0) {
      return NextResponse.json({ ok: false, error: "Please select at least one image." }, { status: 400 });
    }

    for (const file of files) {
      if (!ALLOWED.has(file.type)) {
        return NextResponse.json(
          { ok: false, error: `${file.name}: only JPG, PNG, WebP and AVIF images are supported.` },
          { status: 400 },
        );
      }
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { ok: false, error: `${file.name}: image must be smaller than 8 MB.` },
          { status: 400 },
        );
      }
    }

    await ensureSeeded();
    const uploaded: { id: number; url: string; name: string; size: number }[] = [];

    for (const file of files) {
      const bytes = Buffer.from(await file.arrayBuffer());
      const rows = await db
        .insert(listingMedia)
        .values({
          fileName: file.name.slice(0, 240) || "property-image",
          mimeType: file.type,
          byteSize: bytes.length,
          dataBase64: bytes.toString("base64"),
        })
        .returning({ id: listingMedia.id });
      const id = rows[0]?.id;
      if (id) uploaded.push({ id, url: `/api/media/${id}`, name: file.name, size: bytes.length });
    }

    return NextResponse.json({ ok: true, images: uploaded });
  } catch (error) {
    console.error("media upload failed", error);
    return NextResponse.json({ ok: false, error: "Images could not be uploaded. Please try again." }, { status: 500 });
  }
}
