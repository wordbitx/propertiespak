import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { LeadForm } from "@/components/lead-form";
import { PropertyCard } from "@/components/property-card";
import { Reveal } from "@/components/reveal";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { BlueTick, initialsFor, UnverifiedChip } from "@/components/verified-badge";
import { IconArrowRight, IconBuilding, IconMail, IconPhone, IconPin, IconWhatsApp } from "@/components/icons";
import { getDealerBySlug, getPropertiesForDealer } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { buildMetadata, breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const dealer = await getDealerBySlug(slug);
  if (!dealer) {
    return buildMetadata({
      title: "Dealer not found",
      description: "This dealer profile is not available on Properties Pak.",
      path: "/dealers",
      robots: { index: false, follow: true },
    });
  }
  const where = dealer.cityName ? ` in ${dealer.cityName}` : " in Pakistan";
  return {
    ...buildMetadata({
      title: `${dealer.name}${dealer.isVerified ? " — Verified Property Dealer" : " — Property Dealer"}${where} | Properties Pak`,
      description: `${dealer.name}${dealer.agency ? ` of ${dealer.agency}` : ""} has ${dealer.listings} property ${
        dealer.listings === 1 ? "listing" : "listings"
      } on Properties Pak${where}. ${dealer.isVerified ? "Verified account with confirmed contact details." : "Profile awaiting verification."} View listings, areas covered and contact details.`,
      path: `/dealers/${dealer.slug}`,
      keywords: [
        `${dealer.name} properties`,
        `property dealer ${dealer.cityName || "Pakistan"}`,
        `property agent ${dealer.cityName || "Pakistan"}`,
        "verified property dealer",
      ],
    }),
    robots: { index: true, follow: true },
  };
}

