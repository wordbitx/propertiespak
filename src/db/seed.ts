import { createHash } from "node:crypto";
import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db, type Executor } from "@/db";
import { agents, cities, posts, projects, properties, testimonials, users } from "@/db/schema";
import { dealerSeed } from "@/db/seed-dealers";
import { townPropertySeed } from "@/db/seed-towns";
import { societyPropertySeed } from "@/db/seed-societies";
import { hashPassword } from "@/lib/password";
import { agentSeed, citySeed, postSeed, projectSeed, propertySeed, testimonialSeed } from "@/db/seed-data";
import { extraPropertySeed } from "@/db/seed-data-extra";
import { dhaPropertySeed } from "@/db/seed-data-dha";
import { EXTRA_POSTS, POST_LINKS } from "@/db/seed-content";
import { assignSeedGalleries } from "@/db/seed-gallery";
import type { SeedProperty } from "@/db/seed-data";
import { HERO_PHOTO_ID, photo, photos, sectionPhotos, submissionFallbackPhotos } from "@/lib/images";

/**
 * Idempotent schema guard. The canonical schema lives in `src/db/schema.ts`
 * (applied with `drizzle-kit push`); this raw DDL keeps the app bootable in a
 * fresh sandbox where push has not run yet.
 */
const SCHEMA_SQL = `
    CREATE TABLE IF NOT EXISTS cities (
      id serial PRIMARY KEY,
      slug text NOT NULL UNIQUE,
      name text NOT NULL,
      province text NOT NULL DEFAULT 'Punjab',
      tagline text NOT NULL DEFAULT '',
      description text NOT NULL DEFAULT '',
      image_url text NOT NULL DEFAULT '',
      image_alt text NOT NULL DEFAULT '',
      lat double precision NOT NULL DEFAULT 31.5204,
      lng double precision NOT NULL DEFAULT 74.3587,
      is_featured boolean NOT NULL DEFAULT false,
      sort_order integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS agents (
      id serial PRIMARY KEY,
      slug text NOT NULL UNIQUE,
      name text NOT NULL,
      title text NOT NULL DEFAULT 'Property Consultant',
      agency text NOT NULL DEFAULT 'Properties Pak Partners',
      email text NOT NULL,
      phone text NOT NULL,
      whatsapp text NOT NULL DEFAULT '',
      city_name text NOT NULL DEFAULT 'Lahore',
      experience_years integer NOT NULL DEFAULT 5,
      deals_closed integer NOT NULL DEFAULT 0,
      languages jsonb NOT NULL DEFAULT '[]'::jsonb,
      bio text NOT NULL DEFAULT '',
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS projects (
      id serial PRIMARY KEY,
      slug text NOT NULL UNIQUE,
      name text NOT NULL,
      developer text NOT NULL,
      city_name text NOT NULL,
      city_slug text NOT NULL,
      location text NOT NULL,
      project_type text NOT NULL,
      status text NOT NULL DEFAULT 'Under Construction',
      starting_price bigint NOT NULL,
      completion text NOT NULL DEFAULT '',
      units text NOT NULL DEFAULT '',
      description text NOT NULL DEFAULT '',
      highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
      cover_image text NOT NULL DEFAULT '',
      images jsonb NOT NULL DEFAULT '[]'::jsonb,
      lat double precision NOT NULL DEFAULT 31.5204,
      lng double precision NOT NULL DEFAULT 74.3587,
      featured boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS properties (
      id serial PRIMARY KEY,
      slug text NOT NULL,
      title text NOT NULL,
      purpose text NOT NULL,
      category text NOT NULL,
      property_type text NOT NULL,
      city_slug text NOT NULL,
      city_name text NOT NULL,
      location_area text NOT NULL,
      address text NOT NULL DEFAULT '',
      lat double precision NOT NULL DEFAULT 31.5204,
      lng double precision NOT NULL DEFAULT 74.3587,
      price bigint NOT NULL,
      price_unit text NOT NULL DEFAULT 'total',
      negotiable boolean NOT NULL DEFAULT false,
      bedrooms integer NOT NULL DEFAULT 0,
      bathrooms integer NOT NULL DEFAULT 0,
      area_value double precision NOT NULL DEFAULT 0,
      area_unit text NOT NULL DEFAULT 'sqft',
      area_sqft integer NOT NULL DEFAULT 0,
      parking integer NOT NULL DEFAULT 0,
      furnishing text NOT NULL DEFAULT 'Unfurnished',
      possession text NOT NULL DEFAULT 'Available',
      description text NOT NULL DEFAULT '',
      features jsonb NOT NULL DEFAULT '[]'::jsonb,
      amenities jsonb NOT NULL DEFAULT '[]'::jsonb,
      cover_image text NOT NULL DEFAULT '',
      images jsonb NOT NULL DEFAULT '[]'::jsonb,
      featured boolean NOT NULL DEFAULT false,
      verified boolean NOT NULL DEFAULT true,
      is_new_project boolean NOT NULL DEFAULT false,
      project_slug text,
      agent_slug text NOT NULL,
      listed_by_name text NOT NULL DEFAULT '',
      listed_by_email text NOT NULL DEFAULT '',
      listed_by_phone text NOT NULL DEFAULT '',
      listed_by_whatsapp text NOT NULL DEFAULT '',
      listed_by_user_id integer,
      published boolean NOT NULL DEFAULT true,
      views integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS properties_slug_idx ON properties (slug);
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS listed_by_name text NOT NULL DEFAULT '';
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS listed_by_email text NOT NULL DEFAULT '';
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS listed_by_phone text NOT NULL DEFAULT '';
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS listed_by_whatsapp text NOT NULL DEFAULT '';
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS listed_by_user_id integer;
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS payment_type text NOT NULL DEFAULT '';
    ALTER TABLE properties ALTER COLUMN payment_type SET DEFAULT '';
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS video_url text NOT NULL DEFAULT '';
    CREATE INDEX IF NOT EXISTS properties_listed_by_user_idx ON properties (listed_by_user_id);
    CREATE INDEX IF NOT EXISTS properties_published_idx ON properties (published);
    CREATE INDEX IF NOT EXISTS properties_location_area_idx ON properties (location_area);
    CREATE TABLE IF NOT EXISTS listing_media (
      id serial PRIMARY KEY,
      file_name text NOT NULL,
      mime_type text NOT NULL,
      byte_size integer NOT NULL,
      data_base64 text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS posts (
      id serial PRIMARY KEY,
      slug text NOT NULL UNIQUE,
      title text NOT NULL,
      category text NOT NULL DEFAULT 'Guides',
      excerpt text NOT NULL,
      body jsonb NOT NULL DEFAULT '[]'::jsonb,
      cover_image text NOT NULL DEFAULT '',
      author text NOT NULL DEFAULT 'Properties Pak Research',
      read_minutes integer NOT NULL DEFAULT 5,
      tags jsonb NOT NULL DEFAULT '[]'::jsonb,
      links jsonb NOT NULL DEFAULT '[]'::jsonb,
      published_at timestamptz NOT NULL DEFAULT now()
    );
    ALTER TABLE posts ADD COLUMN IF NOT EXISTS links jsonb NOT NULL DEFAULT '[]'::jsonb;
    CREATE TABLE IF NOT EXISTS testimonials (
      id serial PRIMARY KEY,
      name text NOT NULL,
      role text NOT NULL,
      city text NOT NULL,
      quote text NOT NULL,
      rating integer NOT NULL DEFAULT 5,
      initials text NOT NULL DEFAULT 'EW',
      sort_order integer NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS inquiries (
      id serial PRIMARY KEY,
      type text NOT NULL DEFAULT 'property',
      name text NOT NULL,
      email text NOT NULL,
      phone text NOT NULL,
      message text NOT NULL DEFAULT '',
      budget text NOT NULL DEFAULT '',
      preferred_date text NOT NULL DEFAULT '',
      city_name text NOT NULL DEFAULT '',
      property_slug text NOT NULL DEFAULT '',
      property_title text NOT NULL DEFAULT '',
      project_slug text NOT NULL DEFAULT '',
      source text NOT NULL DEFAULT 'website',
      created_at timestamptz NOT NULL DEFAULT now()
    );
    ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';
    ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS admin_note text NOT NULL DEFAULT '';
    ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
    CREATE TABLE IF NOT EXISTS users (
      id serial PRIMARY KEY,
      name text NOT NULL,
      email text NOT NULL UNIQUE,
      phone text NOT NULL DEFAULT '',
      password_hash text NOT NULL,
      slug text NOT NULL DEFAULT '',
      role text NOT NULL DEFAULT 'member',
      city_slug text NOT NULL DEFAULT '',
      city_name text NOT NULL DEFAULT '',
      agency text NOT NULL DEFAULT '',
      bio text NOT NULL DEFAULT '',
      whatsapp text NOT NULL DEFAULT '',
      avatar_url text NOT NULL DEFAULT '',
      designation text NOT NULL DEFAULT '',
      office_address text NOT NULL DEFAULT '',
      company_phone text NOT NULL DEFAULT '',
      company_website text NOT NULL DEFAULT '',
      company_logo text NOT NULL DEFAULT '',
      experience text NOT NULL DEFAULT '',
      areas text NOT NULL DEFAULT '',
      verification_note text NOT NULL DEFAULT '',
      profile_completed_at timestamptz,
      verification_requested_at timestamptz,
      is_verified boolean NOT NULL DEFAULT false,
      verified_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    ALTER TABLE users ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';
    /* Google sign-in needs no password, so the column becomes nullable. */
    ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
    /* Google's subject id (the sub claim) once an account signs in with Google. */
    ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'member';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS city_slug text NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS city_name text NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS agency text NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp text NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS designation text NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS office_address text NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS company_phone text NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS company_website text NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS company_logo text NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS experience text NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS areas text NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_note text NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed_at timestamptz;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_requested_at timestamptz;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at timestamptz;
    CREATE INDEX IF NOT EXISTS users_slug_idx ON users (slug);
    /* One Google account can only ever map to one Properties Pak account. */
    CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_idx ON users (google_id) WHERE google_id IS NOT NULL AND google_id <> '';
    CREATE TABLE IF NOT EXISTS favorites (
      id serial PRIMARY KEY,
      user_id integer NOT NULL,
      property_id integer NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS favorites_user_property_idx ON favorites (user_id, property_id);
    CREATE TABLE IF NOT EXISTS saved_searches (
      id serial PRIMARY KEY,
      user_id integer NOT NULL,
      label text NOT NULL,
      query_string text NOT NULL DEFAULT '',
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS listing_submissions (
      id serial PRIMARY KEY,
      status text NOT NULL DEFAULT 'pending',
      admin_note text NOT NULL DEFAULT '',
      property_id integer,
      name text NOT NULL,
      email text NOT NULL,
      phone text NOT NULL,
      title text NOT NULL,
      purpose text NOT NULL DEFAULT 'buy',
      category text NOT NULL DEFAULT 'house',
      property_type text NOT NULL DEFAULT 'House',
      city_slug text NOT NULL DEFAULT 'lahore',
      city_name text NOT NULL DEFAULT 'Lahore',
      location_area text NOT NULL DEFAULT '',
      address text NOT NULL DEFAULT '',
      lat double precision NOT NULL DEFAULT 31.5204,
      lng double precision NOT NULL DEFAULT 74.3587,
      price bigint NOT NULL DEFAULT 0,
      price_unit text NOT NULL DEFAULT 'total',
      negotiable boolean NOT NULL DEFAULT false,
      bedrooms integer NOT NULL DEFAULT 0,
      bathrooms integer NOT NULL DEFAULT 0,
      area_value double precision NOT NULL DEFAULT 0,
      area_unit text NOT NULL DEFAULT 'marla',
      area_sqft integer NOT NULL DEFAULT 0,
      parking integer NOT NULL DEFAULT 0,
      furnishing text NOT NULL DEFAULT 'Unfurnished',
      possession text NOT NULL DEFAULT 'Available',
      description text NOT NULL DEFAULT '',
      features jsonb NOT NULL DEFAULT '[]'::jsonb,
      amenities jsonb NOT NULL DEFAULT '[]'::jsonb,
      image_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
      user_id integer,
      created_at timestamptz NOT NULL DEFAULT now(),
      reviewed_at timestamptz
    );
    ALTER TABLE listing_submissions ADD COLUMN IF NOT EXISTS user_id integer;
    ALTER TABLE listing_submissions ADD COLUMN IF NOT EXISTS payment_type text NOT NULL DEFAULT '';
    ALTER TABLE listing_submissions ALTER COLUMN payment_type SET DEFAULT '';
    ALTER TABLE listing_submissions ADD COLUMN IF NOT EXISTS video_url text NOT NULL DEFAULT '';
    UPDATE properties p
    SET listed_by_name = s.name,
        listed_by_email = s.email,
        listed_by_phone = s.phone,
        listed_by_whatsapp = s.phone
    FROM listing_submissions s
    WHERE s.property_id = p.id
      AND s.status = 'approved'
      AND coalesce(p.listed_by_phone, '') = '';
    CREATE TABLE IF NOT EXISTS app_meta (
      key text PRIMARY KEY,
      value text NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
`;

