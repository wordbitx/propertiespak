"use client";

import { ResilientImage } from "@/components/resilient-image";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { IconArrowRight, IconCheck, IconClose, IconShield, IconSpark } from "@/components/icons";

export type ProfileUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  bio: string;
  experience: string;
  areas: string;
  avatarUrl: string;
  agency: string;
  designation: string;
  officeAddress: string;
  citySlug: string;
  cityName: string;
  companyPhone: string;
  companyWebsite: string;
  companyLogo: string;
  verificationNote: string;
  isVerified: boolean;
  profileCompletedAt: string | null;
  verificationRequestedAt: string | null;
};

const CITIES = [
  { slug: "lahore", name: "Lahore" },
  { slug: "karachi", name: "Karachi" },
  { slug: "islamabad", name: "Islamabad" },
  { slug: "rawalpindi", name: "Rawalpindi" },
  { slug: "faisalabad", name: "Faisalabad" },
  { slug: "multan", name: "Multan" },
  { slug: "gujranwala", name: "Gujranwala" },
  { slug: "peshawar", name: "Peshawar" },
];

const AREA_SUGGESTIONS = [
  "DHA Lahore",
  "Bahria Town Lahore",
  "Gulberg",
  "Johar Town",
  "Model Town",
  "Lake City",
  "DHA Islamabad",
  "Bahria Town Karachi",
  "Clifton Karachi",
  "DHA Multan",
];

const SKIP_KEY = "pp-profile-skip";

type Fields = Omit<ProfileUser, "id" | "email" | "phone" | "isVerified" | "profileCompletedAt" | "verificationRequestedAt">;

function toFields(user: ProfileUser): Fields {
  return {
    name: user.name,
    whatsapp: user.whatsapp,
    bio: user.bio,
    experience: user.experience,
    areas: user.areas,
    avatarUrl: user.avatarUrl,
    agency: user.agency,
    designation: user.designation,
    officeAddress: user.officeAddress,
    citySlug: user.citySlug,
    cityName: user.cityName,
    companyPhone: user.companyPhone,
    companyWebsite: user.companyWebsite,
    companyLogo: user.companyLogo,
    verificationNote: user.verificationNote,
  };
}

/**
 * Professional profile setup. Opens automatically on the first dashboard visit
 * after signup (until the profile is completed or skipped), and can be reopened
 * any time from the dashboard to edit the same fields.
 */
