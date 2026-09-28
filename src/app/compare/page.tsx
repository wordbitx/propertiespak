import type { Metadata } from "next";
import { Suspense } from "react";
import { ComparePageClient } from "@/components/compare-page-client";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Compare Properties Side by Side",
  description:
    "Compare up to three properties on Pak Property — price, price per square foot, area, bedrooms, amenities, indicative yield and the illustrative Pak Property Property Score.",
  path: "/compare",
  robots: { index: false, follow: true },
});

export default function ComparePage() {
  return (
    <>
      <PageHero
        eyebrow="Comparison tool"
        title="Compare Properties Like a Professional"
        description="Line up price, price per square foot, area, amenities and indicative yield across two or three shortlisted properties before you book a single visit."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Compare", href: "/compare" },
        ]}
      />
      <Section tone="light">
        <div className="ui-container">
          <Suspense
            fallback={
              <p className="rounded-panel border border-soft bg-mist p-10 text-center text-[0.9375rem] text-ink-muted">
                Loading comparison…
              </p>
            }
          >
            <ComparePageClient />
          </Suspense>
        </div>
      </Section>
    </>
  );
}
