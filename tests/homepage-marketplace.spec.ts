import { test, expect, request as requestFactory, type APIRequestContext } from "@playwright/test";
import { Pool } from "pg";
import { visibleTestId } from "./helpers/visible";

const marker = `QA-marketplace-${Date.now()}`;
const studioTitle = `${marker} furnished studio`;
const videoUrl = "https://example.com/property-tour.mp4";
const ids: number[] = [];
const submissionIds: number[] = [];
const inquiryIds: number[] = [];
let studioId: number;
let coverImage: string;
let admin: APIRequestContext;
const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db" });

function payload(title: string, extra: Record<string, unknown> = {}) {
  return {
    title, purpose: "buy", category: "apartment", propertyType: "Apartment", citySlug: "lahore", cityName: "Lahore",
    locationArea: marker, lat: 31.47, lng: 74.38, price: 20000000, areaValue: 5, areaUnit: "marla",
    bedrooms: 0, bathrooms: 2, furnishing: "Furnished", possession: "Available", images: [coverImage],
    description: `${marker} furnished studio with a property tour`, paymentType: "installments", videoUrl,
    verified: true, ...extra,
  };
}
async function create(title: string, extra: Record<string, unknown> = {}) {
  const response = await admin.post("/api/admin/properties", { data: payload(title, extra) });
  expect(response.ok(), await response.text()).toBeTruthy();
  const data = await response.json();
  ids.push(data.property.id);
  return data.property.id as number;
}

test.beforeAll(async ({ request, baseURL }) => {
  const seed = await (await request.get("/api/properties?pageSize=1")).json();
  coverImage = seed.items[0].coverImage;
  admin = await requestFactory.newContext({ baseURL });
  const login = await admin.post("/api/admin/login", { data: { password: process.env.ADMIN_PASSWORD || "estatewx2026" } });
  expect(login.ok()).toBeTruthy();
  // Production cookies stay Secure. Node's HTTP test jar (unlike a browser on
  // localhost) won't send them to 127.0.0.1; use this isolated admin context only.
  const cookie = login.headers()["set-cookie"].split(";")[0];
  await admin.dispose();
  admin = await requestFactory.newContext({ baseURL, extraHTTPHeaders: { Cookie: cookie } });
  studioId = await create(studioTitle);
  await create(`${marker} cash house`, { category: "house", propertyType: "House", bedrooms: 5, areaValue: 15, paymentType: "cash", videoUrl: "" });
  await create(`${marker} Islamabad studio`, { citySlug: "islamabad", cityName: "Islamabad", verified: false });
  const hidden = await create(`${marker} unpublished studio`);
  await pool.query("update properties set published = false where id = $1", [hidden]);
  // More than a page in both rails proves that loading the original 8 cards is not a hard cap.
  for (let index = 0; index < 9; index++) {
    await create(`${marker} featured ${index}`, { featured: true, category: "house", propertyType: "House", bedrooms: 3, videoUrl: "", paymentType: "cash" });
    await create(`${marker} office ${index}`, { category: "office", propertyType: "Office", videoUrl: "", paymentType: "cash" });
  }
});
test.afterAll(async () => {
  if (admin) {
    for (const id of ids) await admin.delete(`/api/admin/properties/${id}`);
    await admin.dispose();
  }
  if (submissionIds.length) await pool.query("delete from listing_submissions where id = any($1::int[])", [submissionIds]);
  if (inquiryIds.length) await pool.query("delete from inquiries where id = any($1::int[])", [inquiryIds]);
  await pool.end();
});