export function ProfileSetupDialog({
  user,
  autoOpen = false,
  label = "Complete Profile",
  variant = "primary",
}: {
  user: ProfileUser;
  autoOpen?: boolean;
  label?: string;
  variant?: "primary" | "ghost";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<Fields>(() => toFields(user));
  const [requestVerification, setRequestVerification] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"photo" | "logo" | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const logoInput = useRef<HTMLInputElement>(null);

  // First-login prompt: only while the profile is unfinished and not skipped on
  // this browser.
  useEffect(() => {
    if (!autoOpen) return;
    if (user.profileCompletedAt) return;
    let skipped = "";
    try {
      skipped = window.localStorage.getItem(SKIP_KEY) ?? "";
    } catch {
      skipped = "";
    }
    if (skipped === String(user.id)) return;
    const timer = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(timer);
  }, [autoOpen, user.id, user.profileCompletedAt]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) close();
    };
    const previousOverflow = document.body.style.overflow;
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, saving]);

  function skip() {
    try {
      window.localStorage.setItem(SKIP_KEY, String(user.id));
    } catch {
      /* storage blocked — the prompt simply shows again next visit */
    }
    close();
  }

  function close() {
    setOpen(false);
    setError("");
    setNotice("");
  }

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  async function upload(file: File | undefined, kind: "photo" | "logo") {
    if (!file) return;
    setUploading(kind);
    setError("");
    try {
      const form = new FormData();
      form.append("images", file);
      const response = await fetch("/api/media/upload", { method: "POST", body: form });
      const payload = (await response.json()) as { ok?: boolean; images?: { url: string }[]; error?: string };
      if (!response.ok || !payload.ok || !payload.images?.length) {
        setError(payload.error ?? "Could not upload that image.");
        return;
      }
      set(kind === "photo" ? "avatarUrl" : "companyLogo", payload.images[0].url);
      setNotice(`${kind === "photo" ? "Profile photo" : "Company logo"} uploaded.`);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(null);
    }
  }

  async function submit(mode: "complete" | "save" | "verify") {
    if (fields.name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          markComplete: mode === "complete" || mode === "verify",
          requestVerification: mode === "verify" || (mode !== "save" && requestVerification),
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Could not save your profile.");
        return;
      }
      if (mode === "save") {
        setNotice("Profile saved.");
        router.refresh();
        return;
      }
      try {
        window.localStorage.setItem(SKIP_KEY, String(user.id));
      } catch {
        /* ignore */
      }
      router.refresh();
      setOpen(false);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const complete = Boolean(user.profileCompletedAt);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          variant === "primary"
            ? "btn btn-primary min-h-11"
            : "inline-flex min-h-11 items-center gap-2 font-sans text-[0.875rem] font-semibold text-forest-700 hover:text-forest-600"
        }
      >
        {complete ? "Edit professional profile" : label}
        {variant === "ghost" && <IconArrowRight className="h-4 w-4" />}
      </button>

      {/* Keep the overlay outside dashboard containers so it cannot be hidden or clipped. */}
      {open && createPortal(
        <div
          className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-navy-950/70 p-4 py-8 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-setup-title"
          onMouseDown={(event) => {
            if (event.target === dialogRef.current && !saving) close();
          }}
          ref={dialogRef}
        >
          <div className="w-full max-w-3xl rounded-panel border border-soft bg-white shadow-card">
            <div className="flex items-start justify-between gap-4 border-b border-soft px-5 py-4 sm:px-7 sm:py-5">
              <div className="min-w-0">
                <p className="eyebrow text-forest-700">
                  <IconSpark className="h-3.5 w-3.5" /> Dealer profile
                </p>
                <h2 id="profile-setup-title" className="mt-2 font-sans text-[1.25rem] font-bold text-navy-900 sm:text-[1.4rem]">
                  Complete Your Professional Profile
                </h2>
                <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-muted">
                  Build your profile to appear as a verified dealer on our platform.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close profile setup"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-soft text-ink-muted transition-colors hover:border-navy-100 hover:text-navy-900"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-5 py-5 sm:px-7">
              {/* Personal profile */}
              <section>
                <h3 className="font-sans text-[0.9375rem] font-bold text-navy-900">Personal Profile</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
                  <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                    <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border border-soft bg-mist font-sans text-[1.1rem] font-bold text-navy-900">
                      {fields.avatarUrl ? (
                                    <ResilientImage src={fields.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (fields.name.trim()[0] ?? "P").toUpperCase()
                      )}
                    </span>
                    <span className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => photoInput.current?.click()}
                        disabled={uploading === "photo"}
                        className="rounded-lg border border-soft px-3 py-2 text-[0.75rem] font-semibold text-navy-900 transition-colors hover:border-navy-800 disabled:opacity-60"
                      >
                        {uploading === "photo" ? "Uploading…" : "Profile Photo"}
                      </button>
                      {fields.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => set("avatarUrl", "")}
                          className="text-[0.6875rem] font-semibold text-ink-muted hover:text-red-600"
                        >
                          Remove photo
                        </button>
                      )}
                    </span>
                    <input
                      ref={photoInput}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif"
                      className="hidden"
                      onChange={(event) => upload(event.target.files?.[0], "photo")}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="field-label">Full Name *</span>
                      <input
                        className="field"
                        value={fields.name}
                        onChange={(event) => set("name", event.target.value)}
                        placeholder="e.g. Ahmed Raza"
                        autoComplete="name"
                      />
                    </label>
                    <label className="block">
                      <span className="field-label">WhatsApp Number</span>
                      <input
                        className="field"
                        value={fields.whatsapp}
                        onChange={(event) => set("whatsapp", event.target.value)}
                        placeholder="+92 300 0000000"
                        inputMode="tel"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="field-label">Short Bio</span>
                      <textarea
                        className="field min-h-[92px]"
                        value={fields.bio}
                        onChange={(event) => set("bio", event.target.value)}
                        placeholder="Two or three lines about the areas you know and how you work with buyers."
                      />
                    </label>
                    <label className="block">
                      <span className="field-label">Experience</span>
                      <input
                        className="field"
                        value={fields.experience}
                        onChange={(event) => set("experience", event.target.value)}
                        placeholder="e.g. 9 years in DHA and Bahria Town"
                      />
                    </label>
                    <label className="block">
                      <span className="field-label">Areas You Deal In</span>
                      <input
                        className="field"
                        value={fields.areas}
                        onChange={(event) => set("areas", event.target.value)}
                        placeholder="DHA Lahore, Bahria Town, Gulberg"
                        list="profile-area-suggestions"
                      />
                      <datalist id="profile-area-suggestions">
                        {AREA_SUGGESTIONS.map((area) => (
                          <option key={area} value={area} />
                        ))}
                      </datalist>
                    </label>
                  </div>
                </div>
              </section>

              {/* Business information */}
              <section className="mt-7 border-t border-soft pt-6">
                <h3 className="font-sans text-[0.9375rem] font-bold text-navy-900">Business Information</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="field-label">Agency / Company Name</span>
                    <input
                      className="field"
                      value={fields.agency}
                      onChange={(event) => set("agency", event.target.value)}
                      placeholder="e.g. City Estate Advisors"
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">Designation</span>
                    <input
                      className="field"
                      value={fields.designation}
                      onChange={(event) => set("designation", event.target.value)}
                      placeholder="e.g. Sales Director"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="field-label">Office Address</span>
                    <input
                      className="field"
                      value={fields.officeAddress}
                      onChange={(event) => set("officeAddress", event.target.value)}
                      placeholder="Office / shop address"
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">City</span>
                    <select
                      className="field"
                      value={fields.citySlug}
                      onChange={(event) => {
                        const city = CITIES.find((item) => item.slug === event.target.value);
                        set("citySlug", city?.slug ?? "");
                        set("cityName", city?.name ?? "");
                      }}
                    >
                      <option value="">Select city</option>
                      {CITIES.map((city) => (
                        <option key={city.slug} value={city.slug}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="field-label">Company Phone</span>
                    <input
                      className="field"
                      value={fields.companyPhone}
                      onChange={(event) => set("companyPhone", event.target.value)}
                      placeholder="+92 42 0000000"
                      inputMode="tel"
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">Company Website</span>
                    <input
                      className="field"
                      value={fields.companyWebsite}
                      onChange={(event) => set("companyWebsite", event.target.value)}
                      placeholder="https://example.com"
                      inputMode="url"
                    />
                  </label>
                  <div className="block">
                    <span className="field-label">Company Logo</span>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-soft bg-mist">
                        {fields.companyLogo ? (
                                        <ResilientImage src={fields.companyLogo} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-[0.625rem] font-semibold uppercase tracking-wide text-ink-muted">Logo</span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => logoInput.current?.click()}
                        disabled={uploading === "logo"}
                        className="rounded-lg border border-soft px-3 py-2 text-[0.75rem] font-semibold text-navy-900 transition-colors hover:border-navy-800 disabled:opacity-60"
                      >
                        {uploading === "logo" ? "Uploading…" : "Upload logo"}
                      </button>
                      {fields.companyLogo && (
                        <button
                          type="button"
                          onClick={() => set("companyLogo", "")}
                          className="text-[0.6875rem] font-semibold text-ink-muted hover:text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      ref={logoInput}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif"
                      className="hidden"
                      onChange={(event) => upload(event.target.files?.[0], "logo")}
                    />
                  </div>
                </div>
              </section>

              {/* Verification */}
              <section className="mt-7 border-t border-soft pt-6">
                <h3 className="flex items-center gap-2 font-sans text-[0.9375rem] font-bold text-navy-900">
                  <IconShield className="h-4 w-4 text-forest-600" /> Verification
                </h3>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-muted">
                  Optional. Add the documents or references our team should check (agency registration, CNIC for the business,
                  previous listings). Verification is reviewed by our team before a blue tick is granted.
                </p>
                <label className="mt-4 block">
                  <span className="field-label">Verification documents / notes</span>
                  <textarea
                    className="field min-h-[80px]"
                    value={fields.verificationNote}
                    onChange={(event) => set("verificationNote", event.target.value)}
                    placeholder="e.g. Agency registration no. 1234, NTN, CNIC, links to past listings"
                  />
                </label>
                <label className="mt-3 flex items-start gap-2.5 text-[0.8125rem] text-navy-900">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[#10a456]"
                    checked={requestVerification}
                    onChange={(event) => setRequestVerification(event.target.checked)}
                  />
                  <span>Submit for Verification — send my profile to the Properties Pak team for the blue tick review.</span>
                </label>
                {user.verificationRequestedAt && (
                  <p className="mt-3 rounded-xl border border-forest-600/30 bg-forest-50 px-4 py-2.5 text-[0.8125rem] font-medium text-forest-700">
                    Verification requested on{" "}
                    {new Date(user.verificationRequestedAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}.
                    Our team will review your profile.
                  </p>
                )}
                {user.isVerified && (
                  <p className="mt-3 flex items-center gap-2 rounded-xl border border-forest-600/30 bg-forest-50 px-4 py-2.5 text-[0.8125rem] font-medium text-forest-700">
                    <IconCheck className="h-4 w-4" /> This account is verified.
                  </p>
                )}
              </section>

              {notice && (
                <p className="mt-5 rounded-xl border border-forest-600/30 bg-forest-50 px-4 py-3 text-[0.8125rem] font-medium text-forest-700">
                  {notice}
                </p>
              )}
              {error && (
                <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.8125rem] font-medium text-red-700">
                  {error}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-soft px-5 py-4 sm:px-7">
              <button
                type="button"
                onClick={skip}
                disabled={saving}
                className="rounded-lg border border-soft px-4 py-2.5 font-sans text-[0.8125rem] font-semibold text-navy-900 transition-colors hover:border-navy-800 disabled:opacity-60"
              >
                Skip for Now
              </button>
              <button
                type="button"
                onClick={() => submit("save")}
                disabled={saving}
                className="rounded-lg border border-soft px-4 py-2.5 font-sans text-[0.8125rem] font-semibold text-navy-900 transition-colors hover:border-navy-800 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => submit("complete")}
                disabled={saving}
                className="btn btn-primary min-h-11"
              >
                {saving ? "Saving…" : "Complete Profile"}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
