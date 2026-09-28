import Link from "next/link";
import { BrandLockup } from "@/components/brand-lockup";
import { IconArrowRight, IconMail } from "@/components/icons";
import { WordbitxContacts } from "@/components/wordbitx-section";
import { NewsletterForm } from "@/components/newsletter-form";
import { SITE } from "@/lib/constants";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Buy property", href: "/properties/for-sale" },
      { label: "Rent property", href: "/properties/for-rent" },
      { label: "New projects", href: "/projects" },
      { label: "Commercial", href: "/commercial" },
      { label: "All properties", href: "/properties" },
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
      { label: "About Pak Property", href: "/about" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-navy-950 text-white/65" aria-label="Pak Property footer">
      <div className="ui-container py-12 sm:py-16">
        <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)] lg:gap-14">
          <div className="min-w-0">
            <Link href="/" aria-label={`${SITE.name} — ${SITE.tagline}`} className="inline-block">
              <BrandLockup light large />
            </Link>
            <p className="mt-5 max-w-sm text-[0.875rem] leading-7">
              Property discovery, location intelligence and investment tools for Pakistan. Find a place for the way you
              live, work and invest.
            </p>
            <Link href="/list-property" className="mt-4 inline-flex items-center gap-2 text-[0.875rem] font-semibold text-forest-400 transition-colors hover:text-white">
              List your property <IconArrowRight className="h-4 w-4" />
            </Link>
            <div className="mt-8 max-w-sm">
              <h2 className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white/90">Market updates</h2>
              <p className="mt-2 text-[0.8125rem] leading-relaxed">Register your interest in property news and guides.</p>
              <NewsletterForm />
            </div>
          </div>

          <nav aria-label="Footer navigation" className="grid min-w-0 grid-cols-2 gap-x-6 gap-y-8 xl:grid-cols-4">
            {COLUMNS.map((column) => (
              <div key={column.title} className="min-w-0">
                <h2 className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.13em] text-white/90">{column.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="block break-words text-[0.8125rem] leading-6 transition-colors hover:text-forest-400">
                        {link.label}
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
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.13em] text-white/50">A WordbitX Product</p>
            <a href={SITE.companyUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-sans text-[0.9375rem] font-semibold text-white hover:text-forest-400">WordbitX Software Company</a>
            <a href={`mailto:${SITE.companyEmail}`} className="mt-2 flex items-center gap-2 text-[0.75rem] text-white/60 hover:text-white"><IconMail className="h-3.5 w-3.5 shrink-0" /><span className="break-all">{SITE.companyEmail}</span></a>
          </div>
          <WordbitxContacts light />
        </div>

        <p className="mt-5 max-w-5xl text-[0.6875rem] leading-5 text-white/45">
          Sample listings, market figures and property scores are illustrative, not independently verified transactions
          or valuations. Owner-submitted listings are identified on their detail pages. Verify information independently
          before making a property decision.
        </p>
        <div className="mt-6 flex min-w-0 flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:flex-wrap md:items-center md:justify-between">
          <p className="text-[0.75rem] text-white/50">© {new Date().getFullYear()} {SITE.name}. A WordbitX Product.</p>
          <div className="flex min-w-0 flex-wrap gap-x-5 gap-y-3 text-[0.75rem]">
            <Link href="/contact" className="hover:text-white">Contact</Link>
            <Link href="/sitemap" className="hover:text-white">Directory</Link>
            <Link href="/sitemap-index.xml" className="hover:text-white">Sitemap index</Link>
            <Link href="/sitemap.xml" className="hover:text-white">XML sitemap</Link>
            <a href={SITE.url} className="hover:text-white">Official demo</a>
            <Link href="/admin" className="hover:text-white">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
