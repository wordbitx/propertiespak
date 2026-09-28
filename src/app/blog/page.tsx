import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { CtaSection } from "@/components/sections-editorial";
import { Section, SectionHeading } from "@/components/section";
import { formatDate } from "@/lib/format";
import { getPosts } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Property Insights, Guides & Market Notes",
  description:
    "Pakistan property insights: best areas to buy in Lahore, investing in Islamabad, DHA vs Bahria Town, commercial property strategy and rental documentation guides.",
  path: "/blog",
  keywords: ["property investment Pakistan", "real estate blog Pakistan", "buying property guide Pakistan"],
});

export default async function BlogPage() {
  const posts = await getPosts(9);
  const [lead, ...rest] = posts;
  const categories = Array.from(new Set(posts.map((post) => post.category)));

  return (
    <>
      <PageHero
        eyebrow="Property insights"
        title="Editorial Research for Better Property Decisions"
        description="Area comparisons, investment notes and documentation checklists written by the Pak Property research and advisory desks — no hype, no guaranteed-return claims."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Insights", href: "/blog" },
        ]}
      >
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <span key={category} className="rounded-md border border-white/15 px-2.5 py-1 text-[0.75rem] font-semibold text-white/70">
              {category}
            </span>
          ))}
        </div>
      </PageHero>

      {lead && (
        <Section tone="light">
          <div className="ui-container">
            <article className="grid gap-8 overflow-hidden rounded-panel border border-soft bg-white shadow-soft lg:grid-cols-[1.15fr_1fr]">
              <Link href={`/blog/${lead.slug}`} className="zoom-frame relative block aspect-[16/11] overflow-hidden bg-soft lg:aspect-auto">
                <img
                  src={lead.coverImage}
                  alt={lead.title}
                  width={1400}
                  height={950}
                  fetchPriority="high"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </Link>
              <div className="p-6 lg:py-10 lg:pr-10">
                <p className="eyebrow text-forest-700">
                  <span className="h-[1px] w-6 bg-current opacity-70" />
                  {lead.category} · Latest
                </p>
                <h2 className="mt-4 font-sans text-[clamp(1.4rem,2.4vw,2rem)] font-bold leading-tight text-navy-900">
                  <Link href={`/blog/${lead.slug}`} className="hover:text-forest-700">
                    {lead.title}
                  </Link>
                </h2>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-muted">{lead.excerpt}</p>
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8125rem] text-ink-muted">
                  <span>{lead.author}</span>
                  <span>{formatDate(lead.publishedAt)}</span>
                  <span>{lead.readMinutes} min read</span>
                </div>
                <Link href={`/blog/${lead.slug}`} className="btn btn-primary mt-7">
                  Read the article <IconArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          </div>
        </Section>
      )}

      <Section tone="mist">
        <div className="ui-container">
          <SectionHeading
            eyebrow="Archive"
            title="Guides and market notes"
            description="Practical reading for buyers, sellers, landlords and investors in Pakistan's property market."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((post, index) => (
              <Reveal key={post.slug} delay={index * 50}>
                <article className="group flex h-full flex-col overflow-hidden rounded-panel border border-soft bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                  <Link href={`/blog/${post.slug}`} className="zoom-frame relative block aspect-[16/10] overflow-hidden bg-soft">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      width={1200}
                      height={750}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-4 top-4 rounded-md bg-white/95 px-2.5 py-1 font-sans text-[0.625rem] font-bold uppercase tracking-[0.14em] text-navy-900">
                      {post.category}
                    </span>
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-sans text-[1.0625rem] font-semibold leading-snug text-navy-900">
                      <Link href={`/blog/${post.slug}`} className="hover:text-forest-700">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-3 line-clamp-3 text-[0.875rem] leading-relaxed text-ink-muted">{post.excerpt}</p>
                    <div className="mt-auto pt-5">
                      <div className="hairline pt-4 text-[0.75rem] font-medium text-ink-muted">
                        {formatDate(post.publishedAt)} · {post.readMinutes} min read
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <CtaSection />
    </>
  );
}
