import Link from "next/link";

/**
 * Verification marks used across the marketplace.
 *
 * The blue tick marks something the Properties Pak team has checked: a dealer
 * account verified in the admin workspace (`users.is_verified` — identity,
 * phone and published inventory), or a listing flagged verified in the
 * catalogue. It means the same thing everywhere it appears.
 */

export function BlueTick({ className = "h-4 w-4", title = "Verified account" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label={title} className={className}>
      <title>{title}</title>
      <path
        fill="#1D9BF0"
        d="M12 1.7l2.3 1.9 3-.3 1.2 2.7 2.7 1.2-.3 3 1.9 2.3-1.9 2.3.3 3-2.7 1.2-1.2 2.7-3-.3L12 23.3l-2.3-1.9-3 .3-1.2-2.7-2.7-1.2.3-3L1.2 12.5l1.9-2.3-.3-3 2.7-1.2L6.7 3.3l3 .3L12 1.7z"
      />
      <path
        fill="#fff"
        d="M10.6 16.2 7.3 12.9a1 1 0 0 1 1.4-1.4l1.9 1.9 4.7-4.7a1 1 0 1 1 1.4 1.4l-6.1 6.1z"
      />
    </svg>
  );
}

/** Compact chip: blue tick + label, used on cards and profile headers. */
export function VerifiedChip({ className = "", label = "Verified" }: { className?: string; label?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#1D9BF0]/35 bg-[#1D9BF0]/10 px-2 py-0.5 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-[#0b6fb8] ${className}`}
    >
      <BlueTick className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

/** Unverified counterpart so the difference is explicit, never implied. */
export function UnverifiedChip({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-soft bg-mist px-2 py-0.5 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted ${className}`}
    >
      Not verified yet
    </span>
  );
}

/**
 * Dealer identity line: name plus the blue tick when the account is verified.
 * Links to the public dealer profile when one exists.
 */
export function DealerIdentity({
  name,
  verified,
  href,
  className = "",
  nameClassName = "",
  showLabel = false,
}: {
  name: string;
  verified: boolean;
  href?: string;
  className?: string;
  nameClassName?: string;
  showLabel?: boolean;
}) {
  const label = (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={nameClassName}>{name}</span>
      {verified && (
        <>
          <BlueTick className="h-4 w-4 shrink-0" />
          {showLabel && <span className="text-[0.75rem] font-semibold text-[#0b6fb8]">Verified</span>}
        </>
      )}
    </span>
  );
  if (!href) return label;
  return (
    <Link href={href} className="transition-opacity hover:opacity-80">
      {label}
    </Link>
  );
}

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const initials = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  return initials || "PP";
}
