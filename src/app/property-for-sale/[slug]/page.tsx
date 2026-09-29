import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { LandingPageView } from "@/components/landing-page-view";
import { buildSocietyLanding, getAllSocietySlugs } from "@/lib/landing-pages";
import { buildTownLanding, getAllTownSlugs } from "@/lib/towns";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return [...getAllSocietySlugs(), ...getAllTownSlugs()].map((slug) => ({ slug }));
}

/** Society guides first, then the town registry for township-level pages. */
function resolveAreaGuide(slug: string) {
  return buildSocietyLanding(slug) ?? buildTownLanding(slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = resolveAreaGuide(slug);
  if (!content) {
    return buildMetadata({
      title: "Location not found",
      description: "This area guide is not available on Properties Pak.",
      path: "/properties",
    });
  }
  return {
    ...buildMetadata({
      title: content.metaTitle,
      description: content.metaDescription,
      path: `/property-for-sale/${slug}`,
      keywords: content.keywords,
      ogKicker: "AREA GUIDE",
      ogSubtitle: content.metaDescription,
    }),
    robots: { index: true, follow: true },
  };
}

export default async function SocietyPage({ params }: PageProps) {
  const { slug } = await params;
  const content = resolveAreaGuide(slug);
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
      <JsonLd
        data={webPageJsonLd({
          name: content.h1,
          description: content.metaDescription,
          path: `/property-for-sale/${slug}`,
          about: content.keywords.slice(0, 8),
        })}
      />
      <JsonLd
        data={itemListJsonLd({
          name: content.h1,
          path: `/property-for-sale/${slug}`,
          items: content.relatedLinks.slice(0, 20).map((link) => ({ name: link.label, path: link.href })),
        })}
      />
      {content.faqs.length > 0 && <JsonLd data={faqJsonLd(content.faqs)} />}
    </>
  );
}
