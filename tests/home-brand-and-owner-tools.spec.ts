import { test, expect, type Page } from "@playwright/test";
import { visibleTestId } from "./helpers/visible";
import { createHmac } from "node:crypto";
import { Pool } from "pg";

/**
 * Covers the premium-brand homepage surface and the owner/admin self-service
 * controls: the dealer belt loops forever without leaving the page, owners can
 * hide, restore and delete what they posted, and admins can delete an enquiry.
 *
 * Fixtures are written with a dedicated `pg` pool instead of the app's shared
 * Drizzle pool so this file never closes a connection other suites still need.
 */

const stamp = Date.now();
const ownerEmail = `owner-qa-${stamp}@example.com`;
const ownerName = `Owner QA ${stamp}`;
const listingTitle = `QA Lakeview House ${stamp}`;
const listingSlug = `qa-lakeview-house-${stamp}`;
const submissionTitle = `QA Pending Plot ${stamp}`;
const enquiryMarker = `QA-ENQ-${stamp}`;

let ownerId = 0;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function sessionToken(userId: number) {
  const secret = process.env.SESSION_SECRET ?? "estatewx-dev-session-secret";
  return `${userId}.${createHmac("sha256", secret).update(String(userId)).digest("hex").slice(0, 32)}`;
}

test.beforeAll(async () => {
  // This established owner's listing controls are tested separately from onboarding.
  const owner = await pool.query(
    `insert into users (name, email, phone, password_hash, slug, role, profile_completed_at)
     values ($1,$2,'03001234567','scrypt$1$qa$qa',$3,'dealer',now()) returning id`,
    [ownerName, ownerEmail, `owner-qa-${stamp}`],
  );
  ownerId = owner.rows[0].id;

  await pool.query(
    `insert into properties (slug, title, purpose, category, property_type, city_slug, city_name, location_area,
       price, price_unit, area_value, area_unit, area_sqft, agent_slug, cover_image, listed_by_user_id, published)
     values ($1,$2,'buy','house','House','lahore','Lahore','QA Town',25000000,'total',10,'marla',2250,
       'hassan-rizvi','https://images.pexels.com/photos/36676879/pexels-photo.jpeg',$3,true)`,
    [listingSlug, listingTitle, ownerId],
  );

  await pool.query(
    `insert into listing_submissions (user_id, name, email, phone, title, purpose, category, property_type,
       city_slug, city_name, location_area, price, price_unit, area_value, area_unit, area_sqft, image_urls)
     values ($1,$2,$3,'03001234567',$4,'buy','plot','Plot','lahore','Lahore','QA Town',18000000,'total',5,'marla',1125,
       '["https://images.pexels.com/photos/36676879/pexels-photo.jpeg"]'::jsonb)`,
    [ownerId, ownerName, ownerEmail, submissionTitle],
  );
});

test.afterAll(async () => {
  if (ownerId) {
    await pool.query("delete from inquiries where email = $1", [ownerEmail]);
    await pool.query("delete from listing_submissions where user_id = $1", [ownerId]);
    await pool.query("delete from favorites where property_id in (select id from properties where listed_by_user_id = $1)", [ownerId]);
    await pool.query("delete from properties where listed_by_user_id = $1", [ownerId]);
    await pool.query("delete from users where id = $1", [ownerId]);
  }
  await pool.end();
});

/**
 * Waits until the visible copy of a section is on screen.
 *
 * Next paints the page inside a hidden prerender shell and swaps it in, so the
 * id exists twice for a moment — `visibleTestId` scopes to the real one and this
 * waits for it (plus any client fetch that follows a dashboard action).
 */
async function settle(page: Page, testId: string) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await expect(visibleTestId(page, testId).first()).toBeVisible({ timeout: 15_000 });
}

async function signedInAsOwner(page: Page) {
  await page.context().addCookies([
    { name: "estatewx_session", value: sessionToken(ownerId), domain: "127.0.0.1", path: "/" },
  ]);
}

