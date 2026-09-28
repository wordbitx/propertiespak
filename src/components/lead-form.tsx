"use client";

import { useId, useState } from "react";
import { IconArrowRight, IconCheck, IconMail } from "@/components/icons";
import { SITE } from "@/lib/constants";

type Variant = "property" | "visit" | "contact" | "list" | "valuation";
const PURPOSES = ["Buy", "Rent", "Sell", "Invest"];
const PROPERTY_KINDS = ["House", "Apartment", "Plot", "Office", "Shop", "Commercial Building", "Farmhouse", "Warehouse"];

export function LeadForm({
  variant = "property", propertySlug, propertyTitle, projectSlug, compact = false,
  heading, description, defaultCity = "", source = "website",
}: {
  variant?: Variant; propertySlug?: string; propertyTitle?: string; projectSlug?: string;
  compact?: boolean; heading?: string; description?: string; defaultCity?: string; source?: string;
}) {
  const prefix = useId();
  const id = (field: string) => `${prefix}-${field}`;
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", message: "", budget: "", preferredDate: "", city: defaultCity,
    propertyKind: "", purpose: "Buy", area: "", expectedPrice: "",
  });
  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (state === "loading") return;
    setState("loading"); setError("");
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: variant, ...form, propertySlug: propertySlug ?? "", propertyTitle: propertyTitle ?? "", projectSlug: projectSlug ?? "", source }),
      });
      const payload = await response.json() as { ok?: boolean; error?: string; reference?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error || "We could not save your request. Please try again.");
      setReference(payload.reference || ""); setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Please try again."); setState("error");
    }
  }

  if (state === "done") {
    return (
      <div role="status" className="min-w-0 rounded-xl border border-forest-600/25 bg-forest-50 p-5">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-forest-600 text-white"><IconCheck className="h-5 w-5" /></span>
        <h3 className="mt-4 font-sans text-[1.05rem] font-semibold text-navy-900">{variant === "visit" ? "Visit request sent to admin" : "Enquiry sent to admin"}</h3>
        <p className="mt-2 break-words text-[0.875rem] leading-7 text-ink-muted">
          Thank you, {form.name}. Your details{propertyTitle ? ` and enquiry for ${propertyTitle}` : ""} are saved in our admin inbox.
          {variant === "visit" ? ` The team will contact you about your requested date (${form.preferredDate}) before confirming the visit.` : " The team can now review your request and contact you using the details you provided."}
        </p>
        {reference && <p className="mt-3 text-[0.75rem] font-semibold text-navy-900">Reference: <span className="font-mono">{reference}</span></p>}
        <a href={`mailto:${SITE.companyEmail}?subject=${encodeURIComponent(`${SITE.name} enquiry ${reference}`)}`} className="mt-4 inline-flex max-w-full items-center gap-2 text-[0.8125rem] font-semibold text-forest-700 hover:underline"><IconMail className="h-4 w-4 shrink-0" /><span className="break-all">{SITE.companyEmail}</span></a>
      </div>
    );
  }
  const label = "block text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-muted";
  const isListing = variant === "list" || variant === "valuation";

  return (
    <form onSubmit={onSubmit} aria-label={heading || "Property enquiry"} className={compact ? "min-w-0" : "min-w-0 rounded-panel border border-soft bg-white p-5 shadow-soft sm:p-6"}>
      {heading && <h3 className="font-sans text-[1.15rem] font-semibold text-navy-900">{heading}</h3>}
      {description && <p className="mt-2 text-[0.875rem] leading-7 text-ink-muted">{description}</p>}
      <div className={`grid min-w-0 gap-4 ${heading ? "mt-5" : ""} ${compact ? "grid-cols-1" : "sm:grid-cols-2"}`}>
        <div className="min-w-0"><label className={label} htmlFor={id("name")}>Full name *</label><input id={id("name")} name="name" required autoComplete="name" maxLength={120} value={form.name} onChange={(event) => set("name", event.target.value)} className="field mt-2" placeholder="e.g. Ahmed Khan" /></div>
        <div className="min-w-0"><label className={label} htmlFor={id("phone")}>Phone / WhatsApp *</label><input id={id("phone")} name="phone" required type="tel" autoComplete="tel" maxLength={50} value={form.phone} onChange={(event) => set("phone", event.target.value)} className="field mt-2" placeholder="+92 3xx xxxxxxx" /></div>
        <div className="min-w-0"><label className={label} htmlFor={id("email")}>Email *</label><input id={id("email")} name="email" required type="email" autoComplete="email" maxLength={254} value={form.email} onChange={(event) => set("email", event.target.value)} className="field mt-2" placeholder="you@email.com" /></div>
        {(variant === "contact" || isListing) && <div className="min-w-0"><label className={label} htmlFor={id("city")}>City</label><input id={id("city")} name="city" maxLength={100} value={form.city} onChange={(event) => set("city", event.target.value)} className="field mt-2" placeholder="Lahore, Islamabad, Karachi…" /></div>}
        {variant === "visit" && <div className="min-w-0"><label className={label} htmlFor={id("date")}>Preferred visit date *</label><input id={id("date")} name="preferredDate" type="date" required min={new Date().toISOString().slice(0, 10)} value={form.preferredDate} onChange={(event) => set("preferredDate", event.target.value)} className="field mt-2" /></div>}
        {variant === "property" && <div className="min-w-0"><label className={label} htmlFor={id("budget")}>Budget (optional)</label><input id={id("budget")} name="budget" maxLength={120} value={form.budget} onChange={(event) => set("budget", event.target.value)} className="field mt-2" placeholder="PKR 4 – 6 Crore" /></div>}
        {isListing && <>
          <div className="min-w-0"><label className={label} htmlFor={id("purpose")}>I want to</label><select id={id("purpose")} value={form.purpose} onChange={(event) => set("purpose", event.target.value)} className="field mt-2">{PURPOSES.map((value) => <option key={value}>{value}</option>)}</select></div>
          <div className="min-w-0"><label className={label} htmlFor={id("kind")}>Property type</label><select id={id("kind")} value={form.propertyKind} onChange={(event) => set("propertyKind", event.target.value)} className="field mt-2"><option value="">Select type</option>{PROPERTY_KINDS.map((value) => <option key={value}>{value}</option>)}</select></div>
          <div className="min-w-0"><label className={label} htmlFor={id("area")}>Area / society</label><input id={id("area")} maxLength={200} value={form.area} onChange={(event) => set("area", event.target.value)} className="field mt-2" placeholder="DHA Phase 5, Bahria Town…" /></div>
          <div className="min-w-0"><label className={label} htmlFor={id("price")}>Expected price</label><input id={id("price")} maxLength={100} value={form.expectedPrice} onChange={(event) => set("expectedPrice", event.target.value)} className="field mt-2" placeholder="PKR 12.5 Crore" /></div>
        </>}
      </div>
      <div className="mt-4 min-w-0">
        <label className={label} htmlFor={id("message")}>{isListing ? "Property details" : variant === "visit" ? "Visit notes (optional)" : "Message"}</label>
        <textarea id={id("message")} name="message" maxLength={4000} rows={compact ? 3 : 4} value={form.message} onChange={(event) => set("message", event.target.value)} className="field mt-2 resize-y" placeholder={variant === "visit" ? "Preferred time or anything the team should know…" : "Tell us what you would like to know about this property…"} />
      </div>
      {state === "error" && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-[0.8125rem] text-red-700">{error}</p>}
      <button type="submit" disabled={state === "loading"} className="btn btn-green mt-5 w-full disabled:opacity-70">{state === "loading" ? "Sending…" : variant === "visit" ? "Request visit" : "Send enquiry"}<IconArrowRight className="h-4 w-4" /></button>
      <p className="mt-3 text-[0.6875rem] leading-5 text-ink-muted">Your request goes to the Pak Property admin team. By submitting, you agree to be contacted about it. We never sell your data.</p>
    </form>
  );
}
