"use client";

import { useSyncExternalStore } from "react";
import { PropertyRail } from "@/components/property-rail";
import { PropertyCard } from "@/components/property-card";
import { Reveal } from "@/components/reveal";
import type { PropertyWithDealer } from "@/lib/queries";

const PHONE = "(max-width: 767px)";
function subscribe(listener: () => void) {
  const media = window.matchMedia(PHONE);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

/** Show four rows of desktop discovery cards and a paginated, single-row swipe rail on phones. */
export function HomeExploreProperties({ properties, total }: { properties: PropertyWithDealer[]; total: number }) {
  const mobile = useSyncExternalStore(subscribe, () => window.matchMedia(PHONE).matches, () => false);
  // On phones this becomes a swipe rail that drifts the opposite way to Featured
  // Properties, and on a slower cadence, so the two home rails read as
  // independent rather than driven by one timer.
  return mobile ? (
    <PropertyRail
      initialProperties={properties}
      initialTotal={total}
      query="sort=newest"
      label="Explore properties"
      pageSize={16}
      propertyTypeBelowPrice
      autoPlay
      autoPlayDirection="backward"
    />
  ) :
    <div className="home-explore-grid mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {properties.map((property, index) => <Reveal key={property.id} delay={index * 50}><PropertyCard property={property} priority={index < 4} propertyTypeBelowPrice /></Reveal>)}
    </div>;
}
