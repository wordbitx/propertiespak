"use client";

import { useState } from "react";
import { IconArrowRight, IconCheck, IconPin } from "@/components/icons";
import { LocationPicker } from "@/components/location-picker";
import { ListingImageUploader, type UploadedImage } from "@/components/listing-image-uploader";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { CITY_CENTERS } from "@/lib/map-engine";

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

function SectionTitle({ step, title, copy }: { step: string; title: string; copy: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy-800 font-sans text-[0.75rem] font-bold text-white">
        {step}
      </span>
      <div>
        <h3 className="font-sans text-[1rem] font-semibold text-navy-900">{title}</h3>
        <p className="mt-0.5 text-[0.8125rem] text-ink-muted">{copy}</p>
      </div>
    </div>
  );
}

export function ListingForm() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [referenceId, setReferenceId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState<"buy" | "rent">("buy");
  const [category, setCategory] = useState("house");
  const [propertyType, setPropertyType] = useState("House");
  const [citySlug, setCitySlug] = useState("lahore");
  const [locationArea, setLocationArea] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(CITY_CENTERS.lahore.lat);
  const [lng, setLng] = useState(CITY_CENTERS.lahore.lng);
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(true);
  const [bedrooms, setBedrooms] = useState("5");
  const [bathrooms, setBathrooms] = useState("4");
  const [areaValue, setAreaValue] = useState("10");
  const [areaUnit, setAreaUnit] = useState("marla");
  const [parking, setParking] = useState("1");
  const [furnishing, setFurnishing] = useState("Unfurnished");
  const [possession, setPossession] = useState("Available");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [amenities, setAmenities] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const cityName = CITIES.find((c) => c.slug === citySlug)?.name ?? "Lahore";
  const typeOptions = CATEGORIES.find((c) => c.value === category)?.types ?? ["House"];

  function onCityChange(slug: string) {
    setCitySlug(slug);
    const preset = CITY_CENTERS[slug];
    if (preset) {
      setLat(preset.lat);
      setLng(preset.lng);
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (uploadedImages.length === 0) {
      setState("error");
      setError("Please upload at least one clear photo of the property before submitting.");
      return;
    }
    setState("loading");
    setError("");
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          title:
            category === "plot"
              ? `${areaValue} ${areaUnit === "kanal" ? "Kanal" : "Marla"} ${propertyType} for ${purpose === "rent" ? "Rent" : "Sale"} in ${locationArea || cityName}`
              : `${bedrooms}-Bed ${propertyType} for ${purpose === "rent" ? "Rent" : "Sale"} in ${locationArea || cityName}`,
          purpose,
          category,
          propertyType,
          citySlug,
          cityName,
          locationArea,
          address,
          lat,
          lng,
          price: Number(price),
          negotiable,
          bedrooms: Number(bedrooms),
          bathrooms: Number(bathrooms),
          areaValue: Number(areaValue),
          areaUnit,
          parking: Number(parking),
          furnishing,
          possession,
          description,
          features,
          amenities,
          imageUrls: uploadedImages.map((image) => image.url),
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string; id?: number };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "We could not send your listing. Please try again.");
        setState("error");
        return;
      }
      setReferenceId(payload.id ?? null);
      setState("done");
    } catch {
      setError("Network error. Please check your connection and try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-panel border border-forest-500/30 bg-forest-50 p-6 sm:p-8">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-forest-600 text-white">
          <IconCheck className="h-5 w-5" />
        </span>
        <h3 className="mt-4 font-sans text-[1.25rem] font-bold text-navy-900">Listing sent for admin review</h3>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-muted">
          Thank you, {name.split(" ")[0] || "owner"}. Your property has been submitted
          {referenceId ? (
            <>
              {" "}as <span className="font-semibold text-navy-900">submission #{referenceId}</span>
            </>
          ) : null}{" "}
          and is now <span className="font-semibold text-navy-900">pending approval</span>. Our admin team will verify
          the details and publish it live — usually within 24 hours. We will contact you on {phone || "your number"} if
          anything is needed.
        </p>
        <button
          type="button"
          onClick={() => {
            setState("idle");
            setLocationArea("");
            setAddress("");
            setPrice("");
            setDescription("");
            setUploadedImages([]);
          }}
          className="btn btn-outline mt-6"
        >
          Submit another property
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="overflow-hidden rounded-panel border border-navy-800/25 bg-[#eef3f8] shadow-lift ring-1 ring-navy-900/5"
    >
      {/* Dark header strip — visually separates the form from the page */}
      <div className="bg-navy-950 px-6 py-5 sm:px-8">
        <p className="eyebrow text-forest-400">
          <span className="h-px w-6 bg-current" /> Property listing form
        </p>
        <h3 className="mt-2 font-sans text-[1.35rem] font-bold text-white">Submit your property</h3>
        <p className="mt-1.5 text-[0.875rem] leading-relaxed text-white/70">
          Fill in the details below. Your listing goes to our admin team for verification and is published after approval.
        </p>
      </div>

      <div className="p-6 sm:p-8">

      {/* 1 — Contact */}
      <div className="rounded-xl border border-soft bg-white p-5 shadow-soft sm:p-6">
        <SectionTitle step="1" title="Your contact details" copy="Buyers reach you through Pak Property after approval." />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={label} htmlFor="listing-name">Full name *</label>
            <input id="listing-name" required value={name} onChange={(e) => setName(e.target.value)} className="field mt-2" placeholder="e.g. Ahmed Khan" />
          </div>
          <div>
            <label className={label} htmlFor="listing-phone">Phone / WhatsApp *</label>
            <input id="listing-phone" required value={phone} onChange={(e) => setPhone(e.target.value)} className="field mt-2" placeholder="+92 3xx xxxxxxx" inputMode="tel" />
          </div>
          <div>
            <label className={label} htmlFor="listing-email">Email *</label>
            <input id="listing-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field mt-2" placeholder="you@email.com" />
          </div>
        </div>
      </div>

      {/* 2 — Listing type */}
      <div className="mt-6 rounded-xl border border-soft bg-white p-5 shadow-soft sm:p-6">
        <SectionTitle step="2" title="What are you listing?" copy="Sale or rent, and the property category." />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <span className={label} id="listing-purpose-label">I want to *</span>
            <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-labelledby="listing-purpose-label">
              {(["buy", "rent"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPurpose(value)}
                  aria-pressed={purpose === value}
                  className={[
                    "rounded-[10px] border px-3 py-2.5 font-sans text-[0.875rem] font-semibold transition-colors",
                    purpose === value
                      ? "border-navy-800 bg-navy-800 text-white"
                      : "border-soft bg-white text-navy-900 hover:border-navy-800",
                  ].join(" ")}
                >
                  {value === "buy" ? "Sell" : "Rent out"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={label} htmlFor="listing-category">Category *</label>
            <select
              id="listing-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                const first = CATEGORIES.find((c) => c.value === e.target.value)?.types[0] ?? "House";
                setPropertyType(first);
              }}
              className="field mt-2"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="listing-type">Property type *</label>
            <select id="listing-type" value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="field mt-2">
              {typeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3 — Location + map */}
      <div className="mt-6 rounded-xl border border-soft bg-white p-5 shadow-soft sm:p-6">
        <SectionTitle step="3" title="Location" copy="Select the city and area, then pin the exact spot on the satellite map." />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="listing-city">City *</label>
            <select id="listing-city" value={citySlug} onChange={(e) => onCityChange(e.target.value)} className="field mt-2">
              {CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="listing-area">Society / Area *</label>
            <p className="mt-1 text-[0.6875rem] text-ink-muted">Start typing — sectors, phases and blocks appear below (e.g. &ldquo;Bahria Town Sector&rdquo;).</p>
            <LocationAutocomplete
              id="listing-area"
              required
              className="mt-2"
              value={locationArea}
              onChange={setLocationArea}
              citySlug={citySlug}
              cityName={cityName}
              onSelect={(s) => {
                setLat(Math.round(s.lat * 1e5) / 1e5);
                setLng(Math.round(s.lng * 1e5) / 1e5);
              }}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className={label} htmlFor="listing-address">Street / block / plot no. (optional)</label>
          <input
            id="listing-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="field mt-2"
            placeholder="e.g. Block C, Plot 1474, 70-ft road"
          />
        </div>
        <div className="mt-5 rounded-xl border border-soft bg-white p-3 shadow-soft sm:p-4">
          <p className="mb-3 flex items-center gap-2 text-[0.8125rem] font-semibold text-navy-900">
            <IconPin className="h-4 w-4 text-forest-600" />
            Pin the exact location on the map *
          </p>
          <LocationPicker
            lat={lat}
            lng={lng}
            citySlug={citySlug}
            cityName={cityName}
            locationQuery={[locationArea, address].filter(Boolean).join(", ")}
            plotLabel={address.trim() || locationArea.trim() || "Property location"}
            plotSubtitle={
              category === "plot"
                ? `${areaValue} ${areaUnit === "kanal" ? "Kanal" : areaUnit === "marla" ? "Marla" : "sq ft"} ${propertyType}`
                : `${areaValue} ${areaUnit === "kanal" ? "Kanal" : areaUnit === "marla" ? "Marla" : "sq ft"} · ${bedrooms} bed ${propertyType}`
            }
            onChange={(pickedLat, pickedLng) => {
              setLat(pickedLat);
              setLng(pickedLng);
            }}
            autoLocate
          />
        </div>
      </div>

      {/* 4 — Price & size */}
      <div className="mt-6 rounded-xl border border-soft bg-white p-5 shadow-soft sm:p-6">
        <SectionTitle step="4" title="Price & size" copy={purpose === "rent" ? "Monthly rent and covered area." : "Total asking price and plot / covered area."} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="listing-price">
              {purpose === "rent" ? "Monthly rent (PKR) *" : "Asking price (PKR) *"}
            </label>
            <input
              id="listing-price"
              required
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="field mt-2"
              placeholder={purpose === "rent" ? "e.g. 85000" : "e.g. 32500000"}
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex cursor-pointer items-center gap-2.5 text-[0.875rem] font-medium text-navy-900">
              <input
                type="checkbox"
                checked={negotiable}
                onChange={(e) => setNegotiable(e.target.checked)}
                className="h-5 w-5 accent-forest-600"
              />
              Price is negotiable
            </label>
          </div>
          <div>
            <label className={label} htmlFor="listing-area-value">Area *</label>
            <div className="mt-2 flex gap-2">
              <input
                id="listing-area-value"
                type="number"
                min={0}
                step="any"
                value={areaValue}
                onChange={(e) => setAreaValue(e.target.value)}
                className="field"
                placeholder="e.g. 10"
              />
              <select value={areaUnit} onChange={(e) => setAreaUnit(e.target.value)} className="field max-w-[130px]" aria-label="Area unit">
                <option value="marla">Marla</option>
                <option value="kanal">Kanal</option>
                <option value="sqft">Sq Ft</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={label} htmlFor="listing-beds">Beds</label>
              <input id="listing-beds" type="number" min={0} value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="field mt-2" />
            </div>
            <div>
              <label className={label} htmlFor="listing-baths">Baths</label>
              <input id="listing-baths" type="number" min={0} value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="field mt-2" />
            </div>
            <div>
              <label className={label} htmlFor="listing-parking">Parking</label>
              <input id="listing-parking" type="number" min={0} value={parking} onChange={(e) => setParking(e.target.value)} className="field mt-2" />
            </div>
          </div>
          <div>
            <label className={label} htmlFor="listing-furnishing">Furnishing</label>
            <select id="listing-furnishing" value={furnishing} onChange={(e) => setFurnishing(e.target.value)} className="field mt-2">
              {["Unfurnished", "Semi-furnished", "Fully furnished", "Fitted", "Bare shell", "Not applicable"].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="listing-possession">Possession</label>
            <select id="listing-possession" value={possession} onChange={(e) => setPossession(e.target.value)} className="field mt-2">
              {["Available", "Immediate", "Within 1 month", "Within 3 months", "On completion"].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 5 — Details */}
      <div className="mt-6 rounded-xl border border-soft bg-white p-5 shadow-soft sm:p-6">
        <SectionTitle step="5" title="Description & photos" copy="Good detail gets approved faster and sells quicker." />
        <div className="mt-4">
          <label className={label} htmlFor="listing-desc">Property description</label>
          <textarea
            id="listing-desc"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="field mt-2 resize-y"
            placeholder=" facing, floor, road width, nearby landmarks, documentation status…"
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="listing-features">Key features (comma separated)</label>
            <input id="listing-features" value={features} onChange={(e) => setFeatures(e.target.value)} className="field mt-2" placeholder="e.g. Corner plot, Park facing, Imported fittings" />
          </div>
          <div>
            <label className={label} htmlFor="listing-amenities">Amenities (comma separated)</label>
            <input id="listing-amenities" value={amenities} onChange={(e) => setAmenities(e.target.value)} className="field mt-2" placeholder="e.g. Gated society, 24/7 security, Mosque nearby" />
          </div>
        </div>
        <div className="mt-5">
          <p className={label}>Property photos *</p>
          <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-muted">
            Upload clear photos of this exact property. These same original-quality images will appear on the live listing
            after admin approval; the first image becomes the cover.
          </p>
          <div className="mt-3">
            <ListingImageUploader images={uploadedImages} onChange={setUploadedImages} />
          </div>
        </div>
      </div>

      {state === "error" && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 px-3.5 py-2.5 text-[0.8125rem] text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={state === "loading"} className="btn btn-green mt-7 w-full disabled:opacity-70">
        {state === "loading" ? "Submitting for review…" : "Submit listing for admin approval"}
        <IconArrowRight className="h-4 w-4" />
      </button>
      <p className="mt-3 text-[0.75rem] leading-relaxed text-ink-muted">
        By submitting you confirm the details are accurate. Listings are published only after admin verification.
      </p>
      </div>
    </form>
  );
}
