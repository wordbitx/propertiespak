import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FavoritesProvider } from "@/components/favorites-provider";
import { CompareProvider } from "@/components/compare-provider";
import { CompareBar } from "@/components/compare-bar";
import { JsonLd } from "@/components/json-ld";
import { getSessionUserId } from "@/lib/auth";
import { SITE } from "@/lib/constants";
import { ogImage } from "@/lib/images";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Pak Property — Property for Sale & Rent in Pakistan | Pakistan Real Estate",
    template: "%s | Pak Property",
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.company, url: SITE.companyUrl }],
  creator: SITE.company,
  publisher: SITE.company,
  keywords: [
    "real estate Pakistan",
    "property for sale Pakistan",
    "property for rent Pakistan",
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
    "WordbitX Software Company real estate demo",
    "Pakistan property search",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: SITE.url },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    url: SITE.url,
    title: "Pak Property — Pakistan Real Estate in Pakistan",
    description: SITE.description,
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Pak Property — premium property marketplace for Pakistan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pak Property — Pakistan Real Estate in Pakistan",
    description: SITE.description,
    images: [ogImage],
  },
  other: {
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  themeColor: "#082B4C",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const userId = await getSessionUserId();

  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable}`}>
      <body className="bg-white text-ink antialiased">
        <FavoritesProvider>
          <CompareProvider>
            <SiteHeader isAuthenticated={userId !== null} />
            <main id="main" className="min-h-screen">
              {children}
            </main>
            <SiteFooter />
            <CompareBar />
          </CompareProvider>
        </FavoritesProvider>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
      </body>
    </html>
  );
}