async function ensureSchema(q: Executor) {
  await q.execute(sql.raw(SCHEMA_SQL));
}

/** Reference content is refreshed whenever the seed changes; listings are inserted once. */
async function refreshReferenceContent(q: Executor) {
  await q.delete(cities).where(inArray(cities.slug, citySeed.map((city) => city.slug)));
  await q.insert(cities).values(citySeed);

  await q.delete(agents).where(inArray(agents.slug, agentSeed.map((agent) => agent.slug)));
  await q.insert(agents).values(agentSeed);

  await q.delete(projects).where(inArray(projects.slug, projectSeed.map((project) => project.slug)));
  await q.insert(projects).values(
    projectSeed.map((project, index) => ({
      slug: project.slug,
      name: project.name,
      developer: project.developer,
      cityName: project.cityName,
      citySlug: project.citySlug,
      location: project.location,
      projectType: project.projectType,
      status: project.status,
      startingPrice: project.startingPrice,
      completion: project.completion,
      units: project.units,
      description: project.description,
      highlights: project.highlights,
      coverImage: photo(project.images[0], 1400, 900),
      images: project.images.map((id) => photo(id, 1400, 950)),
      lat: project.lat,
      lng: project.lng,
      featured: project.featured,
      createdAt: new Date(Date.now() - (index + 1) * 86_400_000 * 3),
    })),
  );

  const basePosts = postSeed.map((post, index) => ({
    slug: post.slug,
    title: post.title,
    category: post.category,
    excerpt: post.excerpt,
    body: post.body,
    coverImage: photo(post.image, 1200, 800),
    author: post.author,
    readMinutes: post.readMinutes,
    tags: post.tags,
    links: POST_LINKS[post.slug] ?? [],
    publishedAt: new Date(Date.now() - (index + 1) * 86_400_000 * 6),
  }));

  const extraPosts = EXTRA_POSTS.map((post, index) => ({
    slug: post.slug,
    title: post.title,
    category: post.category,
    excerpt: post.excerpt,
    body: post.body,
    coverImage: photo(post.image, 1200, 800),
    author: post.author,
    readMinutes: post.readMinutes,
    tags: post.tags,
    links: post.links,
    publishedAt: new Date(Date.now() - (basePosts.length + index + 1) * 86_400_000 * 5),
  }));

  const postRows = [...basePosts, ...extraPosts];
  await q.delete(posts).where(inArray(posts.slug, postRows.map((post) => post.slug)));
  await q.insert(posts).values(postRows);

  const { rows } = await q.execute<{ total: number }>(sql`select cast(count(*) as int) as total from testimonials`);
  if (Number(rows[0]?.total ?? 0) === 0) {
    await q.insert(testimonials).values(testimonialSeed);
  }
}

