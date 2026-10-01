"use client";

import Link from "next/link";
import { IconArrowRight } from "@/components/icons";
import { useLanguage } from "@/components/language-provider";
import { ResilientImage } from "@/components/resilient-image";
import { SearchPanel } from "@/components/search-panel";
import { SITE } from "@/lib/constants";
import { heroImage } from "@/lib/images";

const HERO_IMAGE_SOURCES = [
  { type: "image/jpeg", media: "(max-width: 767px)", srcSet: heroImage.mobileSrcSet, sizes: "100vw" },
  { type: "image/jpeg", srcSet: heroImage.desktopSrcSet, sizes: "100vw" },
];

/** The original Pexels residence photo, served at high desktop and portrait mobile resolutions. */
export function Hero() {
  const { t } = useLanguage();
  return (
    <section id="home-hero" className="home-hero" aria-labelledby="hero-heading" data-testid="home-hero">
      <link rel="preconnect" href={heroImage.origin} crossOrigin="anonymous" />
      <ResilientImage
        pictureClassName="hero-photograph"
        pictureSources={HERO_IMAGE_SOURCES}
        srcSet={heroImage.desktopSrcSet}
        fallbackSrc="/images/residence-1600.webp"
        src={heroImage.desktop}
        sizes="100vw"
        width={7688}
        height={5128}
        alt={heroImage.alt}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="hero-background-image"
        data-testid="hero-photograph"
      />
      <div className="hero-photograph-shade" aria-hidden="true" />
      <div className="ui-container hero-content">
        <div className="hero-search-intro">
          <p className="hero-eyebrow"><span aria-hidden="true" />{t("Pakistan’s Premium Property Marketplace")}</p>
          <h1 id="hero-heading" className="hero-headline">
            <span className="hero-headline-desktop">{t("Find Your Future.")}<br />{t("Invest With")} <span>{t("Clarity.")}</span></span>
            <span className="hero-headline-mobile">{t("Find Property for")}<br />{t("Sale & Rent in Pakistan")}</span>
          </h1>
          <p className="hero-description hero-description-desktop">
            {t("Discover homes, apartments, plots, commercial properties and new projects across Lahore, Islamabad, Karachi and Pakistan’s major markets.")}
          </p>
          <p className="hero-description hero-description-mobile">{t("Buy, sell or rent property anywhere across Pakistan.")}</p>
          <div className="hero-actions hero-actions-desktop">
            <Link href="#featured" className="btn btn-green">{t("Explore Properties")}<IconArrowRight className="h-4 w-4" /></Link>
            <Link href="/list-property" className="btn btn-ghost-light">{t("List Your Property")}</Link>
          </div>
          <p className="hero-signature">{t("Better Homes. Bigger Dreams.")}</p>
          <a className="hero-credit" href={SITE.companyUrl} target="_blank" rel="noreferrer noopener">
            {t("Official platform by WordbitX Software Company")}
          </a>
        </div>
        <div className="home-search-wrap" id="property-search" data-testid="hero-search">
          <SearchPanel />
        </div>
      </div>
    </section>
  );
}
