import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { IconArrowRight } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { LeadForm } from "@/components/lead-form";
import { Section, SectionHeading } from "@/components/section";
import { formatDate } from "@/lib/format";
import { getPostBySlug, getPosts } from "@/lib/queries";
import { articleJsonLd, buildMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return buildMetadata({
      title: "Article not found",
      description: "This insight is no longer available on Pak Property.",
      path: "/blog",
    });
  }
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImage,
    type: "article",
    publishedTime: post.publishedAt instanceof Date ? post.publishedAt.toISOString() : undefined,
    keywords: post.tags,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = (await getPosts(4)).filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy-950 pb-16 pt-28 lg:pb-20 lg:pt-36">
        <div className="ui-container relative z-10">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Insights", href: "/blog" },
              { name: post.title, href: `/blog/${post.slug}` },
            ]}
          />
          <div className="mt-7 max-w-3xl">
            <p className="eyebrow text-forest-400">
              <span className="h-[1px] w-6 bg-current opacity-70" />
              {post.category}
            </p>
            <h1 className="display-2 mt-4 text-white ew-fade-up">{post.title}</h1>
            <p className="lede mt-5 text-white/70">{post.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8125rem] text-white/55">
              <span>{post.author}</span>
              <span>{formatDate(post.publishedAt)}</span>
              <span>{post.readMinutes} min read</span>
            </div>
          </div>
        </div>
      </section>

      <Section tone="light">
        <div className="ui-container grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <article>
            <div className="overflow-hidden rounded-panel bg-soft">
              <img
                src={post.coverImage}
                alt={post.title}
                width={1400}
                height={900}
                fetchPriority="high"
                decoding="async"
                className="h-[280px] w-full object-cover lg:h-[420px]"
              />
            </div>
            <div className="mt-8 space-y-5">
              {post.body.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="text-[1.0125rem] leading-[1.8] text-ink">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/properties?q=${encodeURIComponent(tag)}`} className="chip">
                  {tag}
                </Link>
              ))}
            </div>

            {post.links.length > 0 && (
              <div className="mt-10 rounded-panel border border-soft bg-white p-6 shadow-soft">
                <h2 className="font-sans text-[1.05rem] font-semibold text-navy-900">
                  Related pages, markets and tools
                </h2>
                <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-muted">
                  Continue from this guide into the matching market pages and calculators.
                </p>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {post.links.map((link) => (
                    <li key={`${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-soft bg-mist/60 px-4 py-3 text-[0.875rem] font-medium text-navy-900 transition-colors hover:border-navy-800 hover:bg-white"
                      >
                        {link.label}
                        <IconArrowRight className="h-4 w-4 shrink-0 text-forest-600 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-10 rounded-panel border border-soft bg-mist p-6">
              <p className="font-sans text-[1rem] font-semibold text-navy-900">Continue your research</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/properties" className="btn btn-primary">
                  Browse demo listings
                </Link>
                <Link href="/tools" className="btn btn-outline">
                  Run the numbers
                </Link>
              </div>
            </div>
          </article>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <LeadForm
              variant="contact"
              heading="Talk to an advisor"
              description="If any part of this article applies to your plan, our advisory desk can review your specific options."
              source={`blog-${post.slug}`}
            />
          </aside>
        </div>
      </Section>

      {related.length > 0 && (
        <Section tone="mist">
          <div className="ui-container">
            <SectionHeading eyebrow="Keep reading" title="Related insights" action={{ label: "All insights", href: "/blog" }} />
            <div className="mt-9 grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/blog/${item.slug}`}
                  className="group flex flex-col rounded-panel border border-soft bg-white p-5 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
                >
                  <span className="eyebrow text-forest-700">{item.category}</span>
                  <span className="mt-3 font-sans text-[1rem] font-semibold leading-snug text-navy-900">{item.title}</span>
                  <span className="mt-2 text-[0.8125rem] text-ink-muted">{item.readMinutes} min read</span>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-forest-700">
                    Read article <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Section>
      )}

      <JsonLd data={articleJsonLd(post)} />
    </>
  );
}
