import { useId, type SVGProps } from "react";

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

export function IconAssistant(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M11.1 3.4 12.8 8.7l5.3 1.7-5.3 1.7-1.7 5.3-1.7-5.3L4.1 10.4l5.3-1.7 1.7-5.3Z" />
      <path d="M18.3 14.6l.8 2.3 2.3.8-2.3.8-.8 2.3-.8-2.3-2.3-.8 2.3-.8.8-2.3Z" />
    </svg>
  );
}

/**
 * Google's mark. Unlike the other icons this one is filled and multi-colour,
 * so it opts out of the shared `base` stroke props.
 */
export function IconGoogle(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.2-4 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1C3.3 21.3 7.3 24 12 24Z"
      />
      <path fill="#FBBC05" d="M5.3 14.3A7.4 7.4 0 0 1 4.8 12c0-.8.1-1.6.4-2.3V6.6H1.3A11.9 11.9 0 0 0 0 12c0 1.9.5 3.8 1.3 5.4l4-3.1Z" />
      <path
        fill="#EA4335"
        d="M12 4.7c2.3 0 3.9.9 4.8 1.8l3.5-3.5C17.9 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.6l4 3.1C6.2 6.8 8.9 4.7 12 4.7Z"
      />
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

/** Hide / take a listing off the public site. */
export function IconEyeOff(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M4.4 8.2C6.3 6.6 9 5.5 12 5.5c3.6 0 6.6 2.1 8.2 4.4M3.4 8.9c1 1.6 2.6 3 4.3 4.1" />
      <path d="M4 4l16 16" />
      <path d="M9.6 10.7a4.2 4.2 0 0 0 5.9 5.9" />
      <path d="M13.9 18.3c-2.1.4-4.2 0-6-1.1" />
    </svg>
  );
}

/** Publish / push a listing back to the live site. */
export function IconUpload(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M12 16V5m0 0L8 9m4-4 4 4" />
      <path d="M5 16v2.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V16" />
    </svg>
  );
}

/** Permanent delete. */
export function IconTrash(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M5 7h14M10 7V5h4v2" />
      <path d="M6.5 7l.8 11.2A1.5 1.5 0 0 0 8.8 19.5h6.4a1.5 1.5 0 0 0 1.5-1.3L17.5 7" />
      <path d="M10.5 11v5m3-5v5" />
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

/* ---------------------------------------------------------------------------
 * Brand marks used for company social profiles (footer). These are filled
 * glyphs rather than the site's line icons so each platform stays recognisable
 * at small sizes.
 * ------------------------------------------------------------------------- */

export function IconFacebook(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
      <path d="M13.4 21.2v-7.1h2.6l.4-3h-3V9.2c0-.87.24-1.46 1.5-1.46h1.6V5.05c-.28-.04-1.23-.12-2.34-.12-2.32 0-3.9 1.42-3.9 4.02v1.15H7.6v3h2.66v7.1Z" />
    </svg>
  );
}

export function IconInstagram(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M8.1 2.7h7.8a5.4 5.4 0 0 1 5.4 5.4v7.8a5.4 5.4 0 0 1-5.4 5.4H8.1a5.4 5.4 0 0 1-5.4-5.4V8.1a5.4 5.4 0 0 1 5.4-5.4Zm0 2A3.4 3.4 0 0 0 4.7 8.1v7.8a3.4 3.4 0 0 0 3.4 3.4h7.8a3.4 3.4 0 0 0 3.4-3.4V8.1a3.4 3.4 0 0 0-3.4-3.4H8.1Zm3.9 2.9a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8Zm0 2a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8Zm4.75-3.1a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function IconLinkedIn(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
      <path d="M6.9 20.4h-3V9h3Zm-1.5-13a1.78 1.78 0 1 1 0-3.56 1.78 1.78 0 0 1 0 3.56Zm4.1 1.6h2.88v1.56h.04c.4-.75 1.38-1.55 2.85-1.55 3.05 0 3.61 2 3.61 4.6v6.79h-3v-6.02c0-1.44-.03-3.28-2-3.28-2 0-2.3 1.56-2.3 3.17v6.13H9.5Z" />
    </svg>
  );
}

export function IconYouTube(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M20.4 6.3a2.9 2.9 0 0 1 2.05 2.06c.35 1.4.4 3.1.4 3.64s-.05 2.24-.4 3.64a2.9 2.9 0 0 1-2.05 2.06c-1.62.4-8.4.4-8.4.4s-6.78 0-8.4-.4A2.9 2.9 0 0 1 1.55 15.6C1.2 14.2 1.15 12.5 1.15 12s.05-2.24.4-3.64A2.9 2.9 0 0 1 3.6 6.3c1.62-.4 8.4-.4 8.4-.4s6.78 0 8.4.4Zm-11.6 3.9 5.6 3.8-5.6 3.8Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
      <path d="M8.5 5.4a1 1 0 0 1 1.52-.85l8.1 5.6a1 1 0 0 1 0 1.7l-8.1 5.6A1 1 0 0 1 8.5 16.6Z" />
    </svg>
  );
}

