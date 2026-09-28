"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconShield } from "@/components/icons";
import { BrandLockup } from "@/components/brand-lockup";
import { SITE } from "@/lib/constants";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Login failed.");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-navy-950 px-4 pb-16 pt-28">
      <div className="w-full max-w-md rounded-panel border border-white/10 bg-white p-8 shadow-lift">
        <BrandLockup large />

        <h1 className="mt-6 font-sans text-[1.35rem] font-bold text-navy-900">Admin sign in</h1>
        <p className="mt-1.5 text-[0.875rem] text-ink-muted">
          Review owner-submitted listings — approve to publish, or reject with a note.
        </p>

        <form onSubmit={onSubmit} className="mt-6">
          <label
            htmlFor="admin-password"
            className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-muted"
          >
            Admin password
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field mt-2"
            placeholder="Enter admin password"
            autoComplete="current-password"
            autoFocus
          />
          {error && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-[0.8125rem] text-red-700">
              {error}
            </p>
          )}
          <button type="submit" disabled={loading || !password} className="btn btn-primary mt-5 w-full disabled:opacity-60">
            <IconShield className="h-4 w-4" />
            {loading ? "Signing in…" : "Sign in to admin"}
          </button>
        </form>

        <p className="mt-6 border-t border-soft pt-4 text-[0.75rem] leading-relaxed text-ink-muted">
          {SITE.demoLabel}. Set the <code className="rounded bg-mist px-1 font-mono">ADMIN_PASSWORD</code> environment
          variable to change the admin password in production.
        </p>
      </div>
    </div>
  );
}
