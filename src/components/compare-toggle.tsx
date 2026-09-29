"use client";

import { IconCheck, IconLayers } from "@/components/icons";
import { MAX_COMPARE, useCompare } from "@/components/compare-provider";

export function CompareToggle({
  propertyId,
  title,
  tone = "dark",
  className = "",
  withLabel = false,
}: {
  propertyId: number;
  title: string;
  tone?: "light" | "dark";
  className?: string;
  withLabel?: boolean;
}) {
  const { has, toggle, ids } = useCompare();
  const active = has(propertyId);
  const disabled = !active && ids.length >= MAX_COMPARE;

  return (
    <button
      type="button"
      aria-pressed={active}
      title={disabled ? `Compare list is full (${MAX_COMPARE} max) — add will replace the oldest` : undefined}
      aria-label={active ? `Remove ${title} from comparison` : `Add ${title} to comparison`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(propertyId);
      }}
      className={[
        "inline-flex items-center gap-2 rounded-[10px] border transition-colors",
        withLabel ? "px-3.5 py-2.5 font-sans text-[0.813rem] font-semibold" : "h-9 w-9 justify-center",
        active
          ? "border-forest-500 bg-forest-600 text-white"
          : tone === "light"
            ? "border-white/45 bg-white/85 text-navy-900 hover:border-forest-500 hover:text-forest-700"
            : "border-soft bg-white text-navy-900 hover:border-navy-800",
        className,
      ].join(" ")}
    >
      {active ? <IconCheck className="h-[0.95rem] w-[0.95rem]" /> : <IconLayers className="h-[0.95rem] w-[0.95rem]" />}
      {withLabel && (active ? "In comparison" : "Compare")}
    </button>
  );
}
