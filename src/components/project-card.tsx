import Link from "next/link";
import { IconArrowRight, IconPin } from "@/components/icons";
import type { Project } from "@/db/schema";
import { formatPrice } from "@/lib/format";

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-panel border border-soft bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      <Link href={`/projects/${project.slug}`} className="zoom-frame relative block aspect-[16/10] overflow-hidden bg-soft">
        <img
          src={project.coverImage}
          alt={`${project.name} — ${project.projectType} in ${project.location}`}
          width={1200}
          height={750}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-navy-950/45 to-transparent" />
        <span className="absolute left-4 top-4 rounded-md bg-navy-950/85 px-2.5 py-1 font-sans text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
          {project.status}
        </span>
        <span className="absolute bottom-4 left-4 rounded-md bg-white/94 px-2.5 py-1 font-sans text-[0.625rem] font-bold uppercase tracking-[0.12em] text-navy-900">
          {project.projectType}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-sans text-[1.1rem] font-semibold text-navy-900">
          <Link href={`/projects/${project.slug}`} className="hover:text-forest-700">
            {project.name}
          </Link>
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-[0.875rem] text-ink-muted">
          <IconPin className="h-4 w-4 text-forest-600" /> {project.location}
        </p>
        <p className="mt-3 text-[0.8125rem] text-ink-muted">
          by <span className="font-medium text-navy-900">{project.developer}</span>
        </p>
        <div className="mt-auto pt-5">
          <div className="hairline pt-4">
            <p className="font-sans text-[1.05rem] font-bold text-navy-900">
              Starting from {formatPrice(project.startingPrice)}
            </p>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">{project.completion}</p>
            <Link
              href={`/projects/${project.slug}`}
              className="mt-3 inline-flex items-center gap-1.5 font-sans text-[0.875rem] font-semibold text-navy-800 hover:text-forest-700"
            >
              Explore Project
              <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
