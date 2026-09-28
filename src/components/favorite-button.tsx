"use client";

import { IconHeart } from "@/components/icons";
import { useFavorites } from "@/components/favorites-provider";

export function FavoriteButton({
  propertyId,
  title,
  tone = "light",
  className = "",
}: {
  propertyId: number;
  title: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const { has, toggle } = useFavorites();
  const saved = has(propertyId);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved properties` : `Save ${title} to your shortlist`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(propertyId);
      }}
      className={[
        "grid h-9 w-9 place-items-center rounded-full border backdrop-blur-sm transition-all duration-200",
        saved
          ? "border-forest-500 bg-forest-500 text-white"
          : tone === "light"
            ? "border-white/45 bg-white/85 text-navy-900 hover:border-forest-500 hover:text-forest-700"
            : "border-soft bg-white text-navy-900 hover:border-forest-500 hover:text-forest-700",
        className,
      ].join(" ")}
    >
      <IconHeart filled={saved} className="h-[1.05rem] w-[1.05rem]" />
    </button>
  );
}
