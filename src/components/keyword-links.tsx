import Link from "next/link";
import { IconArrowRight, IconSearch } from "@/components/icons";
import { relatedKeywords, type KeywordLink } from "@/lib/keyword-catalog";

/**
 * "Popular searches" block. Renders the keyword phrases that point at a page
 * (and its city cluster) so crawlers see descriptive internal anchors instead of
 * a dead end, and visitors can jump to the adjacent search they actually want.
 */
export function KeywordLinks({
  path,
  title = "Popular searches for this page",
  description,
  limit = 12,
  links: providedLinks,
  tone = "light",
}: {
  path?: string;
  title?: string;
  description?: string;
  limit?: number;
  links?: KeywordLink[];
  tone?: "light" | "mist";
}) {
  const links = providedLinks ?? relatedKeywords(path ?? "", limit);
  if (links.length === 0) return null;

  return (
    <section className={tone === "mist" ? "bg-mist py-12" : "bg-white py-12"} aria-label={title}>
      <div className="ui-container">
        <p className="eyebrow text-forest-700">
          <IconSearch className="h-3.5 w-3.5" /> Related property searches
        </p>
        <h2 className="display-3 mt-3 text-navy-900">{title}</h2>
        {description && <p className="lede mt-3 max-w-3xl">{description}</p>}
        <ul className="mt-6 flex flex-wrap gap-2">
          {links.map((link) => (
            <li key={`${link.label}-${link.href}`}>
              <Link
                href={link.href}
                className="group inline-flex items-center gap-2 rounded-full border border-soft bg-white px-3.5 py-2 text-[0.8125rem] font-semibold text-navy-800 transition-all hover:-translate-y-0.5 hover:border-navy-100 hover:text-forest-700 hover:shadow-card"
              >
                {link.label}
                <IconArrowRight className="h-3.5 w-3.5 text-forest-600 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[0.8125rem] text-ink-muted">
          See the{" "}
          <Link href="/keywords-for-pakistan" className="font-semibold text-forest-700 hover:underline">
            full Pakistan property keyword directory
          </Link>{" "}
          for every search we cover.
        </p>
      </div>
    </section>
  );
}
