import { and, asc, desc, eq, getTableColumns, gte, ilike, inArray, isNotNull, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import {
  agents,
  cities,
  favorites,
  inquiries,
  posts,
  projects,
  listingSubmissions,
  properties,
  testimonials,
  users,
  type Property,
  type User,
} from "@/db/schema";

export type PropertyFilters = {
  purpose?: string;
  city?: string;
  /** Town / society name fragment matched against `location_area`. */
  town?: string;
  type?: string;
  baths?: number;
  furnishing?: string;
  possession?: string;
  maxArea?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  minArea?: number;
  q?: string;
  featured?: boolean;
  verified?: boolean;
  isNewProject?: boolean;
  commercialOnly?: boolean;
  sort?: string;
  page?: number;
  pageSize?: number;
  ids?: number[];
};

const COMMERCIAL_CATEGORIES = ["office", "shop", "building", "warehouse"];

/** A listing with its owning account's verification state resolved. */
export type PropertyWithDealer = Property & { dealerVerified?: boolean | null };

/**
 * Joins the listing owner (by account, falling back to the email captured on
 * the listing) so cards and detail pages can show the blue tick only for
 * admin-verified dealers.
 */
const LISTING_WITH_DEALER = {
  ...getTableColumns(properties),
  dealerVerified: sql<boolean | null>`${users.isVerified}`.as("dealer_verified"),
} as const;

/**
 * A listing belongs to an account only through `listed_by_user_id`, which is
 * stamped when the owner publishes while signed in (or when the admin approves
 * a submission created from an account). The email on a listing is contact
 * information only — matching on it would let anyone inherit another account's
 * verification tick by typing their address into the listing form.
 */
function listingOwnerJoin() {
  return eq(properties.listedByUserId, users.id);
}

/** Same rule for portfolio queries: id only, never the published email. */
function listedByUser(userId: number): SQL {
  return eq(properties.listedByUserId, userId);
}

/**
 * Public inventory never shows a listing its owner has taken down. Storefront
 * queries add this condition; the owner dashboard and the admin screens keep
 * their own unfiltered queries on purpose.
 */
const isPublished: SQL = eq(properties.published, true);

/** Dealer counters join only the listings that are actually live on the site. */
function dealerListingJoin() {
  return and(eq(properties.listedByUserId, users.id), isPublished)!;
}

export function buildConditions(filters: PropertyFilters): SQL[] {
  const conditions: SQL[] = [isPublished];
  if (filters.purpose) conditions.push(eq(properties.purpose, filters.purpose));
  if (filters.city) conditions.push(eq(properties.citySlug, filters.city));
  if (filters.town) {
    const term = `%${filters.town.trim()}%`;
    const townMatch = or(ilike(properties.locationArea, term), ilike(properties.address, term));
    if (townMatch) conditions.push(townMatch);
  }
  if (filters.type) conditions.push(eq(properties.propertyType, filters.type));
  if (filters.baths) conditions.push(gte(properties.bathrooms, filters.baths));
  if (filters.furnishing) conditions.push(eq(properties.furnishing, filters.furnishing));
  if (filters.possession) conditions.push(eq(properties.possession, filters.possession));
  if (typeof filters.maxArea === "number") conditions.push(lte(properties.areaSqft, filters.maxArea));
  if (filters.category === "commercial" || filters.commercialOnly) {
    conditions.push(inArray(properties.category, COMMERCIAL_CATEGORIES));
  } else if (filters.category) {
    conditions.push(eq(properties.category, filters.category));
  }
  if (typeof filters.minPrice === "number") conditions.push(gte(properties.price, filters.minPrice));
  if (typeof filters.maxPrice === "number") conditions.push(lte(properties.price, filters.maxPrice));
  if (filters.beds) conditions.push(gte(properties.bedrooms, filters.beds));
  if (filters.minArea) conditions.push(gte(properties.areaSqft, filters.minArea));
  if (filters.featured) conditions.push(eq(properties.featured, true));
  if (filters.verified) conditions.push(eq(properties.verified, true));
  if (filters.isNewProject) conditions.push(eq(properties.isNewProject, true));
  if (filters.ids && filters.ids.length > 0) conditions.push(inArray(properties.id, filters.ids));
  if (filters.ids && filters.ids.length === 0) conditions.push(sql`false`);
  if (filters.q) {
    const term = `%${filters.q.trim()}%`;
    const search = or(
      ilike(properties.title, term),
      ilike(properties.locationArea, term),
      ilike(properties.cityName, term),
      ilike(properties.propertyType, term),
      ilike(properties.description, term),
    );
    if (search) conditions.push(search);
  }
  return conditions;
}

export function orderFor(sort?: string) {
  switch (sort) {
    case "price-asc":
      return [asc(properties.price)];
    case "price-desc":
      return [desc(properties.price)];
    case "area-desc":
      return [desc(properties.areaSqft)];
    case "popular":
      return [desc(properties.views)];
    default:
      return [desc(properties.createdAt)];
  }
}

export async function searchProperties(filters: PropertyFilters = {}) {
  await ensureSeeded();
  const conditions = buildConditions(filters);
  const where = conditions.length ? and(...conditions) : undefined;
  const pageSize = filters.pageSize ?? 9;
  const page = Math.max(1, filters.page ?? 1);

  const [items, countRows] = await Promise.all([
    db
      .select(LISTING_WITH_DEALER)
      .from(properties)
      .leftJoin(users, listingOwnerJoin())
      .where(where)
      .orderBy(...orderFor(filters.sort))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: sql<number>`cast(count(*) as int)` }).from(properties).where(where),
  ]);

  const total = countRows[0]?.total ?? 0;
  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

