import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { IconArrowRight, IconCheck, IconPin } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { LeadForm } from "@/components/lead-form";
import { PropertyCard } from "@/components/property-card";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section";
import { formatPrice } from "@/lib/format";
import { getProjectBySlug, getProjects, searchProperties } from "@/lib/queries";
import { buildMetadata, projectJsonLd } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) {
    return buildMetadata({
      title: "Project not found",
      description: "This development is no longer tracked on Pak Property.",
      path: "/projects",
    });
  }
  return buildMetadata({
    title: `${project.name} — ${project.projectType} in ${project.location}`,
    description: `${project.name} by ${project.developer} in ${project.location}. ${project.projectType}, starting from ${formatPrice(project.startingPrice)}. ${project.completion}. Unite sizes, payment plans and status on Pak Property.`,
    path: `/projects/${project.slug}`,
    image: project.coverImage,
    keywords: [`${project.name}`, `${project.cityName} new project`, `${project.projectType} ${project.cityName}`],
  });
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const [units, others] = await Promise.all([
    searchProperties({ isNewProject: true, city: project.citySlug, pageSize: 3, sort: "price-asc" }),
    getProjects(3),
  ]);

  const images = project.images.length ? project.images : [project.coverImage];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy-950 pb-16 pt-28 lg:pb-20 lg:pt-36">
        <div className="absolute inset-0">
          <img
            src={images[0]}
            alt={`${project.name} in ${project.location}`}
            width={1800}
            height={1000}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/92 to-navy-900/60" />
        </div>
        <div className="ui-container relative z-10">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "New Projects", href: "/projects" },
              { name: project.name, href: `/projects/${project.slug}` },
            ]}
          />
          <div className="mt-7 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-md bg-forest-600 px-2.5 py-1 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-white">
                  {project.status}
                </span>
                <span className="rounded-md border border-white/15 px-2.5 py-1 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/70">
                  {project.projectType}
                </span>
              </div>
              <h1 className="display-2 mt-5 text-white ew-fade-up">{project.name}</h1>
              <p className="mt-4 flex items-center gap-2 text-[0.9375rem] text-white/70">
                <IconPin className="h-4 w-4 text-forest-400" /> {project.location}
              </p>
              <p className="mt-2 text-[0.875rem] text-white/60">Developed by {project.developer}</p>
            </div>
            <div className="rounded-panel border border-white/12 bg-white/[0.05] p-5 backdrop-blur-sm">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-forest-400">
                Starting from
              </p>
              <p className="mt-2 font-sans text-[1.9rem] font-bold leading-none tracking-[-0.03em] text-white">
                {formatPrice(project.startingPrice)}
              </p>
              <dl className="mt-4 space-y-2 border-t border-white/12 pt-4 text-[0.8125rem]">
                <div className="flex justify-between gap-3">
                  <dt className="text-white/60">Handover</dt>
                  <dd className="font-medium text-white">{project.completion}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-white/60">Unit mix</dt>
                  <dd className="text-right font-medium text-white">{project.units}</dd>
                </div>
              </dl>
              <Link href="#enquire" className="btn btn-green mt-5 w-full">
                Request payment plan <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Section tone="light">
        <div className="ui-container grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="font-sans text-[1.35rem] font-bold text-navy-900">About {project.name}</h2>
            <p className="mt-4 text-[0.9875rem] leading-[1.75] text-ink">{project.description}</p>

            <h3 className="mt-8 font-sans text-[1.05rem] font-semibold text-navy-900">Project highlights</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {project.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2.5 text-[0.9rem] text-ink">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                  {highlight}
                </li>
              ))}
            </ul>

            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              {images.slice(1, 5).map((image, index) => (
                <div key={image} className="overflow-hidden rounded-panel bg-soft">
                  <img
                    src={image}
                    alt={`${project.name} — view ${index + 2}`}
                    width={900}
                    height={620}
                    loading="lazy"
                    decoding="async"
                    className="h-[220px] w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <aside id="enquire" className="lg:sticky lg:top-28 lg:self-start">
            <LeadForm
              variant="contact"
              heading="Request project details"
              description="Get the current payment plan, unit availability and site visit options for this development."
              defaultCity={project.cityName}
              projectSlug={project.slug}
              source={`project-${project.slug}`}
            />
            <div className="mt-5 rounded-panel border border-soft bg-mist p-5">
              <p className="font-sans text-[0.9375rem] font-semibold text-navy-900">Buying decision checklist</p>
              <ul className="mt-3 space-y-2 text-[0.8125rem] text-ink-muted">
                <li>Approve authority &amp; project registration</li>
                <li>Payment plan and escalation terms</li>
                <li>Handover history of the developer</li>
                <li>Post-handover service charges</li>
              </ul>
              <Link href="/blog/buying-property-in-pakistan-checklist" className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-forest-700">
                Read the full checklist <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </Section>

      {units.items.length > 0 && (
        <Section tone="mist">
          <div className="ui-container">
            <SectionHeading
              eyebrow="Released inventory"
              title="Units available in new developments"
              description={`Currently released units in ${project.cityName} with instalment plans and booking terms.`}
              action={{ label: "All new project units", href: "/properties/new-projects" }}
            />
            <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {units.items.map((property, index) => (
                <Reveal key={property.id} delay={index * 50}>
                  <PropertyCard property={property} />
                </Reveal>
              ))}
            </div>
          </div>
        </Section>
      )}

      <Section tone="light">
        <div className="ui-container">
          <SectionHeading
            eyebrow="More projects"
            title="Other developments we track"
            action={{ label: "All projects", href: "/projects" }}
          />
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {others
              .filter((item) => item.slug !== project.slug)
              .slice(0, 3)
              .map((item) => (
                <Link
                  key={item.slug}
                  href={`/projects/${item.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-panel border border-soft bg-white p-5 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
                >
                  <span>
                    <span className="block font-sans text-[1rem] font-semibold text-navy-900">{item.name}</span>
                    <span className="mt-1 block text-[0.8125rem] text-ink-muted">{item.location}</span>
                    <span className="mt-2 block font-sans text-[0.875rem] font-semibold text-forest-700">
                      {formatPrice(item.startingPrice)}
                    </span>
                  </span>
                  <IconArrowRight className="h-4 w-4 shrink-0 text-forest-600 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
          </div>
        </div>
      </Section>

      <JsonLd data={projectJsonLd(project)} />
    </>
  );
}