/**
 * Founding dealer accounts. Profile fields are refreshed whenever the seed changes; the
 * verification flag is only *seeded* once so an administrator's decision in the
 * admin workspace is never overwritten by a restart.
 */
async function seedDealerAccounts(q: Executor) {
  for (const dealer of dealerSeed) {
    const phoneDigits = dealer.phone.replace(/[^0-9]/g, "");
    const existing = await q
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dealer.email))
      .limit(1);

    if (existing.length === 0) {
      await q.insert(users).values({
        name: dealer.name,
        email: dealer.email,
        phone: dealer.phone,
        passwordHash: hashPassword(dealer.password),
        slug: dealer.slug,
        role: "dealer",
        citySlug: dealer.citySlug,
        cityName: dealer.cityName,
        agency: dealer.agency,
        bio: dealer.bio,
        whatsapp: phoneDigits,
        designation: dealer.designation,
        experience: dealer.experience,
        areas: dealer.areas,
        officeAddress: dealer.officeAddress,
        companyPhone: dealer.companyPhone,
        companyWebsite: dealer.companyWebsite,
        profileCompletedAt: new Date(),
        isVerified: dealer.isVerified,
        verifiedAt: dealer.isVerified ? new Date() : null,
      });
      continue;
    }

    await q
      .update(users)
      .set({
        name: dealer.name,
        phone: dealer.phone,
        slug: dealer.slug,
        role: "dealer",
        citySlug: dealer.citySlug,
        cityName: dealer.cityName,
        agency: dealer.agency,
        bio: dealer.bio,
        whatsapp: phoneDigits,
        designation: dealer.designation,
        experience: dealer.experience,
        areas: dealer.areas,
        officeAddress: dealer.officeAddress,
        companyPhone: dealer.companyPhone,
        companyWebsite: dealer.companyWebsite,
        profileCompletedAt: new Date(),
      })
      .where(eq(users.email, dealer.email));
  }
}

