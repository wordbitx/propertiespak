import Link from "next/link";
import { DealerCard } from "@/components/dealer-card";
import { BlueTick } from "@/components/verified-badge";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section";
import type { DealerProfile } from "@/lib/queries";

/**
 * Homepage dealer strip. Verified accounts (blue tick) are shown first, because
 * that is the promise the section makes: every profile with a tick has had its
 * identity, agency and phone number confirmed by the admin team.
 */
export function VerifiedDealersSection({
  dealers,
  totalDealers,
  verifiedCount,
}: {
  dealers: DealerProfile[];
  totalDealers: number;
  verifiedCount: number;
}) {
  if (dealers.length === 0) return null;

  return (
    <Section tone="mist" id="dealers">
      <div className="ui-container">
        <SectionHeading
          eyebrow="Verified dealers"
          title="Dealers & agencies behind the listings"
          description={`${verifiedCount} of ${totalDealers} accounts on Properties Pak carry the verification tick: identity, agency and phone number confirmed by our team, with live property published under the same account.`}
          action={{ label: "All dealers", href: "/dealers" }}
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {dealers.slice(0, 4).map((dealer, index) => (
            <Reveal key={dealer.id} delay={index * 45}>
              <DealerCard dealer={dealer} compact />
            </Reveal>
          ))}
        </div>
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
