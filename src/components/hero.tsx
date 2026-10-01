import { ResilientImage } from "@/components/resilient-image";
import { SearchPanel } from "@/components/search-panel";
import { siteImages } from "@/lib/site-images";

/** A generous photograph, with the introduction attached to the search rather than floating in its centre. */
export function Hero() {
  return (
    <section id="home-hero" className="home-hero" aria-labelledby="hero-heading" data-testid="home-hero">
      <ResilientImage
        pictureClassName="hero-photograph"
        pictureSources={[{ type: "image/avif", srcSet: siteImages.aboutVilla.avif[0].src, sizes: "100vw" }]}
        fallbackSrc={siteImages.aboutVilla.webp[0].src}
        src={siteImages.aboutVilla.webp[0].src}
        sizes="100vw"
        width={siteImages.aboutVilla.webp[0].width}
        height={siteImages.aboutVilla.webp[0].height}
        alt={siteImages.aboutVilla.alt}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="hero-background-image"
        data-testid="hero-photograph"
      />
      <div className="hero-photograph-shade" aria-hidden="true" />
      <div className="ui-container hero-content">
        <div className="hero-search-intro">
          <h1 id="hero-heading" className="hero-headline">{"Find Property for Sale & Rent in Pakistan"}</h1>
          <p className="hero-description">Buy, sell or rent homes, plots and commercial properties.</p>
        </div>
        <div className="home-search-wrap" id="property-search" data-testid="hero-search">
          <SearchPanel />
        </div>
      </div>
    </section>
  );
}
