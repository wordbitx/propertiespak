import { IconChart, IconLayers, IconPin, IconShield } from "@/components/icons";
import type { Property } from "@/db/schema";
import { computePropertyScore } from "@/lib/score";

/** Pak Property Property Score panel — always presented with its demo disclaimer. */
export function PropertyScorePanel({ property, variant = "full" }: { property: Property; variant?: "full" | "compact" }) {
  const score = computePropertyScore(property);

  if (variant === "compact") {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg border border-soft bg-white px-3 py-2">
        <IconChart className="h-4 w-4 text-forest-600" />
        <span className="font-sans text-[0.8125rem] font-semibold text-navy-900">Score {score.overall}/10</span>
        <span className="text-[0.6875rem] text-ink-muted">demo</span>
      </span>
    );
  }

  return (
    <div className="rounded-panel border border-soft bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="eyebrow text-forest-700">
            <span className="h-[1px] w-6 bg-current opacity-70" />
            Pak Property Property Score
          </p>
          <div className="mt-3 flex items-end gap-3">
            <span className="font-sans text-[2.6rem] font-bold leading-none tracking-[-0.04em] text-navy-900">
              {score.overall}
            </span>
            <span className="pb-1 text-[0.875rem] text-ink-muted">/ 10</span>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-lg bg-mist px-3 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          <IconShield className="h-3.5 w-3.5 text-forest-600" />
          {score.label}
        </span>
      </div>

      <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {score.dimensions.map((dimension) => (
          <div key={dimension.key}>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[0.8125rem] font-semibold text-navy-900">{dimension.label}</dt>
              <dd className="font-sans text-[0.8125rem] font-bold text-navy-900">{dimension.score}</dd>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-soft">
              <span className="block h-full rounded-full bg-navy-800" style={{ width: `${(dimension.score / 10) * 100}%` }} />
            </div>
            <p className="mt-1.5 text-[0.6875rem] text-ink-muted">{dimension.note}</p>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-soft pt-5 text-[0.75rem] text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <IconPin className="h-3.5 w-3.5 text-forest-600" /> Society-level location weighting
        </span>
        <span className="inline-flex items-center gap-1.5">
          <IconLayers className="h-3.5 w-3.5 text-forest-600" /> Compare up to 3 properties
        </span>
      </div>

      <p className="mt-4 text-[0.6875rem] leading-relaxed text-ink-muted">{score.disclaimer}</p>
    </div>
  );
}