/**
 * Gives every founding dealer a real portfolio: unassigned listings in their
 * own city are distributed round-robin and stamped with the dealer's contact
 * details, so `/dealers/<slug>` pages, the blue tick and the owner contact
 * block on each listing all agree.
 */
async function linkDealerListings(q: Executor) {
  const cities = Array.from(new Set(dealerSeed.map((dealer) => dealer.citySlug)));

  for (const citySlug of cities) {
    const cityDealers = dealerSeed.filter((dealer) => dealer.citySlug === citySlug);
    const accounts: { id: number; name: string; phone: string; email: string }[] = [];

    for (const dealer of cityDealers) {
      const rows = await q
        .select({ id: users.id, name: users.name, phone: users.phone })
        .from(users)
        .where(eq(users.email, dealer.email))
        .limit(1);
      const account = rows[0];
      if (account) accounts.push({ ...account, email: dealer.email });
    }
    if (accounts.length === 0) continue;

    const unassigned = await q
      .select({ id: properties.id })
      .from(properties)
      .where(and(isNull(properties.listedByUserId), eq(properties.citySlug, citySlug)))
      .orderBy(asc(properties.id));
    if (unassigned.length === 0) continue;

    // Round-robin keeps every dealer's portfolio believable. The cap counts
    // listings the account already publishes, so repeated seeds stay stable
    // and whatever is left over stays a Properties Pak desk listing.
    const MAX_PER_DEALER = 24;
    const existing = await q
      .select({ userId: properties.listedByUserId, total: sql<number>`count(*)::int` })
      .from(properties)
      .where(sql`${properties.listedByUserId} is not null`)
      .groupBy(properties.listedByUserId);
    const capacity = new Map<number, number>(
      accounts.map((account) => {
        const used = existing.find((row) => row.userId === account.id)?.total ?? 0;
        return [account.id, Math.max(0, MAX_PER_DEALER - Number(used))];
      }),
    );

    const buckets = new Map<number, number[]>();
    let cursor = 0;
    for (const row of unassigned) {
      let picked: (typeof accounts)[number] | null = null;
      for (let offset = 0; offset < accounts.length; offset += 1) {
        const candidate = accounts[(cursor + offset) % accounts.length];
        if ((capacity.get(candidate.id) ?? 0) > 0) {
          picked = candidate;
          cursor = (cursor + offset + 1) % accounts.length;
          break;
        }
      }
      if (!picked) break;
      const bucket = buckets.get(picked.id) ?? [];
      bucket.push(row.id);
      buckets.set(picked.id, bucket);
      capacity.set(picked.id, (capacity.get(picked.id) ?? 1) - 1);
    }

    for (const account of accounts) {
      const ids = buckets.get(account.id) ?? [];
      if (ids.length === 0) continue;
      await q
        .update(properties)
        .set({
          listedByUserId: account.id,
          listedByName: account.name,
          listedByEmail: account.email,
          listedByPhone: account.phone,
          listedByWhatsapp: account.phone.replace(/[^0-9]/g, ""),
        })
        .where(inArray(properties.id, ids));
    }
  }
}