test("homepage hero is a clean brand statement followed by the featured, then explore, sections", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await settle(page, "home-hero");
  const hero = visibleTestId(page, "home-hero");
  await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
  for (const clutter of ["Popular searches", "Live properties", "Cities to explore", "Property tools"]) {
    await expect(hero).not.toContainText(clutter);
  }
  await expect(visibleTestId(page, "hero-search")).toBeVisible();

  // Featured inventory sits above the Explore Properties discovery block.
  const featured = page.getByRole("heading", { name: "Featured Properties", exact: true });
  const explore = page.getByRole("heading", { name: "Explore Properties", exact: true });
  await featured.scrollIntoViewIfNeeded();
  expect((await featured.boundingBox())!.y).toBeLessThan((await explore.boundingBox())!.y);

  // Popular Searches replaces the inline location map above new projects.
  const location = page.getByRole("heading", { name: "Popular Searches", exact: true });
  const projects = page.getByRole("heading", { name: "New Housing Projects", exact: true });
  await location.scrollIntoViewIfNeeded();
  expect((await location.boundingBox())!.y).toBeLessThan((await projects.boundingBox())!.y);

  // Dealers moved out of the desktop header and the mobile drawer.
  const primaryNav = page.getByRole("navigation", { name: "Primary", exact: true });
  await expect(primaryNav.getByRole("link", { name: "Dealers", exact: true })).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  const drawer = page.getByRole("dialog", { name: "Main menu" });
  // The drawer button needs hydration before it responds; retry the open.
  await expect(async () => {
    await visibleTestId(page, "header-menu").click();
    await expect(drawer).toBeVisible({ timeout: 1500 });
  }).toPass({ timeout: 15_000 });
  await expect(drawer.getByRole("link", { name: "Dealers", exact: true })).toHaveCount(0);
});

test("dealer belt runs a continuous loop that never leaves the page", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await settle(page, "dealers-marquee");
  const viewport = visibleTestId(page, "dealers-marquee");
  await viewport.scrollIntoViewIfNeeded();
  const belt = viewport.locator(".dealer-belt");
  const groups = viewport.locator(".dealer-belt-group");
  await expect(groups).toHaveCount(2);

  // The clone pass exists purely to close the loop: hidden from readers and tab order.
  const firstGroupCardCount = await groups.nth(0).locator("a").count();
  expect(await groups.nth(1).locator("a").count()).toBe(firstGroupCardCount);
  expect(firstGroupCardCount).toBeGreaterThan(0);
  await expect(groups.nth(1)).toHaveAttribute("aria-hidden", "true");
  await expect(groups.nth(1).locator("a").first()).toHaveAttribute("tabindex", "-1");

  // Native scrolling supports the automatic loop and user-controlled movement
  // without CSS transforms fighting touch, trackpad or arrow scrolling.
  const layout = await belt.evaluate((element) => {
    const style = getComputedStyle(element);
    const cards = [...element.querySelectorAll(".dealer-belt-group a")].slice(0, 3).map((card) => card.getBoundingClientRect());
    return {
      display: style.display,
      animation: style.animationName,
      horizontal: cards.length > 1 ? cards[0].top === cards[1].top && cards[1].left > cards[0].left : false,
    };
  });
  expect(layout.display).toBe("flex");
  expect(layout.horizontal, "dealer cards must sit side by side, not stacked").toBe(true);

  // Motion is continuous: it only ever advances, and it never restarts at zero.
  const offsets: number[] = [];
  for (let sample = 0; sample < 4; sample++) {
    offsets.push(await viewport.evaluate((element) => element.scrollLeft));
    await page.waitForTimeout(900);
  }
  for (let index = 1; index < offsets.length; index++) {
    expect(offsets[index], `belt restarted between samples: ${offsets.join(", ")}`).toBeGreaterThan(offsets[index - 1]!);
  }
  await expect(page.getByRole("button", { name: /pause dealer rotation/i })).toHaveCount(0);

  // And it is clipped by the page: paused at its start, the row begins exactly on
  // the container edge (no stray offset, nothing hanging outside the grid).
  const alignment = await page.evaluate(() => {
    const marquee = document.querySelector('[data-testid="dealers-marquee"]') as HTMLElement;
    marquee.scrollLeft = 0;
    const parentLeft = marquee.getBoundingClientRect().left;
    const firstCardLeft = (marquee.querySelector("a") as HTMLElement).getBoundingClientRect().left;
    return { parentLeft, firstCardLeft, cardWidth: (marquee.querySelector("a") as HTMLElement).getBoundingClientRect().width };
  });
  expect(Math.abs(alignment.firstCardLeft - alignment.parentLeft)).toBeLessThanOrEqual(1);
  expect(alignment.cardWidth).toBeGreaterThan(120);
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await viewport.scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
      `home overflow at ${width}px`,
    ).toBeLessThanOrEqual(1);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await viewport.scrollIntoViewIfNeeded();
  await viewport.screenshot({ path: testInfo.outputPath("dealer-belt.png") });
});

