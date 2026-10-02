import { and, asc, desc, eq, getTableColumns, gte, ilike, inArray, isNotNull, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { cachedQuery } from "@/lib/cache";
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
  townExact?: boolean;
  type?: string;
  baths?: number;
  furnishing?: string;
  possession?: string;
  paymentType?: string;
  withImages?: boolean;
  withVideos?: boolean;
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

const COMMERCIAL_CATEGORIES = ["office", "shop", "building", "warehouse", "commercial", "factory", "other"];
const PLOT_CATEGORIES = ["plot", "land", "plot_file", "plot_form", "agricultural_land", "commercial_plot", "industrial_land"];
const HOME_CATEGORIES = ["house", "apartment", "farmhouse", "penthouse"];

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
    if (filters.townExact) {
      conditions.push(eq(properties.locationArea, filters.town));
    } else {
      const term = `%${filters.town.trim()}%`;
      const townMatch = or(ilike(properties.locationArea, term), ilike(properties.address, term));
      if (townMatch) conditions.push(townMatch);
    }
  }
  if (filters.type) conditions.push(eq(properties.propertyType, filters.type));
  if (typeof filters.baths === "number") conditions.push(gte(properties.bathrooms, filters.baths));
  if (filters.furnishing) conditions.push(eq(properties.furnishing, filters.furnishing));
  if (filters.possession) conditions.push(eq(properties.possession, filters.possession));
  if (typeof filters.maxArea === "number") conditions.push(lte(properties.areaSqft, filters.maxArea));
  if (filters.category === "homes") {
    conditions.push(inArray(properties.category, HOME_CATEGORIES));
  } else if (filters.category === "plot") {
    conditions.push(inArray(properties.category, PLOT_CATEGORIES));
  } else if (filters.category === "commercial" || filters.commercialOnly) {
    conditions.push(inArray(properties.category, COMMERCIAL_CATEGORIES));
  } else if (filters.category) {
    conditions.push(eq(properties.category, filters.category));
  }
  if (typeof filters.minPrice === "number") conditions.push(gte(properties.price, filters.minPrice));
  if (typeof filters.maxPrice === "number") conditions.push(lte(properties.price, filters.maxPrice));
  if (typeof filters.beds === "number") {
    if (filters.beds === 0) {
      conditions.push(eq(properties.bedrooms, 0), inArray(properties.propertyType, ["Apartment", "Penthouse", "Upper Portion", "Lower Portion", "Room"]));
    } else conditions.push(gte(properties.bedrooms, filters.beds));
  }
  if (filters.paymentType) conditions.push(eq(properties.paymentType, filters.paymentType));
  if (filters.withImages) conditions.push(sql`(length(trim(${properties.coverImage})) > 0 or jsonb_array_length(${properties.images}) > 0)`);
  if (filters.withVideos) conditions.push(sql`length(trim(${properties.videoUrl})) > 0`);
  if (typeof filters.minArea === "number") conditions.push(gte(properties.areaSqft, filters.minArea));
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
      return [asc(properties.price), asc(properties.id)];
    case "price-desc":
      return [desc(properties.price), desc(properties.id)];
    case "area-desc":
      return [desc(properties.areaSqft), desc(properties.id)];
    case "popular":
      return [desc(properties.views), desc(properties.id)];
    default:
      return [desc(properties.createdAt), desc(properties.id)];
  }
}

