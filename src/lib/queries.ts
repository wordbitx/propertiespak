import { and, asc, desc, eq, gte, ilike, inArray, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import {
  agents,
  cities,
  favorites,
  inquiries,
  posts,
  projects,
  properties,
  testimonials,
  type Property,
} from "@/db/schema";

export type PropertyFilters = {
  purpose?: string;
  city?: string;
  type?: string;
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

export function buildConditions(filters: PropertyFilters): SQL[] {
  const conditions: SQL[] = [];
  if (filters.purpose) conditions.push(eq(properties.purpose, filters.purpose));
  if (filters.city) conditions.push(eq(properties.citySlug, filters.city));
  if (filters.type) conditions.push(eq(properties.propertyType, filters.type));
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
      .select()
      .from(properties)
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
    db.select().from(properties).where(where).orderBy(...orderFor(filters.sort)).limit(limit),
    db.select({ total: sql<number>`cast(count(*) as int)` }).from(properties).where(where),
  ]);
  return { items, total: countRows[0]?.total ?? 0 };
}

export async function getPropertyBySlug(slug: string): Promise<Property | undefined> {
  await ensureSeeded();
  const rows = await db.select().from(properties).where(eq(properties.slug, slug)).limit(1);
  return rows[0];
}

export async function getAllPropertySlugs() {
  await ensureSeeded();
  return db.select({ slug: properties.slug }).from(properties);
}

export async function getSimilarProperties(property: Property, limit = 3) {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(properties)
    .where(
      and(
        ne(properties.id, property.id),
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
    .select()
    .from(properties)
    .where(and(eq(properties.featured, true), eq(properties.verified, true)))
    .orderBy(desc(properties.createdAt))
    .limit(limit);
}

export async function getPropertiesByIds(ids: number[]) {
  await ensureSeeded();
  if (ids.length === 0) return [];
  return db.select().from(properties).where(inArray(properties.id, ids));
}

export async function getMapProperties(filters: PropertyFilters = {}, limit = 24) {
  await ensureSeeded();
  const conditions = buildConditions(filters);
  return db
    .select()
    .from(properties)
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
  return db.select({ slug: posts.slug }).from(posts);
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
    db.select({ total: sql<number>`cast(count(*) as int)` }).from(properties),
    db.select({ total: sql<number>`cast(count(distinct ${properties.citySlug}) as int)` }).from(properties),
    db.select({ total: sql<number>`cast(count(*) as int)` }).from(properties).where(eq(properties.verified, true)),
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
    .where(eq(favorites.userId, userId))
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
