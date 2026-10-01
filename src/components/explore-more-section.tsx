"use client";

import { useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import {
  IconArrowRight,
  IconArea,
  IconBuilding,
  IconCalculator,
  IconChart,
  IconCompass,
  IconLayers,
  IconMap,
} from "@/components/icons";

/**
 * Tools, guides and resources that live on Properties Pak itself — every card
 * opens a page of this website rather than sending visitors to another portal.
 */
const LINKS = [
  {
    title: "New Projects",
    description: "The best investment opportunities",
    href: "/properties/new-projects",
    icon: IconBuilding,
    color: "sand",
  },
  {
    title: "Construction Cost Calculator",
    description: "Get construction cost estimate",
    href: "/tools/construction-cost-calculator",
    icon: IconBuilding,
    color: "blue",
  },
  {
    title: "Home Loan Calculator",
    description: "Find affordable loan packages",
    href: "/tools/mortgage-calculator",
    icon: IconCalculator,
    color: "mint",
  },
  {
    title: "Area Guides",
    description: "Explore housing societies in Pakistan",
    href: "/towns",
    icon: IconCompass,
    color: "rose",
  },
  {
    title: "Plot Finder",
    description: "Find plots in any housing society",
    href: "/properties?category=plot",
    icon: IconMap,
    color: "green",
  },
  {
    title: "Property Trends",
    description: "Find popular areas to buy property",
    href: "/blog",
    icon: IconChart,
    color: "lavender",
  },
  {
    title: "All Calculators",
    description: "Every investment tool in one place",
    href: "/tools",
    icon: IconArea,
    color: "aqua",
  },
  {
    title: "Compare Listings",
    description: "Line up shortlisted homes side by side",
    href: "/compare",
    icon: IconLayers,
    color: "violet",
  },
] as const;

export function ExploreMoreSection() {
  const { t } = useLanguage();
  const viewportRef = useRef<HTMLDivElement | null>(null);

  function scroll(direction: -1 | 1) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollBy({ left: direction * Math.max(260, viewport.clientWidth * 0.8), behavior: "smooth" });
  }

  return (
    <section id="explore-more" className="home-explore-more" aria-labelledby="explore-more-heading">
      <div className="ui-container">
        <div className="home-section-topline">
          <div>
            <h2 id="explore-more-heading">{t("Explore more on Properties Pak")}</h2>
            <p className="explore-more-subtitle">{t("Tools, guides and property resources")}</p>
          </div>
          <div className="explore-more-controls" aria-label={t("Explore more resources")}>
            <button type="button" aria-label={t("Scroll to previous resources")} onClick={() => scroll(-1)}>
              <IconArrowRight className="h-4 w-4 rotate-180" />
            </button>
            <button type="button" aria-label={t("Scroll to more resources")} onClick={() => scroll(1)}>
              <IconArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div ref={viewportRef} className="explore-more-viewport" role="region" aria-label={t("More property tools and guides")} tabIndex={0}>
          <div className="explore-more-track">
            {LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} className="explore-more-card" href={item.href}>
                  <span className={`explore-more-icon explore-more-icon--${item.color}`} aria-hidden="true">
                    <Icon className="h-7 w-7" />
                  </span>
                  <span className="explore-more-copy">
                    <span className="explore-more-title">{t(item.title)}</span>
                    <span className="explore-more-description">{t(item.description)}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
