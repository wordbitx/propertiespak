"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IconArrowRight, IconCheck, IconClose, IconPin, IconSearch } from "@/components/icons";
import type { Property } from "@/db/schema";
import { formatArea, formatPrice } from "@/lib/format";
import { CITY_CENTERS } from "@/lib/map-engine";
import { ListingImageUploader, type UploadedImage } from "@/components/listing-image-uploader";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { LocationPicker } from "@/components/location-picker";

const CITIES = [
  { slug: "lahore", name: "Lahore" },
  { slug: "islamabad", name: "Islamabad" },
  { slug: "karachi", name: "Karachi" },
  { slug: "rawalpindi", name: "Rawalpindi" },
  { slug: "faisalabad", name: "Faisalabad" },
  { slug: "multan", name: "Multan" },
  { slug: "gujranwala", name: "Gujranwala" },
  { slug: "peshawar", name: "Peshawar" },
];

const CATEGORIES = [
  { value: "house", label: "House", types: ["House", "Villa"] },
  { value: "apartment", label: "Apartment / Flat", types: ["Apartment", "Penthouse", "Upper Portion"] },
  { value: "plot", label: "Plot / File", types: ["Plot"] },
  { value: "office", label: "Office", types: ["Office"] },
  { value: "shop", label: "Shop / Retail", types: ["Shop"] },
  { value: "building", label: "Commercial Building", types: ["Commercial Building"] },
  { value: "warehouse", label: "Warehouse", types: ["Warehouse"] },
  { value: "farmhouse", label: "Farmhouse", types: ["Farmhouse"] },
];

const label = "text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-muted";

type FormState = {
  title: string;
  purpose: "buy" | "rent";
  category: string;
  propertyType: string;
  citySlug: string;
  locationArea: string;
  address: string;
  lat: number;
  lng: number;
  price: string;
  negotiable: boolean;
  bedrooms: string;
  bathrooms: string;
  areaValue: string;
  areaUnit: string;
  parking: string;
  furnishing: string;
  possession: string;
  description: string;
  features: string;
  amenities: string;
  featured: boolean;
  verified: boolean;
  listedByName: string;
  listedByEmail: string;
  listedByPhone: string;
  listedByWhatsapp: string;
  images: UploadedImage[];
};

const EMPTY: FormState = {
  title: "",
  purpose: "buy",
  category: "house",
  propertyType: "House",
  citySlug: "lahore",
  locationArea: "",
  address: "",
  lat: CITY_CENTERS.lahore.lat,
  lng: CITY_CENTERS.lahore.lng,
  price: "",
  negotiable: true,
  bedrooms: "0",
  bathrooms: "0",
  areaValue: "5",
  areaUnit: "marla",
  parking: "0",
  furnishing: "Unfurnished",
  possession: "Available",
  description: "",
  features: "",
  amenities: "",
  featured: false,
  verified: false,
  listedByName: "",
  listedByEmail: "",
  listedByPhone: "",
  listedByWhatsapp: "",
  images: [],
};

function toForm(property: Property): FormState {
  return {
    title: property.title,
    purpose: property.purpose === "rent" ? "rent" : "buy",
    category: property.category,
    propertyType: property.propertyType,
    citySlug: property.citySlug,
    locationArea: property.locationArea,
    address: property.address,
    lat: property.lat,
    lng: property.lng,
    price: String(property.price),
    negotiable: property.negotiable,
    bedrooms: String(property.bedrooms),
    bathrooms: String(property.bathrooms),
    areaValue: String(property.areaValue),
    areaUnit: property.areaUnit,
    parking: String(property.parking),
    furnishing: property.furnishing,
    possession: property.possession,
    description: property.description,
    features: property.features.join(", "),
    amenities: property.amenities.join(", "),
    featured: property.featured,
    verified: property.verified,
    listedByName: property.listedByName,
    listedByEmail: property.listedByEmail,
    listedByPhone: property.listedByPhone,
    listedByWhatsapp: property.listedByWhatsapp,
    images: (property.images.length ? property.images : [property.coverImage]).filter(Boolean).map((url, index) => ({
      id: -(index + 1),
      url,
      name: `image-${index + 1}`,
      size: 0,
    })),
  };
}