export default async function DealerProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const dealer = await getDealerBySlug(slug);
  if (!dealer || !dealer.slug) notFound();

  const listings = await getPropertiesForDealer(dealer, 24);
  const areas = Array.from(new Set(listings.map((property) => property.locationArea))).slice(0, 12);
  const cityNames = Array.from(new Set(listings.map((property) => property.cityName)));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          "@id": `${SITE.url}/dealers/${dealer.slug}#agent`,
          name: dealer.name,
          url: `${SITE.url}/dealers/${dealer.slug}`,
          description: dealer.bio || `${dealer.name} lists property on Properties Pak.`,
          email: dealer.email,
          telephone: dealer.phone || undefined,
          areaServed: cityNames.map((name) => ({ "@type": "City", name })),
          worksFor: dealer.agency ? { "@type": "Organization", name: dealer.agency } : undefined,
          knowsLanguage: ["en-PK", "ur-PK"],
          memberOf: { "@id": `${SITE.url}/#organization` },
          hasCertification: dealer.isVerified
            ? {
                "@type": "Certification",
                name: "Properties Pak verified dealer",
                description:
                  "Identity, agency and contact number confirmed by the Properties Pak team; account holds published property listings.",
              }
            : undefined,
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Dealers", href: "/dealers" },
          { name: dealer.name, href: `/dealers/${dealer.slug}` },
        ])}
      />
      {listings.length > 0 && (
        <JsonLd
          data={itemListJsonLd({
            name: `Properties listed by ${dealer.name}`,
            path: `/dealers/${dealer.slug}`,
            items: listings.slice(0, 24).map((property) => ({
              name: property.title,
              path: `/property/${property.slug}`,
            })),
          })}
        />
      )}

      <PageHero
        eyebrow={dealer.isVerified ? "Verified dealer profile" : "Dealer profile"}
        title={dealer.name}
        description={
          dealer.bio ||
          `${dealer.name} publishes property on Properties Pak. ${dealer.listings} live ${
            dealer.listings === 1 ? "listing" : "listings"
          } across ${cityNames.join(", ") || "Pakistan"}.`
        }
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Dealers", href: "/dealers" },
          { name: dealer.name, href: `/dealers/${dealer.slug}` },
        ]}
      />

      <section className="bg-white py-10 lg:py-14">
        <div className="ui-container">
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
            <div className="min-w-0">
              <div className="mb-6">
                <Breadcrumbs
                  items={[
                    { name: "Home", href: "/" },
                    { name: "Dealers", href: "/dealers" },
                    { name: dealer.name, href: `/dealers/${dealer.slug}` },
                  ]}
                />
              </div>
              <div className="flex flex-wrap items-start gap-5 rounded-panel border border-soft bg-white p-6 shadow-soft">
                <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-navy-900 font-sans text-[1.5rem] font-bold text-white">
                  {initialsFor(dealer.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="flex flex-wrap items-center gap-2.5 font-sans text-[1.375rem] font-bold text-navy-900">
                    {dealer.name}
                    {dealer.isVerified ? <BlueTick className="h-5 w-5" /> : <UnverifiedChip />}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.875rem] text-ink-muted">
                    {dealer.agency && (
                      <span className="flex items-center gap-1.5">
                        <IconBuilding className="h-4 w-4 text-forest-600" /> {dealer.agency}
                      </span>
                    )}
                    {dealer.cityName && (
                      <span className="flex items-center gap-1.5">
                        <IconPin className="h-4 w-4 text-forest-600" /> {dealer.cityName}
                      </span>
                    )}
                    <span>Member since {formatDate(dealer.createdAt)}</span>
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-soft bg-mist px-3 py-2.5">
                      <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">Listings</dt>
                      <dd className="mt-1 font-sans text-[1.05rem] font-bold text-navy-900">{dealer.listings}</dd>
                    </div>
                    <div className="rounded-xl border border-soft bg-mist px-3 py-2.5">
                      <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">Verified</dt>
                      <dd className="mt-1 font-sans text-[1.05rem] font-bold text-navy-900">{dealer.verifiedListings}</dd>
                    </div>
                    <div className="rounded-xl border border-soft bg-mist px-3 py-2.5">
                      <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">Cities</dt>
                      <dd className="mt-1 font-sans text-[1.05rem] font-bold text-navy-900">{dealer.cityCount || 1}</dd>
                    </div>
                    <div className="rounded-xl border border-soft bg-mist px-3 py-2.5">
                      <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">Status</dt>
                      <dd className="mt-1 font-sans text-[0.875rem] font-bold text-navy-900">
                        {dealer.isVerified ? "Verified" : "In review"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {dealer.bio && (
                <div className="mt-6 rounded-panel border border-soft bg-white p-6 shadow-soft">
                  <h3 className="font-sans text-[1.05rem] font-semibold text-navy-900">About {dealer.name}</h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted">{dealer.bio}</p>
                  {areas.length > 0 && (
                    <p className="mt-4 text-[0.8125rem] leading-relaxed text-ink-muted">
                      <span className="font-semibold text-navy-900">Areas covered:</span> {areas.join(" · ")}
                    </p>
                  )}
                </div>
              )}
            </div>

            <aside className="min-w-0 lg:sticky lg:top-24">
              <div className="rounded-panel border border-soft bg-white p-5 shadow-soft sm:p-6">
                <h3 className="font-sans text-[1.05rem] font-semibold text-navy-900">Contact {dealer.name}</h3>
                {dealer.isVerified ? (
                  <>
                    <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-muted">
                      Contact details confirmed by the Properties Pak team.
                    </p>
                    <div className="mt-5 grid gap-2.5">
                      {dealer.phone && (
                        <a href={`tel:${dealer.phone.replace(/\s/g, "")}`} className="btn btn-primary w-full">
                          <IconPhone className="h-4 w-4" /> {dealer.phone}
                        </a>
                      )}
                      {(dealer.whatsapp || dealer.phone) && (
                        <a
                          href={`https://wa.me/${(dealer.whatsapp || dealer.phone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Hello ${dealer.name}, I found your profile on Properties Pak and would like to discuss a property.`,
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-green w-full"
                        >
                          <IconWhatsApp className="h-4 w-4" /> WhatsApp
                        </a>
                      )}
                      <a href={`mailto:${dealer.email}`} className="btn btn-outline w-full">
                        <IconMail className="h-4 w-4" /> Email
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="mt-2 rounded-xl border border-soft bg-mist p-4 text-[0.8125rem] leading-relaxed text-ink-muted">
                    This profile is still in review, so direct contact details are hidden until our team verifies the account.
                    Send your requirement below and the Properties Pak desk will pass it on and confirm the details for you.
                  </p>
                )}
              </div>

              <div className="mt-6 rounded-panel border border-soft bg-white p-5 shadow-soft sm:p-6">
                <LeadForm
                  compact
                  variant="contact"
                  defaultCity={dealer.cityName}
                  heading={`Enquire through ${dealer.name}`}
                  description="Your message is stored in the Properties Pak inbox with this dealer's reference."
                  source={`dealer-${dealer.slug}`}
                />
              </div>

              {dealer.isVerified && (
                <div className="mt-6 rounded-panel border border-[#1D9BF0]/30 bg-[#1D9BF0]/5 p-5">
                  <div className="flex items-center gap-2">
                    <BlueTick className="h-5 w-5" />
                    <p className="font-sans text-[0.9375rem] font-semibold text-navy-900">Verified {formatDate(dealer.verifiedAt ?? dealer.createdAt)}</p>
                  </div>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-muted">
                    Identity, agency name and phone number were checked against the account, and the account holds at least one
                    published property listing.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      <Section tone="mist">
        <div className="ui-container">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-forest-700">
                <span className="h-px w-6 bg-current" /> Portfolio
              </p>
              <h2 className="display-3 mt-3 text-navy-900">
                Property listed by {dealer.name}
              </h2>
            </div>
            <Link href="/properties" className="btn btn-outline">
              Search all listings <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {listings.length === 0 ? (
            <p className="mt-8 rounded-panel border border-soft bg-white p-8 text-center text-[0.9rem] text-ink-muted">
              This account has no live listings at the moment. Browse the full marketplace or ask the desk for matching
              inventory.
            </p>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((property, index) => (
                <Reveal key={property.id} delay={index * 40}>
                  <PropertyCard property={property} priority={index < 4} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