/** Listing query used by the curated SEO landing pages. */
export async function getLandingProperties(filters: PropertyFilters, limit = 9) {
  await ensureSeeded();
  const conditions = buildConditions(filters);
  const where = conditions.length ? and(...conditions) : undefined;
  const [items, countRows] = await Promise.all([
    db
      .select(LISTING_WITH_DEALER)
      .from(properties)
      .leftJoin(users, listingOwnerJoin())
      .where(where)
      .orderBy(...orderFor(filters.sort))
      .limit(limit),
    db.select({ total: sql<number>`cast(count(*) as int)` }).from(properties).where(where),
  ]);
  return { items, total: countRows[0]?.total ?? 0 };
}

export async function getPropertyBySlug(slug: string): Promise<Property | undefined> {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(properties)
    .where(and(eq(properties.slug, slug), isPublished))
    .limit(1);
  return rows[0];
}

export async function getAllPropertySlugs() {
  await ensureSeeded();
  return db
    .select({ slug: properties.slug, updatedAt: properties.createdAt })
    .from(properties)
    .where(isPublished)
    .orderBy(desc(properties.createdAt));
}

export async function getSimilarProperties(property: Property, limit = 3) {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(properties)
    .where(
      and(
        ne(properties.id, property.id),
        isPublished,
        or(
          eq(properties.citySlug, property.citySlug),
          eq(properties.propertyType, property.propertyType),
          eq(properties.purpose, property.purpose),
        ),
      ),
    )
    .orderBy(desc(properties.featured), desc(properties.createdAt))
    .limit(limit);
  return rows;
}

/** Nearby is geographic proximity, not merely matching purpose or property type. */
export async function getNearbyProperties(property: Property, limit = 6, radiusKm = 20) {
  await ensureSeeded();
  if (!Number.isFinite(property.lat) || !Number.isFinite(property.lng)) return [];
  const latitudeSpan = radiusKm / 111;
  const longitudeSpan = radiusKm / (111 * Math.max(0.1, Math.cos(property.lat * Math.PI / 180)));
  const distance = sql<number>`6371.0088 * 2 * asin(sqrt(least(1.0, greatest(0.0,
    power(sin(radians(${properties.lat} - ${property.lat}::double precision) / 2), 2)
    + cos(radians(${property.lat}::double precision)) * cos(radians(${properties.lat}))
    * power(sin(radians(${properties.lng} - ${property.lng}::double precision) / 2), 2)
  ))))`;
  const rows = await db.select({ property: properties, distanceKm: distance })
    .from(properties)
    .where(and(
      ne(properties.id, property.id),
      isPublished,
      gte(properties.lat, property.lat - latitudeSpan), lte(properties.lat, property.lat + latitudeSpan),
      gte(properties.lng, property.lng - longitudeSpan), lte(properties.lng, property.lng + longitudeSpan),
      lte(distance, radiusKm),
    ))
    .orderBy(asc(distance), asc(properties.id))
    .limit(Math.max(1, Math.min(12, limit)));
  return rows.map((row) => ({ ...row.property, distanceKm: Number(row.distanceKm) }));
}

