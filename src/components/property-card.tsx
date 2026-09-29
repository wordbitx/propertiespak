import Link from "next/link";
import { IconArea, IconArrowRight, IconBath, IconBed, IconEye, IconPin } from "@/components/icons";
import { FavoriteButton } from "@/components/favorite-button";
import { CompareToggle } from "@/components/compare-toggle";
import type { Property } from "@/db/schema";
import { formatArea, formatNumber, formatPrice } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/constants";
import { computePropertyScore, pricePerSqft } from "@/lib/score";

export function purposeBadge(property: Pick<Property, "purpose" | "isNewProject">) {
  if (property.isNewProject) return { label: "New Project", className: "bg-navy-800 text-white" };
  if (property.purpose === "rent") return { label: "For Rent", className: "bg-forest-600 text-white" };
  return { label: "For Sale", className: "bg-white/95 text-navy-900" };
}

export function PropertyCard({
  property,
  priority = false,
  className = "",
}: {
  property: Property;
  priority?: boolean;
  className?: string;
}) {
  const badge = purposeBadge(property);
  const score = computePropertyScore(property);
  const pps = pricePerSqft(property);

  return (
    <article
      className={[
        "group relative flex h-full min-w-0 max-w-full flex-col overflow-hidden rounded-panel border border-soft bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-navy-100 hover:shadow-card",
        className,
      ].join(" ")}
    >
      <div className="zoom-frame relative block aspect-[4/3] overflow-hidden bg-soft">
        <img
          src={property.coverImage}
          alt={`${property.title} — ${property.propertyType} in ${property.locationArea}, ${property.cityName}`}
          width={1200}
          height={800}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover"
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/45 via-transparent to-transparent" />
      </div>

      <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-md px-2.5 py-1 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.12em] shadow-soft ${badge.className}`}
        >
          {badge.label}
        </span>
        <span className="rounded-md bg-navy-950/70 px-2 py-1 font-sans text-[0.625rem] font-bold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm">
          Demo listing
        </span>
      </div>

      <div className="absolute right-4 top-4 flex flex-col gap-2">
        <FavoriteButton propertyId={property.id} title={property.title} />
        <CompareToggle propertyId={property.id} title={property.title} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <p className="font-sans text-[1.28rem] font-bold leading-tight tracking-[-0.03em] text-navy-900">
            {formatPrice(property.price, property.priceUnit)}
          </p>
          <span className="mt-0.5 max-w-full rounded-md bg-mist px-2 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-muted">
            {property.propertyType}
          </span>
        </div>

        <p className="mt-2 text-[0.75rem] text-ink-muted">
          {pps > 0 ? `≈ PKR ${pps.toLocaleString("en-PK")} / sq ft` : CATEGORY_LABELS[property.category] ?? property.propertyType}
          {" · "}
          <span className="font-semibold text-forest-700">Score {score.overall}/10 (demo)</span>
        </p>

        <h3 className="mt-2.5 line-clamp-2 font-sans text-[1.0625rem] font-semibold leading-snug text-navy-900">
          <Link href={`/property/${property.slug}`} className="transition-colors hover:text-forest-700">
            {property.title}
          </Link>
        </h3>

        <p className="mt-2 flex items-center gap-1.5 text-[0.875rem] text-ink-muted">
          <IconPin className="h-4 w-4 shrink-0 text-forest-600" />
          <span className="truncate">
            {property.locationArea}, {property.cityName}
          </span>
        </p>

        <div className="mt-auto pt-4">
          <div className="hairline" />
          <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.8125rem] font-medium text-ink">
            {property.bedrooms > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <IconBed className="h-4 w-4 text-navy-600" /> {property.bedrooms} Beds
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <IconBath className="h-4 w-4 text-navy-600" /> {property.bathrooms} Baths
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <IconArea className="h-4 w-4 text-navy-600" /> {formatArea(property.areaValue, property.areaUnit)}
            </span>
          </div>

          <p className="mt-3 truncate text-[0.75rem] text-ink-muted">
            {property.amenities.slice(0, 3).join(" · ") || property.furnishing}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Link
              href={`/property/${property.slug}`}
              className="inline-flex items-center gap-1.5 font-sans text-[0.875rem] font-semibold text-navy-800 transition-colors hover:text-forest-700"
            >
              View Details
              <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <span className="flex items-center gap-3 text-[0.75rem] text-ink-muted">
              {property.negotiable && <span className="hidden sm:inline">Negotiable</span>}
              <span className="inline-flex items-center gap-1">
                <IconEye className="h-3.5 w-3.5" /> {formatNumber(property.views)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function PropertyRow({ property }: { property: Property }) {
  const badge = purposeBadge(property);
  return (
    <article className="group flex gap-4 rounded-xl border border-soft bg-white p-3 transition-all duration-300 hover:border-navy-100 hover:shadow-card">
      <Link
        href={`/property/${property.slug}`}
        className="zoom-frame relative block h-[104px] w-[140px] shrink-0 overflow-hidden rounded-lg bg-soft"
      >
        <img
          src={property.coverImage}
          alt={`${property.title}, ${property.locationArea}`}
          width={420}
          height={312}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <span className={`absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.1em] ${badge.className}`}>
          {badge.label}
        </span>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="font-sans text-[1rem] font-bold leading-none text-navy-900">
          {formatPrice(property.price, property.priceUnit)}
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-[0.9375rem] font-semibold leading-snug text-navy-900">
          <Link href={`/property/${property.slug}`} className="hover:text-forest-700">
            {property.title}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1.5 truncate text-[0.8125rem] text-ink-muted">
          <IconPin className="h-3.5 w-3.5 text-forest-600" />
          {property.locationArea}, {property.cityName}
        </p>
        <p className="mt-auto pt-2 text-[0.75rem] font-medium text-ink-muted">
          {CATEGORY_LABELS[property.category] ?? property.propertyType}
          {property.bedrooms > 0 ? ` · ${property.bedrooms} beds` : ""} · {formatArea(property.areaValue, property.areaUnit)}
        </p>
      </div>
    </article>
  );
}
