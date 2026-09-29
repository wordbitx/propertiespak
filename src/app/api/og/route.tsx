import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants";

export const runtime = "nodejs";

const NAVY = "#061C33";
const NAVY_SOFT = "#0B355C";
const GREEN = "#16B364";

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
      <rect width="48" height="48" rx="13" fill="#FFFFFF" fillOpacity="0.1" />
      <path d="M24 12.4 9.9 24.9a1.95 1.95 0 0 0 1.29 3.38h25.62a1.95 1.95 0 0 0 1.29-3.38Z" fill={GREEN} />
      <path d="M15.3 27.3h17.4v8.1a1.95 1.95 0 0 1-1.95 1.95H17.25A1.95 1.95 0 0 1 15.3 35.4Z" fill="#FFFFFF" />
      <path d="M21.2 37.35v-5.5a1.55 1.55 0 0 1 1.55-1.55h2.5a1.55 1.55 0 0 1 1.55 1.55v5.5Z" fill={NAVY_SOFT} />
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
          backgroundImage: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_SOFT} 62%, #0F5C46 100%)`,
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