export async function getFeaturedProperties(limit = 4) {
  await ensureSeeded();
  return db
    .select(LISTING_WITH_DEALER)
    .from(properties)
    .leftJoin(users, listingOwnerJoin())
    .where(and(eq(properties.featured, true), eq(properties.verified, true), isPublished))
    .orderBy(desc(properties.createdAt))
    .limit(limit);
}

export async function getPropertiesByIds(ids: number[]) {
  await ensureSeeded();
  if (ids.length === 0) return [];
  return db.select().from(properties).where(and(inArray(properties.id, ids), isPublished));
}

export async function getMapProperties(filters: PropertyFilters = {}, limit = 24) {
  await ensureSeeded();
  const conditions = buildConditions(filters);
  return db
    .select(LISTING_WITH_DEALER)
    .from(properties)
    .leftJoin(users, listingOwnerJoin())
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(properties.featured), desc(properties.views))
    .limit(limit);
}

export async function getCities() {
  await ensureSeeded();
  return db.select().from(cities).orderBy(asc(cities.sortOrder));
}

export async function getCityBySlug(slug: string) {
  await ensureSeeded();
  const rows = await db.select().from(cities).where(eq(cities.slug, slug)).limit(1);
  return rows[0];
}

export async function getCityListingCounts() {
  await ensureSeeded();
  const rows = await db
    .select({ citySlug: properties.citySlug, total: sql<number>`cast(count(*) as int)` })
    .from(properties)
    .where(isPublished)
    .groupBy(properties.citySlug);
  return new Map(rows.map((row) => [row.citySlug, row.total]));
}

export async function getProjects(limit = 12, featuredOnly = false) {
  await ensureSeeded();
  const query = db.select().from(projects);
  const rows = featuredOnly
    ? await query.where(eq(projects.featured, true)).orderBy(desc(projects.createdAt)).limit(limit)
    : await query.orderBy(desc(projects.featured), desc(projects.createdAt)).limit(limit);
  return rows;
}

export async function getProjectBySlug(slug: string) {
  await ensureSeeded();
  const rows = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  return rows[0];
}

export async function getAllProjectSlugs() {
  await ensureSeeded();
  return db.select({ slug: projects.slug }).from(projects);
}

export async function getPosts(limit = 6) {
  await ensureSeeded();
  return db.select().from(posts).orderBy(desc(posts.publishedAt)).limit(limit);
}

export async function getPostBySlug(slug: string) {
  await ensureSeeded();
  const rows = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  return rows[0];
}

export async function getAllPostSlugs() {
  await ensureSeeded();
  return db
    .select({ slug: posts.slug, updatedAt: posts.publishedAt })
    .from(posts)
    .orderBy(desc(posts.publishedAt));
}

export async function getTestimonials() {
  await ensureSeeded();
  return db.select().from(testimonials).orderBy(asc(testimonials.sortOrder));
}

export async function getAgents() {
  await ensureSeeded();
  return db.select().from(agents).orderBy(asc(agents.id));
}

export async function getAgentBySlug(slug: string) {
  await ensureSeeded();
  const rows = await db.select().from(agents).where(eq(agents.slug, slug)).limit(1);
  return rows[0];
}

export async function getPlatformStats() {
  await ensureSeeded();
  const [listingRows, cityRows, verifiedRows, featuredRows] = await Promise.all([
    db.select({ total: sql<number>`cast(count(*) as int)` }).from(properties).where(isPublished),
    db
      .select({ total: sql<number>`cast(count(distinct ${properties.citySlug}) as int)` })
      .from(properties)
      .where(isPublished),
    db
      .select({ total: sql<number>`cast(count(*) as int)` })
      .from(properties)
      .where(and(eq(properties.verified, true), isPublished)),
    db.select({ total: sql<number>`cast(count(*) as int)` }).from(projects),
  ]);
  return {
    listings: listingRows[0]?.total ?? 0,
    cities: cityRows[0]?.total ?? 0,
    verified: verifiedRows[0]?.total ?? 0,
    projects: featuredRows[0]?.total ?? 0,
  };
}

