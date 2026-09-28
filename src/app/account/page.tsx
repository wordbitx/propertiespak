import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { IconArrowRight, IconCalendar, IconMail, IconPhone, IconShield } from "@/components/icons";
import { FavoritesSync } from "@/components/favorites-sync";
import { PageHero } from "@/components/page-hero";
import { PropertyRow } from "@/components/property-card";
import { Section } from "@/components/section";
import { getSessionUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getFavoritePropertiesForUser, getInquiriesForEmail, searchProperties } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "My Account — Saved Properties & Enquiries",
  description:
    "Manage your Pak Property account: review your synced property shortlist, track enquiries sent to our consultants and continue your search.",
  path: "/account",
  robots: { index: false, follow: true },
});

const INQUIRY_LABELS: Record<string, string> = {
  property: "Property enquiry",
  visit: "Site visit request",
  contact: "Contact request",
  list: "Listing submission",
  valuation: "Valuation request",
  advisory: "Advisory request",
  newsletter: "Newsletter",
};

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [saved, inquiries, suggestions] = await Promise.all([
    getFavoritePropertiesForUser(user.id),
    getInquiriesForEmail(user.email),
    searchProperties({ verified: true, pageSize: 3, sort: "newest" }),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Account"
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Your synced shortlist and every enquiry you have sent from Pak Property."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Account", href: "/account" },
        ]}
      />

      <Section tone="light">
        <div className="ui-container">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
            <aside>
              <div className="rounded-panel border border-soft bg-white p-6 shadow-soft">
                <p className="font-sans text-[1.05rem] font-semibold text-navy-900">{user.name}</p>
                <dl className="mt-4 space-y-3 text-[0.875rem]">
                  <div className="flex items-center gap-2.5">
                    <IconMail className="h-4 w-4 text-forest-600" />
                    <dt className="sr-only">Email</dt>
                    <dd className="truncate">{user.email}</dd>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2.5">
                      <IconPhone className="h-4 w-4 text-forest-600" />
                      <dt className="sr-only">Phone</dt>
                      <dd>{user.phone}</dd>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <IconCalendar className="h-4 w-4 text-forest-600" />
                    <dt className="sr-only">Member since</dt>
                    <dd>Member since {formatDate(user.createdAt)}</dd>
                  </div>
                </dl>
                <form action={logoutAction} className="mt-6">
                  <button type="submit" className="btn btn-outline w-full">
                    Sign out
                  </button>
                </form>
              </div>

              <div className="mt-5 rounded-panel border border-soft bg-mist p-5">
                <p className="flex items-center gap-2 font-sans text-[0.9375rem] font-semibold text-navy-900">
                  <IconShield className="h-4 w-4 text-forest-600" /> Data &amp; privacy
                </p>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-muted">
                  Your shortlist is stored on this account and on the device you browse from. Enquiry details are shared
                  only with the consultant handling your requirement.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/properties" className="btn btn-primary">
                  Continue searching <IconArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/tools" className="btn btn-outline">
                  Investment tools
                </Link>
              </div>
            </aside>

            <div>
              <FavoritesSync />

              <h2 className="mt-2 font-sans text-[1.15rem] font-bold text-navy-900">
                Synced shortlist {saved.length > 0 && <span className="text-ink-muted">({saved.length})</span>}
              </h2>
              {saved.length === 0 ? (
                <div className="mt-4 rounded-panel border border-soft bg-mist p-6">
                  <p className="text-[0.9rem] leading-relaxed text-ink-muted">
                    Nothing synced yet. Heart a property while browsing and it will appear here — device saves merge into
                    your account automatically the first time you open this page.
                  </p>
                </div>
              ) : (
                <div className="mt-4 grid gap-3.5">
                  {saved.map((item) => (
                    <Link key={item.id} href={`/property/${item.slug}`} className="block">
                      <div className="flex items-center gap-4 rounded-xl border border-soft bg-white p-3 transition-all hover:-translate-y-0.5 hover:shadow-card">
                        <img
                          src={item.coverImage}
                          alt={`${item.title}, ${item.locationArea}`}
                          width={280}
                          height={210}
                          loading="lazy"
                          decoding="async"
                          className="h-[74px] w-[104px] shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-sans text-[0.9375rem] font-semibold text-navy-900">{item.title}</p>
                          <p className="mt-0.5 truncate text-[0.8125rem] text-ink-muted">
                            {item.locationArea}, {item.cityName} · {item.propertyType}
                          </p>
                          <p className="mt-1 text-[0.8125rem] font-semibold text-forest-700">
                            {item.priceUnit === "month"
                              ? `PKR ${(item.price / 100000).toFixed(1)} Lakh / month`
                              : `PKR ${(item.price / 10000000).toFixed(2)} Crore`}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <h2 className="mt-10 font-sans text-[1.15rem] font-bold text-navy-900">Your enquiries</h2>
              {inquiries.length === 0 ? (
                <p className="mt-4 rounded-panel border border-soft bg-mist p-6 text-[0.9rem] text-ink-muted">
                  No enquiries yet. Send a request from any listing and it will be tracked here with the consultant's reply.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-soft rounded-panel border border-soft bg-white">
                  {inquiries.map((inquiry) => (
                    <li key={inquiry.id} className="flex flex-wrap items-start justify-between gap-3 p-5">
                      <div className="min-w-0">
                        <p className="font-sans text-[0.9375rem] font-semibold text-navy-900">
                          {INQUIRY_LABELS[inquiry.type] ?? "Enquiry"}
                          {inquiry.propertyTitle && <span className="text-ink-muted"> · {inquiry.propertyTitle}</span>}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[0.8125rem] text-ink-muted">
                          {inquiry.message || "No additional notes supplied."}
                        </p>
                      </div>
                      <span className="shrink-0 text-[0.75rem] text-ink-muted">{formatDate(inquiry.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}

              <h2 className="mt-10 font-sans text-[1.15rem] font-bold text-navy-900">New this week</h2>
              <div className="mt-4 grid gap-3.5">
                {suggestions.items.map((property) => (
                  <PropertyRow key={property.id} property={property} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
