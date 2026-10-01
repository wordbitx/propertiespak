"use client";

import { ResilientImage } from "@/components/resilient-image";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconArrowRight, IconCheck, IconClose, IconEye, IconTrash, IconUpload } from "@/components/icons";
import { formatDate, formatPrice } from "@/lib/format";

/** A listing the signed-in account has published. */
export type OwnerListing = {
  id: number;
  slug: string;
  title: string;
  cityName: string;
  locationArea: string;
  propertyType: string;
  price: number;
  priceUnit: string;
  coverImage: string;
  views: number;
  published: boolean;
};

/** A listing still moving through the admin review queue. */
export type OwnerSubmission = {
  id: number;
  title: string;
  cityName: string;
  locationArea: string;
  propertyType: string;
  price: number;
  priceUnit: string;
  imageUrls: string[];
  status: string;
  adminNote: string;
  createdAt: string;
};

type Pending =
  | { kind: "unpublish" | "delete" | "submission-delete"; id: number }
  | null;

function priceLine(price: number, priceUnit: string) {
  return formatPrice(price, priceUnit);
}

function Badge({ tone, children }: { tone: "live" | "hidden" | "pending" | "rejected"; children: React.ReactNode }) {
  const styles =
    tone === "live"
      ? "border-forest-600/25 bg-forest-600/10 text-forest-700"
      : tone === "hidden"
        ? "border-navy-200 bg-mist text-navy-800"
        : tone === "pending"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-red-200 bg-red-50 text-red-700";
  return (
    <span
      className={`shrink-0 rounded-md border px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] ${styles}`}
    >
      {children}
    </span>
  );
}