export async function getFavoritePropertiesForUser(userId: number) {
  await ensureSeeded();
  return db
    .select({
      id: properties.id,
      slug: properties.slug,
      title: properties.title,
      cityName: properties.cityName,
      locationArea: properties.locationArea,
      price: properties.price,
      priceUnit: properties.priceUnit,
      purpose: properties.purpose,
      coverImage: properties.coverImage,
      propertyType: properties.propertyType,
      bedrooms: properties.bedrooms,
      bathrooms: properties.bathrooms,
      areaValue: properties.areaValue,
      areaUnit: properties.areaUnit,
      areaSqft: properties.areaSqft,
      verified: properties.verified,
      createdAt: favorites.createdAt,
    })
    .from(favorites)
    .innerJoin(properties, eq(favorites.propertyId, properties.id))
    .where(and(eq(favorites.userId, userId), isPublished))
    .orderBy(desc(favorites.createdAt));
}

export async function getInquiriesForEmail(email: string) {
  await ensureSeeded();
  return db.select().from(inquiries).where(eq(inquiries.email, email)).orderBy(desc(inquiries.createdAt)).limit(20);
}

export async function addFavorite(userId: number, propertyId: number) {
  await ensureSeeded();
  await db.insert(favorites).values({ userId, propertyId }).onConflictDoNothing();
}

export async function removeFavorite(userId: number, propertyId: number) {
  await ensureSeeded();
  await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId)));
}

export async function toggleFavorite(userId: number, propertyId: number) {
  await ensureSeeded();
  const existing = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId)))
    .limit(1);
  if (existing.length > 0) {
    await removeFavorite(userId, propertyId);
    return false;
  }
  await addFavorite(userId, propertyId);
  return true;
}

/* ------------------------------------------------------------------ */
/*  Dealers — registered accounts that publish property               */
/* ------------------------------------------------------------------ */

/** A public dealer profile never carries password material. */
export type DealerProfile = Omit<User, "passwordHash"> & {
  listings: number;
  verifiedListings: number;
  cityCount: number;
};

const dealerAggregates = {
  id: users.id,
  name: users.name,
  email: users.email,
  phone: users.phone,
  whatsapp: users.whatsapp,
  slug: users.slug,
  role: users.role,
  citySlug: users.citySlug,
  cityName: users.cityName,
  agency: users.agency,
  bio: users.bio,
  avatarUrl: users.avatarUrl,
  designation: users.designation,
  officeAddress: users.officeAddress,
  companyPhone: users.companyPhone,
  companyWebsite: users.companyWebsite,
  companyLogo: users.companyLogo,
  experience: users.experience,
  areas: users.areas,
  verificationNote: users.verificationNote,
  profileCompletedAt: users.profileCompletedAt,
  verificationRequestedAt: users.verificationRequestedAt,
  isVerified: users.isVerified,
  verifiedAt: users.verifiedAt,
  createdAt: users.createdAt,
  listings: sql<number>`cast(count(${properties.id}) as int)`,
  verifiedListings: sql<number>`cast(count(${properties.id}) filter (where ${properties.verified}) as int)`,
  cityCount: sql<number>`cast(count(distinct ${properties.citySlug}) as int)`,
} as const;

/**
 * Public dealer profiles. Only accounts that actually published inventory are
 * returned — a registered buyer with an empty shortlist is not a dealer.
 */
export async function getDealers(options: { verifiedOnly?: boolean; city?: string; limit?: number } = {}) {
  await ensureSeeded();
  const rows = await db
    .select(dealerAggregates)
    .from(users)
    .leftJoin(properties, dealerListingJoin())
    .where(options.city ? eq(users.citySlug, options.city) : undefined)
    .groupBy(users.id)
    .having(sql`count(${properties.id}) > 0`)
    .orderBy(desc(users.isVerified), desc(sql`count(${properties.id})`), asc(users.name))
    .limit(Math.max(1, Math.min(60, options.limit ?? 24)));

  const dealers = rows as unknown as DealerProfile[];
  return options.verifiedOnly ? dealers.filter((dealer) => dealer.isVerified) : dealers;
}

export async function getDealerCount() {
  await ensureSeeded();
  const rows = await db
    .select({ total: sql<number>`cast(count(distinct ${users.id}) as int)` })
    .from(users)
    .leftJoin(properties, dealerListingJoin())
    .having(sql`count(${properties.id}) > 0`);
  return rows[0]?.total ?? 0;
}

