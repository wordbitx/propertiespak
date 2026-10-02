"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BlueTick, UnverifiedChip, initialsFor } from "@/components/verified-badge";
import { IconCheck, IconClose, IconSearch } from "@/components/icons";
import type { DealerProfile } from "@/lib/queries";
import { formatDate } from "@/lib/format";

type Filter = "all" | "verified" | "unverified" | "dealers" | "requested";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All accounts" },
  { key: "dealers", label: "Has listings" },
  { key: "verified", label: "Verified" },
  { key: "unverified", label: "Not verified" },
  { key: "requested", label: "Verification requests" },
];

/**
 * Admin controls for dealer verification and public identity. Every account is
 * listed with its listing footprint; admins can verify or unverify it and edit
 * the name and agency shown on public profiles.
 */
export function AdminUsersPanel() {
  const router = useRouter();
  const [items, setItems] = useState<DealerProfile[]>([]);
  const [counts, setCounts] = useState({ total: 0, verified: 0, dealers: 0, profiles: 0, requested: 0 });
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [identityDraft, setIdentityDraft] = useState({ name: "", agency: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/users");
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      const payload = (await response.json()) as {
        ok?: boolean;
        items?: DealerProfile[];
        counts?: { total: number; verified: number; dealers: number; profiles: number; requested: number };
        error?: string;
      };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Could not load accounts.");
        return;
      }
      setItems(payload.items ?? []);
      setCounts(payload.counts ?? { total: 0, verified: 0, dealers: 0, profiles: 0, requested: 0 });
    } catch {
      setError("Network error. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function setVerification(user: DealerProfile, verified: boolean) {
    setActing(user.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Could not update verification.");
        return;
      }
      setNotice(
        verified
          ? `${user.name} is now verified — the blue tick shows on the profile, their listings and their property cards.`
          : `${user.name} is no longer verified — the tick has been removed site-wide.`,
      );
      await load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setActing(null);
    }
  }

  async function clearRequest(user: DealerProfile) {
    setActing(user.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear-request" }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Could not clear the request.");
        return;
      }
      setNotice(`Verification request for ${user.name} marked as reviewed.`);
      await load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setActing(null);
    }
  }

  async function saveIdentity(user: DealerProfile) {
    const name = identityDraft.name.trim();
    const agency = identityDraft.agency.trim();
    if (name.length < 2) {
      setError("Public name must be at least 2 characters.");
      return;
    }
    if (name.length > 120 || agency.length > 160) {
      setError("Name or agency is too long. Please shorten it and try again.");
      return;
    }

    setActing(user.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, agency }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Could not update the dealer name and agency.");
        return;
      }
      setEditingId(null);
      setNotice(`Public name and agency updated for ${name}.`);
      await load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setActing(null);
    }
  }

  const visible = items.filter((user) => {
    if (filter === "verified" && !user.isVerified) return false;
    if (filter === "unverified" && user.isVerified) return false;
    if (filter === "dealers" && user.listings === 0) return false;
    if (filter === "requested" && !(user.verificationRequestedAt && !user.isVerified)) return false;
    if (query.trim()) {
      const term = query.trim().toLowerCase();
      const haystack =
        `${user.name} ${user.email} ${user.cityName} ${user.agency} ${user.designation} ${user.areas} ${user.whatsapp} ${user.companyPhone}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });

  return (
    <div className="min-w-0">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-panel border border-soft bg-white px-5 py-4">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">Registered accounts</p>
          <p className="mt-1 font-sans text-[1.5rem] font-bold text-navy-900">{counts.total}</p>
        </div>
        <div className="rounded-panel border border-soft bg-white px-5 py-4">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">Accounts with listings</p>
          <p className="mt-1 font-sans text-[1.5rem] font-bold text-navy-900">{counts.dealers}</p>
        </div>
        <div className="rounded-panel border border-soft bg-white px-5 py-4">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">Verified (blue tick)</p>
          <p className="mt-1 flex items-center gap-2 font-sans text-[1.5rem] font-bold text-navy-900">
            {counts.verified} <BlueTick className="h-5 w-5" />
          </p>
        </div>
        <div className="rounded-panel border border-soft bg-white px-5 py-4">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">Profiles completed</p>
          <p className="mt-1 font-sans text-[1.5rem] font-bold text-navy-900">{counts.profiles}</p>
        </div>
        <div className={`rounded-panel border px-5 py-4 ${counts.requested > 0 ? "border-amber-300 bg-amber-50" : "border-soft bg-white"}`}>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">Verification requests</p>
          <p className="mt-1 font-sans text-[1.5rem] font-bold text-navy-900">{counts.requested}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Account filters">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={filter === item.key}
              onClick={() => setFilter(item.key)}
              className={`rounded-[10px] border px-4 py-2.5 font-sans text-[0.8125rem] font-semibold transition-colors ${
                filter === item.key ? "border-navy-800 bg-navy-800 text-white" : "border-soft bg-white text-navy-900 hover:border-navy-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email or city"
            className="field pl-9"
            aria-label="Search accounts"
          />
        </div>
      </div>

      {notice && (
        <p className="mt-4 rounded-xl border border-forest-600/30 bg-forest-50 px-4 py-3 text-[0.8125rem] font-medium text-forest-700">
          {notice}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.8125rem] font-medium text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="mt-6 text-[0.875rem] text-ink-muted">Loading accounts…</p>
      ) : visible.length === 0 ? (
        <p className="mt-6 rounded-panel border border-soft bg-white p-8 text-center text-[0.875rem] text-ink-muted">
          No accounts match this view.
        </p>
      ) : (
        <div className="mt-6 grid min-w-0 gap-4">
          {visible.map((user) => (
            <article key={user.id} className="min-w-0 rounded-panel border border-soft bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-navy-900 font-sans text-[0.9375rem] font-bold text-white">
                    {initialsFor(user.name)}
                    {user.isVerified && (
                      <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-white">
                        <BlueTick className="h-4 w-4" />
                      </span>
                    )}
                  </span>
                  <div className="min-w-0">
                    <h3 className="flex flex-wrap items-center gap-2 font-sans text-[1rem] font-semibold text-navy-900">
                      {user.name}
                      {user.isVerified ? <BlueTick className="h-4 w-4" /> : <UnverifiedChip />}
                      <span className="rounded-md bg-mist px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-ink-muted">
                        {user.role}
                      </span>
                    </h3>
                    <p className="mt-1 break-words text-[0.8125rem] text-ink-muted">
                      {user.email}
                      {user.phone ? ` · ${user.phone}` : ""}
                    </p>
                    <p className="mt-1 text-[0.75rem] text-ink-muted">
                      {user.cityName || "City not set"}
                      {user.agency ? ` · ${user.agency}` : ""} · Registered {formatDate(user.createdAt)}
                      {user.slug ? (
                        <>
                          {" · "}
                          <Link href={`/dealers/${user.slug}`} className="font-semibold text-forest-700 hover:underline">
                            public profile
                          </Link>
                        </>
                      ) : null}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-right">
                    <p className="font-sans text-[1.25rem] font-bold leading-none text-navy-900">{user.listings}</p>
                    <p className="mt-1 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                      {user.listings === 1 ? "listing" : "listings"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-[1.25rem] font-bold leading-none text-navy-900">{user.verifiedListings}</p>
                    <p className="mt-1 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">checked</p>
                  </div>
                  <button
                    type="button"
                    aria-expanded={editingId === user.id}
                    aria-controls={editingId === user.id ? `admin-user-edit-${user.id}` : undefined}
                    disabled={acting === user.id}
                    onClick={() => {
                      if (editingId === user.id) {
                        setEditingId(null);
                      } else {
                        setEditingId(user.id);
                        setIdentityDraft({ name: user.name, agency: user.agency });
                        setError("");
                        setNotice("");
                      }
                    }}
                    className="btn btn-outline"
                  >
                    {editingId === user.id ? "Close editor" : "Edit name / agency"}
                  </button>
                  <button
                    type="button"
                    disabled={acting === user.id}
                    onClick={() => setVerification(user, !user.isVerified)}
                    className={user.isVerified ? "btn btn-outline" : "btn btn-primary"}
                  >
                    {user.isVerified ? (
                      <>
                        <IconClose className="h-4 w-4" /> Unverify
                      </>
                    ) : (
                      <>
                        <IconCheck className="h-4 w-4" /> Verify &amp; add blue tick
                      </>
                    )}
                  </button>
                </div>
              </div>

              {editingId === user.id && (
                <form
                  id={`admin-user-edit-${user.id}`}
                  onSubmit={(event) => {
                    event.preventDefault();
                    void saveIdentity(user);
                  }}
                  className="mt-4 rounded-xl border border-forest-600/25 bg-forest-50 p-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-ink-muted" htmlFor={`admin-user-name-${user.id}`}>
                        Public name
                      </label>
                      <input
                        id={`admin-user-name-${user.id}`}
                        value={identityDraft.name}
                        onChange={(event) => setIdentityDraft((current) => ({ ...current, name: event.target.value }))}
                        maxLength={120}
                        minLength={2}
                        required
                        className="field mt-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-ink-muted" htmlFor={`admin-user-agency-${user.id}`}>
                        Agency / company name
                      </label>
                      <input
                        id={`admin-user-agency-${user.id}`}
                        value={identityDraft.agency}
                        onChange={(event) => setIdentityDraft((current) => ({ ...current, agency: event.target.value }))}
                        maxLength={160}
                        className="field mt-1.5"
                        placeholder="Leave blank for an individual dealer"
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-[0.75rem] text-ink-muted">Changes appear on the public dealer profile and agency directory.</p>
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button type="button" disabled={acting === user.id} onClick={() => setEditingId(null)} className="btn btn-outline">
                      Cancel
                    </button>
                    <button type="submit" disabled={acting === user.id} className="btn btn-primary">
                      {acting === user.id ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-4 grid gap-x-6 gap-y-3 border-t border-soft pt-4 text-[0.75rem] sm:grid-cols-2 xl:grid-cols-3">
                <div>
                  <p className="font-semibold uppercase tracking-[0.1em] text-ink-muted">Profile</p>
                  <p className="mt-1 text-navy-900">
                    {user.profileCompletedAt ? `Completed ${formatDate(user.profileCompletedAt)}` : "Not completed"}
                    {user.verificationRequestedAt && !user.isVerified
                      ? ` · verification requested ${formatDate(user.verificationRequestedAt)}`
                      : ""}
                  </p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-[0.1em] text-ink-muted">Agency / designation</p>
                  <p className="mt-1 text-navy-900">
                    {user.agency || "—"}
                    {user.designation ? ` · ${user.designation}` : ""}
                  </p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-[0.1em] text-ink-muted">WhatsApp / company phone</p>
                  <p className="mt-1 text-navy-900">
                    {user.whatsapp || "—"}
                    {user.companyPhone ? ` · ${user.companyPhone}` : ""}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="font-semibold uppercase tracking-[0.1em] text-ink-muted">Areas you deal in</p>
                  <p className="mt-1 text-navy-900">{user.areas || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-[0.1em] text-ink-muted">Experience</p>
                  <p className="mt-1 text-navy-900">{user.experience || "—"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="font-semibold uppercase tracking-[0.1em] text-ink-muted">Office address</p>
                  <p className="mt-1 text-navy-900">{user.officeAddress || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-[0.1em] text-ink-muted">Company website</p>
                  <p className="mt-1 break-words text-navy-900">
                    {user.companyWebsite ? (
                      <a href={user.companyWebsite} target="_blank" rel="noopener noreferrer" className="font-semibold text-forest-700 hover:underline">
                        {user.companyWebsite}
                      </a>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
                {(user.bio || user.verificationNote) && (
                  <div className="sm:col-span-2 xl:col-span-3">
                    <p className="font-semibold uppercase tracking-[0.1em] text-ink-muted">Bio / verification notes</p>
                    {user.bio && <p className="mt-1 text-navy-900">{user.bio}</p>}
                    {user.verificationNote && <p className="mt-1 text-ink-muted">Verification: {user.verificationNote}</p>}
                  </div>
                )}
              </div>

              {user.verificationRequestedAt && !user.isVerified && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
                  <p className="text-[0.8125rem] font-medium text-amber-800">
                    This account asked to be verified{user.verificationNote ? " and supplied notes above" : ""}.
                  </p>
                  <button
                    type="button"
                    disabled={acting === user.id}
                    onClick={() => clearRequest(user)}
                    className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-[0.75rem] font-semibold text-amber-800 hover:border-amber-500"
                  >
                    Mark as reviewed
                  </button>
                </div>
              )}

              {user.listings > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-soft pt-4">
                  <Link
                    href={`/properties?q=${encodeURIComponent(user.email)}`}
                    className="text-[0.75rem] font-semibold text-forest-700 hover:underline"
                  >
                    Listings on the marketplace
                  </Link>
                  {user.isVerified && user.verifiedAt && (
                    <span className="text-[0.75rem] text-ink-muted">Verified {formatDate(user.verifiedAt)}</span>
                  )}
                  {!user.isVerified && user.listings > 0 && (
                    <span className="text-[0.75rem] text-ink-muted">
                      Verify to show the blue tick on the profile and every listing this account publishes.
                    </span>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
