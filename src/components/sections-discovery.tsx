import { ResilientImage } from "@/components/resilient-image";
import Link from "next/link";
import {
  IconArrowRight,
  IconArea,
  IconBuilding,
  IconCompass,
  IconKey,
  IconLayers,
  IconPin,
  IconShield,
  IconSpark,
} from "@/components/icons";
import { MobileScrollGrid } from "@/components/mobile-scroll-grid";
import { PropertyRail } from "@/components/property-rail";
import type { MapProperty } from "@/components/map-view";
import { ResponsiveHomeMap } from "@/components/responsive-home-map";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section";
import type { City, Post, Project, Property } from "@/db/schema";
import { formatPrice } from "@/lib/format";
import { photo, sectionPhotos } from "@/lib/images";
import { SITE } from "@/lib/constants";
import { siteImages } from "@/lib/site-images";
import { SitePicture } from "@/components/site-picture";

const CATEGORY_TILES = [
  { label: "Buy", sub: "Houses, plots & villas", href: "/properties/for-sale", image: sectionPhotos.buy, icon: IconKey },
  { label: "Rent", sub: "Homes & apartments", href: "/properties/for-rent", image: sectionPhotos.rent, icon: IconArea },
  { label: "New Projects", sub: "Off-plan & launches", href: "/properties/new-projects", image: sectionPhotos.newProjects, icon: IconLayers },
  { label: "Commercial", sub: "Offices & retail", href: "/commercial", image: sectionPhotos.commercial, icon: IconBuilding },
  { label: "Luxury Homes", sub: "Signature residences", href: "/properties?category=house", image: sectionPhotos.luxury, icon: IconSpark },
  { label: "Apartments", sub: "City living", href: "/properties?category=apartment", image: sectionPhotos.apartments, icon: IconBuilding },
  { label: "Plots", sub: "Developed sectors", href: "/properties?category=plot", image: sectionPhotos.plots, icon: IconCompass },
  { label: "Offices", sub: "Corporate floors", href: "/properties?type=Office", image: sectionPhotos.offices, icon: IconShield },
];

