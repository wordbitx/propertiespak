"use client";

import { useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { IconShield } from "@/components/icons";
import { BrandLockup } from "@/components/brand-lockup";
import { SITE } from "@/lib/constants";

const SESSION_HINT = "The password was accepted but this browser did not store the admin session cookie. "
  + "Open the preview in its own browser tab (not embedded), or allow cookies for this site, then try again.";

const noopSubscribe = () => () => {};

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // `/admin` bounces back here when the session cookie is missing. If that
  // happens within two minutes of a successful sign-in, the browser blocked the
  // cookie (embedded preview + third-party cookie restrictions). Read via
  // useSyncExternalStore so SSR is unaffected and hydration stays consistent.
  const cookieBlocked = useSyncExternalStore(
    noopSubscribe,
    () => {
      if (searchParams.get("session") !== "missing") return false;
      try {
        const signedInAt = Number(window.sessionStorage.getItem("pp_admin_login_at") ?? 0);
        return Boolean(signedInAt) && Date.now() - signedInAt < 120_000;
      } catch {
        return false;
      }
    },
    () => false,
  );
  const shownError = error || (cookieBlocked ? SESSION_HINT : "");

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
      try {
        window.sessionStorage.setItem("pp_admin_login_at", String(Date.now()));
      } catch {
        // Storage is optional; only used to explain a blocked session cookie.
      }
      // Full navigation (rather than a client-side push) so the freshly issued
      // session cookie is sent with the /admin request.
      window.location.assign("/admin");
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
          {shownError && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-[0.8125rem] text-red-700">
              {shownError}
            </p>
          )}
          <button type="submit" disabled={loading || !password} className="btn btn-primary mt-5 w-full disabled:opacity-60">
            <IconShield className="h-4 w-4" />
            {loading ? "Signing in…" : "Sign in to admin"}
          </button>
        </form>

        <p className="mt-6 border-t border-soft pt-4 text-[0.75rem] leading-relaxed text-ink-muted">
          {SITE.platformLabel}. Set the <code className="rounded bg-mist px-1 font-mono">ADMIN_PASSWORD</code> environment
          variable to change the admin password in production.
        </p>
      </div>
    </div>
  );
}