async function searchPropertiesUncached(filters: PropertyFilters = {}) {
  await ensureSeeded();
  const conditions = buildConditions(filters);
  const where = conditions.length ? and(...conditions) : undefined;
  const pageSize = filters.pageSize ?? 12;
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
async function getLandingPropertiesUncached(filters: PropertyFilters, limit = 9) {
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

async function getPropertyBySlugUncached(slug: string): Promise<Property | undefined> {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(properties)
    .where(and(eq(properties.slug, slug), isPublished))
    .limit(1);
  return rows[0];
}

async function getAllPropertySlugsUncached() {
  await ensureSeeded();
  return db
    .select({ slug: properties.slug, updatedAt: properties.createdAt })
    .from(properties)
    .where(isPublished)
    .orderBy(desc(properties.createdAt));
}

async function getSimilarPropertiesUncached(property: Pick<Property, "id" | "citySlug" | "propertyType" | "purpose">, limit = 3) {
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
async function getNearbyPropertiesUncached(property: Pick<Property, "id" | "lat" | "lng">, limit = 6, radiusKm = 20) {
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

async function getFeaturedPropertiesUncached(limit = 4) {
  await ensureSeeded();
  return db
    .select(LISTING_WITH_DEALER)
    .from(properties)
    .leftJoin(users, listingOwnerJoin())
    .where(and(eq(properties.featured, true), eq(properties.verified, true), isPublished))
    .orderBy(desc(properties.createdAt))
    .limit(limit);
}

async function getPropertiesByIdsUncached(ids: number[]) {
  await ensureSeeded();
  if (ids.length === 0) return [];
  return db.select().from(properties).where(and(inArray(properties.id, ids), isPublished));
}

async function getMapPropertiesUncached(filters: PropertyFilters = {}, limit = 24) {
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

export type PopularSearchGroup = {
  citySlug: string;
  cityName: string;
  purpose: string;
  type: string;
  total: number;
  locations: { name: string; total: number }[];
};

/** Counts come from published inventory, never invented visitor/search numbers. */
async function getPopularSearchesUncached(): Promise<PopularSearchGroup[]> {
  await ensureSeeded();
  const rows = await db.select({
    citySlug: properties.citySlug, cityName: properties.cityName, purpose: properties.purpose,
    type: properties.propertyType, category: properties.category, area: properties.locationArea,
    total: sql<number>`count(*)::int`,
  }).from(properties).where(and(isPublished, inArray(properties.purpose, ["buy", "rent"])))
    .groupBy(properties.citySlug, properties.cityName, properties.purpose, properties.propertyType, properties.category, properties.locationArea);
  const groups = new Map<string, Omit<PopularSearchGroup, "locations"> & { areas: Map<string, number> }>();
  for (const row of rows) {
    const types = ["all", row.type, ...(COMMERCIAL_CATEGORIES.includes(row.category) ? ["commercial"] : [])];
    for (const type of types) {
      const key = `${row.citySlug}:${row.purpose}:${type}`;
      let group = groups.get(key);
      if (!group) {
        group = { citySlug: row.citySlug, cityName: row.cityName, purpose: row.purpose, type, total: 0, areas: new Map() };
        groups.set(key, group);
      }
      group.total += row.total;
      if (row.area.trim()) group.areas.set(row.area, (group.areas.get(row.area) ?? 0) + row.total);
    }
  }
  return [...groups.values()].map(({ areas, ...group }) => ({
    ...group,
    locations: [...areas].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8).map(([name, total]) => ({ name, total })),
  }));
}

async function getCitiesUncached() {
  await ensureSeeded();
  return db.select().from(cities).orderBy(asc(cities.sortOrder));
}

async function getCityBySlugUncached(slug: string) {
  await ensureSeeded();
  const rows = await db.select().from(cities).where(eq(cities.slug, slug)).limit(1);
  return rows[0];
}

async function getCityListingCountsUncached() {
  await ensureSeeded();
  const rows = await db
    .select({ citySlug: properties.citySlug, total: sql<number>`cast(count(*) as int)` })
    .from(properties)
    .where(isPublished)
    .groupBy(properties.citySlug);
  return new Map(rows.map((row) => [row.citySlug, row.total]));
}

async function getProjectsUncached(limit = 12, featuredOnly = false) {
  await ensureSeeded();
  const query = db.select().from(projects);
  const rows = featuredOnly
    ? await query.where(eq(projects.featured, true)).orderBy(desc(projects.createdAt)).limit(limit)
    : await query.orderBy(desc(projects.featured), desc(projects.createdAt)).limit(limit);
  return rows;
}

async function getProjectBySlugUncached(slug: string) {
  await ensureSeeded();
  const rows = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  return rows[0];
}

async function getAllProjectSlugsUncached() {
  await ensureSeeded();
  return db.select({ slug: projects.slug }).from(projects);
}

async function getPostsUncached(limit = 6) {
  await ensureSeeded();
  return db.select().from(posts).orderBy(desc(posts.publishedAt)).limit(limit);
}

async function getPostBySlugUncached(slug: string) {
  await ensureSeeded();
  const rows = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  return rows[0];
}

async function getAllPostSlugsUncached() {
  await ensureSeeded();
  return db
    .select({ slug: posts.slug, updatedAt: posts.publishedAt })
    .from(posts)
    .orderBy(desc(posts.publishedAt));
}

async function getTestimonialsUncached() {
  await ensureSeeded();
  return db.select().from(testimonials).orderBy(asc(testimonials.sortOrder));
}

async function getAgentsUncached() {
  await ensureSeeded();
  return db.select().from(agents).orderBy(asc(agents.id));
}

async function getAgentBySlugUncached(slug: string) {
  await ensureSeeded();
  const rows = await db.select().from(agents).where(eq(agents.slug, slug)).limit(1);
  return rows[0];
}

async function getPlatformStatsUncached() {
  await ensureSeeded();
  // One round trip instead of four.
  const [row] = await db
    .select({
      listings: sql<number>`cast(count(*) as int)`,
      cities: sql<number>`cast(count(distinct ${properties.citySlug}) as int)`,
      verified: sql<number>`cast(count(*) filter (where ${properties.verified}) as int)`,
      projects: sql<number>`(select cast(count(*) as int) from ${projects})`,
    })
    .from(properties)
    .where(isPublished);
  return {
    listings: Number(row?.listings ?? 0),
    cities: Number(row?.cities ?? 0),
    verified: Number(row?.verified ?? 0),
    projects: Number(row?.projects ?? 0),
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
async function getDealersUncached(options: { verifiedOnly?: boolean; city?: string; limit?: number } = {}) {
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

async function getDealerCountUncached() {
  await ensureSeeded();
  const rows = await db
    .select({ total: sql<number>`cast(count(distinct ${users.id}) as int)` })
    .from(users)
    .leftJoin(properties, dealerListingJoin())
    .having(sql`count(${properties.id}) > 0`);
  return rows[0]?.total ?? 0;
}

async function getDealerBySlugUncached(slug: string): Promise<DealerProfile | undefined> {
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

async function getAllDealerSlugsUncached() {
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
async function getPropertiesForDealerUncached(userId: number, limit = 12) {
  await ensureSeeded();
  return db
    .select(LISTING_WITH_DEALER)
    .from(properties)
    .leftJoin(users, listingOwnerJoin())
    .where(and(listedByUser(userId), isPublished))
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
async function getLeadDealerForPropertyUncached(property: Pick<Property, "listedByUserId">): Promise<DealerProfile | undefined> {
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

/** Admin: update the name and agency shown on public dealer profiles. */
export async function updateAdminUserIdentity(userId: number, input: { name?: string; agency?: string }) {
  await ensureSeeded();
  const updated = await db
    .update(users)
    .set(input)
    .where(eq(users.id, userId))
    .returning({ id: users.id, name: users.name, agency: users.agency, slug: users.slug });
  return updated[0];
}

/** Distinct towns present in the live inventory, for the cascading filters. */
async function getListingAreasByCityUncached() {
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
async function getDealerShowcaseUncached(limit = 60) {
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

// ---------------------------------------------------------------------------
// Public reads go through the shared data cache (see src/lib/cache.ts).
// ---------------------------------------------------------------------------

export const searchProperties = cachedQuery("searchProperties", searchPropertiesUncached);
export const getLandingProperties = cachedQuery("getLandingProperties", getLandingPropertiesUncached);
export const getPropertyBySlug = cachedQuery("getPropertyBySlug", getPropertyBySlugUncached);
export const getAllPropertySlugs = cachedQuery("getAllPropertySlugs", getAllPropertySlugsUncached);
export const getFeaturedProperties = cachedQuery("getFeaturedProperties", getFeaturedPropertiesUncached);
export const getPropertiesByIds = cachedQuery("getPropertiesByIds", getPropertiesByIdsUncached);
export const getMapProperties = cachedQuery("getMapProperties", getMapPropertiesUncached);
export const getCities = cachedQuery("getCities", getCitiesUncached);
export const getCityBySlug = cachedQuery("getCityBySlug", getCityBySlugUncached);
export const getCityListingCounts = cachedQuery("getCityListingCounts", getCityListingCountsUncached);
export const getPopularSearches = cachedQuery("getPopularSearches", getPopularSearchesUncached);
export const getProjects = cachedQuery("getProjects", getProjectsUncached);
export const getProjectBySlug = cachedQuery("getProjectBySlug", getProjectBySlugUncached);
export const getAllProjectSlugs = cachedQuery("getAllProjectSlugs", getAllProjectSlugsUncached);
export const getPosts = cachedQuery("getPosts", getPostsUncached);
export const getPostBySlug = cachedQuery("getPostBySlug", getPostBySlugUncached);
export const getAllPostSlugs = cachedQuery("getAllPostSlugs", getAllPostSlugsUncached);
export const getTestimonials = cachedQuery("getTestimonials", getTestimonialsUncached);
export const getAgents = cachedQuery("getAgents", getAgentsUncached);
export const getAgentBySlug = cachedQuery("getAgentBySlug", getAgentBySlugUncached);
export const getPlatformStats = cachedQuery("getPlatformStats", getPlatformStatsUncached);
export const getDealers = cachedQuery("getDealers", getDealersUncached);
export const getDealerCount = cachedQuery("getDealerCount", getDealerCountUncached);
export const getDealerBySlug = cachedQuery("getDealerBySlug", getDealerBySlugUncached);
export const getAllDealerSlugs = cachedQuery("getAllDealerSlugs", getAllDealerSlugsUncached);
export const getListingAreasByCity = cachedQuery("getListingAreasByCity", getListingAreasByCityUncached);
export const getDealerShowcase = cachedQuery("getDealerShowcase", getDealerShowcaseUncached);

const similarPropertiesCached = cachedQuery("getSimilarProperties", getSimilarPropertiesUncached);
export function getSimilarProperties(property: Pick<Property, "id" | "citySlug" | "propertyType" | "purpose">, limit = 3) {
  const { id, citySlug, propertyType, purpose } = property;
  return similarPropertiesCached({ id, citySlug, propertyType, purpose }, limit);
}

const nearbyPropertiesCached = cachedQuery("getNearbyProperties", getNearbyPropertiesUncached);
export function getNearbyProperties(property: Pick<Property, "id" | "lat" | "lng">, limit = 6, radiusKm = 20) {
  const { id, lat, lng } = property;
  return nearbyPropertiesCached({ id, lat, lng }, limit, radiusKm);
}

const leadDealerCached = cachedQuery("getLeadDealerForProperty", getLeadDealerForPropertyUncached);
export function getLeadDealerForProperty(property: Pick<Property, "listedByUserId">): Promise<DealerProfile | undefined> {
  if (!property.listedByUserId) return Promise.resolve(undefined);
  return leadDealerCached({ listedByUserId: property.listedByUserId });
}

const propertiesForDealerCached = cachedQuery("getPropertiesForDealer", getPropertiesForDealerUncached);
export function getPropertiesForDealer(user: Pick<User, "id" | "email">, limit = 12) {
  // Key on the id only — callers may pass a full user row.
  return propertiesForDealerCached(user.id, limit);
}
