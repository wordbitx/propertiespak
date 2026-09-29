import Link from "next/link";
import { IconChevronDown } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

export type Crumb = { name: string; href: string };

export function Breadcrumbs({
  items,
  tone = "dark",
  withSchema = true,
}: {
  items: Crumb[];
  tone?: "dark" | "light";
  withSchema?: boolean;
}) {
  const textTone = tone === "dark" ? "text-white/60" : "text-ink-muted";
  const hoverTone = tone === "dark" ? "hover:text-white" : "hover:text-navy-900";

  return (
    <nav aria-label="Breadcrumb" className={`text-[0.8125rem] font-medium ${textTone}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.href}-${item.name}`} className="flex items-center gap-2">
              {isLast ? (
                <span aria-current="page" className={tone === "dark" ? "text-white/85" : "text-navy-900"}>
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className={`transition-colors ${hoverTone}`}>
                  {item.name}
                </Link>
              )}
              {!isLast && <IconChevronDown className="h-3.5 w-3.5 -rotate-90 opacity-60" />}
            </li>
          );
        })}
      </ol>
      {withSchema && <JsonLd data={breadcrumbJsonLd(items)} />}
    </nav>
  );
}
