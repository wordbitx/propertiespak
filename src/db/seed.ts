import { inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { agents, cities, posts, projects, properties, testimonials } from "@/db/schema";
import { agentSeed, citySeed, postSeed, projectSeed, propertySeed, testimonialSeed } from "@/db/seed-data";
import { extraPropertySeed } from "@/db/seed-data-extra";
import { EXTRA_POSTS, POST_LINKS } from "@/db/seed-content";
import { photo } from "@/lib/images";

/**
 * Idempotent schema guard. The canonical schema lives in `src/db/schema.ts`
 * (applied with `drizzle-kit push`); this raw DDL keeps the app bootable in a
 * fresh sandbox where push has not run yet.
 */
async function ensureSchema() {
  await db.execute(sql`
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
      agency text NOT NULL DEFAULT 'Pak Property Partners',
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
      views integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS properties_slug_idx ON properties (slug);
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS listed_by_name text NOT NULL DEFAULT '';
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS listed_by_email text NOT NULL DEFAULT '';
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS listed_by_phone text NOT NULL DEFAULT '';
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS listed_by_whatsapp text NOT NULL DEFAULT '';
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
      author text NOT NULL DEFAULT 'Pak Property Research',
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
      created_at timestamptz NOT NULL DEFAULT now()
    );
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
      created_at timestamptz NOT NULL DEFAULT now(),
      reviewed_at timestamptz
    );
    UPDATE properties p
    SET listed_by_name = s.name,
        listed_by_email = s.email,
        listed_by_phone = s.phone,
        listed_by_whatsapp = s.phone
    FROM listing_submissions s
    WHERE s.property_id = p.id
      AND s.status = 'approved'
      AND coalesce(p.listed_by_phone, '') = '';
  `);
}

/** Reference content is refreshed on every cold start; listings are inserted once. */
async function refreshReferenceContent() {
  await db.delete(cities).where(inArray(cities.slug, citySeed.map((city) => city.slug)));
  await db.insert(cities).values(citySeed);

  await db.delete(agents).where(inArray(agents.slug, agentSeed.map((agent) => agent.slug)));
  await db.insert(agents).values(agentSeed);

  await db.delete(projects).where(inArray(projects.slug, projectSeed.map((project) => project.slug)));
  await db.insert(projects).values(
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
  await db.delete(posts).where(inArray(posts.slug, postRows.map((post) => post.slug)));
  await db.insert(posts).values(postRows);

  const { rows } = await db.execute<{ total: number }>(sql`select cast(count(*) as int) as total from testimonials`);
  if (Number(rows[0]?.total ?? 0) === 0) {
    await db.insert(testimonials).values(testimonialSeed);
  }
}

async function seedProperties() {
  // Additive: insert only slugs that are missing, so new inventory lands
  // without touching existing listings or admin-approved properties.
  const existing = await db.select({ slug: properties.slug }).from(properties);
  const existingSlugs = new Set(existing.map((row) => row.slug));
  const pending = [...propertySeed, ...extraPropertySeed].filter(
    (property) => !existingSlugs.has(property.slug),
  );
  if (pending.length === 0) return;

  await db.insert(properties).values(
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
      coverImage: photo(property.images[0], 1200, 800),
      images: property.images.map((id) => photo(id, 1600, 1050)),
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

async function runSeed() {
  await ensureSchema();
  await refreshReferenceContent();
  await seedProperties();
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