export function IconPause(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
      <rect x="7" y="5" width="3.6" height="14" rx="1.2" />
      <rect x="13.4" y="5" width="3.6" height="14" rx="1.2" />
    </svg>
  );
}

export function IconTikTok(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
      <path d="M16.5 2.6c.4 2.1 1.7 3.3 3.9 3.5v2.7c-1.4.05-2.7-.35-3.9-1.15v6.5c0 3.9-2.9 6.35-6.2 5.75-2.5-.45-4.1-2.5-3.95-5.15.15-2.7 2.4-4.6 5.1-4.35.3.03.5.05.75.12v2.85c-.25-.08-.5-.13-.75-.15-1.3-.1-2.35.75-2.4 2-.05 1.2.85 2.1 2.05 2.05 1.2-.05 2.05-.95 2.05-2.3V2.6Z" />
    </svg>
  );
}

export function IconX(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M17.2 3.6h2.94l-6.42 7.34 7.55 9.46h-5.91l-4.63-6.05-5.3 6.05H2.48l6.86-7.85L2.1 3.6h6.06l4.19 5.54Zm-1.04 14.5h1.63L7.5 5.24H5.75Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Properties Pak brand mark — the official logo: a white "P" whose bowl frames
 * a four-pane window, a green roof chevron sweeping under it and three rising
 * bars (two white, one green) for growth. The green is the single brand green
 * (--color-brand, #10A456) used across the whole site. Drawn as a vector on the brand's
 * deep-navy tile so it stays crisp from 16px favicons up to the 512px app icon.
 */
/** The mark itself, in the logo's original 1568×627 artwork space. */
function LogoMarkShapes({ white }: { white: string }) {
  return (
    <>
      <path d="M560 246 L596 219 L596 376 L560 405 Z" fill={white} />
      <path d="M609 197 L637 175 L637 340 L609 363 Z" fill={white} />
      <path d="M654 122 Q654 115 660 119 L699 152 L699 288 L654 326 Z" fill="#10A456" />
      <path
        d="M731 138 H890 A113 113 0 0 1 952 350 L903 307 A56 56 0 0 0 888 195 H806 Q792 195 791 210 L718 272 V151 Q718 138 731 138 Z"
        fill={white}
      />
      <path
        d="M562 437 L571 424 L782 242 Q790 234 798 242 L940 356 Q928 372 906 372 Q890 370 880 362 L790 289 L622 437 Z"
        fill="#10A456"
      />
      <g fill="#FFFFFF">
        <rect x="759" y="354" width="28" height="29" />
        <rect x="796" y="354" width="28" height="29" />
        <rect x="759" y="392" width="28" height="29" />
        <rect x="796" y="392" width="28" height="29" />
      </g>
    </>
  );
}

export function IconLogo({ className }: { className?: string }) {
  // SVG IDs are document-wide. Give each logo its own paint servers so the
  // sidebar never references gradients inside the header's hidden tile logo.
  const id = useId();
  const tileId = `${id}-ppMarkTile`;
  const whiteId = `${id}-ppMarkWhite`;

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={tileId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0A1A3A" />
          <stop offset="1" stopColor="#050E26" />
        </linearGradient>
        <linearGradient id={whiteId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E4E8EE" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13.5" fill={`url(#${tileId})`} />
      <rect x="0.6" y="0.6" width="46.8" height="46.8" rx="12.9" fill="none" stroke="#FFFFFF" strokeOpacity="0.09" strokeWidth="1.2" />
      <g transform="translate(24 24.4) scale(0.0815) translate(-783.5 -276)">
        <LogoMarkShapes white={`url(#${whiteId})`} />
      </g>
    </svg>
  );
}

/**
 * The same mark with no tile — the transparent logo, for dark surfaces such as
 * the header while it floats over the hero photograph. The viewBox is a square
 * around the mark so it occupies exactly the tile's box and swapping between
 * the two never shifts the wordmark.
 */
export function IconLogoMark({ className }: { className?: string }) {
  const whiteId = `${useId()}-ppBareWhite`;

  return (
    <svg viewBox="553.5 48 460 460" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={whiteId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E4E8EE" />
        </linearGradient>
      </defs>
      <LogoMarkShapes white={`url(#${whiteId})`} />
    </svg>
  );
}
