import Link from "next/link";
import { IconArrowRight } from "@/components/icons";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  tone = "light",
  align = "left",
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  tone?: "light" | "dark";
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
}) {
  const isDark = tone === "dark";
  return (
    <div
      className={[
        "flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between",
        align === "center" ? "items-center text-center lg:flex-col lg:items-center lg:text-center" : "",
      ].join(" ")}
    >
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && (
          <p className={`eyebrow ${isDark ? "text-forest-400" : "text-forest-700"}`}>
            <span className="h-[1px] w-6 bg-current opacity-70" />
            {eyebrow}
          </p>
        )}
        <Tag
          className={[
            "display-2 mt-3.5",
            isDark ? "text-white" : "text-navy-900",
          ].join(" ")}
        >
          {title}
        </Tag>
        {description && (
          <p className={["lede mt-4", isDark ? "text-white/70" : ""].join(" ")}>{description}</p>
        )}
      </div>
      {action && align !== "center" && (
        <Link
          href={action.href}
          className={[
            "group inline-flex shrink-0 items-center gap-2 font-sans text-[0.9375rem] font-semibold transition-colors",
            isDark ? "text-white hover:text-forest-400" : "text-navy-800 hover:text-forest-700",
          ].join(" ")}
        >
          {action.label}
          <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

export function Section({
  children,
  className = "",
  tone = "light",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "light" | "mist" | "dark";
  id?: string;
}) {
  const tones = {
    light: "bg-white",
    mist: "bg-mist",
    dark: "bg-navy-950 text-white",
  } as const;
  return (
    <section id={id} className={`${tones[tone]} py-16 lg:py-24 ${className}`}>
      {children}
    </section>
  );
}