export async function getDealerBySlug(slug: string): Promise<DealerProfile | undefined> {
  await ensureSeeded();
  const rows = await db
    .select(dealerAggregates)
    .from(users)
    .leftJoin(properties, dealerListingJoin())
    .where(eq(users.slug, slug))
    .groupBy(users.id)
    .limit(1);
  return (rows[0] as unknown as DealerProfile) ?? undefined;
}

export async function getDealerByEmail(email: string): Promise<DealerProfile | undefined> {
  await ensureSeeded();
  const rows = await db
    .select(dealerAggregates)
    .from(users)
    .leftJoin(properties, dealerListingJoin())
    .where(sql`lower(${users.email}) = lower(${email})`)
    .groupBy(users.id)
    .limit(1);
  return (rows[0] as unknown as DealerProfile) ?? undefined;
}

export async function getAllDealerSlugs() {
  await ensureSeeded();
  return db
    .select({ slug: users.slug, updatedAt: users.createdAt, verified: users.isVerified })
    .from(users)
    .innerJoin(properties, dealerListingJoin())
    .where(sql`${users.slug} <> ''`)
    .groupBy(users.slug, users.createdAt, users.isVerified);
}

/**
 * Listings the signed-in owner has published plus everything still waiting for
 * review, so the account dashboard shows the full picture: what is live, what is
 * pending in the admin queue and what came back rejected with a note.
 */
export async function getUserSubmissions(user: Pick<User, "id" | "email">) {
  await ensureSeeded();
  const rows = await db
    .select({
      id: listingSubmissions.id,
      title: listingSubmissions.title,
      status: listingSubmissions.status,
      cityName: listingSubmissions.cityName,
      locationArea: listingSubmissions.locationArea,
      price: listingSubmissions.price,
      priceUnit: listingSubmissions.priceUnit,
      purpose: listingSubmissions.purpose,
      propertyType: listingSubmissions.propertyType,
      imageUrls: listingSubmissions.imageUrls,
      adminNote: listingSubmissions.adminNote,
      propertyId: listingSubmissions.propertyId,
      createdAt: listingSubmissions.createdAt,
      reviewedAt: listingSubmissions.reviewedAt,
    })
    .from(listingSubmissions)
    .where(
      or(
        eq(listingSubmissions.userId, user.id),
        sql`lower(${listingSubmissions.email}) = lower(${user.email})`,
      ),
    )
    .orderBy(desc(listingSubmissions.createdAt))
    .limit(30);
  return rows;
}

export type OwnerSubmission = Awaited<ReturnType<typeof getUserSubmissions>>[number];

/** Listings published by one dealer, newest first. */
export async function getPropertiesForDealer(user: Pick<User, "id" | "email">, limit = 12) {
  await ensureSeeded();
  return db
    .select(LISTING_WITH_DEALER)
    .from(properties)
    .leftJoin(users, listingOwnerJoin())
    .where(and(listedByUser(user.id), isPublished))
    .orderBy(desc(properties.featured), desc(properties.createdAt))
    .limit(Math.max(1, Math.min(48, limit)));
}

/**
 * Everything the signed-in owner has live, newest first. Used by the account
 * dashboard so a large portfolio never pushes a brand-new listing out of view
 * (the public dealer page keeps the featured-first ordering).
 */
export async function getOwnedProperties(userId: number, limit = 60) {
  await ensureSeeded();
  return db
    .select(LISTING_WITH_DEALER)
    .from(properties)
    .leftJoin(users, listingOwnerJoin())
    .where(listedByUser(userId))
    .orderBy(desc(properties.createdAt))
    .limit(Math.max(1, Math.min(120, limit)));
}

/**
 * The publishing account behind a listing, when there is one. Listings with no
 * account (desk inventory, or a submission approved before the owner signed in)
 * return nothing and the page falls back to the Properties Pak desk contact —
 * a published email address is never treated as proof of ownership.
 */
export async function getLeadDealerForProperty(property: Property): Promise<DealerProfile | undefined> {
  if (!property.listedByUserId) return undefined;
  const rows = await db
    .select(dealerAggregates)
    .from(users)
    .leftJoin(properties, dealerListingJoin())
    .where(eq(users.id, property.listedByUserId))
    .groupBy(users.id)
    .limit(1);
  return (rows[0] as unknown as DealerProfile) ?? undefined;
}

