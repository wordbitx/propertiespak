import { getAllPostSlugs } from "@/lib/queries";
import { renderUrlSet, xmlResponse } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await getAllPostSlugs();
  return xmlResponse(
    renderUrlSet([
      { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
      ...posts.map((post) => ({
        path: `/blog/${post.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ]),
  );
}
