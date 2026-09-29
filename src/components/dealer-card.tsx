import Link from "next/link";
import { IconArrowRight, IconBuilding, IconPin } from "@/components/icons";
import { BlueTick, UnverifiedChip, initialsFor } from "@/components/verified-badge";
import type { DealerProfile } from "@/lib/queries";
import { formatDate } from "@/lib/format";

/**
 * Public dealer card. Shows the blue tick for admin-verified accounts, and is
 * explicit when an account is still awaiting verification.
 */
export function DealerCard({ dealer, compact = false }: { dealer: DealerProfile; compact?: boolean }) {
  const href = dealer.slug ? `/dealers/${dealer.slug}` : "/dealers";
  const displayName = dealer.agency || `${dealer.cityName || "Pakistan"} property desk`;

  return (
    <article className="flex h-full min-w-0 flex-col rounded-panel border border-soft bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-navy-100 hover:shadow-card">
      <div className="flex items-start gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-navy-900 font-sans text-[1.0625rem] font-bold text-white">
          {initialsFor(dealer.name)}
        </span>
        <div className="min-w-0">
          <h3 className="flex min-w-0 flex-wrap items-center gap-2 font-sans text-[1.0625rem] font-semibold text-navy-900">
            <Link href={href} className="truncate transition-colors hover:text-forest-700">
              {dealer.name}
            </Link>
            {/* Blue tick lives beside the name — the same mark the dealer slider uses. */}
            {dealer.isVerified && <BlueTick className="h-4 w-4 shrink-0" />}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-[0.8125rem] text-ink-muted">
            <IconBuilding className="h-3.5 w-3.5 shrink-0 text-forest-600" />
            <span className="truncate">{displayName}</span>
          </p>
          {dealer.cityName && (
            <p className="mt-1 flex items-center gap-1.5 text-[0.8125rem] text-ink-muted">
              <IconPin className="h-3.5 w-3.5 shrink-0 text-forest-600" />
              {dealer.cityName}
            </p>
          )}
        </div>
      </div>

      {!compact && dealer.bio && (
        <p className="mt-4 line-clamp-3 text-[0.875rem] leading-relaxed text-ink-muted">{dealer.bio}</p>
      )}

      <dl className="mt-4 grid grid-cols-3 gap-3 rounded-xl border border-soft bg-mist px-3 py-2.5 text-center">
        <div>
          <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">Listings</dt>
          <dd className="mt-1 font-sans text-[1rem] font-bold text-navy-900">{dealer.listings}</dd>
        </div>
        <div>
          <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">Verified</dt>
          <dd className="mt-1 font-sans text-[1rem] font-bold text-navy-900">{dealer.verifiedListings}</dd>
        </div>
        <div>
          <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">Since</dt>
          <dd className="mt-1 font-sans text-[0.8125rem] font-bold text-navy-900">
            {new Date(dealer.createdAt).getFullYear()}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
        {dealer.isVerified ? (
          <span className="text-[0.75rem] font-semibold text-[#0b6fb8]">Identity &amp; contact verified</span>
        ) : (
          <UnverifiedChip />
        )}
        <Link href={href} className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-forest-700 hover:underline">
          View profile &amp; listings <IconArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {dealer.isVerified && dealer.verifiedAt && (
        <p className="mt-3 border-t border-soft pt-3 text-[0.6875rem] text-ink-muted">
          Verified by the Properties Pak team on {formatDate(dealer.verifiedAt)}
        </p>
      )}
    </article>
  );
}
