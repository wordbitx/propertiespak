import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { LandingPageView } from "@/components/landing-page-view";
import { getAllLandingSlugs, resolveLanding } from "@/lib/landing-pages";
import { keywordsForPath } from "@/lib/keyword-catalog";
import { getAllKeywordLandingSlugs, resolveKeywordLanding } from "@/lib/keyword-landings";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo";

type PageProps = { params: Promise<{ landing: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return [...getAllLandingSlugs(), ...getAllKeywordLandingSlugs()].map((landing) => ({ landing }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { landing } = await params;
  const content = resolveLanding(landing) ?? resolveKeywordLanding(landing);
  if (!content) {
    return buildMetadata({
      title: "Page not found",
      description: "This page is not available on Properties Pak.",
      path: "/properties",
    });
  }
  return {
    ...buildMetadata({
      title: content.metaTitle,
      description: content.metaDescription,
      path: `/${content.slug}`,
      // Page keywords plus every catalog phrase that targets this slug, so the
      // metadata matches the terms the page is actually built to answer.
      keywords: [...new Set([...content.keywords, ...keywordsForPath(`/${content.slug}`)])],
      ogKicker: "PROPERTIES PAK",
      ogSubtitle: content.metaDescription,
    }),
    robots: { index: true, follow: true },
  };
}

export default async function LandingPage({ params }: PageProps) {
  const { landing } = await params;
  const content = resolveLanding(landing) ?? resolveKeywordLanding(landing);
  if (!content) notFound();

  const crumbLabel = content.h1.replace(/^Property for (Sale|Rent) in /, "").replace(/^Real Estate /, "");

  return (
    <>
      <LandingPageView content={content} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Properties", href: "/properties" },
          { name: crumbLabel, href: `/${content.slug}` },
        ])}
      />
      <JsonLd
        data={webPageJsonLd({
          name: content.h1,
          description: content.metaDescription,
          path: `/${content.slug}`,
          about: content.keywords.slice(0, 8),
        })}
      />
      <JsonLd
        data={itemListJsonLd({
          name: content.h1,
          path: `/${content.slug}`,
          items: content.relatedLinks.slice(0, 20).map((link) => ({ name: link.label, path: link.href })),
        })}
      />
      {content.faqs.length > 0 && <JsonLd data={faqJsonLd(content.faqs)} />}
    </>
  );
}
