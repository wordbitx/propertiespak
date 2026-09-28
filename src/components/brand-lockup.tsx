import { IconLogo } from "@/components/icons";
import { SITE } from "@/lib/constants";

/** Consistent product identity; compact variant reserves room for mobile actions. */
export function BrandLockup({ light = false, large = false, compact = false }: { light?: boolean; large?: boolean; compact?: boolean }) {
  return (
    <span className={`brand-lockup ${compact ? "brand-lockup--compact" : ""} ${large ? "brand-lockup--large" : ""}`}>
      <IconLogo className="brand-lockup-mark" />
      <span className="min-w-0">
        <span className={`brand-lockup-name ${light ? "text-white" : "text-navy-900"}`}>Pak <span className={light ? "text-forest-400" : "text-forest-700"}>Property</span></span>
        <span className={`brand-lockup-tagline ${light ? "text-white/70" : "text-ink-muted"}`}>{SITE.tagline}</span>
      </span>
    </span>
  );
}
