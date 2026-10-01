import { ResilientImage } from "@/components/resilient-image";
import type { SiteImage } from "@/lib/site-images";

const srcSet = (images: SiteImage["avif"]) => images.map((image) => `${image.src} ${image.width}w`).join(", ");

/** Responsive `<picture>` for bundled artwork: AVIF first, WebP fallback. */
export function SitePicture({
  image,
  sizes,
  className,
  priority = false,
}: {
  image: SiteImage;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const fallback = image.webp[image.webp.length - 1];
  return (
      <ResilientImage
        pictureSources={[{ type: "image/avif", srcSet: srcSet(image.avif), sizes }, { type: "image/webp", srcSet: srcSet(image.webp), sizes }]}
        src={fallback.src}
        alt={image.alt}
        width={fallback.width}
        height={fallback.height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={className}
      />
  );
}
