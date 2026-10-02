import {
  bigint,
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/** Cities / markets covered by the marketplace. */
export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  province: text("province").notNull().default("Punjab"),
  tagline: text("tagline").notNull().default(""),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  imageAlt: text("image_alt").notNull().default(""),
  lat: doublePrecision("lat").notNull().default(31.5204),
  lng: doublePrecision("lng").notNull().default(74.3587),
  isFeatured: boolean("is_featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Real estate agents / agencies handling listings. */
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  title: text("title").notNull().default("Property Consultant"),
  agency: text("agency").notNull().default("Properties Pak Partners"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp").notNull().default(""),
  cityName: text("city_name").notNull().default("Lahore"),
  experienceYears: integer("experience_years").notNull().default(5),
  dealsClosed: integer("deals_closed").notNull().default(0),
  languages: jsonb("languages").$type<string[]>().notNull().default([]),
  bio: text("bio").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** New development projects (developers / housing schemes). */
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  developer: text("developer").notNull(),
  cityName: text("city_name").notNull(),
  citySlug: text("city_slug").notNull(),
  location: text("location").notNull(),
  projectType: text("project_type").notNull(),
  status: text("status").notNull().default("Under Construction"),
  startingPrice: bigint("starting_price", { mode: "number" }).notNull(),
  completion: text("completion").notNull().default(""),
  units: text("units").notNull().default(""),
  description: text("description").notNull().default(""),
  highlights: jsonb("highlights").$type<string[]>().notNull().default([]),
  coverImage: text("cover_image").notNull().default(""),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  lat: doublePrecision("lat").notNull().default(31.5204),
  lng: doublePrecision("lng").notNull().default(74.3587),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Core listings table. */
export const properties = pgTable(
  "properties",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    purpose: text("purpose").notNull(), // buy | rent
    category: text("category").notNull(), // house | apartment | plot | office | shop | building | farmhouse | penthouse | warehouse
    propertyType: text("property_type").notNull(),
    citySlug: text("city_slug").notNull(),
    cityName: text("city_name").notNull(),
    locationArea: text("location_area").notNull(),
    address: text("address").notNull().default(""),
    lat: doublePrecision("lat").notNull().default(31.5204),
    lng: doublePrecision("lng").notNull().default(74.3587),
    price: bigint("price", { mode: "number" }).notNull(),
    priceUnit: text("price_unit").notNull().default("total"), // total | month
    paymentType: text("payment_type").notNull().default(""),
    videoUrl: text("video_url").notNull().default(""),
    negotiable: boolean("negotiable").notNull().default(false),
    bedrooms: integer("bedrooms").notNull().default(0),
    bathrooms: integer("bathrooms").notNull().default(0),
    areaValue: doublePrecision("area_value").notNull().default(0),
    areaUnit: text("area_unit").notNull().default("sqft"), // sqft | marla | kanal
    areaSqft: integer("area_sqft").notNull().default(0),
    parking: integer("parking").notNull().default(0),
    furnishing: text("furnishing").notNull().default("Unfurnished"),
    possession: text("possession").notNull().default("Available"),
    description: text("description").notNull().default(""),
    features: jsonb("features").$type<string[]>().notNull().default([]),
    amenities: jsonb("amenities").$type<string[]>().notNull().default([]),
    coverImage: text("cover_image").notNull().default(""),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    featured: boolean("featured").notNull().default(false),
    verified: boolean("verified").notNull().default(true),
    isNewProject: boolean("is_new_project").notNull().default(false),
    projectSlug: text("project_slug"),
    agentSlug: text("agent_slug").notNull(),
    /** Exact listing-person details copied from an approved owner submission. */
    listedByName: text("listed_by_name").notNull().default(""),
    listedByEmail: text("listed_by_email").notNull().default(""),
    listedByPhone: text("listed_by_phone").notNull().default(""),
    listedByWhatsapp: text("listed_by_whatsapp").notNull().default(""),
    /** Registered account that owns this listing (null for platform inventory). */
    listedByUserId: integer("listed_by_user_id"),
    /**
     * Owner visibility switch. An owner can pull a published listing off the
     * public site from their dashboard and restore it later; unpublished rows
     * stay in the database with their photos and enquiries intact.
     */
    published: boolean("published").notNull().default(true),
    views: integer("views").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("properties_slug_idx").on(table.slug)],
);

/** Editorial insights / guides (blog). */
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull().default("Guides"),
  excerpt: text("excerpt").notNull(),
  body: jsonb("body").$type<string[]>().notNull().default([]),
  coverImage: text("cover_image").notNull().default(""),
  author: text("author").notNull().default("Properties Pak Research"),
  readMinutes: integer("read_minutes").notNull().default(5),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  links: jsonb("links").$type<{ label: string; href: string }[]>().notNull().default([]),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Client testimonials (believable, non-certification content). */
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  city: text("city").notNull(),
  quote: text("quote").notNull(),
  rating: integer("rating").notNull().default(5),
  initials: text("initials").notNull().default("EW"),
  sortOrder: integer("sort_order").notNull().default(0),
});

