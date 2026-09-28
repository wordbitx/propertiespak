import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { LandingPageView } from "@/components/landing-page-view";
import { buildSocietyLanding, getAllSocietySlugs } from "@/lib/landing-pages";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSocietySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = buildSocietyLanding(slug);
  if (!content) {
    return buildMetadata({
      title: "Location not found",
      description: "This area guide is not available on Pak Property.",
      path: "/properties",
    });
  }
  return {
    ...buildMetadata({
      title: content.metaTitle,
      description: content.metaDescription,
      path: `/property-for-sale/${slug}`,
      keywords: content.keywords,
    }),
    robots: { index: true, follow: true },
  };
}

export default async function SocietyPage({ params }: PageProps) {
  const { slug } = await params;
  const content = buildSocietyLanding(slug);
  if (!content) notFound();

  return (
    <>
      <LandingPageView content={content} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Property for Sale", href: "/properties/for-sale" },
          { name: content.h1.replace("Property for Sale in ", ""), href: `/property-for-sale/${slug}` },
        ])}
      />
      {content.faqs.length > 0 && <JsonLd data={faqJsonLd(content.faqs)} />}
    </>
  );
}
