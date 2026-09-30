/**
 * Premium section artwork bundled through static imports, so Next.js serves it
 * from `/_next/static/media/<hash>` with immutable caching — the same pipeline
 * as the app's JS and CSS. (AI-generated architectural artwork; see
 * docs/hero-assets.md.)
 */
import type { StaticImageData } from "next/image";
import towerAvif800 from "@/assets/images/commercial-tower-800.avif";
import towerAvif1200 from "@/assets/images/commercial-tower-1200.avif";
import towerWebp800 from "@/assets/images/commercial-tower-800.webp";
import towerWebp1200 from "@/assets/images/commercial-tower-1200.webp";
import lobbyAvif480 from "@/assets/images/commercial-lobby-480.avif";
import lobbyAvif960 from "@/assets/images/commercial-lobby-960.avif";
import lobbyWebp480 from "@/assets/images/commercial-lobby-480.webp";
import lobbyWebp960 from "@/assets/images/commercial-lobby-960.webp";
import livingAvif from "@/assets/images/smarter-living-768.avif";
import livingWebp from "@/assets/images/smarter-living-768.webp";
import villaAvif from "@/assets/images/about-villa-768.avif";
import villaWebp from "@/assets/images/about-villa-768.webp";

export type SiteImage = {
  alt: string;
  avif: StaticImageData[];
  webp: StaticImageData[];
};

export const siteImages = {
  commercialTower: {
    alt: "Premium glass office tower glowing at dusk above a landscaped business plaza",
    avif: [towerAvif800, towerAvif1200],
    webp: [towerWebp800, towerWebp1200],
  },
  commercialLobby: {
    alt: "Marble and walnut reception lobby of a premium office building",
    avif: [lobbyAvif480, lobbyAvif960],
    webp: [lobbyWebp480, lobbyWebp960],
  },
  smarterLiving: {
    alt: "Double-height luxury living room opening onto an illuminated infinity pool at dusk",
    avif: [livingAvif],
    webp: [livingWebp],
  },
  aboutVilla: {
    alt: "Contemporary luxury villa with stone and teak facade at golden hour",
    avif: [villaAvif],
    webp: [villaWebp],
  },
} satisfies Record<string, SiteImage>;