/** Every lead captured by the platform: enquiries, visits, list-your-property. */
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  type: text("type").notNull().default("property"), // property | visit | contact | list | valuation
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull().default(""),
  budget: text("budget").notNull().default(""),
  preferredDate: text("preferred_date").notNull().default(""),
  cityName: text("city_name").notNull().default(""),
  propertySlug: text("property_slug").notNull().default(""),
  propertyTitle: text("property_title").notNull().default(""),
  projectSlug: text("project_slug").notNull().default(""),
  source: text("source").notNull().default("website"),
  status: text("status").notNull().default("new"), // new | contacted | closed
  adminNote: text("admin_note").notNull().default(""),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Registered platform accounts. Every account that lists a property becomes a
 * public dealer profile at `/dealers/<slug>`: the profile only carries a blue
 * verification tick once an administrator verifies it in the admin workspace.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().default(""),
  /**
   * Null for accounts that only ever signed in with Google. Password accounts
   * keep `salt:hash` here (see `src/lib/password.ts`); Google-only accounts
   * have no password to store.
   */
  passwordHash: text("password_hash"),
  /**
   * Google's stable subject id (`sub` claim) once the account has signed in
   * with Google. Null for password accounts and never shared with Google.
   */
  googleId: text("google_id"),
  /** Public profile slug; empty until the account publishes a listing. */
  slug: text("slug").notNull().default(""),
  /** member | dealer | agency — dealers are members who list property. */
  role: text("role").notNull().default("member"),
  citySlug: text("city_slug").notNull().default(""),
  cityName: text("city_name").notNull().default(""),
  agency: text("agency").notNull().default(""),
  bio: text("bio").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  avatarUrl: text("avatar_url").notNull().default(""),
  /* ---- professional profile (dealer setup) ---- */
  /** Job title shown on the dealer profile, e.g. "Sales Director". */
  designation: text("designation").notNull().default(""),
  /** Street / office address entered by the account owner. */
  officeAddress: text("office_address").notNull().default(""),
  companyPhone: text("company_phone").notNull().default(""),
  companyWebsite: text("company_website").notNull().default(""),
  companyLogo: text("company_logo").notNull().default(""),
  /** Free-text experience line, e.g. "9 years in DHA and Bahria Town". */
  experience: text("experience").notNull().default(""),
  /** Comma-separated areas the account deals in. */
  areas: text("areas").notNull().default(""),
  /** Documents or notes supplied with a verification request. */
  verificationNote: text("verification_note").notNull().default(""),
  /** Set when the account owner finishes the profile setup form. */
  profileCompletedAt: timestamp("profile_completed_at", { withTimezone: true }),
  /** Set when the account asks to be reviewed for the blue tick. */
  verificationRequestedAt: timestamp("verification_requested_at", { withTimezone: true }),
  /** Blue tick state — set only from the admin workspace. */
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type DealerStats = {
  listings: number;
  verifiedListings: number;
  cities: number;
};

/** Saved properties per user (server-side favourites). */
export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    propertyId: integer("property_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("favorites_user_property_idx").on(table.userId, table.propertyId)],
);

/** Saved searches per user. */
export const savedSearches = pgTable("saved_searches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  label: text("label").notNull(),
  queryString: text("query_string").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Owner-submitted property listings awaiting admin review.
 * status: pending | approved | rejected. On approval a row is created in
 * `properties` and `propertyId` is set; the submission is kept for audit.
 */
/** Original uploaded listing images, stored durably in PostgreSQL. */
export const listingMedia = pgTable("listing_media", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  byteSize: integer("byte_size").notNull(),
  dataBase64: text("data_base64").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const listingSubmissions = pgTable("listing_submissions", {
  id: serial("id").primaryKey(),
  status: text("status").notNull().default("pending"),
  /** Account that submitted the listing, when the owner was signed in. */
  userId: integer("user_id"),
  adminNote: text("admin_note").notNull().default(""),
  propertyId: integer("property_id"),
  // Contact
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  // Property basics
  title: text("title").notNull(),
  purpose: text("purpose").notNull().default("buy"), // buy | rent
  category: text("category").notNull().default("house"),
  propertyType: text("property_type").notNull().default("House"),
  citySlug: text("city_slug").notNull().default("lahore"),
  cityName: text("city_name").notNull().default("Lahore"),
  locationArea: text("location_area").notNull().default(""),
  address: text("address").notNull().default(""),
  lat: doublePrecision("lat").notNull().default(31.5204),
  lng: doublePrecision("lng").notNull().default(74.3587),
  // Price & size
  price: bigint("price", { mode: "number" }).notNull().default(0),
  priceUnit: text("price_unit").notNull().default("total"), // total | month
  paymentType: text("payment_type").notNull().default(""),
  videoUrl: text("video_url").notNull().default(""),
  negotiable: boolean("negotiable").notNull().default(false),
  bedrooms: integer("bedrooms").notNull().default(0),
  bathrooms: integer("bathrooms").notNull().default(0),
  areaValue: doublePrecision("area_value").notNull().default(0),
  areaUnit: text("area_unit").notNull().default("marla"), // sqft | marla | kanal
  areaSqft: integer("area_sqft").notNull().default(0),
  parking: integer("parking").notNull().default(0),
  furnishing: text("furnishing").notNull().default("Unfurnished"),
  possession: text("possession").notNull().default("Available"),
  description: text("description").notNull().default(""),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  amenities: jsonb("amenities").$type<string[]>().notNull().default([]),
  imageUrls: jsonb("image_urls").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

export type City = typeof cities.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type ListingSubmission = typeof listingSubmissions.$inferSelect;
export type ListingMedia = typeof listingMedia.$inferSelect;
