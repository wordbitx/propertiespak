"use client";

import { useRef, useState } from "react";
import { IconCheck, IconClose, IconLayers } from "@/components/icons";

export type UploadedImage = { id: number; url: string; name: string; size: number };

export function ListingImageUploader({
  images,
  onChange,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    const remaining = Math.max(0, 12 - images.length);
    const selected = Array.from(files).slice(0, remaining);
    if (selected.length === 0) {
      setError("Maximum 12 images are allowed.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      for (const file of selected) data.append("images", file);
      const response = await fetch("/api/media/upload", { method: "POST", body: data });
      const payload = (await response.json()) as { ok?: boolean; error?: string; images?: UploadedImage[] };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Images could not be uploaded.");
        return;
      }
      onChange([...images, ...(payload.images ?? [])].slice(0, 12));
    } catch {
      setError("Network error while uploading images. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="sr-only"
        onChange={(event) => uploadFiles(event.target.files)}
      />

      <button
        type="button"
        disabled={uploading || images.length >= 12}
        onClick={() => inputRef.current?.click()}
        className="flex min-h-32 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-soft bg-mist/50 px-5 py-6 text-center transition-colors hover:border-forest-500 hover:bg-forest-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-forest-700 shadow-soft">
          <IconLayers className="h-5 w-5" />
        </span>
        <span className="mt-3 font-sans text-[0.9rem] font-semibold text-navy-900">
          {uploading ? "Uploading original-quality images…" : images.length ? "Add more property photos" : "Upload property photos"}
        </span>
        <span className="mt-1 text-[0.75rem] text-ink-muted">
          JPG, PNG, WebP or AVIF · up to 8 MB each · maximum 12 photos
        </span>
      </button>

      {error && <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[0.8125rem] text-red-700">{error}</p>}

      {images.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-navy-900">
              <IconCheck className="h-4 w-4 text-forest-600" /> {images.length} {images.length === 1 ? "photo" : "photos"} uploaded
            </p>
            <p className="text-[0.75rem] text-ink-muted">First photo becomes the cover</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image, index) => (
              <div key={image.id} className="group relative overflow-hidden rounded-xl border border-soft bg-white">
                <img
                  src={image.url}
                  alt={`Uploaded property photo ${index + 1}`}
                  width={520}
                  height={390}
                  className="aspect-[4/3] w-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-md bg-navy-950/85 px-2 py-1 font-sans text-[0.625rem] font-bold uppercase tracking-[0.1em] text-white">
                    Cover photo
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onChange(images.filter((item) => item.id !== image.id))}
                  aria-label={`Remove ${image.name}`}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white text-navy-900 shadow-soft hover:bg-red-600 hover:text-white"
                >
                  <IconClose className="h-4 w-4" />
                </button>
                <div className="flex items-center justify-between gap-2 px-2 py-2">
                  <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="text-[0.6875rem] font-semibold text-ink-muted hover:text-navy-900 disabled:opacity-25">← Earlier</button>
                  <button type="button" disabled={index === images.length - 1} onClick={() => move(index, 1)} className="text-[0.6875rem] font-semibold text-ink-muted hover:text-navy-900 disabled:opacity-25">Later →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
