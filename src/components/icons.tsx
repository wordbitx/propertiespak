import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconSearch(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function IconHeart({ filled, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} fill={filled ? "currentColor" : "none"} {...props}>
      <path d="M12 20s-7-4.35-7-9.5A3.9 3.9 0 0 1 12 7.6a3.9 3.9 0 0 1 7 2.9C19 15.65 12 20 12 20Z" />
    </svg>
  );
}

export function IconBed(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M3 18v-7h13a4 4 0 0 1 4 4v3" />
      <path d="M3 11V7m0 11h18" />
      <path d="M8 11V8h5v3" />
    </svg>
  );
}

export function IconBath(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" />
      <path d="M7 12V6.5A2.5 2.5 0 0 1 9.5 4c1.2 0 2 .6 2.4 1.6" />
      <path d="M6 19.5 5 21m13-1.5L19 21" />
    </svg>
  );
}

export function IconArea(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 4v3M15 4v3M4 9h3M4 15h3" />
    </svg>
  );
}

export function IconPin(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M5 12h13m0 0-5-5m5 5-5 5" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="m6 9.5 6 6 6-6" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  );
}

export function IconUser(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <circle cx="12" cy="9" r="3.4" />
      <path d="M5.5 20c.9-3.4 3.4-5.2 6.5-5.2s5.6 1.8 6.5 5.2" />
    </svg>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M6.5 4h3l1.5 4-2 1.3a11 11 0 0 0 5.7 5.7L16 13l4 1.5v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4 6.2 2 2 0 0 1 6.5 4Z" />
    </svg>
  );
}

export function IconMail(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4.5 7 7.5 5.5L19.5 7" />
    </svg>
  );
}

export function IconWhatsApp(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
      <path d="M12.03 3.2a8.74 8.74 0 0 0-7.4 13.37L3.4 20.8l4.35-1.2a8.73 8.73 0 1 0 4.28-16.4Zm0 1.62a7.11 7.11 0 0 1 0 14.22 7.1 7.1 0 0 1-3.9-1.16l-.36-.22-2.42.66.66-2.35-.24-.38a7.11 7.11 0 0 1 6.26-10.77Zm-2.5 3.3c-.2 0-.5.07-.72.34-.24.28-.86.86-.86 2.03 0 1.18.86 2.31.98 2.47.12.16 1.68 2.7 4.08 3.6 2 .75 2.4.6 2.83.56.43-.04 1.4-.57 1.6-1.13.2-.55.2-1.03.14-1.13-.06-.1-.22-.16-.46-.28-.24-.12-1.4-.7-1.62-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06a6.5 6.5 0 0 1-1.9-1.18 7.2 7.2 0 0 1-1.32-1.65c-.14-.24-.02-.37.1-.49.12-.12.28-.32.42-.48.14-.16.2-.28.3-.46.1-.18.04-.34-.02-.46-.06-.12-.52-1.28-.72-1.75-.16-.38-.32-.4-.48-.4h-.4Z" />
    </svg>
  );
}

export function IconStar({ filled, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} fill={filled ? "currentColor" : "none"} {...props}>
      <path d="m12 4.5 2.4 4.9 5.4.8-3.9 3.8.92 5.4L12 16.9l-4.82 2.5.92-5.4L4.2 10.2l5.4-.8Z" />
    </svg>
  );
}

export function IconShield(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M12 3.5 5.5 6v6c0 4.2 2.9 7.3 6.5 8.5 3.6-1.2 6.5-4.3 6.5-8.5V6L12 3.5Z" />
      <path d="m9.2 12.2 2 2 3.6-3.9" />
    </svg>
  );
}

export function IconSliders(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M4 8h10m4 0h2M4 16h4m4 0h8" />
      <circle cx="16" cy="8" r="2" />
      <circle cx="10" cy="16" r="2" />
    </svg>
  );
}

export function IconMap(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M9 4.5 4 6.5v13l5-2 6 2 5-2v-13l-5 2-6-2Z" />
      <path d="M9 4.5v13M15 6.5v13" />
    </svg>
  );
}

export function IconChart(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M4 19h16" />
      <path d="M7 19V9m5 10V5m5 14v-7" />
    </svg>
  );
}

export function IconCalculator(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <rect x="5" y="3.5" width="14" height="17" rx="2" />
      <path d="M8.5 8h7M8.5 12h1.5m3 0h2.5M8.5 16h1.5m3 0h2.5" />
    </svg>
  );
}

export function IconCompass(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15 9-2 4.2-4.2 2 2-4.2Z" />
    </svg>
  );
}

export function IconBuilding(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h6A1.5 1.5 0 0 1 14 5.5V20" />
      <path d="M14 10h3.5A1.5 1.5 0 0 1 19 11.5V20M4 20h16" />
      <path d="M8 8h3M8 12h3M8 16h3" />
    </svg>
  );
}

export function IconKey(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <circle cx="8.5" cy="14" r="3.5" />
      <path d="m11 12 8-8 1.5 1.5-1.6 1.6 1.4 1.4-2.2 2.2-1.4-1.4-1.6 1.6" />
    </svg>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <rect x="4" y="5.5" width="16" height="14" rx="2" />
      <path d="M4 10h16M9 4v3m6-3v3" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function IconSpark(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M12 4v4m0 8v4m-5.6-1.4 2.8-2.8m5.6-5.6 2.8-2.8M4 12h4m8 0h4M6.4 6.4l2.8 2.8m5.6 5.6 2.8 2.8" />
    </svg>
  );
}

export function IconEye(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M2.8 12S6 6.5 12 6.5 21.2 12 21.2 12 18 17.5 12 17.5 2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

export function IconLayers(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="m12 4 8 4-8 4-8-4 8-4Z" />
      <path d="m4 13 8 4 8-4" />
    </svg>
  );
}

export function IconLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <rect width="40" height="40" rx="11" fill="#082B4C" />
      <path d="M11.5 25.8V17l8.4-5.6L28.3 17v8.8" stroke="#22C55E" strokeWidth="2.1" fill="none" strokeLinecap="round" />
      <path d="M16.6 25.8v-5.2h6.7v5.2" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M11.5 27.6h17" stroke="#22C55E" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}