test("homepage is compact, retains Explore, removes duplicate dealers and never overflows", async ({ page }, testInfo) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("console", (message) => { if (message.type() === "error" && /hydrat|React|runtime/i.test(message.text())) failures.push(message.text()); });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(visibleTestId(page, "home-hero").locator(".hero-headline-desktop")).toHaveText(/Find Your Future\.\s*Invest With Clarity\./);
  await expect(visibleTestId(page, "home-hero").getByText("Pakistan’s Premium Property Marketplace", { exact: true })).toBeVisible();
  await expect(visibleTestId(page, "home-hero").getByRole("link", { name: "List Your Property", exact: true })).toHaveAttribute("href", "/list-property");
  await expect(page.getByRole("heading", { name: "Dealers & Agencies", exact: true })).toHaveCount(1);
  await expect(page.getByRole("heading", { name: /Dealers & agencies behind/ })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "How different buyers would use Properties Pak", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Property across Pakistan's major markets", exact: true })).toHaveCount(0);
  await expect(page.getByText("Browse city markets, property types and area guides.", { exact: true })).toHaveCount(0);
  await expect(page.locator("#explore article")).toHaveCount(16);
  await expect(page.locator("#explore .ui-container > .grid")).toHaveClass(/xl:grid-cols-4/);
  for (const width of [1440, 1280, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${width}px overflow`).toBeLessThanOrEqual(1);
    expect((await visibleTestId(page, "home-hero").boundingBox())!.height).toBeGreaterThanOrEqual(540);
    expect((await page.locator(".dealer-showcase-card").first().boundingBox())!.height).toBeLessThan(130);
    await expect(visibleTestId(page, "header-map")).toBeVisible();
    if (width < 768) await expect(page.locator("#map")).toBeHidden();
    if (width === 1440 || width === 390) await page.screenshot({ path: testInfo.outputPath(`compact-home-${width}.png`) });
  }
  await page.waitForTimeout(800);
  expect(failures).toEqual([]);
});

test("featured rail auto-advances with pauses while both rails remain manually controllable", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  for (const section of ["featured", "commercial"]) {
    const rail = page.locator(`#${section} [data-testid="property-rail"]`);
    const viewport = rail.getByRole("region");
    await viewport.scrollIntoViewIfNeeded();
    await expect(rail).toHaveAttribute("data-auto-play", "true");
    await rail.hover();
    const start = await viewport.evaluate((element) => element.scrollLeft);
    await page.waitForTimeout(700);
    expect(await viewport.evaluate((element) => element.scrollLeft)).toBe(start);
    expect(await viewport.evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
    const initial = await rail.locator("article").count();
    expect(initial).toBe(8);
    if (section === "featured") {
      await expect(rail.locator('.property-rail-item[data-property-featured="false"]')).toHaveCount(0);
      await expect(rail.locator('.property-rail-item[data-property-verified="false"]')).toHaveCount(0);
    }
    const query = section === "featured" ? "featured=1&verified=1" : "category=commercial";
    const inventory = await (await page.request.get(`/api/properties?${query}&pageSize=48`)).json();
    if (section === "featured") expect(inventory.items.every((property: { featured: boolean; verified: boolean }) => property.featured && property.verified)).toBe(true);
    expect(inventory.total).toBeGreaterThan(8);
    await rail.getByRole("button", { name: /^Next/ }).click();
    await expect.poll(() => viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    for (let pageNumber = 0; pageNumber < Math.ceil(inventory.total / 8); pageNumber++) {
      if (await rail.locator("article").count() >= inventory.total) break;
      const previous = await rail.locator("article").count();
      await viewport.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
      await expect.poll(() => rail.locator("article").count()).toBeGreaterThan(previous);
    }
    await expect(rail.locator("article")).toHaveCount(inventory.total);
    await viewport.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
    await expect(rail.getByRole("button", { name: /^Next/ })).toBeDisabled();
    await rail.getByRole("button", { name: /^Previous/ }).click();
    expect((await rail.locator("article").first().boundingBox())!.height).toBeLessThan(420);
  }
});

test("mobile Search Properties opens complete filters and finds the exact live listing", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await visibleTestId(page, "hero-search").getByRole("button", { name: "Search Properties", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Search properties", exact: true });
  await dialog.getByLabel("City", { exact: true }).selectOption("lahore");
  await dialog.getByRole("group", { name: "Payment type", exact: true }).getByRole("button", { name: "Installments", exact: true }).click();
  await dialog.getByRole("group", { name: "Property category", exact: true }).getByRole("button", { name: "Homes", exact: true }).click();
  for (const name of ["House", "Upper Portion", "Lower Portion", "Room", "Farm House", "Penthouse", "Flat / Apartment"]) {
    await expect(dialog.getByRole("group", { name: "Property type", exact: true }).getByRole("button", { name, exact: true })).toBeVisible();
  }
  await dialog.getByRole("button", { name: "Flat / Apartment", exact: true }).click();
  await dialog.getByLabel("Minimum price (PKR)", { exact: true }).fill("15000000");
  await dialog.getByLabel("Maximum price (PKR)", { exact: true }).fill("25000000");
  await dialog.getByLabel("Minimum area (marla)", { exact: true }).fill("5");
  await dialog.getByLabel("Maximum area (marla)", { exact: true }).fill("10");
  await dialog.getByRole("switch", { name: /Show verified listings only/ }).check();
  await dialog.getByRole("group", { name: "Bedrooms", exact: true }).getByRole("button", { name: "Studio", exact: true }).click();
  await dialog.getByRole("group", { name: "Bathrooms", exact: true }).getByRole("button", { name: "2+", exact: true }).click();
  await dialog.getByLabel("Add keyword", { exact: true }).fill(marker);
  await dialog.getByRole("switch", { name: "Show ads with videos only", exact: true }).check();
  await dialog.getByRole("switch", { name: "Show ads with images only", exact: true }).check();
  await dialog.getByRole("button", { name: "Find properties", exact: true }).click();
  await expect(page).toHaveURL(/\/properties\/for-sale\?/);
  const params = new URL(page.url()).searchParams;
  for (const [key, value] of Object.entries({ city: "lahore", category: "homes", type: "Apartment", paymentType: "installments", beds: "0", baths: "2", minPrice: "15000000", maxPrice: "25000000", minArea: "1125", maxArea: "2250", verified: "1", withImages: "1", withVideos: "1", q: marker })) expect(params.get(key), key).toBe(value);
  await expect(page.getByRole("link", { name: studioTitle, exact: true })).toBeVisible();
  await expect(page.locator("article")).toHaveCount(1);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  await page.getByRole("button", { name: "All filters", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Studio", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(dialog.getByLabel("Maximum area (marla)", { exact: true })).toHaveValue("10");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("advanced editing preserves featured scope and commercial pages keep their fixed predicate", async ({ page }) => {
  await page.goto(`/properties/for-sale?category=house&featured=1&verified=1&q=${marker}`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "All filters", exact: true }).click();
  const editor = page.getByRole("dialog", { name: "Search properties", exact: true });
  await expect(editor.getByRole("button", { name: "Featured ×", exact: true })).toBeVisible();
  await expect(editor.getByRole("button", { name: "Houses ×", exact: true })).toBeVisible();
  await editor.getByRole("button", { name: "Find properties", exact: true }).click();
  await expect(editor).toHaveCount(0);
  const params = new URL(page.url()).searchParams;
  expect(params.get("featured")).toBe("1");
  expect(params.get("category")).toBe("house");
  await expect(page.locator("article")).toHaveCount(9);
  await page.goto("/properties/commercial", { waitUntil: "domcontentloaded" });
  await expect(page.locator("article")).toHaveCount(12);
  await expect(page.locator("article").getByText(/^(House|Villa|Apartment|Farmhouse|Room|Upper Portion|Lower Portion|Penthouse)$/)).toHaveCount(0);
});

test("payment, studio, media, max-area and verified filters are genuine server predicates", async ({ request }) => {
  const params = new URLSearchParams({ purpose: "buy", city: "lahore", type: "Apartment", q: marker, beds: "0", verified: "1", paymentType: "installments", withImages: "1", withVideos: "1", minArea: "1125", maxArea: "2250" });
  const result = await (await request.get(`/api/properties?${params}`)).json();
  expect(result.items.map((item: { id: number }) => item.id)).toEqual([studioId]);
  for (const extra of [{ paymentType: "cash" }, { maxArea: "1000" }, { maxPrice: "0" }]) {
    const changed = new URLSearchParams(params);
    for (const [key, value] of Object.entries(extra)) changed.set(key, value);
    const empty = await (await request.get(`/api/properties?${changed}`)).json();
    expect(empty.total).toBe(0);
  }
  params.set("view", "map");
  const map = await (await request.get(`/api/properties?${params}`)).json();
  expect(map.items.map((item: { id: number }) => item.id)).toEqual([studioId]);
  expect(map.items[0]).not.toHaveProperty("listedByEmail");
  const html = await (await request.get("/properties/for-sale?paymentType=installments&withVideos=1&maxArea=2250")).text();
  expect(html).toMatch(/name="robots" content="noindex/);
});

test("range validation, area conversion, reset and short-screen focus/scroll cleanup work", async ({ page }) => {
  await page.setViewportSize({ width: 568, height: 320 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const trigger = visibleTestId(page, "site-header").getByRole("button", { name: "Search properties", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Search properties", exact: true });
  await dialog.getByLabel("Minimum price (PKR)", { exact: true }).fill("25000000");
  await dialog.getByLabel("Maximum price (PKR)", { exact: true }).fill("15000000");
  await dialog.getByRole("button", { name: "Find properties", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("Minimum price cannot");
  await expect(dialog.getByRole("alert")).toBeInViewport();
  await dialog.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(dialog.getByRole("alert")).toHaveCount(0);
  await dialog.getByRole("button", { name: "1 Kanal", exact: true }).click();
  await expect(dialog.getByLabel("Minimum area (marla)", { exact: true })).toHaveValue("20");
  await dialog.getByLabel("Area unit", { exact: true }).selectOption("kanal");
  await expect(dialog.getByLabel("Minimum area (kanal)", { exact: true })).toHaveValue("1");
  await dialog.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(dialog.getByLabel("Minimum area (marla)", { exact: true })).toHaveValue("");
  for (let index = 0; index < 12; index++) { await page.keyboard.press("Tab"); expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true); }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});

test("popular sale/rent city and type browsing sits above projects with real counts", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const popular = page.locator("#popular-searches:visible");
  await popular.scrollIntoViewIfNeeded();
  expect(await popular.evaluate((element) => !!(element.compareDocumentPosition(element.closest(".home-page")!.querySelector("#projects")!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await popular.getByRole("group", { name: "Popular cities", exact: true }).getByRole("button", { name: "Karachi", exact: true }).click();
  await popular.getByRole("button", { name: "To Rent", exact: true }).click();
  await popular.getByRole("group", { name: "Popular property types", exact: true }).getByRole("button", { name: "Flats", exact: true }).click();
  await expect(popular.getByRole("heading", { name: "Flats to rent in Karachi", exact: true })).toBeVisible();
  const all = popular.locator(".popular-search-all");
  const result = await (await page.request.get("/api/properties?purpose=rent&city=karachi&type=Apartment&pageSize=1")).json();
  await expect(all).toContainText(`View all ${result.total.toLocaleString("en-PK")} listings`);
  const location = popular.locator(".popular-location-grid a").first();
  if (await location.count()) {
    const exact = new URL((await location.getAttribute("href"))!, page.url());
    expect(exact.searchParams.get("townExact")).toBe("1");
    exact.searchParams.set("purpose", "rent");
    const matching = await (await page.request.get(`/api/properties?${exact.searchParams}`)).json();
    await expect(location.locator(".popular-location-count")).toHaveText(matching.total.toLocaleString("en-PK"));
  }
  const href = await all.getAttribute("href");
  expect(href).toContain("/properties/for-rent?");
  expect(href).toContain("type=Apartment");
  await all.click();
  await expect(page).toHaveURL(/\/properties\/for-rent\?city=karachi&type=Apartment/);
});

test("mobile header map opens real properties, pinches in place and closes cleanly", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 2 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await visibleTestId(page, "header-map").click();
  const dialog = page.getByRole("dialog", { name: "Property map", exact: true });
  await expect(dialog.getByRole("group", { name: "Choose property map location", exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Explore Pakistan", exact: true }).click();
  await expect(dialog.getByRole("group", { name: "Choose property map location", exact: true })).toHaveCount(0);
  await dialog.getByLabel("City", { exact: true }).selectOption("lahore");
  const list = dialog.locator(".map-view-list-track--horizontal");
  await expect(dialog.getByText("Properties on map", { exact: true })).toBeVisible();
  expect(await list.evaluate((element) => getComputedStyle(element).display)).toBe("flex");
  expect(await list.evaluate((element) => element.scrollWidth)).toBeGreaterThan(await list.evaluate((element) => element.clientWidth));
  const firstCard = list.locator("li").first();
  expect(await firstCard.evaluate((element) => getComputedStyle(element).borderTopColor)).toBe("rgb(23, 58, 93)");
  expect(await firstCard.evaluate((element) => parseFloat(getComputedStyle(element).borderTopWidth))).toBeGreaterThan(1);
  expect(await firstCard.evaluate((element) => getComputedStyle(element).backgroundImage)).toContain("linear-gradient");
  await dialog.getByRole("button", { name: "Next properties on map", exact: true }).click();
  await expect.poll(() => list.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  const map = dialog.locator(".leaflet-container");
  await expect(map).toBeVisible();
  await expect.poll(() => dialog.locator(".ewx-pin, .ewx-cluster").count()).toBeGreaterThan(0);
  await map.evaluate((element) => { element.setAttribute("data-instance-check", "same-map"); });
  const before = Number(await map.getAttribute("data-map-zoom"));
  const rect = (await map.boundingBox())!;
  const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
  const touches = (distance: number) => [{ x: x - distance, y, id: 1 }, { x: x + distance, y, id: 2 }];
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: touches(28) });
  for (const distance of [35, 45, 58, 75, 92]) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: touches(distance) }); await page.waitForTimeout(40); }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect.poll(async () => Number(await map.getAttribute("data-map-zoom"))).toBeGreaterThan(before);
  await expect(map).toHaveAttribute("data-instance-check", "same-map");
  await dialog.getByRole("button", { name: "Show on map", exact: true }).first().click();
  await expect(map).toHaveAttribute("data-instance-check", "same-map");
  await dialog.screenshot({ path: testInfo.outputPath("header-map-mobile.png") });
  await dialog.getByRole("button", { name: "Close property map", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  await expect(visibleTestId(page, "header-map")).toBeFocused();
});

test("header map location permission focuses the nearest supported city", async ({ page }) => {
  await page.context().grantPermissions(["geolocation"]);
  await page.context().setGeolocation({ latitude: 31.5204, longitude: 74.3587, accuracy: 30 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await visibleTestId(page, "header-map").click();
  const dialog = page.getByRole("dialog", { name: "Property map", exact: true });
  await dialog.getByRole("button", { name: "Use my location", exact: true }).click();
  await expect(dialog.getByLabel("City", { exact: true })).toHaveValue("lahore");
  await expect(dialog.locator(".header-map-status")).toContainText("Showing Lahore around your location.");
  await expect.poll(async () => Number(await dialog.locator(".leaflet-container").getAttribute("data-map-zoom"))).toBeGreaterThan(8);
});

test("desktop utility links, mobile support/advertise and genuine Sell entry are functional", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const header = visibleTestId(page, "site-header");
  await expect(header.getByRole("link", { name: "Help & Support", exact: true })).toBeVisible();
  await expect(header.getByRole("link", { name: "Advertise on Properties Pak", exact: true })).toHaveAttribute("href", "/advertise");
  await header.getByRole("link", { name: "Sell", exact: true }).click();
  await expect(page).toHaveURL(/\/list-property$/);
  await expect(page.getByRole("button", { name: "Sell", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.setViewportSize({ width: 390, height: 844 });
  await visibleTestId(page, "header-menu").click();
  const drawer = page.getByRole("dialog", { name: "Main menu", exact: true });
  await expect(drawer.getByRole("link", { name: "Help & Support", exact: true })).toHaveAttribute("href", "/contact");
  await drawer.getByRole("link", { name: "Advertise on Properties Pak", exact: true }).click();
  await expect(page).toHaveURL(/\/advertise$/);
  const form = page.getByRole("form", { name: "Request advertising details", exact: true });
  await form.getByLabel("Full name *", { exact: true }).fill(marker);
  await form.getByLabel("Phone / WhatsApp *", { exact: true }).fill("03001234567");
  await form.getByLabel("Email *", { exact: true }).fill(`${marker.toLowerCase()}@example.com`);
  await form.getByLabel("City", { exact: true }).fill("Lahore");
  await form.getByLabel("Advertising requirements", { exact: true }).fill("Please share agency advertising options.");
  const sent = page.waitForResponse((response) => response.url().includes("/api/inquiries") && response.request().method() === "POST");
  await form.getByRole("button", { name: "Request advertising details", exact: true }).click();
  const response = await sent;
  expect(response.status()).toBe(201);
  inquiryIds.push((await response.json()).id);
  await expect(page.getByRole("heading", { name: "Advertising request sent", exact: true })).toBeVisible();
  const inbox = await (await admin.get(`/api/admin/inquiries?q=${marker}`)).json();
  expect(inbox.items.some((item: { type: string; message: string }) => item.type === "advertise" && item.message.includes("agency advertising"))).toBe(true);
});

test("submission, approval, property details and validation preserve payment/video metadata", async ({ request }) => {
  const submission = { ...payload(`${marker} lower portion`), propertyType: "Lower Portion", name: marker, email: `${marker.toLowerCase()}-owner@example.com`, phone: "03001234567", imageUrls: [coverImage], createAccount: false };
  expect((await request.post("/api/submissions", { data: { ...submission, videoUrl: "javascript:alert(1)" } })).status()).toBe(400);
  expect((await admin.post("/api/admin/properties", { data: { ...payload(`${marker} invalid payment`), paymentType: "unknown" } })).status()).toBe(400);
  const response = await request.post("/api/submissions", { data: submission });
  expect(response.status(), await response.text()).toBe(200);
  const created = await response.json();
  submissionIds.push(created.id);
  const { rows: [stored] } = await pool.query("select payment_type, video_url from listing_submissions where id=$1", [created.id]);
  expect(stored).toEqual({ payment_type: "installments", video_url: videoUrl });
  const approved = await admin.patch(`/api/admin/submissions/${created.id}`, { data: { action: "approve" } });
  expect(approved.ok(), await approved.text()).toBeTruthy();
  const result = await approved.json();
  const { rows: [property] } = await pool.query("select id, payment_type, video_url, property_type from properties where slug=$1", [result.propertySlug]);
  ids.push(property.id);
  expect(property.payment_type).toBe("installments");
  expect(property.video_url).toBe(videoUrl);
  expect(property.property_type).toBe("Lower Portion");
  const html = await (await request.get(`/property/${result.propertySlug}`)).text();
  expect(html).toContain("Watch property video");
  expect(html).toContain("Installments");
});

test("failed photos fall back after hydration without triggering a React mismatch", async ({ page }) => {
  const issues: string[] = [];
  await page.route("**/images.pexels.com/**", (route) => route.abort());
  page.on("pageerror", (error) => issues.push(error.message));
  page.on("console", (message) => { if (message.type() === "error" && /hydrat|React|runtime/i.test(message.text())) issues.push(message.text()); });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const hero = visibleTestId(page, "hero-photograph");
  // Hero artwork is now bundled, so the primary photograph never depends on the remote CDN.
  await expect.poll(() => hero.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect.poll(() => page.locator('#featured img[data-image-state="fallback"]').count()).toBeGreaterThan(0);
  await visibleTestId(page, "header-map").click();
  await page.getByRole("dialog", { name: "Property map" }).getByRole("button", { name: "Close property map", exact: true }).click();
  expect(issues).toEqual([]);
});
