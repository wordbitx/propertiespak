import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { LandingPageView } from "@/components/landing-page-view";
import { getAllLandingSlugs, resolveLanding } from "@/lib/landing-pages";
import { getAllKeywordLandingSlugs, resolveKeywordLanding } from "@/lib/keyword-landings";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

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
      description: "This page is not available on Pak Property.",
      path: "/properties",
    });
  }
  return {
    ...buildMetadata({
      title: content.metaTitle,
      description: content.metaDescription,
      path: `/${content.slug}`,
      keywords: content.keywords,
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
      {content.faqs.length > 0 && <JsonLd data={faqJsonLd(content.faqs)} />}
    </>
  );
}
