"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { IconCheck, IconClose, IconPin } from "@/components/icons";
import type { ListingSubmission } from "@/db/schema";
import { formatArea, formatDate, formatPrice } from "@/lib/format";

type Counts = { pending: number; approved: number; rejected: number };
type Tab = "pending" | "approved" | "rejected";

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "approved"
      ? "bg-forest-50 text-forest-700 border-forest-500/40"
      : status === "rejected"
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-amber-50 text-amber-700 border-amber-200";
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.1em] ${styles}`}>
      {status}
    </span>
  );
}

export function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pending");
  const [items, setItems] = useState<ListingSubmission[]>([]);
  const [counts, setCounts] = useState<Counts>({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [error, setError] = useState("");

  const load = useCallback(async (activeTab: Tab) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/submissions?status=${activeTab}`);
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      const payload = (await response.json()) as {
        ok?: boolean;
        items?: ListingSubmission[];
        counts?: { status: string; total: number }[];
        error?: string;
      };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Could not load submissions.");
        return;
      }
      setItems(payload.items ?? []);
      const next: Counts = { pending: 0, approved: 0, rejected: 0 };
      for (const row of payload.counts ?? []) {
        if (row.status in next) next[row.status as Tab] = row.total;
      }
      setCounts(next);
    } catch {
      setError("Network error. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  async function review(id: number, action: "approve" | "reject") {
    setActing(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNote: notes[id] ?? "" }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string; propertySlug?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Could not update the submission.");
        return;
      }
      await load(tab);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setActing(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "pending", label: `Pending (${counts.pending})` },
    { key: "approved", label: `Approved (${counts.approved})` },
    { key: "rejected", label: `Rejected (${counts.rejected})` },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2" role="tablist" aria-label="Submission status">
          {tabs.map((item) => (
            <button
              key={item.key}
              role="tab"
              aria-selected={tab === item.key}
              onClick={() => setTab(item.key)}
              className={[
                "rounded-[10px] border px-4 py-2.5 font-sans text-[0.8125rem] font-semibold transition-colors",
                tab === item.key
                  ? "border-navy-800 bg-navy-800 text-white"
                  : "border-soft bg-white text-navy-900 hover:border-navy-800",
              ].join(" ")}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button onClick={logout} className="btn btn-outline px-4 py-2.5 text-[0.8125rem]">
          Sign out
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-[0.875rem] text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="mt-6 grid gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-panel border border-soft bg-mist" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-panel border border-soft bg-mist p-10 text-center">
          <p className="font-sans text-[1.05rem] font-semibold text-navy-900">No {tab} submissions</p>
          <p className="mx-auto mt-2 max-w-md text-[0.875rem] text-ink-muted">
            {tab === "pending"
              ? "New owner listings from the List Property page will appear here for review."
              : `Nothing has been ${tab} yet.`}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5">
          {items.map((item) => (
            <article key={item.id} className="rounded-panel border border-soft bg-white p-5 shadow-soft sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-sans text-[0.75rem] font-bold text-ink-muted">#{item.id}</span>
                    <StatusBadge status={item.status} />
                    <span className="rounded-md bg-mist px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                      {item.purpose === "rent" ? "For Rent" : "For Sale"} · {item.propertyType}
                    </span>
                  </div>
                  <h2 className="mt-2.5 font-sans text-[1.1rem] font-bold leading-snug text-navy-900">{item.title}</h2>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[0.875rem] text-ink-muted">
                    <IconPin className="h-4 w-4 text-forest-600" />
                    {item.locationArea}, {item.cityName}
                    {item.address ? ` — ${item.address}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-sans text-[1.25rem] font-bold text-navy-900">
                    {formatPrice(item.price, item.priceUnit)}
                  </p>
                  <p className="mt-1 text-[0.75rem] text-ink-muted">
                    Submitted {formatDate(item.createdAt)}
                    {item.reviewedAt ? ` · Reviewed ${formatDate(item.reviewedAt)}` : ""}
                  </p>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-soft pt-4 text-[0.8125rem] sm:grid-cols-4">
                <div className="flex justify-between gap-2 sm:block">
                  <dt className="text-ink-muted">Owner</dt>
                  <dd className="font-semibold text-navy-900">{item.name}</dd>
                </div>
                <div className="flex justify-between gap-2 sm:block">
                  <dt className="text-ink-muted">Contact</dt>
                  <dd className="font-semibold text-navy-900">
                    {item.phone} · <span className="font-normal">{item.email}</span>
                  </dd>
                </div>
                <div className="flex justify-between gap-2 sm:block">
                  <dt className="text-ink-muted">Size</dt>
                  <dd className="font-semibold text-navy-900">{formatArea(item.areaValue, item.areaUnit)}</dd>
                </div>
                <div className="flex justify-between gap-2 sm:block">
                  <dt className="text-ink-muted">Beds / Baths / Parking</dt>
                  <dd className="font-semibold text-navy-900">
                    {item.bedrooms} / {item.bathrooms} / {item.parking}
                  </dd>
                </div>
                <div className="flex justify-between gap-2 sm:block">
                  <dt className="text-ink-muted">Pin</dt>
                  <dd className="font-semibold tabular-nums text-navy-900">
                    {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                  </dd>
                </div>
                <div className="flex justify-between gap-2 sm:block">
                  <dt className="text-ink-muted">Furnishing</dt>
                  <dd className="font-semibold text-navy-900">{item.furnishing}</dd>
                </div>
                <div className="flex justify-between gap-2 sm:block">
                  <dt className="text-ink-muted">Possession</dt>
                  <dd className="font-semibold text-navy-900">{item.possession}</dd>
                </div>
                <div className="flex justify-between gap-2 sm:block">
                  <dt className="text-ink-muted">Photos</dt>
                  <dd className="font-semibold text-navy-900">
                    {item.imageUrls.length > 0 ? `${item.imageUrls.length} attached` : "None attached"}
                  </dd>
                </div>
              </dl>

              {item.description && (
                <p className="mt-3 line-clamp-3 text-[0.875rem] leading-relaxed text-ink">{item.description}</p>
              )}
              {(item.features.length > 0 || item.amenities.length > 0) && (
                <p className="mt-2 text-[0.75rem] text-ink-muted">
                  {[...item.features, ...item.amenities].slice(0, 8).join(" · ")}
                </p>
              )}
              {item.imageUrls.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {item.imageUrls.slice(0, 6).map((url) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <img src={url} alt="" width={160} height={120} loading="lazy" className="h-[68px] w-[96px] rounded-lg border border-soft object-cover" />
                    </a>
                  ))}
                </div>
              )}

              {item.status === "pending" ? (
                <div className="mt-5 border-t border-soft pt-4">
                  <label
                    htmlFor={`note-${item.id}`}
                    className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-muted"
                  >
                    Admin note (optional — shown in record)
                  </label>
                  <input
                    id={`note-${item.id}`}
                    value={notes[item.id] ?? ""}
                    onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                    className="field mt-2"
                    placeholder="e.g. Called owner, details confirmed"
                  />
                  <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
                    <button
                      type="button"
                      disabled={acting === item.id}
                      onClick={() => review(item.id, "approve")}
                      className="btn btn-green flex-1 disabled:opacity-60"
                    >
                      <IconCheck className="h-4 w-4" />
                      {acting === item.id ? "Publishing…" : "Approve & publish"}
                    </button>
                    <button
                      type="button"
                      disabled={acting === item.id}
                      onClick={() => review(item.id, "reject")}
                      className="btn btn-outline flex-1 !border-red-200 !text-red-700 hover:!border-red-400 disabled:opacity-60"
                    >
                      <IconClose className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-soft pt-4 text-[0.8125rem] text-ink-muted">
                  {item.adminNote && (
                    <span>
                      Note: <span className="font-medium text-navy-900">{item.adminNote}</span>
                    </span>
                  )}
                  {item.status === "approved" && item.propertyId && (
                    <Link href="/properties" className="font-semibold text-forest-700 hover:text-forest-600">
                      View live in listings →
                    </Link>
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
