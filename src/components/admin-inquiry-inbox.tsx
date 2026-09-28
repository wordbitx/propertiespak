"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconArrowRight, IconCalendar, IconCheck, IconChevronDown, IconMail, IconPhone, IconSearch, IconWhatsApp } from "@/components/icons";
import { contactDigits, INQUIRY_LABELS, INQUIRY_STATUSES, INQUIRY_TYPES, type InboxItem, type InboxResponse, type InquiryStatus } from "@/lib/inquiry-options";

function timestamp(value: string) {
  return new Date(value).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" });
}
function Status({ status }: { status: string }) {
  const color = status === "new" ? "border-amber-200 bg-amber-50 text-amber-800" : status === "contacted" ? "border-blue-200 bg-blue-50 text-blue-800" : "border-soft bg-mist text-ink-muted";
  return <span className={`rounded-md border px-2 py-1 text-[0.625rem] font-bold uppercase tracking-[0.1em] ${color}`}>{status}</span>;
}

function FollowUp({ inquiry, onSaved }: { inquiry: InboxItem; onSaved: () => void }) {
  const [status, setStatus] = useState<InquiryStatus>(INQUIRY_STATUSES.includes(inquiry.status as InquiryStatus) ? inquiry.status as InquiryStatus : "new");
  const [note, setNote] = useState(inquiry.adminNote);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true); setError("");
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, adminNote: note }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not save follow-up.");
      onSaved();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save follow-up."); }
    finally { setSaving(false); }
  }
  return (
    <form onSubmit={save} className="min-w-0 rounded-xl border border-soft bg-mist p-4">
      <h3 className="font-sans text-[0.9375rem] font-semibold text-navy-900">Admin follow-up</h3>
      <label className="mt-4 block text-[0.75rem] font-semibold text-ink-muted" htmlFor={`enquiry-status-${inquiry.id}`}>Status</label>
      <select id={`enquiry-status-${inquiry.id}`} value={status} onChange={(event) => setStatus(event.target.value as InquiryStatus)} className="field mt-2">
        <option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option>
      </select>
      <label className="mt-4 block text-[0.75rem] font-semibold text-ink-muted" htmlFor={`enquiry-note-${inquiry.id}`}>Internal notes</label>
      <textarea id={`enquiry-note-${inquiry.id}`} value={note} maxLength={3000} rows={4} onChange={(event) => setNote(event.target.value)} className="field mt-2 resize-y" placeholder="Record your call, next steps or visit confirmation…" />
      <p className="mt-2 text-[0.6875rem] leading-5 text-ink-muted">Visible only to admins. Saving a status does not send an email or confirm a visit automatically.</p>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={saving} className="btn btn-primary mt-4 w-full disabled:opacity-60"><IconCheck className="h-4 w-4" />{saving ? "Saving…" : "Save follow-up"}</button>
      {inquiry.reviewedAt && <p className="mt-3 text-[0.6875rem] text-ink-muted">Last updated {timestamp(inquiry.reviewedAt)} PKT</p>}
    </form>
  );
}

