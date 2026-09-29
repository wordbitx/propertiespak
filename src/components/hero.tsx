import Link from "next/link";
import { IconArrowRight } from "@/components/icons";
import { SearchPanel } from "@/components/search-panel";
import { SITE } from "@/lib/constants";
import { heroImage } from "@/lib/images";

/**
 * Architectural hero only: individual listings belong in the marketplace below.
 * Kept deliberately quiet — photograph, one headline, one supporting line, two
 * actions and the search panel. No counters, no keyword cloud: the marketplace
 * sections below carry that weight.
 */
export function Hero() {
  return (
    <>
      <section id="home-hero" className="home-hero" aria-labelledby="hero-heading" data-testid="home-hero">
        <picture className="hero-photograph">
          <source media="(max-width: 767px)" type="image/avif" srcSet={heroImage.mobileAvifSrcSet} sizes="100vw" />
          <source media="(max-width: 767px)" type="image/webp" srcSet={heroImage.mobileSrcSet} sizes="100vw" />
          <source type="image/avif" srcSet={heroImage.avifSrcSet} sizes="100vw" />
          <img
            src={heroImage.desktop}
            srcSet={heroImage.desktopSrcSet}
            sizes="100vw"
            width={3200}
            height={2000}
            alt={heroImage.alt}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="hero-background-image"
            data-testid="hero-photograph"
          />
        </picture>
        <div className="hero-photograph-shade" aria-hidden="true" />
        <div className="ui-container hero-content">
          <p className="hero-eyebrow">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-forest-400" />
            Pakistan’s Premium Property Marketplace
          </p>
          <h1 id="hero-heading" className="hero-headline">
            <span className="block">Find Your Future.</span>
            <span className="block">
              Invest With <span className="text-forest-400">Clarity.</span>
            </span>
          </h1>
          <p className="hero-description">
            Discover premium houses, apartments, plots, commercial properties, new developments and investment
            opportunities across Lahore, Islamabad, Karachi and major property markets in Pakistan.
          </p>
          <div className="hero-actions">
            <Link href="/properties" className="btn btn-green">
              Explore Properties <IconArrowRight className="h-4 w-4 shrink-0" />
            </Link>
            <Link href="/list-property" className="btn btn-ghost-light">
              List Your Property
            </Link>
          </div>
          <p className="hero-signature">Better Homes. Bigger Dreams.</p>
          <a href={SITE.companyUrl} target="_blank" rel="noopener noreferrer" className="hero-credit">
            Official platform by WordbitX Software Company
          </a>
        </div>
      </section>

      <div className="home-search-wrap ui-container" id="property-search" data-testid="hero-search">
        <SearchPanel initialTab="buy" />
      </div>
    </>
  );
}
