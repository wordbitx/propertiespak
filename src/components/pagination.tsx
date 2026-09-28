import Link from "next/link";
import { IconArrowRight, IconChevronDown } from "@/components/icons";

export function Pagination({
  page,
  pageCount,
  basePath,
  params,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;

  const buildHref = (target: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) search.set(key, value);
    }
    if (target > 1) search.set("page", String(target));
    else search.delete("page");
    const query = search.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (value) => value === 1 || value === pageCount || Math.abs(value - page) <= 1,
  );

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      {page > 1 && (
        <Link href={buildHref(page - 1)} className="chip" rel="prev">
          <IconChevronDown className="h-4 w-4 rotate-90" /> Previous
        </Link>
      )}
      <ul className="flex items-center gap-1.5">
        {pages.map((value, index) => {
          const previous = pages[index - 1];
          const gap = previous && value - previous > 1;
          return (
            <li key={value} className="flex items-center gap-1.5">
              {gap && <span className="px-1 text-ink-muted">…</span>}
              <Link
                href={buildHref(value)}
                aria-current={value === page ? "page" : undefined}
                className={`grid h-9 min-w-9 place-items-center rounded-lg border px-2.5 font-sans text-[0.875rem] font-semibold transition-colors ${
                  value === page
                    ? "border-navy-800 bg-navy-800 text-white"
                    : "border-soft bg-white text-navy-900 hover:border-navy-800"
                }`}
              >
                {value}
              </Link>
            </li>
          );
        })}
      </ul>
      {page < pageCount && (
        <Link href={buildHref(page + 1)} className="chip" rel="next">
          Next <IconArrowRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