/**
 * Photos already used elsewhere on the site (hero, rejected hero, city tiles,
 * project pages, guides and the submission fallback). Listings never reuse
 * them, so a property card never looks like a blog cover or a city tile.
 */
const RESERVED_PHOTOS = new Set<number>([
  HERO_PHOTO_ID,
  28054849,
  ...Object.values(photos.cities),
  ...projectSeed.flatMap((project) => project.images),
  ...postSeed.map((post) => post.image),
  ...EXTRA_POSTS.map((post) => post.image),
  ...Object.values(submissionFallbackPhotos).flat(),
  ...Object.values(sectionPhotos),
]);

/** Every seeded listing, each with its own cover photo (see seed-gallery.ts). */
const seedListings: SeedProperty[] = assignSeedGalleries(
  [...propertySeed, ...extraPropertySeed, ...dhaPropertySeed, ...townPropertySeed, ...societyPropertySeed],
  RESERVED_PHOTOS,
);

const listingCover = (property: SeedProperty) => photo(property.images[0], 1200, 800);
const listingGallery = (property: SeedProperty) => property.images.map((id) => photo(id, 1600, 1050));

async function seedProperties(q: Executor) {
  // Additive: insert only slugs that are missing, so new inventory lands
  // without touching existing listings or admin-approved properties.
  const existing = await q.select({ slug: properties.slug }).from(properties);
  const existingSlugs = new Set(existing.map((row) => row.slug));
  const pending = seedListings.filter((property) => !existingSlugs.has(property.slug));
  if (pending.length === 0) return;

  await q.insert(properties).values(
    pending.map((property) => ({
      slug: property.slug,
      title: property.title,
      purpose: property.purpose,
      category: property.category,
      propertyType: property.propertyType,
      citySlug: property.citySlug,
      cityName: property.cityName,
      locationArea: property.locationArea,
      address: property.address,
      lat: property.lat,
      lng: property.lng,
      price: property.price,
      priceUnit: property.priceUnit,
      negotiable: property.negotiable,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      areaValue: property.areaValue,
      areaUnit: property.areaUnit,
      areaSqft: property.areaSqft,
      parking: property.parking,
      furnishing: property.furnishing,
      possession: property.possession,
      description: property.description,
      features: property.features,
      amenities: property.amenities,
      coverImage: listingCover(property),
      images: listingGallery(property),
      featured: property.featured,
      verified: property.verified,
      isNewProject: property.isNewProject,
      projectSlug: property.projectSlug ?? null,
      agentSlug: property.agentSlug,
      views: property.views,
      createdAt: new Date(Date.now() - property.daysAgo * 86_400_000),
    })),
  );
}

