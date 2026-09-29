import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { CtaSection } from "@/components/sections-editorial";
import { LeadForm } from "@/components/lead-form";
import { Section, SectionHeading } from "@/components/section";
import { getProjects } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "New Property Projects & Developments in Pakistan",
  description:
    "Explore residential and mixed-use developments in Pakistan — luxury apartments in Islamabad, towers in Karachi, housing schemes in Lahore and Faisalabad with launch pricing and payment plans.",
  path: "/projects",
  keywords: ["new projects Pakistan", "new developments Islamabad", "housing schemes Lahore", "off plan apartments Pakistan"],
});

export default async function ProjectsPage() {
  const projects = await getProjects(12);

  return (
    <>
      <PageHero
        eyebrow="New projects"
        title="New Developments Across Pakistan"
        description="Launch pricing, unit configuration, payment plans and handover timelines presented side by side — so a project can be judged on substance and not just marketing."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "New Projects", href: "/projects" },
        ]}
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/properties/new-projects" className="btn btn-green">
            Browse released units
          </Link>
          <Link href="/contact?topic=projects" className="btn btn-ghost-light">
            Talk to the projects desk
          </Link>
        </div>
      </PageHero>

      <Section tone="light">
        <div className="ui-container">
          <SectionHeading
            eyebrow="Active developments"
            title={`${projects.length} projects currently tracked`}
            description="We follow development progress, pricing revisions and handover dates, and flag anything that changes materially."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, index) => (
              <Reveal key={project.slug} delay={index * 50}>
                <ProjectCard project={project} priority={index < 3} />
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="mist">
        <div className="ui-container grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <p className="eyebrow text-forest-700">
              <span className="h-[1px] w-6 bg-current opacity-70" />
              Buying off-plan
            </p>
            <h2 className="display-2 mt-4 text-navy-900">What to check before booking a unit</h2>
            <ol className="mt-6 space-y-4 text-[0.9375rem] leading-relaxed text-ink">
              {[
                "Confirm the developer's approval status with the relevant authority and match the project name on the approval.",
                "Read the payment plan end to end: down payment, instalment schedule, escalation clauses and transfer fees.",
                "Verify the handover date against completed comparable projects by the same developer.",
                "Ask how service charges, utilities and maintenance levies are set after handover.",
                "Keep every receipt and allotment letter — off-plan value depends on documentation quality.",
              ].map((item, index) => (
                <li key={item} className="flex gap-4">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy-800 font-sans text-[0.8125rem] font-bold text-white">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
          <LeadForm
            variant="contact"
            heading="Request a project briefing"
            description="Tell us your budget and city preference. We will send a short comparison of the projects that fit, including unit sizes and payment terms."
            source="projects-page"
          />
        </div>
      </Section>

      <CtaSection />
    </>
  );
}
