"use client";

import { useState } from "react";
import { IconArrowRight, IconCheck } from "@/components/icons";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "newsletter",
          name: "Newsletter subscriber",
          email,
          phone: "",
          message: "Subscribed to Pak Property market updates",
          source: "footer",
        }),
      });
      setState(response.ok ? "done" : "error");
      if (response.ok) setEmail("");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="flex items-center gap-2 text-[0.8125rem] font-medium text-forest-400">
        <IconCheck className="h-4 w-4" /> You are on the list. We will send new listings and market notes.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4">
      <label htmlFor="footer-newsletter" className="sr-only">
        Email address
      </label>
      <div className="flex overflow-hidden rounded-[10px] border border-white/15 bg-white/5 focus-within:border-forest-500">
        <input
          id="footer-newsletter"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@email.com"
          className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-[0.875rem] text-white placeholder:text-white/45 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="flex items-center gap-1.5 bg-forest-600 px-4 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-forest-700 disabled:opacity-70"
        >
          {state === "loading" ? "Sending…" : "Join"}
          <IconArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      {state === "error" && <p className="mt-2 text-[0.8125rem] text-red-300">Something went wrong. Please try again.</p>}
    </form>
  );
}
