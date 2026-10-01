import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LanguageProvider } from "@/components/language-provider";
import { FavoritesProvider } from "@/components/favorites-provider";
import { CompareProvider } from "@/components/compare-provider";
import { CompareBar } from "@/components/compare-bar";
import { AiAssistant } from "@/components/ai-assistant";
import { JsonLd } from "@/components/json-ld";
import { getSessionUserId } from "@/lib/auth";
import { SITE } from "@/lib/constants";
import { ogImage } from "@/lib/images";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

/**
 * Self-hosted variable fonts (see scripts/vendor-fonts.mjs). Serving them from
 * our own origin removes a render-blocking third-party request, keeps the build
 * hermetic, and avoids the `next/font/google` build-time fetch.
 */
const jakarta = localFont({
  src: [
    { path: "./fonts/jakarta-latin-normal.woff2", weight: "200 800", style: "normal" },
    { path: "./fonts/jakarta-latin-ext-normal.woff2", weight: "200 800", style: "normal" },
    { path: "./fonts/jakarta-latin-italic.woff2", weight: "200 800", style: "italic" },
  ],
  display: "swap",
  variable: "--font-jakarta",
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
});

const inter = localFont({
  src: [
    { path: "./fonts/inter-latin-normal.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/inter-latin-ext-normal.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/inter-latin-italic.woff2", weight: "100 900", style: "italic" },
  ],
  display: "swap",
  variable: "--font-inter",
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Properties Pak — Property for Sale & Rent in Pakistan | Pakistan Real Estate",
    template: "%s | Properties Pak",
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.company, url: SITE.companyUrl }],
  creator: SITE.company,
  publisher: SITE.company,
  category: "real estate",
  keywords: [
    "properties pak",
    "propertiespak",
    "property for sale in Pakistan",
    "property for rent in Pakistan",
    "real estate Pakistan",
    "houses for sale in Lahore",
    "apartments for sale in Islamabad",
    "plots for sale in Karachi",
    "commercial property Pakistan",
    "new housing projects Pakistan",
    "property investment Pakistan",
    "DHA Lahore property",
    "Bahria Town Karachi property",
    "DHA Islamabad plots",
    "real estate marketplace Pakistan",
    "buy house Pakistan",
    "property portal Pakistan",
    "Pakistan property search",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: SITE.url,
    languages: { "en-PK": SITE.url, "x-default": SITE.url },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    url: SITE.url,
    title: "Properties Pak — Pakistan Real Estate Marketplace",
    description: SITE.description,
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Properties Pak — property marketplace for Pakistan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Properties Pak — Pakistan Real Estate Marketplace",
    description: SITE.description,
    images: [ogImage],
  },
  formatDetection: { telephone: false },
  // Search Console / Bing / Yandex tokens come from the environment so the
  // domain can be verified without a code change.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
        : {}),
      ...(process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION
        ? { "yandex-verification": process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION }
        : {}),
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#082B4C",
  width: "device-width",
  initialScale: 1,
};

/**
 * Toggles `data-header-solid` on <html> once the page scrolls past the hero
 * edge. The header's solid styling keys off this attribute in CSS, so it never
 * depends on React hydrating. SiteHeader keeps its own state for data-surface.
 */
const HEADER_SCROLL_SCRIPT = `(function(){var d=document.documentElement,s;function u(){var v=(window.scrollY||d.scrollTop)>36;if(v===s)return;s=v;if(v)d.setAttribute("data-header-solid","");else d.removeAttribute("data-header-solid")}u();addEventListener("scroll",u,{passive:true});addEventListener("pageshow",u);addEventListener("resize",u)})()`;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const userId = await getSessionUserId();

  return (
    /**
     * suppressHydrationWarning on html/body: browser extensions, translation
     * tools and preview-instrumentation scripts add their own attributes to
     * these two elements before React hydrates. Without this, React treats the
     * attribute difference as a failed hydration and re-renders the whole tree
     * on the client, which briefly shows two copies of the page.
     */
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="bg-white text-ink antialiased" suppressHydrationWarning>
        {/* Runs straight from the HTML, before and independently of React, so the header turns solid on scroll even if hydration is slow or a JS chunk fails. */}
        <script dangerouslySetInnerHTML={{ __html: HEADER_SCROLL_SCRIPT }} />
        <LanguageProvider>
          <FavoritesProvider>
            <CompareProvider>
              <SiteHeader isAuthenticated={userId !== null} />
              <main id="main" className="min-h-screen">
                {children}
              </main>
              <SiteFooter />
              <CompareBar />
              <AiAssistant />
            </CompareProvider>
          </FavoritesProvider>
        </LanguageProvider>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
      </body>
    </html>
  );
}
