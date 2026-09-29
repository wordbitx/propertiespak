"use client";

import { useState } from "react";
import { IconCheck, IconLayers } from "@/components/icons";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-2 rounded-[10px] border border-soft bg-white px-3.5 py-2.5 font-sans text-[0.875rem] font-semibold text-navy-900 transition-colors hover:border-navy-800"
    >
      {copied ? <IconCheck className="h-4 w-4 text-forest-600" /> : <IconLayers className="h-4 w-4" />}
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
