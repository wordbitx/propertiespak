import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants";

export const runtime = "nodejs";

const NAVY = "#061C33";
const NAVY_SOFT = "#0B355C";
/** The single brand green (--color-brand in globals.css). */
const GREEN = "#10A456";

function clamp(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

/**
 * Branded Open Graph / Twitter card image. Any page can request a title-aware
 * card with `/api/og?title=…&kicker=…&subtitle=…`, which keeps shared links
 * readable in search results, WhatsApp, Facebook and X.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = clamp(searchParams.get("title")?.trim() || `${SITE.name} — Pakistan Real Estate`, 92);
  const kicker = clamp(searchParams.get("kicker")?.trim() || SITE.name.toUpperCase(), 34);
  const subtitle = clamp(
    searchParams.get("subtitle")?.trim() || "Houses, apartments, plots & commercial property across Pakistan",
    86,
  );
  const footer = clamp(searchParams.get("footer")?.trim() || SITE.host, 44);

  const logo = (
    <svg width="86" height="86" viewBox="0 0 48 48">
      <rect width="48" height="48" rx="13.5" fill="#FFFFFF" fillOpacity="0.1" />
      <g transform="translate(24 24.4) scale(0.0815) translate(-783.5 -276)">
        <path d="M560 246 L596 219 L596 376 L560 405 Z" fill="#FFFFFF" />
        <path d="M609 197 L637 175 L637 340 L609 363 Z" fill="#FFFFFF" />
        <path d="M654 122 Q654 115 660 119 L699 152 L699 288 L654 326 Z" fill={GREEN} />
        <path
          d="M731 138 H890 A113 113 0 0 1 952 350 L903 307 A56 56 0 0 0 888 195 H806 Q792 195 791 210 L718 272 V151 Q718 138 731 138 Z"
          fill="#FFFFFF"
        />
        <path
          d="M562 437 L571 424 L782 242 Q790 234 798 242 L940 356 Q928 372 906 372 Q890 370 880 362 L790 289 L622 437 Z"
          fill={GREEN}
        />
        <path d="M759 354h28v29h-28Zm37 0h28v29h-28Zm-37 38h28v29h-28Zm37 0h28v29h-28Z" fill="#FFFFFF" />
      </g>
    </svg>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "58px 64px",
          backgroundImage: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_SOFT} 62%, #0C3A63 100%)`,
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {logo}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>{SITE.name}</span>
            <span style={{ fontSize: 20, color: GREEN, fontWeight: 600 }}>{kicker}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1000 }}>
          <span style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.12, letterSpacing: -1.6 }}>{title}</span>
          <span style={{ fontSize: 26, color: "rgba(255,255,255,0.82)", lineHeight: 1.35 }}>{subtitle}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 52, height: 6, borderRadius: 999, backgroundColor: GREEN }} />
            <span style={{ fontSize: 24, color: "rgba(255,255,255,0.85)" }}>{footer}</span>
          </div>
          <span style={{ fontSize: 22, color: "rgba(255,255,255,0.7)" }}>
            Buy · Rent · Invest across Pakistan
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