function InquiryDetails({ item, onSaved }: { item: InboxItem; onSaved: () => void }) {
  const digits = contactDigits(item.phone);
  const reference = `PP-ENQ-${String(item.id).padStart(6, "0")}`;
  const whatsappMessage = encodeURIComponent(`Hi ${item.name}, I am following up on your Pak Property ${item.type === "visit" ? "visit request" : "enquiry"}${item.propertyTitle ? ` for ${item.propertyTitle}` : ""}. Reference ${reference}.`);
  return (
    <div className="mt-5 grid min-w-0 gap-6 border-t border-soft pt-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <dl className="grid min-w-0 gap-x-6 gap-y-4 sm:grid-cols-2">
          {[
            ["Client name", item.name], ["Email", item.email], ["Phone / WhatsApp", item.phone || "Not supplied"],
            ["Request type", INQUIRY_LABELS[item.type] || item.type], ["Budget", item.budget || "Not supplied"],
            ["Preferred visit date", item.preferredDate || "Not requested"], ["City", item.cityName || "Not supplied"],
            ["Received (PKT)", timestamp(item.createdAt)], ["Reference", reference], ["Source", item.source],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">{label}</dt>
              <dd className="mt-1 break-words text-[0.875rem] font-medium leading-6 text-navy-900">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 rounded-lg border border-soft p-4">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">Property / project</p>
          {item.propertyUrl || item.projectUrl ? (
            <Link href={item.propertyUrl || item.projectUrl!} target="_blank" className="mt-2 inline-flex items-start gap-2 break-words text-[0.875rem] font-semibold text-forest-700 hover:underline">
              {item.propertyTitle || item.propertySlug || item.projectSlug}<IconArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
            </Link>
          ) : <p className="mt-2 break-words text-[0.875rem] text-navy-900">{item.propertyTitle || "General enquiry — no property selected"}</p>}
          {(item.propertySlug || item.projectSlug) && <p className="mt-2 break-all font-mono text-[0.6875rem] text-ink-muted">{item.propertySlug || item.projectSlug}{!item.propertyUrl && !item.projectUrl ? " (listing no longer available)" : ""}</p>}
        </div>
        <div className="mt-5">
          <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">Full client message</h3>
          <p className="mt-2 whitespace-pre-wrap break-words rounded-lg border border-soft bg-white p-4 text-[0.875rem] leading-7 text-ink">{item.message || "No additional message was supplied."}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {digits && <a href={`tel:+${digits}`} className="btn btn-outline text-[0.8125rem]"><IconPhone className="h-4 w-4" />Call client</a>}
          {digits && <a href={`https://wa.me/${digits}?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer" className="btn btn-green text-[0.8125rem]"><IconWhatsApp className="h-4 w-4" />WhatsApp</a>}
          <a href={`mailto:${item.email}?subject=${encodeURIComponent(`Pak Property enquiry ${reference}`)}`} className="btn btn-outline text-[0.8125rem]"><IconMail className="h-4 w-4" />Email client</a>
        </div>
      </div>
      <div className="min-w-0"><FollowUp key={`${item.id}-${item.reviewedAt}`} inquiry={item} onSaved={onSaved} /></div>
    </div>
  );
}

export function AdminInquiryInbox({ onNewCount }: { onNewCount?: (count: number) => void }) {
  const [data, setData] = useState<InboxResponse | null>(null);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [tick, setTick] = useState(0);
  const [openId, setOpenId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true); setError("");
      try {
        const params = new URLSearchParams({ q: query, type, status, page: String(page) });
        const response = await fetch(`/api/admin/inquiries?${params}`, { cache: "no-store", signal: controller.signal });
        const payload = await response.json() as InboxResponse;
        if (!response.ok || !payload.ok) throw new Error(payload.error || "Could not load enquiries.");
        if (controller.signal.aborted) return;
        setData(payload); onNewCount?.(payload.stats.new);
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not load enquiries.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }, query ? 250 : 0);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [query, type, status, page, tick, onNewCount]);

  function refreshed() { setNotice("Follow-up saved."); setTick((value) => value + 1); }
  const stats = data?.stats;

  return (
    <div className="min-w-0" data-testid="admin-inquiry-inbox">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "All requests", value: stats?.total }, { label: "New enquiries", value: stats?.new },
          { label: "Visit requests", value: stats?.visits }, { label: "Contacted", value: stats?.contacted },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-soft bg-white p-4">
            <p className="text-[0.625rem] font-bold uppercase tracking-[0.13em] text-ink-muted">{stat.label}</p>
            <p className="mt-2 font-sans text-[1.75rem] font-bold leading-none text-navy-900">{stat.value ?? "—"}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid min-w-0 items-end gap-3 rounded-panel border border-soft bg-white p-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <label className="text-[0.75rem] font-semibold text-ink-muted" htmlFor="inbox-search">Search client or property</label>
          <div className="relative mt-2">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input id="inbox-search" className="field pl-9" value={query} placeholder="Name, phone, email or message" onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
          </div>
        </div>
        <div><label className="text-[0.75rem] font-semibold text-ink-muted" htmlFor="inbox-type">Request type</label>
          <select id="inbox-type" className="field mt-2" value={type} onChange={(event) => { setType(event.target.value); setPage(1); }}>
            <option value="">All request types</option>{INQUIRY_TYPES.map((value) => <option key={value} value={value}>{INQUIRY_LABELS[value]}</option>)}
          </select>
        </div>
        <div><label className="text-[0.75rem] font-semibold text-ink-muted" htmlFor="inbox-status">Follow-up status</label>
          <select id="inbox-status" className="field mt-2" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
            <option value="">All statuses</option>{INQUIRY_STATUSES.map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}
          </select>
        </div>
        <button type="button" onClick={() => setTick((value) => value + 1)} className="btn btn-outline" disabled={loading}>{loading ? "Loading…" : "Refresh inbox"}</button>
      </div>
      {notice && <p role="status" className="mt-4 flex items-center gap-2 rounded-lg bg-forest-50 p-3 text-[0.8125rem] text-forest-700"><IconCheck className="h-4 w-4" />{notice}</p>}
      {error && <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-[0.875rem] text-red-800">{error} <Link className="underline" href="/admin/login">Admin sign in</Link></div>}
      {loading && !data ? <p role="status" className="py-12 text-center text-sm text-ink-muted">Loading client requests…</p> : data?.items.length === 0 ? (
        <div className="mt-5 rounded-panel border border-soft bg-white px-6 py-10 text-center">
          <IconMail className="mx-auto h-7 w-7 text-forest-600" />
          <h2 className="mt-4 font-sans text-lg font-semibold text-navy-900">No enquiries match these filters</h2>
          <p className="mt-2 text-[0.875rem] text-ink-muted">Enquiry and visit forms automatically save new requests here. Click Refresh to check for new submissions.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-4" aria-busy={loading}>
          {data?.items.map((item) => {
            const expanded = openId === item.id;
            return (
              <article key={item.id} className={`min-w-0 rounded-panel border bg-white p-5 shadow-soft sm:p-6 ${item.status === "new" ? "border-l-[3px] border-l-forest-600 border-t-soft border-r-soft border-b-soft" : "border-soft"}`}>
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><Status status={item.status} /><span className="text-[0.6875rem] font-semibold text-ink-muted">{INQUIRY_LABELS[item.type] || item.type}</span><span className="text-[0.6875rem] text-ink-muted">#{item.id}</span></div>
                    <h2 className="mt-3 break-words font-sans text-[1.05rem] font-bold text-navy-900">{item.name}</h2>
                    <p className="mt-1 break-words text-[0.8125rem] leading-6 text-ink-muted">{item.propertyTitle || "General enquiry"}</p>
                    <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] text-ink">{item.phone && <span>{item.phone}</span>}<span className="break-all">{item.email}</span></p>
                    {item.type === "visit" && item.preferredDate && <p className="mt-2 flex items-center gap-1.5 text-[0.75rem] font-semibold text-forest-700"><IconCalendar className="h-4 w-4" />Requested visit: {item.preferredDate}</p>}
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end"><p className="text-[0.6875rem] text-ink-muted">{timestamp(item.createdAt)} PKT</p>
                    <button type="button" aria-expanded={expanded} aria-controls={`inquiry-details-${item.id}`} onClick={() => setOpenId(expanded ? null : item.id)} className="btn btn-outline px-3.5 py-2.5 text-[0.8125rem]">
                      {expanded ? "Hide details" : "View full details"}<IconChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </div>
                {expanded && <div id={`inquiry-details-${item.id}`}><InquiryDetails item={item} onSaved={refreshed} /></div>}
              </article>
            );
          })}
        </div>
      )}
      {data && data.pages > 1 && <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[0.8125rem] text-ink-muted">
        <p>{data.total} requests · Page {page} of {data.pages}</p><div className="flex gap-2"><button className="btn btn-outline" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Previous</button><button className="btn btn-outline" disabled={page >= data.pages || loading} onClick={() => setPage((value) => value + 1)}>Next</button></div>
      </div>}
    </div>
  );
}
