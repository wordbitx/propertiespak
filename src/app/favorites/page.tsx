import type { Metadata } from "next";
import { FavoritesList } from "@/components/favorites-list";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Saved Properties",
  description:
    "Your saved Pak Property shortlist — compare favourite properties across Pakistan and share them with your consultant before viewings.",
  path: "/favorites",
  robots: { index: false, follow: true },
});

export default function FavoritesPage() {
  return (
    <>
      <PageHero
        eyebrow="Your shortlist"
        title="Saved Properties"
        description="Everything you have hearted, in one place, ready to compare or share with a consultant."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Saved", href: "/favorites" },
        ]}
      />
      <Section tone="light">
        <div className="ui-container">
          <FavoritesList />
        </div>
      </Section>
    </>
  );
}
