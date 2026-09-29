import Link from "next/link";
import { IconArrowRight, IconShield } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { PropertyCard } from "@/components/property-card";
import { getLandingProperties } from "@/lib/queries";
import type { LandingContent } from "@/lib/landing-pages";

/**
 * Shared renderer for the curated city / property-type / society landing pages.
 * Each page carries unique market copy, price bands, FAQs and internal links,
 * with listings pulled live from the database for the page's filters.
 */
export async function LandingPageView({ content }: { content: LandingContent }) {
  const exact = await getLandingProperties(content.filters, 9);
  const thin = exact.total < 3 && content.alternatives;
  const fallback = thin ? await getLandingProperties(content.alternatives!, 6) : null;

  const showFallback = Boolean(fallback && fallback.total > exact.total);
  const listings = showFallback ? fallback!.items : exact.items;

  return (
    <>
      {/* Intro band */}
      <section className="relative isolate overflow-hidden bg-navy-950 pb-16 pt-28 lg:pb-20 lg:pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(820px 420px at 10% -12%, rgba(22,179,100,0.24), transparent 62%), radial-gradient(760px 420px at 90% 6%, rgba(19,80,127,0.5), transparent 62%)",
          }}
        />
        <div className="ui-container relative z-10">
          <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-white/60">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <IconArrowRight className="h-3.5 w-3.5 opacity-60" />
                <Link href="/properties" className="hover:text-white">
                  Properties
                </Link>
              </li>
              <li className="flex items-center gap-2 text-white/85">
                <IconArrowRight className="h-3.5 w-3.5 opacity-60" />
                {content.h1}
              </li>
            </ol>
          </nav>

          <p className="eyebrow mt-7 text-forest-400">
            <span className="h-[1px] w-6 bg-current opacity-70" />
            {content.eyebrow}
          </p>
          <h1 className="display-2 mt-4 max-w-4xl text-white ew-fade-up">{content.h1}</h1>

          <div className="mt-7 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
            <div className="space-y-4">
              {content.intro.map((paragraph, index) => (
                <p key={paragraph.slice(0, 30)} className={index === 0 ? "lede text-white/80" : "text-[0.9375rem] leading-relaxed text-white/65"}>
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="rounded-panel border border-white/12 bg-white/[0.05] p-5 backdrop-blur-sm">
              <p className="eyebrow text-forest-400">Indicative price bands</p>
              <dl className="mt-4 space-y-3.5">
                {content.priceBands.map((band) => (
                  <div key={band.label} className="border-b border-white/10 pb-3.5 last:border-b-0 last:pb-0">
                    <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/50">{band.label}</dt>
                    <dd className="mt-1 text-[0.875rem] font-medium text-white">{band.range}</dd>
                    <dd className="mt-0.5 text-[0.75rem] text-white/50">{band.note}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 flex items-start gap-2 text-[0.75rem] leading-relaxed text-white/45">
                <IconShield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-500" />
                Illustrative demo reference values, not verified market transactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="bg-white py-14 lg:py-20">
        <div className="ui-container">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-forest-700">
                <span className="h-[1px] w-6 bg-current opacity-70" />
                Demo listings
              </p>
              <h2 className="display-3 mt-3 text-navy-900">
                {exact.total} matching {exact.total === 1 ? "property" : "properties"}
                {content.kind !== "guide" && " in our sample inventory"}
              </h2>
            </div>
            <Link href="/properties" className="btn btn-outline">
              Refine with all filters <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {showFallback && (
            <p className="mt-5 rounded-panel border border-soft bg-mist px-5 py-4 text-[0.875rem] leading-relaxed text-ink-muted">
              We do not have live demo inventory matching every filter on this page yet, so the listings below show the
              closest comparable sample properties. Use the search filters to explore the full demo dataset.
            </p>
          )}

          {listings.length === 0 ? (
            <p className="mt-6 rounded-panel border border-soft bg-mist px-5 py-6 text-[0.9375rem] text-ink-muted">
              No sample listings are available for this combination yet.{" "}
              <Link href="/properties" className="font-semibold text-navy-900 hover:text-forest-700">
                Browse all demo properties
              </Link>
              .
            </p>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((property, index) => (
                <Reveal key={property.id} delay={index * 40}>
                  <PropertyCard property={property} priority={index < 3} />
                </Reveal>
              ))}
            </div>
          )}

          {/* Facets */}
          <div className="mt-14">
            <h2 className="font-sans text-[1.15rem] font-bold text-navy-900">Related searches in this market</h2>
            <div className="mt-5 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
              {content.facets.map((facet) => (
                <Link
                  key={`${facet.href}-${facet.label}`}
                  href={facet.href}
                  className="group flex items-center justify-between gap-4 rounded-panel border border-soft bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-navy-100 hover:shadow-card"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-sans text-[0.9375rem] font-semibold text-navy-900">{facet.label}</span>
                    {facet.note && <span className="mt-0.5 block text-[0.8125rem] text-ink-muted">{facet.note}</span>}
                  </span>
                  <IconArrowRight className="h-4 w-4 shrink-0 text-forest-600 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Market notes + societies */}
      <section className="bg-mist py-14 lg:py-20">
        <div className="ui-container">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            <div>
              <p className="eyebrow text-forest-700">
                <span className="h-[1px] w-6 bg-current opacity-70" />
                Buying notes
              </p>
              <h2 className="display-3 mt-3 text-navy-900">What to check before you commit</h2>
              <ul className="mt-7 space-y-5">
                {content.insightNotes.map((note) => (
                  <li key={note.title} className="border-b border-soft pb-5 last:border-b-0">
                    <h3 className="font-sans text-[1rem] font-semibold text-navy-900">{note.title}</h3>
                    <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-muted">{note.copy}</p>
                  </li>
                ))}
              </ul>
            </div>

            {content.societies.length > 0 && (
              <div>
                <p className="eyebrow text-forest-700">
                  <span className="h-[1px] w-6 bg-current opacity-70" />
                  Locations
                </p>
                <h2 className="display-3 mt-3 text-navy-900">Area guides in this market</h2>
                <ul className="mt-7 space-y-3">
                  {content.societies.map((society) => (
                    <li key={society.href}>
                      <Link
                        href={society.href}
                        className="group flex items-start justify-between gap-4 rounded-xl border border-soft bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-card"
                      >
                        <span className="min-w-0">
                          <span className="block font-sans text-[0.9375rem] font-semibold text-navy-900">{society.name}</span>
                          <span className="mt-1 block text-[0.8125rem] leading-relaxed text-ink-muted">{society.note}</span>
                        </span>
                        <IconArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-forest-600 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQs */}
      {content.faqs.length > 0 && (
        <section className="bg-white py-14 lg:py-20">
          <div className="ui-container">
            <div className="max-w-2xl">
              <p className="eyebrow text-forest-700">
                <span className="h-[1px] w-6 bg-current opacity-70" />
                FAQs
              </p>
              <h2 className="display-3 mt-3 text-navy-900">Questions buyers ask about {content.h1.replace(/^Property for (Sale|Rent) in /, "")}</h2>
            </div>
            <div className="mt-8 grid gap-3.5 lg:grid-cols-2">
              {content.faqs.map((faq) => (
                <details key={faq.question} className="group rounded-panel border border-soft bg-white p-5 open:border-navy-100">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-sans text-[1rem] font-semibold text-navy-900">
                    {faq.question}
                    <IconArrowRight className="h-4 w-4 shrink-0 rotate-90 text-forest-600 transition-transform group-open:-rotate-90" />
                  </summary>
                  <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-muted">{faq.answer}</p>
                </details>
              ))}
            </div>

            <div className="mt-10 rounded-panel border border-soft bg-mist p-6">
              <h2 className="font-sans text-[1.05rem] font-semibold text-navy-900">Continue your research</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {content.relatedLinks.map((link) => (
                  <Link key={`${link.href}-${link.label}`} href={link.href} className="chip">
                    {link.label}
                  </Link>
                ))}
                {!content.relatedLinks.some((link) => link.href === "/keywords-for-pakistan") && (
                  <Link href="/keywords-for-pakistan" className="chip">
                    Explore Pakistan real estate searches
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
