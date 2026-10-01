"use client";

import Link from "next/link";
import { BrandLockup } from "@/components/brand-lockup";
import { useLanguage } from "@/components/language-provider";
import {
  IconArrowRight,
  IconFacebook,
  IconInstagram,
  IconLinkedIn,
  IconMail,
  IconTikTok,
  IconX,
  IconYouTube,
} from "@/components/icons";
import { WordbitxContacts } from "@/components/wordbitx-section";
import { NewsletterForm } from "@/components/newsletter-form";
import { SITE } from "@/lib/constants";

/** Parent-company profiles are opt-in: only platforms with a URL are rendered. */
const COMPANY_SOCIAL = [
  { platform: "Facebook", href: SITE.companySocial.facebook, Icon: IconFacebook },
  { platform: "Instagram", href: SITE.companySocial.instagram, Icon: IconInstagram },
  { platform: "LinkedIn", href: SITE.companySocial.linkedin, Icon: IconLinkedIn },
  { platform: "YouTube", href: SITE.companySocial.youtube, Icon: IconYouTube },
  { platform: "X", href: SITE.companySocial.x, Icon: IconX },
  { platform: "TikTok", href: SITE.companySocial.tiktok, Icon: IconTikTok },
].filter((entry) => entry.href.trim().length > 0);

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Buy property", href: "/properties/for-sale" },
      { label: "Rent property", href: "/properties/for-rent" },
      { label: "New projects", href: "/projects" },
      { label: "Commercial", href: "/commercial" },
      { label: "All properties", href: "/properties" },
      { label: "Towns & societies", href: "/towns" },
      { label: "Verified dealers", href: "/dealers" },
      { label: "Compare properties", href: "/compare" },
    ],
  },
  {
    title: "Markets",
    links: [
      { label: "Lahore property", href: "/property-for-sale-in-lahore" },
      { label: "Islamabad property", href: "/property-for-sale-in-islamabad" },
      { label: "Karachi property", href: "/property-for-sale-in-karachi" },
      { label: "Lahore rentals", href: "/property-for-rent-in-lahore" },
      { label: "Rawalpindi property", href: "/property-for-sale-in-rawalpindi" },
      { label: "Multan property", href: "/property-for-sale-in-multan" },
      { label: "Lake City Lahore", href: "/property-for-sale/lake-city-lahore" },
      { label: "Etihad Town Lahore", href: "/property-for-sale/etihad-town-lahore" },
      { label: "Valencia Town Lahore", href: "/property-for-sale/valencia-town-lahore" },
    ],
  },
  {
    title: "Investment tools",
    links: [
      { label: "Mortgage calculator", href: "/tools/mortgage-calculator" },
      { label: "Rental yield", href: "/tools/rental-yield-calculator" },
      { label: "Property ROI", href: "/tools/roi-calculator" },
      { label: "Construction costs", href: "/tools/construction-cost-calculator" },
      { label: "Property tax", href: "/tools/property-tax-calculator" },
      { label: "Rent vs buy", href: "/tools/rent-vs-buy-calculator" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Pakistan property searches", href: "/keywords-for-pakistan" },
      { label: "Property insights", href: "/blog" },
      { label: "Investment guide", href: "/property-investment-in-pakistan" },
      { label: "Documentation checklist", href: "/blog/property-documentation-checklist-pakistan" },
      { label: "FBR property tax guide", href: "/blog/fbr-property-tax-guide-pakistan" },
      { label: "DHA vs Bahria Town", href: "/blog/dha-vs-bahria-town-comparison" },
      { label: "About Properties Pak", href: "/about" },
    ],
  },
];

export function SiteFooter() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-white/10 bg-navy-950 text-white/65" aria-label={t("Properties Pak footer")}>
      <div className="ui-container py-12 sm:py-16">
        <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)] lg:gap-14">
          <div className="min-w-0">
            <Link href="/" aria-label={`${SITE.name} — ${SITE.tagline}`} className="inline-block">
              <BrandLockup light large transparent />
            </Link>
            <p className="mt-5 max-w-sm text-[0.875rem] leading-7">
              {t("Property discovery, location intelligence and investment tools for Pakistan. Find a place for the way you live, work and invest.")}
            </p>
            <Link href="/list-property" className="mt-4 inline-flex items-center gap-2 text-[0.875rem] font-semibold text-forest-400 transition-colors hover:text-white">
              {t("List your property")} <IconArrowRight className="h-4 w-4" />
            </Link>
            <div className="mt-8 max-w-sm">
              <h2 className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white/90">{t("Market updates")}</h2>
              <p className="mt-2 text-[0.8125rem] leading-relaxed">{t("Register your interest in property news and guides.")}</p>
              <NewsletterForm />
            </div>
          </div>

          <nav aria-label={t("Footer navigation")} className="grid min-w-0 grid-cols-2 gap-x-6 gap-y-8 xl:grid-cols-4">
            {COLUMNS.map((column) => (
              <div key={column.title} className="min-w-0">
                <h2 className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.13em] text-white/90">{t(column.title)}</h2>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="block break-words text-[0.8125rem] leading-6 transition-colors hover:text-forest-400">
                        {t(link.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="footer-company-credit">
          <div className="min-w-0">
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.13em] text-white/50">{t("A WordbitX Product")}</p>
            <a href={SITE.companyUrl} target="_blank" rel="noopener noreferrer" aria-label="WordbitX | Group of Companies" className="mt-2 inline-block font-sans text-[0.9375rem] font-semibold text-white hover:text-forest-400"><span>Wordbit<span className="footer-wordbitx-x text-forest-400">X</span></span> <span className="text-[0.8125rem] font-normal">| {t("Group of Companies")}</span></a>
            <a href={`mailto:${SITE.companyEmail}`} className="mt-2 flex items-center gap-2 text-[0.75rem] text-white/60 hover:text-white"><IconMail className="h-3.5 w-3.5 shrink-0" /><span className="break-all">{SITE.companyEmail}</span></a>
            {COMPANY_SOCIAL.length > 0 && (
              <div className="mt-5">
                <h2 className="text-[0.625rem] font-semibold uppercase tracking-[0.13em] text-white/50">{t("Follow WordbitX")}</h2>
                <ul className="mt-3 flex flex-wrap items-center gap-2.5">
                  {COMPANY_SOCIAL.map(({ platform, href, Icon }) => (
                    <li key={platform}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${SITE.company} on ${platform}`}
                        title={`${SITE.company} on ${platform}`}
                        className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-forest-400 hover:text-forest-400"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <WordbitxContacts light />
        </div>

        <p className="mt-5 max-w-5xl text-[0.6875rem] leading-5 text-white/45">
          Asking prices, market figures and property scores are published indicators — verify title, dues and possession before
          any transaction. Owner-submitted listings are identified on their detail pages, and verified dealer profiles carry a blue
          tick. Verify information independently before making a property decision.
        </p>
        <div className="mt-6 flex min-w-0 flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:flex-wrap md:items-center md:justify-between">
          <p className="text-[0.75rem] text-white/50">© {new Date().getFullYear()} {SITE.name}. A WordbitX Product.</p>
          <div className="flex min-w-0 flex-wrap gap-x-5 gap-y-3 text-[0.75rem]">
            <Link href="/contact" className="hover:text-white">{t("Contact")}</Link>
            <a href={SITE.url} className="hover:text-white">{t("Official platform")}</a>
            <Link href="/admin" className="hover:text-white">{t("Admin")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