test("owner can hide, restore and delete a listing they posted", async ({ page }) => {
  await signedInAsOwner(page);
  await page.goto("/account", { waitUntil: "domcontentloaded" });
  await settle(page, "account-listings");
  const manager = visibleTestId(page, "account-listings");
  await manager.scrollIntoViewIfNeeded();
  await expect(manager.getByRole("link", { name: listingTitle, exact: true })).toBeVisible();
  await expect(manager.getByText("In review", { exact: true })).toBeVisible();

  // Hide it: off the public site, still listed in the dashboard.
  await manager.getByRole("button", { name: "Hide from site" }).click();
  await manager.getByRole("button", { name: "Yes, hide it" }).click();
  await expect(page.getByText("Listing hidden from the public site.", { exact: true })).toBeVisible();
  await settle(page, "account-listings");
  await expect(manager.getByText("Hidden", { exact: true })).toBeVisible();
  await expect(page.getByText("Listing hidden from the public site.", { exact: true })).toBeVisible();
  await page.goto(`/property/${listingSlug}`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /no longer available/i })).toBeVisible();

  // Restore it.
  await page.goto("/account", { waitUntil: "domcontentloaded" });
  await settle(page, "account-listings");
  await page.getByRole("button", { name: "Publish again" }).click();
  await expect(page.getByText("Listing published again — it is back on the site.", { exact: true })).toBeVisible();
  await settle(page, "account-listings");
  await page.goto(`/property/${listingSlug}`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: /QA Town Lahore/ })).toBeVisible();

  // Withdraw the queued submission, then delete the live listing for good.
  await page.goto("/account", { waitUntil: "domcontentloaded" });
  await settle(page, "account-listings");
  const secondManager = visibleTestId(page, "account-listings");
  await secondManager.scrollIntoViewIfNeeded();
  await secondManager.getByRole("button", { name: "Withdraw submission" }).click();
  await secondManager.getByRole("button", { name: "Yes, remove it" }).click();
  await expect(page.getByText("Submission withdrawn.", { exact: true })).toBeVisible();
  await expect(secondManager.getByText(submissionTitle, { exact: true })).toHaveCount(0);

  await secondManager.getByRole("button", { name: "Delete", exact: true }).click();
  await secondManager.getByRole("button", { name: "Yes, delete it" }).click();
  await expect(page.getByText("Listing deleted permanently.", { exact: true })).toBeVisible();
  await settle(page, "account-listings");
  await expect(secondManager.getByRole("link", { name: listingTitle, exact: true })).toHaveCount(0);
  await page.goto(`/property/${listingSlug}`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /no longer available/i })).toBeVisible();
});

test("admin can delete a client enquiry from the inbox", async ({ page }) => {
  const request = page.context().request;
  await pool.query(
    `insert into inquiries (type, name, email, phone, message, property_slug, property_title)
     values ('property',$1,$2,'03009998877',$3,$4,$5)`,
    [`${enquiryMarker} Client`, ownerEmail, `Please share the floor plan. ${enquiryMarker}`, listingSlug, listingTitle],
  );

  expect((await request.delete("/api/admin/inquiries/1")).status()).toBe(401);
  const login = await request.post("/api/admin/login", { data: { password: process.env.ADMIN_PASSWORD || "estatewx2026" } });
  expect(login.ok()).toBeTruthy();

  await page.goto("/admin?tab=inquiries", { waitUntil: "domcontentloaded" });
  await settle(page, "admin-inquiry-inbox");
  await page.getByLabel("Search client or property").fill(enquiryMarker);
  const card = page.getByRole("article").filter({ hasText: `${enquiryMarker} Client` });
  await expect(card).toHaveCount(1);
  await card.getByRole("button", { name: `Delete enquiry from ${enquiryMarker} Client`, exact: true }).click();
  await expect(card).toContainText("Delete this enquiry permanently?");
  await card.getByRole("button", { name: "Yes, delete it", exact: true }).click();
  await expect(page.getByText("Enquiry deleted permanently.", { exact: true })).toBeVisible();
  await expect(page.getByRole("article").filter({ hasText: `${enquiryMarker} Client` })).toHaveCount(0);

  // Deletion is confirmed straight from the database: the browser's admin
  // session cookie is Secure on non-canonical hosts, and Playwright's API
  // client only replays it over https, so an API re-check would 401 here.
  const { rows } = await pool.query("select count(*)::int as total from inquiries where name like $1", [`${enquiryMarker}%`]);
  expect(rows[0].total).toBe(0);
});
