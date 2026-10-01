"use client";

import { useCallback, useEffect, useRef, useState, type ImgHTMLAttributes, type SourceHTMLAttributes } from "react";

/** React owns photo retries; never rewrite server-rendered attributes before hydration. */
export function ResilientImage({
  src, srcSet, fallbackSrc = "/images/property-placeholder.svg", pictureSources, pictureClassName, onError, ...props
}: ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
  pictureSources?: SourceHTMLAttributes<HTMLSourceElement>[];
  pictureClassName?: string;
}) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [retry, setRetry] = useState<{ original: typeof src; url?: string; stage: number }>({ original: src, stage: 0 });
  const active = retry.original === src ? retry : { original: src, stage: 0, url: undefined };

  const recover = useCallback(() => {
    const image = imageRef.current;
    if (!image || timerRef.current || active.stage >= 3) return;
    const failed = image.currentSrc || image.src;
    if (failed.includes("images.pexels.com") && active.stage === 0) {
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setRetry({ original: src, stage: 1, url: `${failed}${failed.includes("?") ? "&" : "?"}retry=1` });
      }, 600);
    } else if (failed.includes("images.pexels.com") && failed.includes(".jpeg") && active.stage === 1) {
      setRetry({ original: src, stage: 2, url: failed.replace(".jpeg", ".png").replace(/[?&]retry=1/, "") });
    } else {
      setRetry({ original: src, stage: 3, url: fallbackSrc });
    }
  }, [active.stage, src, fallbackSrc]);

  useEffect(() => {
    // An error may have happened before this particular image hydrated.
    // Reconcile it after the commit, without touching sibling/server nodes.
    const frame = requestAnimationFrame(() => {
      const image = imageRef.current;
      if (image?.complete && image.naturalWidth === 0) recover();
    });
    return () => cancelAnimationFrame(frame);
  }, [recover, active.url]);
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, [src]);

  const image = (
    // Keep responsive browser-native loading, rather than proxying galleries through an image optimiser.
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt ?? ""} ref={imageRef} src={active.url ?? src} srcSet={active.url ? undefined : srcSet}
      data-image-state={active.stage >= 3 ? "fallback" : undefined}
      onError={(event) => { onError?.(event); recover(); }} />
  );
  return pictureSources ? <picture className={pictureClassName}>
    {pictureSources.map((source, index) => <source key={index} {...source} srcSet={active.url ? undefined : source.srcSet} />)}
    {image}
  </picture> : image;
}