/** Admin overview: every registered account with its listing footprint. */
export async function getAdminUserRows() {
  await ensureSeeded();
  const rows = await db
    .select(dealerAggregates)
    .from(users)
    .leftJoin(
      properties,
      eq(properties.listedByUserId, users.id),
    )
    .groupBy(users.id)
    .orderBy(desc(users.isVerified), desc(sql`count(${properties.id})`), desc(users.createdAt));
  return rows as unknown as DealerProfile[];
}

export async function setUserVerification(userId: number, verified: boolean) {
  await ensureSeeded();
  const updated = await db
    .update(users)
    .set({ isVerified: verified, verifiedAt: verified ? new Date() : null })
    .where(eq(users.id, userId))
    .returning({ id: users.id, isVerified: users.isVerified, slug: users.slug, name: users.name });
  return updated[0];
}

/** Distinct towns present in the live inventory, for the cascading filters. */
export async function getListingAreasByCity() {
  await ensureSeeded();
  const rows = await db
    .select({
      citySlug: properties.citySlug,
      area: properties.locationArea,
      total: sql<number>`cast(count(*) as int)`,
    })
    .from(properties)
    .where(isPublished)
    .groupBy(properties.citySlug, properties.locationArea)
    .orderBy(desc(sql`count(*)`));
  return rows;
}

/**
 * Dealer cards for the homepage slider. Includes every account that either
 * publishes listings or has completed a professional profile, so a new signup
 * appears as soon as they finish setup — before that the account stays private.
 */
export async function getDealerShowcase(limit = 60) {
  await ensureSeeded();
  const rows = await db
    .select(dealerAggregates)
    .from(users)
    .leftJoin(properties, dealerListingJoin())
    .where(or(isNotNull(users.profileCompletedAt), eq(users.role, "dealer"), eq(users.role, "agency")))
    .groupBy(users.id)
    .orderBy(desc(users.isVerified), desc(sql`count(${properties.id})`), asc(users.name))
    .limit(Math.max(1, Math.min(60, limit)));
  return rows as unknown as DealerProfile[];
}

/** Fields the account owner can edit from the dashboard. */
export type DealerProfileInput = {
  name?: string;
  whatsapp?: string;
  bio?: string;
  experience?: string;
  areas?: string;
  avatarUrl?: string;
  agency?: string;
  designation?: string;
  officeAddress?: string;
  citySlug?: string;
  cityName?: string;
  companyPhone?: string;
  companyWebsite?: string;
  companyLogo?: string;
  verificationNote?: string;
  markComplete?: boolean;
  requestVerification?: boolean;
};

const PROFILE_TEXT_FIELDS = [
  "name",
  "whatsapp",
  "bio",
  "experience",
  "areas",
  "avatarUrl",
  "agency",
  "designation",
  "officeAddress",
  "citySlug",
  "cityName",
  "companyPhone",
  "companyWebsite",
  "companyLogo",
  "verificationNote",
] as const;

/** Saves the professional profile; only the account owner can call this. */
export async function updateDealerProfile(userId: number, input: DealerProfileInput) {
  await ensureSeeded();
  const patch: Record<string, unknown> = {};

  for (const field of PROFILE_TEXT_FIELDS) {
    const value = input[field];
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    // Never blank the account name — it is required and shown across the site.
    if (field === "name" && trimmed.length < 2) continue;
    patch[field] = trimmed.slice(0, 600);
  }
  // An account that fills in the dealer form becomes a dealer, so their profile
  // can be linked from listings and the dealer directory.
  if (Object.keys(patch).length > 0) {
    const current = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
    if (current[0]?.role === "member") patch.role = "dealer";
  }
  if (input.markComplete) patch.profileCompletedAt = new Date();
  if (input.requestVerification) patch.verificationRequestedAt = new Date();

  if (Object.keys(patch).length === 0) return undefined;

  const updated = await db.update(users).set(patch).where(eq(users.id, userId)).returning();
  return updated[0];
}

/** Admin: clear a verification request after the account has been reviewed. */
export async function clearVerificationRequest(userId: number) {
  await ensureSeeded();
  const updated = await db
    .update(users)
    .set({ verificationRequestedAt: null })
    .where(eq(users.id, userId))
    .returning({ id: users.id });
  return updated[0];
}