export function CategoryGrid() {
  return (
    <Section tone="light">
      <div className="ui-container">
        <SectionHeading
          eyebrow="Browse by intent"
          title="Every property category, in one place"
          description="Houses, flats, plots and commercial properties."
          action={{ label: "View all listings", href: "/properties" }}
        />
        <div className="mt-10 grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
          {CATEGORY_TILES.map((tile, index) => {
            const Icon = tile.icon;
            return (
              <Reveal key={tile.label} delay={index * 45}>
                <Link
                  href={tile.href}
                  className="zoom-frame group relative flex h-full min-h-[168px] flex-col justify-between overflow-hidden rounded-panel bg-navy-900 p-5 lg:min-h-[196px]"
                >
                  <ResilientImage
                    src={photo(tile.image, 700, 560)}
                    alt=""
                    width={700}
                    height={560}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity duration-500 group-hover:opacity-85"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/55 to-navy-950/10" />
                  <span className="relative grid h-10 w-10 place-items-center rounded-lg border border-white/20 bg-white/10 text-white backdrop-blur-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="relative">
                    <span className="block font-sans text-[1.0625rem] font-semibold text-white">{tile.label}</span>
                    <span className="mt-1 flex items-center justify-between gap-2 text-[0.8125rem] text-white/70">
                      {tile.sub}
                      <IconArrowRight className="h-4 w-4 shrink-0 text-forest-400 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

export function CityDiscovery({ cities, counts }: { cities: City[]; counts: Map<string, number> }) {
  const featured = cities.slice(0, 6);
  if (featured.length === 0) return null;

  return (
    <Section tone="light" id="markets">
      <div className="ui-container">
        <SectionHeading
          eyebrow="Explore the market"
          title="Explore Pakistan's Property Markets"
          description="Find properties in Lahore, Karachi, Islamabad and other major cities."
          action={{ label: "Browse all cities", href: "/properties" }}
        />
        <div className="mt-10 grid grid-cols-2 gap-3.5 sm:gap-4 lg:auto-rows-[184px] lg:grid-cols-4">
          {featured.map((city, index) => {
            const count = counts.get(city.slug) ?? 0;
            const isHero = index === 0;
            const isWide = index === featured.length - 1;
            return (
              <Reveal
                key={city.slug}
                delay={index * 50}
                className={isHero ? "col-span-2 lg:row-span-2" : isWide ? "col-span-2 lg:col-span-4" : "col-span-1"}
              >
                <Link
                  href={`/city/${city.slug}`}
                  className="zoom-frame group relative flex h-full min-h-[170px] flex-col justify-end overflow-hidden rounded-panel bg-navy-900 p-5"
                >
                  <ResilientImage
                    src={city.imageUrl}
                    alt={city.imageAlt || `${city.name} property market`}
                    width={isHero ? 1000 : 700}
                    height={isHero ? 750 : 560}
                    loading={index < 2 ? "lazy" : "lazy"}
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/40 to-transparent" />
                  <span className="relative">
                    <span className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-forest-400">
                      <IconPin className="h-3.5 w-3.5" />
                      {city.province}
                    </span>
                    <span
                      className={[
                        "mt-2 block font-sans font-bold text-white",
                        isHero ? "text-[1.75rem] lg:text-[2.15rem]" : "text-[1.2rem]",
                      ].join(" ")}
                    >
                      {city.name}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-white/70">
                      <span>{count > 0 ? `${count} live listings` : "New listings added weekly"}</span>
                      {isHero && <span className="hidden lg:inline">· {city.tagline}</span>}
                    </span>
                    <span className="mt-3 hidden items-center gap-1.5 text-[0.8125rem] font-semibold text-forest-400 group-hover:flex">
                      Explore {city.name} <IconArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/** Internal-linking hub: connects the homepage to the deeper SEO landing pages. */
export function MarketHub({
  cities,
  typeLinks,
  societyLinks,
}: {
  cities: { name: string; slug: string }[];
  typeLinks: { label: string; href: string }[];
  societyLinks: { label: string; href: string }[];
}) {
  return (
    <Section tone="mist" id="markets-index">
      <div className="ui-container">
        <SectionHeading
          eyebrow="Browse by market"
          title="Property across Pakistan's major markets"
          description="Browse city markets, property types and area guides."
          action={{ label: "All listings", href: "/properties" }}
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div>
            <h3 className="font-sans text-[0.875rem] font-bold uppercase tracking-[0.14em] text-navy-900">
              Cities · for sale
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {cities.map((city) => (
                <li key={`sale-${city.slug}`}>
                  <Link
                    href={`/property-for-sale-in-${city.slug}`}
                    className="text-[0.875rem] text-ink transition-colors hover:text-forest-700"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mt-7 font-sans text-[0.875rem] font-bold uppercase tracking-[0.14em] text-navy-900">
              Cities · for rent
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {cities.slice(0, 6).map((city) => (
                <li key={`rent-${city.slug}`}>
                  <Link
                    href={`/property-for-rent-in-${city.slug}`}
                    className="text-[0.875rem] text-ink transition-colors hover:text-forest-700"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-[0.875rem] font-bold uppercase tracking-[0.14em] text-navy-900">
              Property types
            </h3>
            <ul className="mt-4 space-y-2.5">
              {typeLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[0.875rem] text-ink transition-colors hover:text-forest-700">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-[0.875rem] font-bold uppercase tracking-[0.14em] text-navy-900">
              Popular locations
            </h3>
            <ul className="mt-4 space-y-2.5">
              {societyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[0.875rem] text-ink transition-colors hover:text-forest-700">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/property-investment-in-pakistan"
              className="mt-6 inline-flex items-center gap-2 font-sans text-[0.875rem] font-semibold text-forest-700 hover:text-forest-600"
            >
              Pakistan property investment guide <IconArrowRight className="h-4 w-4" />
            </Link>
            <div className="mt-4 rounded-xl border border-soft bg-white p-3 text-[0.8125rem] text-ink-muted">
              <span>Looking to build a custom real estate portal like Properties Pak? </span>
              <a
                href={SITE.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="WordbitX Software Company — PropTech Development"
                className="font-semibold text-forest-700 hover:underline"
              >
                Explore PropTech Solutions by WordbitX &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function FeaturedProperties({ properties, total }: { properties: Property[]; total: number }) {
  if (properties.length === 0) return null;
  return (
    <Section tone="light" id="featured">
      <div className="ui-container">
        <SectionHeading title="Featured Properties" action={{ label: "View all", href: "/properties?featured=1&verified=1" }} />
        {/* Idle, this rail drifts forward at its own cadence. The Explore rail
            below runs backwards on a different one, so the two home rails never
            move in lockstep. */}
        <PropertyRail initialProperties={properties} initialTotal={total} query="featured=1&verified=1" label="Featured properties" autoPlay />
      </div>
    </Section>
  );
}

export function NewProjectsSection({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;
  return (
    <Section tone="mist" id="projects">
      <div className="ui-container">
        <SectionHeading
          eyebrow="New developments"
          title="New Housing Projects"
          description="Compare locations, payment plans and handover details."
          action={{ label: "Explore all projects", href: "/projects" }}
        />
        <MobileScrollGrid label="New housing projects" autoPlay testId="project-rail">
          {projects.slice(0, 8).map((project) => (
            <div key={project.slug} className="home-project-item">
              <article className="group flex h-full flex-col overflow-hidden rounded-panel border border-soft bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                <Link href={`/projects/${project.slug}`} className="zoom-frame relative block aspect-[16/10] overflow-hidden bg-soft">
                  <ResilientImage
                    src={project.coverImage}
                    alt={`${project.name} — ${project.projectType} in ${project.location}`}
                    width={1200}
                    height={750}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-4 top-4 rounded-md bg-navy-950/85 px-2.5 py-1 font-sans text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                    {project.status}
                  </span>
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-sans text-[1.1rem] font-semibold text-navy-900">
                    <Link href={`/projects/${project.slug}`} className="hover:text-forest-700">
                      {project.name}
                    </Link>
                  </h3>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[0.875rem] text-ink-muted">
                    <IconPin className="h-4 w-4 text-forest-600" /> {project.location}
                  </p>
                  <dl className="mt-4 space-y-2 text-[0.8125rem]">
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-muted">Developer</dt>
                      <dd className="text-right font-medium text-navy-900">{project.developer}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-muted">Project type</dt>
                      <dd className="text-right font-medium text-navy-900">{project.projectType}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-muted">Handover</dt>
                      <dd className="text-right font-medium text-navy-900">{project.completion}</dd>
                    </div>
                  </dl>
                  <div className="mt-auto pt-5">
                    <div className="hairline pt-4">
                      <p className="font-sans text-[1.05rem] font-bold text-navy-900">
                        Starting from {formatPrice(project.startingPrice)}
                      </p>
                      <Link
                        href={`/projects/${project.slug}`}
                        className="mt-3 inline-flex items-center gap-1.5 font-sans text-[0.875rem] font-semibold text-navy-800 hover:text-forest-700"
                      >
                        Explore Project
                        <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </MobileScrollGrid>
      </div>
    </Section>
  );
}

export function CommercialSection({ properties, total }: { properties: Property[]; total: number }) {
  return (
    <Section tone="light" id="commercial">
      <div className="ui-container">
        <SectionHeading title="Commercial Properties" action={{ label: "View all", href: "/properties/commercial" }} />
        {properties.length ? <PropertyRail initialProperties={properties} initialTotal={total} query="category=commercial" label="Commercial properties" autoPlay /> :
          <p className="mt-4 text-sm text-ink-muted">No commercial listings available yet.</p>}
      </div>
    </Section>
  );
}

export function MapSection({
  properties,
  center,
  cities,
  zoom = 6,
}: {
  properties: MapProperty[];
  center: { lat: number; lng: number };
  cities: { name: string; slug: string }[];
  zoom?: number;
}) {
  return (
    <Section tone="mist" id="map" className="home-desktop-map-section">
      <div className="ui-container">
        <SectionHeading
          title="Discover Properties by Location"
          description="Browse areas and tap a pin to see the property."
          action={{ label: "Open listings with map", href: "/properties" }}
        />
        <div className="mt-6 flex flex-wrap gap-2">
          {cities.map((city) => (
            <Link key={city.slug} href={`/properties?city=${city.slug}`} className="chip">
              {city.name}
            </Link>
          ))}
        </div>
        <div className="mt-6">
          <ResponsiveHomeMap properties={properties} center={center} zoom={zoom} />
        </div>
        <p className="mt-4 text-[0.75rem] leading-relaxed text-ink-muted">
          Imagery © Google · Society layouts © ioi Technologies / DHA Plus. Markers are positioned at society level and
          are indicative only — confirm exact plot location during a site visit.
        </p>
      </div>
    </Section>
  );
}

export function InsightsPreview({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;
  return (
    <Section tone="light" id="insights">
      <div className="ui-container">
        <SectionHeading
          eyebrow="Property insights"
          title="Property Guides"
          description="Practical advice on buying, renting and property documents."
          action={{ label: "All insights", href: "/blog" }}
        />
        {/* Phones swipe the guides horizontally; tablets and desktops keep a three-up grid. */}
        <MobileScrollGrid label="Property guides" className="guides-rail">
          {posts.slice(0, 3).map((post, index) => (
            <Reveal key={post.slug} delay={index * 60}>
              <article className="group flex h-full flex-col overflow-hidden rounded-panel border border-soft bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                <Link href={`/blog/${post.slug}`} className="zoom-frame relative block aspect-[16/10] overflow-hidden bg-soft">
                  <ResilientImage
                    src={post.coverImage}
                    alt={post.title}
                    width={1200}
                    height={750}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-4 top-4 rounded-md bg-white/95 px-2.5 py-1 font-sans text-[0.625rem] font-bold uppercase tracking-[0.14em] text-navy-900">
                    {post.category}
                  </span>
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-sans text-[1.0625rem] font-semibold leading-snug text-navy-900">
                    <Link href={`/blog/${post.slug}`} className="hover:text-forest-700">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-3 line-clamp-3 text-[0.875rem] leading-relaxed text-ink-muted">{post.excerpt}</p>
                  <div className="mt-auto pt-5">
                    <div className="hairline pt-4 text-[0.75rem] font-medium text-ink-muted">
                      {post.author} · {post.readMinutes} min read
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </MobileScrollGrid>
      </div>
    </Section>
  );
}