export function AdminPropertyManager() {
  const [items, setItems] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<Property | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async (search: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/properties?q=${encodeURIComponent(search)}`);
      const payload = (await response.json()) as { ok?: boolean; items?: Property[]; total?: number; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Could not load properties.");
        return;
      }
      setItems(payload.items ?? []);
      setTotal(payload.total ?? 0);
    } catch {
      setError("Network error while loading properties.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => load(query), 300);
    return () => window.clearTimeout(timer);
  }, [query, load]);

  const cityName = useMemo(() => CITIES.find((city) => city.slug === form.citySlug)?.name ?? "Lahore", [form.citySlug]);
  const typeOptions = useMemo(() => CATEGORIES.find((c) => c.value === form.category)?.types ?? ["House"], [form.category]);
  const isOpen = creating || editing !== null;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startCreate() {
    setEditing(null);
    setForm(EMPTY);
    setCreating(true);
    setNotice("");
    setError("");
  }

  function startEdit(property: Property) {
    setCreating(false);
    setEditing(property);
    setForm(toForm(property));
    setNotice("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
    setForm(EMPTY);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        cityName,
        price: Number(form.price),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        areaValue: Number(form.areaValue),
        parking: Number(form.parking),
        images: form.images.map((image) => image.url),
      };
      const response = await fetch(editing ? `/api/admin/properties/${editing.id}` : "/api/admin/properties", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string; property?: { slug: string } };
      if (!response.ok || !result.ok) {
        setError(result.error ?? "Could not save the property.");
        return;
      }
      setNotice(editing ? `Property updated: /property/${result.property?.slug}` : `Property published: /property/${result.property?.slug}`);
      closeForm();
      await load(query);
    } catch {
      setError("Network error while saving.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(property: Property) {
    if (!window.confirm(`Delete "${property.title}" permanently? This cannot be undone.`)) return;
    setDeleting(property.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/properties/${property.id}`, { method: "DELETE" });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        setError(result.error ?? "Could not delete the property.");
        return;
      }
      setNotice(`Deleted: ${property.title}`);
      if (editing?.id === property.id) closeForm();
      await load(query);
    } catch {
      setError("Network error while deleting.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      {notice && (
        <p className="mb-4 flex items-center gap-2 rounded-lg border border-forest-500/40 bg-forest-50 px-4 py-3 text-[0.875rem] text-forest-700">
          <IconCheck className="h-4 w-4" /> {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-[0.875rem] text-red-700">
          {error}
        </p>
      )}

      {isOpen && (
        <form onSubmit={save} className="mb-8 rounded-panel border border-soft bg-white p-5 shadow-card sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow text-forest-700">{editing ? `Editing #${editing.id}` : "New property"}</p>
              <h2 className="mt-1 font-sans text-[1.25rem] font-bold text-navy-900">{editing ? editing.title : "Add a property"}</h2>
            </div>
            <button type="button" onClick={closeForm} className="btn btn-outline px-3.5 py-2 text-[0.8125rem]">
              <IconClose className="h-4 w-4" /> Cancel
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label} htmlFor="ap-title">Title *</label>
              <input id="ap-title" required value={form.title} onChange={(e) => set("title", e.target.value)} className="field mt-2" placeholder="e.g. 10 Marla Brand New House in DHA Phase 6" />
            </div>
            <div>
              <span className={label}>Purpose *</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["buy", "rent"] as const).map((value) => (
                  <button key={value} type="button" onClick={() => set("purpose", value)} className={["rounded-[10px] border px-3 py-2.5 font-sans text-[0.875rem] font-semibold", form.purpose === value ? "border-navy-800 bg-navy-800 text-white" : "border-soft bg-white text-navy-900"].join(" ")}>
                    {value === "buy" ? "For sale" : "For rent"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={label} htmlFor="ap-category">Category *</label>
              <select id="ap-category" value={form.category} onChange={(e) => { const next = e.target.value; set("category", next); set("propertyType", CATEGORIES.find((c) => c.value === next)?.types[0] ?? "House"); }} className="field mt-2">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="ap-type">Property type *</label>
              <select id="ap-type" value={form.propertyType} onChange={(e) => set("propertyType", e.target.value)} className="field mt-2">
                {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="ap-city">City *</label>
              <select id="ap-city" value={form.citySlug} onChange={(e) => { const slug = e.target.value; set("citySlug", slug); const preset = CITY_CENTERS[slug]; if (preset) { set("lat", preset.lat); set("lng", preset.lng); } }} className="field mt-2">
                {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="ap-area">Society / Area *</label>
              <LocationAutocomplete
                id="ap-area"
                required
                className="mt-2"
                value={form.locationArea}
                onChange={(v) => set("locationArea", v)}
                citySlug={form.citySlug}
                cityName={cityName}
                onSelect={(s) => {
                  set("lat", Math.round(s.lat * 1e5) / 1e5);
                  set("lng", Math.round(s.lng * 1e5) / 1e5);
                }}
              />
            </div>
            <div>
              <label className={label} htmlFor="ap-address">Street / block / plot</label>
              <input id="ap-address" value={form.address} onChange={(e) => set("address", e.target.value)} className="field mt-2" placeholder="e.g. Block C, Plot 1474" />
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-soft bg-mist/50 p-3 sm:p-4">
            <p className="mb-3 flex items-center gap-2 text-[0.8125rem] font-semibold text-navy-900">
              <IconPin className="h-4 w-4 text-forest-600" /> Location on society map *
            </p>
            <LocationPicker
              lat={form.lat}
              lng={form.lng}
              citySlug={form.citySlug}
              cityName={cityName}
              locationQuery={[form.locationArea, form.address].filter(Boolean).join(", ")}
              plotLabel={form.address || form.locationArea || "Property location"}
              plotSubtitle={`${form.areaValue} ${form.areaUnit === "kanal" ? "Kanal" : form.areaUnit === "marla" ? "Marla" : "sq ft"} ${form.propertyType}`}
              onChange={(lat, lng) => { set("lat", lat); set("lng", lng); }}
            />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={label} htmlFor="ap-price">{form.purpose === "rent" ? "Monthly rent (PKR) *" : "Price (PKR) *"}</label>
              <input id="ap-price" required type="number" min={1} value={form.price} onChange={(e) => set("price", e.target.value)} className="field mt-2" />
            </div>
            <div>
              <label className={label} htmlFor="ap-areavalue">Area *</label>
              <div className="mt-2 flex gap-2">
                <input id="ap-areavalue" type="number" min={0} step="any" value={form.areaValue} onChange={(e) => set("areaValue", e.target.value)} className="field" />
                <select value={form.areaUnit} onChange={(e) => set("areaUnit", e.target.value)} className="field max-w-[120px]" aria-label="Area unit">
                  <option value="marla">Marla</option><option value="kanal">Kanal</option><option value="sqft">Sq Ft</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><label className={label} htmlFor="ap-beds">Beds</label><input id="ap-beds" type="number" min={0} value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} className="field mt-2" /></div>
              <div><label className={label} htmlFor="ap-baths">Baths</label><input id="ap-baths" type="number" min={0} value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} className="field mt-2" /></div>
              <div><label className={label} htmlFor="ap-parking">Parking</label><input id="ap-parking" type="number" min={0} value={form.parking} onChange={(e) => set("parking", e.target.value)} className="field mt-2" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={label} htmlFor="ap-furnishing">Furnishing</label>
                <select id="ap-furnishing" value={form.furnishing} onChange={(e) => set("furnishing", e.target.value)} className="field mt-2">
                  {["Unfurnished", "Semi-furnished", "Fully furnished", "Fitted", "Bare shell", "Not applicable"].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={label} htmlFor="ap-possession">Possession</label>
                <select id="ap-possession" value={form.possession} onChange={(e) => set("possession", e.target.value)} className="field mt-2">
                  {["Available", "Immediate", "Within 1 month", "Within 3 months", "On completion", "File", "Booking open"].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label} htmlFor="ap-description">Description</label>
              <textarea id="ap-description" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} className="field mt-2 resize-y" />
            </div>
            <div>
              <label className={label} htmlFor="ap-features">Features (comma separated)</label>
              <input id="ap-features" value={form.features} onChange={(e) => set("features", e.target.value)} className="field mt-2" />
            </div>
            <div>
              <label className={label} htmlFor="ap-amenities">Amenities (comma separated)</label>
              <input id="ap-amenities" value={form.amenities} onChange={(e) => set("amenities", e.target.value)} className="field mt-2" />
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-soft bg-mist/50 p-4">
            <p className="text-[0.8125rem] font-semibold text-navy-900">Listing person (shown on the property page)</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div><label className={label} htmlFor="ap-lname">Name</label><input id="ap-lname" value={form.listedByName} onChange={(e) => set("listedByName", e.target.value)} className="field mt-2" placeholder="Owner / agent name" /></div>
              <div><label className={label} htmlFor="ap-lphone">Phone</label><input id="ap-lphone" value={form.listedByPhone} onChange={(e) => set("listedByPhone", e.target.value)} className="field mt-2" placeholder="+92 3xx xxxxxxx" /></div>
              <div><label className={label} htmlFor="ap-lwa">WhatsApp</label><input id="ap-lwa" value={form.listedByWhatsapp} onChange={(e) => set("listedByWhatsapp", e.target.value)} className="field mt-2" placeholder="defaults to phone" /></div>
              <div><label className={label} htmlFor="ap-lemail">Email</label><input id="ap-lemail" type="email" value={form.listedByEmail} onChange={(e) => set("listedByEmail", e.target.value)} className="field mt-2" /></div>
            </div>
            <p className="mt-2 text-[0.75rem] text-ink-muted">Leave blank to show the demo consultant for this city instead.</p>
          </div>

          <div className="mt-5">
            <p className={label}>Property photos *</p>
            <div className="mt-3">
              <ListingImageUploader images={form.images} onChange={(images) => set("images", images)} />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-5">
            <label className="flex cursor-pointer items-center gap-2 text-[0.875rem] font-medium text-navy-900">
              <input type="checkbox" checked={form.negotiable} onChange={(e) => set("negotiable", e.target.checked)} className="h-5 w-5 accent-forest-600" /> Negotiable
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-[0.875rem] font-medium text-navy-900">
              <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-5 w-5 accent-forest-600" /> Featured on homepage
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-[0.875rem] font-medium text-navy-900">
              <input type="checkbox" checked={form.verified} onChange={(e) => set("verified", e.target.checked)} className="h-5 w-5 accent-forest-600" /> Show badge
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <button type="submit" disabled={saving} className="btn btn-green flex-1 disabled:opacity-60">
              <IconCheck className="h-4 w-4" /> {saving ? "Saving…" : editing ? "Save changes" : "Publish property"}
            </button>
            {editing && (
              <button type="button" disabled={deleting === editing.id} onClick={() => remove(editing)} className="btn btn-outline !border-red-200 !text-red-700 hover:!border-red-400">
                <IconClose className="h-4 w-4" /> Delete
              </button>
            )}
          </div>
        </form>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-sm">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, area, city or slug" className="field pl-9" aria-label="Search properties" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[0.8125rem] text-ink-muted">{total} properties</span>
          {!creating && (
            <button type="button" onClick={startCreate} className="btn btn-green px-4 py-2.5 text-[0.8125rem]">
              + Add property
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="mt-5 grid gap-3">{[0, 1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-panel border border-soft bg-mist" />)}</div>
      ) : items.length === 0 ? (
        <p className="mt-6 rounded-panel border border-soft bg-mist p-8 text-center text-[0.9rem] text-ink-muted">No properties match this search.</p>
      ) : (
        <ul className="mt-5 grid gap-3">
          {items.map((property) => (
            <li key={property.id} className="flex flex-col gap-4 rounded-panel border border-soft bg-white p-4 shadow-soft sm:flex-row sm:items-center">
              <img src={property.coverImage} alt="" width={200} height={150} loading="lazy" className="h-24 w-full rounded-lg object-cover sm:h-20 sm:w-28" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-sans text-[0.75rem] font-bold text-ink-muted">#{property.id}</span>
                  <span className="rounded-md bg-mist px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-muted">{property.purpose === "rent" ? "Rent" : "Sale"} · {property.propertyType}</span>
                  {property.featured && <span className="rounded-md bg-forest-50 px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-forest-700">Featured</span>}
                  {property.listedByName && <span className="rounded-md bg-navy-800 px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-white">Owner listed</span>}
                </div>
                <p className="mt-1.5 truncate font-sans text-[1rem] font-semibold text-navy-900">{property.title}</p>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-[0.8125rem] text-ink-muted">
                  <IconPin className="h-3.5 w-3.5 text-forest-600" /> {property.locationArea}, {property.cityName} · {formatArea(property.areaValue, property.areaUnit)} · {formatPrice(property.price, property.priceUnit)}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Link href={`/property/${property.slug}`} target="_blank" className="btn btn-outline px-3 py-2 text-[0.75rem]">View <IconArrowRight className="h-3.5 w-3.5" /></Link>
                <button type="button" onClick={() => startEdit(property)} className="btn btn-primary px-3 py-2 text-[0.75rem]">Edit</button>
                <button type="button" disabled={deleting === property.id} onClick={() => remove(property)} className="btn btn-outline !border-red-200 px-3 py-2 text-[0.75rem] !text-red-700 hover:!border-red-400 disabled:opacity-60">
                  {deleting === property.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
