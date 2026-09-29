"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IconArrowRight, IconClose, IconLayers } from "@/components/icons";

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const total = images.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  const next = useCallback(() => setIndex((current) => (current + 1) % total), [total]);
  const prev = useCallback(() => setIndex((current) => (current - 1 + total) % total), [total]);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, next, prev]);

  function openAt(position: number) {
    setIndex(position);
    setOpen(true);
  }

  return (
    <>
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-4 sm:grid-rows-2">
        <button
          type="button"
          onClick={() => openAt(0)}
          className="zoom-frame group relative col-span-1 row-span-2 aspect-[4/3] overflow-hidden rounded-panel bg-soft sm:col-span-3 sm:aspect-auto"
          aria-label={`Open image gallery — ${title}`}
        >
          <img
            src={images[0]}
            alt={`${title} — main view`}
            width={1600}
            height={1050}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-navy-950/35 to-transparent" />
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-lg bg-white/92 px-3 py-2 font-sans text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-navy-900">
            <IconLayers className="h-4 w-4 text-forest-600" /> {total} photos
          </span>
        </button>

        {images.slice(1, 5).map((image, position) => (
          <button
            key={`${image}-${position}`}
            type="button"
            onClick={() => openAt(position + 1)}
            className="zoom-frame group relative hidden aspect-[4/3] overflow-hidden rounded-panel bg-soft sm:block"
            aria-label={`View photo ${position + 2} of ${total}`}
          >
            <img
              src={image}
              alt={`${title} — photo ${position + 2}`}
              width={700}
              height={525}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
            {position === 3 && total > 5 && (
              <span className="absolute inset-0 grid place-items-center bg-navy-950/55 font-sans text-[0.875rem] font-semibold text-white">
                +{total - 5} more
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Mobile strip */}
      <div className="-mx-5 mt-3 flex snap-x gap-3 overflow-x-auto px-5 sm:hidden">
        {images.slice(1, 7).map((image, position) => (
          <button
            key={`${image}-m-${position}`}
            type="button"
            onClick={() => openAt(position + 1)}
            className="relative h-[86px] w-[120px] shrink-0 snap-start overflow-hidden rounded-lg bg-soft"
            aria-label={`View photo ${position + 2} of ${total}`}
          >
            <img src={image} alt="" width={240} height={172} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {/* Lightbox rendered in a portal so it always covers the viewport and the
          close controls can never be clipped by an animated ancestor. */}
      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex flex-col bg-navy-950/[0.97] ew-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label={`Photo gallery — ${title}`}
            onClick={close}
          >
            <div
              className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="font-sans text-[0.875rem] font-semibold text-white">
                {index + 1} <span className="text-white/50">/ {total}</span>
                <span className="ml-3 hidden max-w-[40ch] truncate align-middle text-[0.75rem] font-normal text-white/50 sm:inline-block">
                  {title}
                </span>
              </p>
              <button
                type="button"
                onClick={close}
                autoFocus
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 font-sans text-[0.8125rem] font-bold text-navy-900 shadow-lift transition-all hover:bg-forest-500 hover:text-white"
              >
                <IconClose className="h-4 w-4" />
                Close
              </button>
            </div>

            <div
              className="relative flex min-h-0 flex-1 items-center justify-center px-12 pb-2 sm:px-20"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={prev}
                aria-label="Previous photo"
                className="absolute left-3 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white hover:text-navy-900 sm:left-6"
              >
                <IconArrowRight className="h-5 w-5 rotate-180" />
              </button>
              <img
                key={images[index]}
                src={images[index]}
                alt={`${title} — photo ${index + 1} of ${total}`}
                width={1600}
                height={1050}
                className="max-h-[62vh] w-auto max-w-full rounded-panel object-contain shadow-lift sm:max-h-[68vh]"
              />
              <button
                type="button"
                onClick={next}
                aria-label="Next photo"
                className="absolute right-3 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white hover:text-navy-900 sm:right-6"
              >
                <IconArrowRight className="h-5 w-5" />
              </button>
            </div>

            <div className="px-4 pb-3 sm:px-6" onClick={(event) => event.stopPropagation()}>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((image, position) => (
                  <button
                    key={`${image}-t-${position}`}
                    type="button"
                    onClick={() => setIndex(position)}
                    aria-label={`Go to photo ${position + 1}`}
                    aria-current={position === index}
                    className={[
                      "h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all",
                      position === index
                        ? "border-forest-500 opacity-100"
                        : "border-transparent opacity-60 hover:opacity-100",
                    ].join(" ")}
                  >
                    <img src={image} alt="" width={160} height={112} loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={close}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 py-3 font-sans text-[0.875rem] font-semibold text-white transition-colors hover:bg-white hover:text-navy-900 sm:hidden"
              >
                <IconClose className="h-4 w-4" />
                Close Gallery
              </button>
              <p className="mt-2 hidden text-center text-[0.6875rem] text-white/40 sm:block">
                Press Esc or click outside the photo to close
              </p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
