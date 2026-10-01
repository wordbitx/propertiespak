import { ResilientImage } from "@/components/resilient-image";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { IconArrowRight, IconCalendar, IconMail, IconPhone, IconShield, IconUser } from "@/components/icons";
import { AccountListings, type OwnerListing, type OwnerSubmission } from "@/components/account-listings";
import { FavoritesSync } from "@/components/favorites-sync";
import { PageHero } from "@/components/page-hero";
import { ProfileSetupDialog, type ProfileUser } from "@/components/profile-setup";
import { PropertyRow } from "@/components/property-card";
import { Section } from "@/components/section";
import { getSessionUser } from "@/lib/auth";
import { getDealerByEmail, getOwnedProperties, getUserSubmissions } from "@/lib/queries";
import { BlueTick, UnverifiedChip } from "@/components/verified-badge";
import { formatDate, formatPrice } from "@/lib/format";
import { getFavoritePropertiesForUser, getInquiriesForEmail, searchProperties } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "My Account — Saved Properties & Enquiries",
  description:
    "Manage your Properties Pak account: review your synced property shortlist, track enquiries sent to our consultants and continue your search.",
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

  const [saved, inquiries, suggestions, dealer, liveListings, submissions] = await Promise.all([
    getFavoritePropertiesForUser(user.id),
    getInquiriesForEmail(user.email),
    searchProperties({ verified: true, pageSize: 3, sort: "newest" }),
    getDealerByEmail(user.email),
    getOwnedProperties(user.id, 60),
    getUserSubmissions(user),
  ]);
  // Approved submissions already appear as published listings, so only the ones
  // still in the admin queue (or sent back) need their own rows here.
  const profileUser: ProfileUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    whatsapp: user.whatsapp,
    bio: user.bio,
    experience: user.experience,
    areas: user.areas,
    avatarUrl: user.avatarUrl,
    agency: user.agency,
    designation: user.designation,
    officeAddress: user.officeAddress,
    citySlug: user.citySlug,
    cityName: user.cityName,
    companyPhone: user.companyPhone,
    companyWebsite: user.companyWebsite,
    companyLogo: user.companyLogo,
    verificationNote: user.verificationNote,
    isVerified: user.isVerified,
    profileCompletedAt: user.profileCompletedAt ? user.profileCompletedAt.toISOString() : null,
    verificationRequestedAt: user.verificationRequestedAt ? user.verificationRequestedAt.toISOString() : null,
  };

  // Only submissions still in the admin queue (or sent back) need their own
  // rows here — approved ones already appear as published listings.
  const openSubmissions = submissions.filter((item) => item.status !== "approved");
  const ownerListings: OwnerListing[] = liveListings.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    cityName: item.cityName,
    locationArea: item.locationArea,
    propertyType: item.propertyType,
    price: item.price,
    priceUnit: item.priceUnit,
    coverImage: item.coverImage,
    views: item.views,
    published: item.published,
  }));
  const ownerSubmissions: OwnerSubmission[] = openSubmissions.map((item) => ({
    id: item.id,
    title: item.title,
    cityName: item.cityName,
    locationArea: item.locationArea,
    propertyType: item.propertyType,
    price: item.price,
    priceUnit: item.priceUnit,
    imageUrls: item.imageUrls,
    status: item.status,
    adminNote: item.adminNote,
    createdAt: item.createdAt.toISOString(),
  }));

  return (
    <>
      <PageHero
        eyebrow="Account"
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Your synced shortlist and every enquiry you have sent from Properties Pak."
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

              <div className="mt-5 rounded-panel border border-soft bg-white p-5 shadow-soft">
                <p className="flex flex-wrap items-center gap-2 font-sans text-[0.9375rem] font-semibold text-navy-900">
                  <IconUser className="h-4 w-4 text-forest-600" />
                  Professional profile
                  {user.profileCompletedAt ? (
                    <span className="rounded-md bg-forest-50 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-forest-700">
                      Complete
                    </span>
                  ) : (
                    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-amber-700">
                      Incomplete
                    </span>
                  )}
                </p>
                <dl className="mt-3 space-y-2 text-[0.8125rem] text-ink-muted">
                  <div>
                    <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em]">Agency</dt>
                    <dd className="text-navy-900">{user.agency || "Not set"}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em]">Areas you deal in</dt>
                    <dd className="text-navy-900">{user.areas || "Not set"}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em]">City</dt>
                    <dd className="text-navy-900">{user.cityName || "Not set"}</dd>
                  </div>
                </dl>
                <div className="mt-4">
                  {/* One visible instance handles the first-login prompt and later edits. */}
                  <ProfileSetupDialog user={profileUser} autoOpen={!user.profileCompletedAt} />
                </div>
              </div>

              <div
                className={`mt-5 rounded-panel border p-5 ${
                  dealer?.isVerified ? "border-[#1D9BF0]/35 bg-[#1D9BF0]/5" : "border-soft bg-white"
                }`}
              >
                <p className="flex flex-wrap items-center gap-2 font-sans text-[0.9375rem] font-semibold text-navy-900">
                  {dealer?.isVerified ? <BlueTick className="h-4 w-4" /> : <IconShield className="h-4 w-4 text-forest-600" />}
                  Dealer profile
                  {dealer && !dealer.isVerified && <UnverifiedChip />}
                </p>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-muted">
                  {dealer?.isVerified
                    ? `Verified by the Properties Pak team${dealer.verifiedAt ? ` on ${formatDate(dealer.verifiedAt)}` : ""}. Your blue tick appears on your public profile and on every property you publish.`
                    : dealer
                      ? `Your account has ${dealer.listings} published ${dealer.listings === 1 ? "listing" : "listings"}. Our team verifies accounts after a contact check — ask us and we will review it for the blue tick.`
                      : "List a property from this account and a public dealer profile is created for you. Verified accounts carry the blue tick across the marketplace."}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {dealer?.slug && (
                    <Link href={`/dealers/${dealer.slug}`} className="btn btn-outline px-3.5 py-2 text-[0.8125rem]">
                      View public profile
                    </Link>
                  )}
                  <Link href="/list-property" className="btn btn-primary px-3.5 py-2 text-[0.8125rem]">
                    {dealer ? "Add a listing" : "List a property"}
                  </Link>
                </div>
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

              {/* Owners manage everything they posted here: hide, republish or delete. */}
              <AccountListings listings={ownerListings} submissions={ownerSubmissions} />

              <h2 className="mt-10 font-sans text-[1.15rem] font-bold text-navy-900">
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
                        <ResilientImage
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
                  No enquiries yet. Send a request from any listing and it will be tracked here with the consultant&rsquo;s reply.
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
