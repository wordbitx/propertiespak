import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs";

/** Compact navy hero band used by every inner page so the transparent navbar reads well. */
export function PageHero({
  eyebrow,
  title,
  description,
  crumbs,
  children,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs: Crumb[];
  children?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-950 pb-14 pt-28 lg:pb-20 lg:pt-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "radial-gradient(900px 420px at 12% -10%, rgba(22,179,100,0.28), transparent 62%), radial-gradient(700px 380px at 88% 8%, rgba(19,80,127,0.55), transparent 60%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white/0"
      />
      <div className="ui-container relative z-10">
        <Breadcrumbs items={crumbs} />
        <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
          {eyebrow && (
            <p className="eyebrow mt-7 text-forest-400">
              <span className="h-[1px] w-6 bg-current opacity-70" />
              {eyebrow}
            </p>
          )}
          <h1 className="display-2 mt-4 text-white ew-fade-up">{title}</h1>
          {description && <p className="lede mt-4 text-white/70 ew-fade-up ew-d1">{description}</p>}
        </div>
        {children && <div className="mt-8 lg:mt-10">{children}</div>}
      </div>
    </section>
  );
}
