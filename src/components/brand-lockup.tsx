"use client";

import { IconLogo, IconLogoMark } from "@/components/icons";
import { useLanguage } from "@/components/language-provider";
import { SITE } from "@/lib/constants";

/** Consistent product identity; compact variant reserves room for mobile actions. */
/**
 * `adaptive` hands the text colours to CSS variables (--brand-name, --brand-accent,
 * --brand-tagline) so a surrounding surface — the site header — can switch
 * between light and dark without a React re-render. It also renders both marks:
 * the transparent logo (shown while the header floats over the hero) and the
 * navy-tile logo (shown once the header turns solid). CSS picks one.
 */
export function BrandLockup({
  light = false,
  large = false,
  compact = false,
  adaptive = false,
  transparent = false,
}: {
  light?: boolean;
  large?: boolean;
  compact?: boolean;
  adaptive?: boolean;
  transparent?: boolean;
}) {
  const { t } = useLanguage();
  if (adaptive) {
    return (
      <span className={`brand-lockup brand-lockup--adaptive ${compact ? "brand-lockup--compact" : ""} ${large ? "brand-lockup--large" : ""}`}>
        <IconLogoMark className="brand-lockup-mark brand-lockup-mark--bare" />
        <IconLogo className="brand-lockup-mark brand-lockup-mark--tile" />
        <span className="min-w-0">
          <span className="brand-lockup-name">
            Properties <span className="brand-lockup-accent">Pak</span>
          </span>
          <span className="brand-lockup-tagline">{t(SITE.tagline)}</span>
        </span>
      </span>
    );
  }
  const Logo = transparent ? IconLogoMark : IconLogo;
  return (
    <span className={`brand-lockup ${compact ? "brand-lockup--compact" : ""} ${large ? "brand-lockup--large" : ""}`}>
      <Logo className="brand-lockup-mark" />
      <span className="min-w-0">
        <span className={`brand-lockup-name ${light ? "text-white" : "text-navy-900"}`}>
          Properties <span className={light ? "text-forest-400" : "text-forest-700"}>Pak</span>
        </span>
        <span className={`brand-lockup-tagline ${light ? "text-white/70" : "text-ink-muted"}`}>{t(SITE.tagline)}</span>
      </span>
    </span>
  );
}
