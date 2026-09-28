import { getAllProjectSlugs } from "@/lib/queries";
import { renderUrlSet, xmlResponse } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";

export async function GET() {
  const projects = await getAllProjectSlugs();
  return xmlResponse(
    renderUrlSet([
      { path: "/projects", changeFrequency: "weekly", priority: 0.8 },
      { path: "/properties/new-projects", changeFrequency: "weekly", priority: 0.8 },
      { path: "/new-property-projects-in-pakistan", changeFrequency: "weekly", priority: 0.9 },
      ...projects.map((project) => ({
        path: `/projects/${project.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ]),
  );
}