/**
 * Brings the photos of already-inserted seed listings in line with the seed,
 * in one statement. Only rows whose cover and gallery are still stock photos
 * are touched, so photos a dealer or an administrator uploaded are kept.
 */
async function refreshSeedGalleries(q: Executor) {
  const rows = seedListings.map(
    (property) => sql`(${property.slug}::text, ${listingCover(property)}::text, ${JSON.stringify(listingGallery(property))}::jsonb)`,
  );
  await q.execute(sql`
    update properties as p
       set cover_image = v.cover, images = v.images
      from (values ${sql.join(rows, sql`, `)}) as v(slug, cover, images)
     where p.slug = v.slug
       and p.cover_image like 'https://images.pexels.com/%'
       and not exists (
         select 1 from jsonb_array_elements_text(p.images) as img(url)
          where img.url not like 'https://images.pexels.com/%'
       )
       and (p.cover_image is distinct from v.cover or p.images is distinct from v.images)
  `);
}

/**
 * Fingerprint of everything the seed writes. It changes only when the seed
 * data or the schema guard changes (i.e. on a deploy that edits them), so the
 * full seed runs once per change instead of on every serverless cold start.
 */
export const SEED_VERSION = createHash("sha256")
  .update(SCHEMA_SQL)
  .update(
    JSON.stringify([
      citySeed,
      agentSeed,
      projectSeed,
      postSeed,
      EXTRA_POSTS,
      POST_LINKS,
      testimonialSeed,
      dealerSeed,
      seedListings,
    ]),
  )
  .digest("hex")
  .slice(0, 16);

