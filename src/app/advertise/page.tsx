import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight, IconCheck } from "@/components/icons";
import { LeadForm } from "@/components/lead-form";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Advertise on Properties Pak",
  description: "Contact Properties Pak about promotion for your property, agency or housing project in Pakistan. Request available advertising placements and pricing.",
  path: "/advertise",
});

export default function AdvertisePage() {
  return (
    <>
      <PageHero title="Advertise on Properties Pak" description="Promote your property, agency or housing project. Ask our team about available placements and pricing."
        crumbs={[{ name: "Home", href: "/" }, { name: "Advertise", href: "/advertise" }]} />
      <Section>
        <div className="ui-container grid items-start gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-sans text-2xl font-semibold text-navy-900">Tell us what you want to promote</h2>
            <ul className="mt-5 space-y-3 text-sm text-ink-muted">
              {["An individual property for sale or rent", "Your agency or dealer profile", "A housing project or commercial development"].map((item) => <li key={item} className="flex items-start gap-2.5"><IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />{item}</li>)}
            </ul>
            <p className="mt-5 max-w-lg text-sm leading-7 text-ink-muted">Share your target city, preferred placement and budget. The team will confirm availability, costs and review requirements before any advertising is booked. Paid promotion does not grant a verified badge or guarantee enquiries.</p>
            <Link href="/list-property" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-forest-700 hover:underline">Just want to sell a property? List it here<IconArrowRight className="h-4 w-4" /></Link>
          </div>
          <LeadForm variant="advertise" heading="Request advertising details" description="Send your requirements directly to our team." source="advertise-page" />
        </div>
      </Section>
    </>
  );
}
