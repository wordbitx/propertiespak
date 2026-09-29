import Link from "next/link";
import { IconArrowRight } from "@/components/icons";
import { SearchPanel } from "@/components/search-panel";
import { POPULAR_SEARCHES, SITE } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { heroImage } from "@/lib/images";

type Stats = { listings: number; cities: number; verified: number; projects: number };

/** Architectural hero only: individual listings belong in the marketplace below. */
export function Hero({ stats }: { stats: Stats }) {
  const statsItems = [
    { value: formatNumber(stats.listings), label: "Demo properties" },
    { value: String(stats.cities), label: "Cities to explore" },
    { value: String(stats.projects), label: "Sample projects" },
    { value: "8", label: "Property tools" },
  ];
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
          <p className="hero-eyebrow"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-forest-400" />Pakistan’s Premium Property Marketplace</p>
          <h1 id="hero-heading" className="hero-headline">
            <span className="block">Find Your Future.</span>
            <span className="block">Invest With <span className="text-forest-400">Clarity.</span></span>
          </h1>
          <p className="hero-description">
            Discover premium houses, apartments, plots, commercial properties, new developments and investment
            opportunities across Lahore, Islamabad, Karachi and major property markets in Pakistan.
          </p>
          <div className="hero-actions">
            <Link href="/properties" className="btn btn-green">Explore Properties <IconArrowRight className="h-4 w-4 shrink-0" /></Link>
            <Link href="/list-property" className="btn btn-ghost-light">List Your Property</Link>
          </div>
          <p className="hero-signature">Better Homes. Bigger Dreams.</p>
          <a href={SITE.companyUrl} target="_blank" rel="noopener noreferrer" className="hero-credit">A WordbitX Software Company demo</a>
        </div>
      </section>

      <div className="home-search-wrap ui-container" id="property-search" data-testid="hero-search">
        <SearchPanel initialTab="buy" />
      </div>
      <div className="ui-container hero-discovery-meta">
        <div className="hero-popular-searches">
          <p className="shrink-0 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">Popular searches</p>
          <div className="hero-popular-links">
            {POPULAR_SEARCHES.map((search) => <Link key={search.href} href={search.href} className="hero-popular-link">{search.label}<IconArrowRight className="h-3.5 w-3.5 shrink-0 text-forest-700" /></Link>)}
          </div>
        </div>
        <dl className="hero-stats" aria-label="Platform demo snapshot">
          {statsItems.map((item) => <div key={item.label}><dt className="text-[0.6875rem] leading-5 text-ink-muted">{item.label}</dt><dd className="mt-1 font-sans text-[1.45rem] font-bold leading-none tracking-[-0.035em] text-navy-900 sm:text-[1.75rem]">{item.value}</dd></div>)}
        </dl>
      </div>
    </>
  );
}