/** Arbitrary constant so concurrent cold starts never seed at the same time. */
const SEED_LOCK_KEY = 727_274_101;

async function storedSeedVersion(q: Executor): Promise<string | null> {
  try {
    const { rows } = await q.execute<{ value: string }>(
      sql`select value from app_meta where key = 'seed_version' limit 1`,
    );
    return rows[0]?.value ?? null;
  } catch (error) {
    // 42P01 = undefined_table: brand-new database, the seed below creates it.
    if ((error as { code?: string; cause?: { code?: string } })?.code === "42P01") return null;
    if ((error as { cause?: { code?: string } })?.cause?.code === "42P01") return null;
    throw error;
  }
}

async function runSeed() {
  // Fast path: a single round trip. This is what every cold start pays.
  if ((await storedSeedVersion(db)) === SEED_VERSION) return;

  // Slow path (first boot, or a deploy that changed seed data). One
  // transaction keeps readers from ever seeing half-refreshed content, and the
  // transaction-scoped advisory lock works through transaction poolers
  // (Supabase / PgBouncer port 6543) where session locks would not.
  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(${SEED_LOCK_KEY})`);
    await ensureSchema(tx); // idempotent; also creates app_meta on a fresh database
    if ((await storedSeedVersion(tx)) === SEED_VERSION) return; // another instance finished first
    await refreshReferenceContent(tx);
    await seedDealerAccounts(tx);
    await seedProperties(tx);
    await refreshSeedGalleries(tx);
    await linkDealerListings(tx);
    await tx.execute(sql`
      insert into app_meta (key, value, updated_at) values ('seed_version', ${SEED_VERSION}, now())
      on conflict (key) do update set value = excluded.value, updated_at = now()
    `);
  });
}

let seedPromise: Promise<void> | null = null;

/** Safe to call from any server component or route handler. */
export function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}
