"use client";

import Link from "next/link";
import { DealerCard } from "@/components/dealer-card";
import { BlueTick } from "@/components/verified-badge";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section";
import { useDealerBelt } from "@/components/use-dealer-belt";
import type { DealerProfile } from "@/lib/queries";

/**
 * Homepage dealer strip. Verified accounts (blue tick) are shown first, because
 * that is the promise the section makes: every profile with a tick has had its
 * identity, agency and phone number confirmed by the admin team.
 *
 * The strip is the same seamless horizontal loop as the verified-network belt:
 * the row is duplicated and translated by exactly −50%, advancing a card every
 * ~2.6 seconds. Hovering a card pauses the loop; moving the pointer away
 * resumes it.
 */
const MIN_GROUP_CARDS = 12;
const SECONDS_PER_CARD = 2.6;
const MIN_DURATION_SECONDS = 30;

export function VerifiedDealersSection({
  dealers,
  totalDealers,
  verifiedCount,
}: {
  dealers: DealerProfile[];
  totalDealers: number;
  verifiedCount: number;
}) {
  const repeats = Math.max(1, Math.ceil(MIN_GROUP_CARDS / Math.max(1, dealers.length)));
  const belt = Array.from({ length: repeats }, () => dealers).flat();
  const duration = Math.max(MIN_DURATION_SECONDS, Math.round(belt.length * SECONDS_PER_CARD));
  const { beltRef, held, hold, release } = useDealerBelt(duration);

  if (dealers.length === 0) return null;

  function beltGroup(hidden: boolean) {
    return (
      <ul
        className="dealer-belt-group"
        aria-hidden={hidden ? "true" : undefined}
        aria-label={hidden ? undefined : "Verified dealer profiles"}
        // `inert` keeps the cloned pass out of tab order and pointer events.
        inert={hidden || undefined}
      >
        {belt.map((dealer, index) => (
          <li key={`${hidden ? "clone" : "card"}-${dealer.id}-${index}`} className="w-[280px] shrink-0 sm:w-[300px]">
            <DealerCard dealer={dealer} compact />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Section tone="mist" id="dealers">
      <div className="ui-container">
        <SectionHeading
          eyebrow="Verified dealers"
          title="Dealers & agencies behind the listings"
          description={`${verifiedCount} of ${totalDealers} accounts on Properties Pak carry the verification tick: identity, agency and phone number confirmed by our team, with live property published under the same account.`}
          action={{ label: "All dealers", href: "/dealers" }}
        />
      </div>
      <Reveal className="mt-10">
        <div className="ui-container">
          <div
            className="dealer-belt-viewport"
            data-testid="verified-dealers-marquee"
            style={{ overflow: "hidden" }}
            onMouseEnter={hold}
            onMouseLeave={release}
          >
            <div
              ref={beltRef}
              className="dealer-belt"
              data-held={held ? "true" : undefined}
              style={{ display: "flex", width: "max-content", animationDuration: `${duration}s` }}
              onFocusCapture={hold}
              onBlurCapture={release}
            >
              {beltGroup(false)}
              {beltGroup(true)}
            </div>
          </div>
        </div>
      </Reveal>
      <div className="ui-container">
        <div className="mt-8 flex flex-wrap items-center gap-4 rounded-panel border border-soft bg-white px-5 py-4">
          <span className="inline-flex items-center gap-2 font-sans text-[0.875rem] font-semibold text-navy-900">
            <BlueTick className="h-4 w-4" /> Verified means checked, not paid
          </span>
          <p className="text-[0.8125rem] leading-relaxed text-ink-muted">
            Any account that lists a property gets a public profile. The tick is switched on from the admin workspace once the
            account&rsquo;s identity and contact details are confirmed.
          </p>
          <Link href="/list-property" className="btn btn-outline ml-auto">
            List your property
          </Link>
        </div>
      </div>
    </Section>
  );
}
