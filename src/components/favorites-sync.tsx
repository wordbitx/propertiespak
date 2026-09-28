"use client";

import { useEffect, useRef, useState } from "react";
import { IconCheck } from "@/components/icons";
import { useFavorites } from "@/components/favorites-provider";

/** Pushes the device shortlist to the signed-in account once per session. */
export function FavoritesSync() {
  const { ids, ready } = useFavorites();
  const [state, setState] = useState<"idle" | "syncing" | "synced">("idle");
  const attempted = useRef(false);

  useEffect(() => {
    if (!ready || attempted.current || ids.length === 0) return;
    attempted.current = true;
    setState("syncing");
    fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merge: ids }),
    })
      .then((response) => {
        setState(response.ok ? "synced" : "idle");
      })
      .catch(() => setState("idle"));
  }, [ids, ready]);

  if (state === "idle") return null;

  return (
    <p className="inline-flex items-center gap-2 rounded-lg bg-forest-50 px-3 py-2 text-[0.8125rem] font-medium text-forest-700">
      <IconCheck className="h-4 w-4" />
      {state === "syncing" ? "Syncing your device shortlist…" : "Device shortlist synced to your account"}
    </p>
  );
}