function ActionButton({
  children,
  onClick,
  tone = "quiet",
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: "quiet" | "danger";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 py-1.5 font-sans text-[0.75rem] font-semibold transition-colors disabled:opacity-50 ${
        tone === "danger"
          ? "border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
          : "border-soft text-navy-900 hover:border-navy-200 hover:bg-mist"
      }`}
    >
      {children}
    </button>
  );
}

function ConfirmBar({
  question,
  confirmLabel,
  busy,
  onCancel,
  onConfirm,
}: {
  question: string;
  confirmLabel: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-soft bg-mist px-3 py-2.5">
      <p className="text-[0.75rem] font-medium text-navy-900">{question}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-1.5 font-sans text-[0.75rem] font-semibold text-white transition-colors hover:bg-navy-800 disabled:opacity-60"
        >
          {busy ? "Working…" : confirmLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-soft bg-white px-3 py-1.5 font-sans text-[0.75rem] font-semibold text-navy-900 transition-colors hover:border-navy-200 disabled:opacity-60"
        >
          Keep it
        </button>
      </div>
    </div>
  );
}

/**
 * Owner-side listing manager for the account dashboard.
 *
 * Owners see everything they posted — live, hidden and in-review — and control
 * it here: hide a published listing without losing its photos or enquiries,
 * publish it again later, or delete it permanently. Erasing asks twice.
 */
export function AccountListings({
  listings,
  submissions,
}: {
  listings: OwnerListing[];
  submissions: OwnerSubmission[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(listings);
  const [queue, setQueue] = useState(submissions);
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState<Pending>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const liveCount = rows.filter((row) => row.published).length;
  const hiddenCount = rows.length - liveCount;
  const pendingCount = queue.filter((item) => item.status === "pending").length;
  const rejectedCount = queue.filter((item) => item.status === "rejected").length;

  async function call(url: string, init: RequestInit, success: string) {
    setError("");
    setNotice("");
    try {
      const response = await fetch(url, init);
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Something went wrong. Please try again.");
        return false;
      }
      setNotice(success);
      router.refresh();
      return true;
    } catch {
      setError("Network error. Please check your connection and try again.");
      return false;
    }
  }

  async function setVisibility(listing: OwnerListing, publish: boolean) {
    setBusy({ kind: "unpublish", id: listing.id });
    const done = await call(
      `/api/account/properties/${listing.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: publish ? "publish" : "unpublish" }),
      },
      publish ? "Listing published again — it is back on the site." : "Listing hidden from the public site.",
    );
    if (done) setRows((current) => current.map((row) => (row.id === listing.id ? { ...row, published: publish } : row)));
    setPending(null);
    setBusy(null);
  }

  async function deleteListing(listing: OwnerListing) {
    setBusy({ kind: "delete", id: listing.id });
    const done = await call(
      `/api/account/properties/${listing.id}`,
      { method: "DELETE" },
      "Listing deleted permanently.",
    );
    if (done) setRows((current) => current.filter((row) => row.id !== listing.id));
    setPending(null);
    setBusy(null);
  }

  async function deleteSubmission(id: number) {
    setBusy({ kind: "submission-delete", id });
    const done = await call(
      `/api/account/submissions/${id}`,
      { method: "DELETE" },
      "Submission withdrawn.",
    );
    if (done) setQueue((current) => current.filter((item) => item.id !== id));
    setPending(null);
    setBusy(null);
  }

  return (
    <div data-testid="account-listings">
      <h2 id="your-listings" className="mt-2 scroll-mt-28 font-sans text-[1.15rem] font-bold text-navy-900">
        Your listings{" "}
        <span className="font-normal text-ink-muted">
          ({liveCount} live
          {hiddenCount > 0 ? ` · ${hiddenCount} hidden` : ""}
          {pendingCount > 0 ? ` · ${pendingCount} in review` : ""}
          {rejectedCount > 0 ? ` · ${rejectedCount} not approved` : ""})
        </span>
      </h2>
      <p className="mt-2 max-w-2xl text-[0.8125rem] leading-6 text-ink-muted">
        Everything you posted from this account lives here. Hide a listing to take it off the public site without losing
        its photos or enquiries, publish it again whenever you are ready, or delete it permanently.
      </p>

      {notice && (
        <p role="status" className="mt-4 flex items-center gap-2 rounded-lg bg-forest-50 p-3 text-[0.8125rem] text-forest-700">
          <IconCheck className="h-4 w-4 shrink-0" />
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-[0.8125rem] text-red-800">
          <IconClose className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {rows.length === 0 && queue.length === 0 ? (
        <div className="mt-4 rounded-panel border border-soft bg-mist p-6">
          <p className="text-[0.9rem] leading-relaxed text-ink-muted">
            You have not listed a property from this account yet. Everything you publish appears here with its live link,
            views and controls you can use any time.
          </p>
          <Link href="/list-property" className="btn btn-primary mt-4">
            List a property <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-3.5">
          {rows.map((item) => (
            <article key={`live-${item.id}`} className="rounded-xl border border-soft bg-white p-3">
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <ResilientImage
                  src={item.coverImage}
                  alt={`${item.title}, ${item.locationArea}`}
                  width={280}
                  height={210}
                  loading="lazy"
                  decoding="async"
                  className="h-[74px] w-[104px] shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/property/${item.slug}`}
                    className="line-clamp-1 font-sans text-[0.9375rem] font-semibold text-navy-900 hover:text-forest-700"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-0.5 truncate text-[0.8125rem] text-ink-muted">
                    {item.locationArea}, {item.cityName} · {item.propertyType}
                  </p>
                  <p className="mt-1 text-[0.8125rem] font-semibold text-forest-700">
                    {priceLine(item.price, item.priceUnit)} · {item.views.toLocaleString("en-PK")} views
                  </p>
                </div>
                <Badge tone={item.published ? "live" : "hidden"}>{item.published ? "Live" : "Hidden"}</Badge>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-soft pt-3">
                {item.published ? (
                  <ActionButton onClick={() => setPending({ kind: "unpublish", id: item.id })}>
                    <IconEye className="h-3.5 w-3.5" /> Hide from site
                  </ActionButton>
                ) : (
                  <ActionButton onClick={() => setVisibility(item, true)} disabled={busy?.kind === "unpublish"}>
                    <IconUpload className="h-3.5 w-3.5" /> Publish again
                  </ActionButton>
                )}
                <ActionButton tone="danger" onClick={() => setPending({ kind: "delete", id: item.id })}>
                  <IconTrash className="h-3.5 w-3.5" /> Delete
                </ActionButton>
                {item.slug && (
                  <Link
                    href={`/property/${item.slug}`}
                    className="ml-auto inline-flex min-h-9 items-center gap-1.5 font-sans text-[0.75rem] font-semibold text-navy-800 hover:text-forest-700"
                  >
                    View listing <IconArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>

              {pending?.kind === "unpublish" && pending.id === item.id && (
                <ConfirmBar
                  question="Hide this listing from the public site? You can publish it again any time."
                  confirmLabel="Yes, hide it"
                  busy={busy?.id === item.id}
                  onCancel={() => setPending(null)}
                  onConfirm={() => setVisibility(item, false)}
                />
              )}
              {pending?.kind === "delete" && pending.id === item.id && (
                <ConfirmBar
                  question="Delete this listing permanently? Photos, views and enquiries cannot be recovered."
                  confirmLabel="Yes, delete it"
                  busy={busy?.id === item.id}
                  onCancel={() => setPending(null)}
                  onConfirm={() => deleteListing(item)}
                />
              )}
            </article>
          ))}

          {queue.map((item) => (
            <article key={`sub-${item.id}`} className="rounded-xl border border-soft bg-white p-3">
              <div className="flex items-start gap-4">
                {item.imageUrls[0] ? (
                        <ResilientImage
                    src={item.imageUrls[0]}
                    alt={item.title}
                    width={280}
                    height={210}
                    loading="lazy"
                    decoding="async"
                    className="h-[74px] w-[104px] shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="grid h-[74px] w-[104px] shrink-0 place-items-center rounded-lg bg-mist text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                    No photo
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-sans text-[0.9375rem] font-semibold text-navy-900">{item.title}</p>
                  <p className="mt-0.5 truncate text-[0.8125rem] text-ink-muted">
                    {item.locationArea}, {item.cityName} · {item.propertyType}
                  </p>
                  <p className="mt-1 text-[0.8125rem] text-ink-muted">
                    {priceLine(item.price, item.priceUnit)} · submitted {formatDate(new Date(item.createdAt))}
                  </p>
                  {item.status === "rejected" && item.adminNote && (
                    <p className="mt-1.5 text-[0.8125rem] text-red-700">Reviewer note: {item.adminNote}</p>
                  )}
                </div>
                <Badge tone={item.status === "pending" ? "pending" : "rejected"}>
                  {item.status === "pending" ? "In review" : "Not approved"}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-soft pt-3">
                <ActionButton tone="danger" onClick={() => setPending({ kind: "submission-delete", id: item.id })}>
                  <IconTrash className="h-3.5 w-3.5" /> {item.status === "pending" ? "Withdraw submission" : "Remove"}
                </ActionButton>
              </div>

              {pending?.kind === "submission-delete" && pending.id === item.id && (
                <ConfirmBar
                  question="Remove this submission from the review queue?"
                  confirmLabel="Yes, remove it"
                  busy={busy?.id === item.id}
                  onCancel={() => setPending(null)}
                  onConfirm={() => deleteSubmission(item.id)}
                />
              )}
            </article>
          ))}

          {rows.length === 0 && queue.length > 0 && (
            <p className="text-[0.8125rem] leading-relaxed text-ink-muted">
              Your listing is in the review queue — our team checks the details, then publishes it here with a live link
              you can share.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
