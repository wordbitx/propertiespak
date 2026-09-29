import { test, expect } from "@playwright/test";
import { inArray } from "drizzle-orm";
import { db, pool } from "../src/db";
import { inquiries } from "../src/db/schema";

const PROPERTY_PATH = "/property/premium-office-space-gulberg-lahore";
const PROPERTY_TITLE = "Premium Corporate Office Floor";
const createdIds: number[] = [];

test.afterEach(async () => {
  if (createdIds.length) {
    await db.delete(inquiries).where(inArray(inquiries.id, createdIds.splice(0)));
  }
});
test.afterAll(async () => { await pool.end(); });

test("primary map contains one property and nearby results stay separate", async ({ page }, testInfo) => {
  await page.goto(PROPERTY_PATH, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Where this property is located", exact: true })).toBeVisible();
  const primary = page.getByTestId("single-property-map");
  await primary.scrollIntoViewIfNeeded();
  await expect(primary.locator(".leaflet-container")).toBeVisible();
  await expect(primary.locator(".ewx-pin")).toHaveCount(1);
  await expect(primary.locator(".leaflet-popup-content")).toContainText(PROPERTY_TITLE);
  await expect(primary.locator("[data-map-marker-count]")).toHaveAttribute("data-map-marker-count", "1");
  const primaryId = await primary.getAttribute("data-property-id");
  const secondary = page.getByTestId("nearby-property-map");
  await expect(page.getByRole("heading", { name: "See nearby properties", exact: true })).toBeVisible();
  await secondary.scrollIntoViewIfNeeded();
  await expect(secondary.locator(".leaflet-container")).toBeVisible();
  const ids = (await secondary.locator("[data-map-property-ids]").getAttribute("data-map-property-ids"))!.split(",");
  expect(ids).not.toContain(primaryId);
  expect(ids.length).toBeGreaterThan(0);
  await secondary.getByRole("button", { name: "Show on map" }).first().click();
  await expect(primary.locator(".ewx-pin")).toHaveCount(1);
  await expect(primary.locator(".leaflet-popup-content")).toContainText(PROPERTY_TITLE);
  await page.locator("#schedule").screenshot({ path: testInfo.outputPath("single-property-desktop.png") });
  for (const width of [1024, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await primary.scrollIntoViewIfNeeded();
    await expect(primary.locator(".ewx-pin")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), `Property page overflow at ${width}px`).toBeLessThanOrEqual(1);
    if (width === 390) await page.locator("#schedule").screenshot({ path: testInfo.outputPath("single-property-mobile.png") });
  }
});

test("enquiry and visit forms persist full details in the private admin inbox", async ({ page, request }) => {
  expect((await request.get("/api/admin/inquiries")).status()).toBe(401);
  const marker = `QA-${Date.now()}`;
  const email = `${marker.toLowerCase()}@example.com`;
  const date = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
  await page.goto(PROPERTY_PATH, { waitUntil: "domcontentloaded" });
  const enquiry = page.getByRole("form", { name: "Request details & availability" });
  await enquiry.getByLabel("Full name *", { exact: true }).fill(`${marker} Buyer`);
  await enquiry.getByLabel("Phone / WhatsApp *", { exact: true }).fill("03001234567");
  await enquiry.getByLabel("Email *", { exact: true }).fill(email);
  await enquiry.getByLabel("Budget (optional)").fill("PKR 4.5 Lakh per month");
  await enquiry.getByLabel("Message", { exact: true }).fill(`Please share the office floor plan. ${marker}`);
  const first = page.waitForResponse((response) => response.url().includes("/api/inquiries") && response.request().method() === "POST");
  await enquiry.getByRole("button", { name: "Send enquiry", exact: true }).click();
  const firstResponse = await first;
  expect(firstResponse.status()).toBe(201);
  const firstData = await firstResponse.json();
  createdIds.push(firstData.id);
  await expect(page.getByText("Enquiry sent to admin", { exact: true })).toBeVisible();

  const visit = page.getByRole("form", { name: "Schedule a visit" });
  await visit.getByLabel("Full name *", { exact: true }).fill(`${marker} Visitor`);
  await visit.getByLabel("Phone / WhatsApp *", { exact: true }).fill("+92 301 7654321");
  await visit.getByLabel("Email *", { exact: true }).fill(email);
  await visit.getByLabel("Preferred visit date *", { exact: true }).fill(date);
  await visit.getByLabel("Visit notes (optional)").fill(`After 3 pm, please. ${marker}`);
  const second = page.waitForResponse((response) => response.url().includes("/api/inquiries") && response.request().method() === "POST");
  await visit.getByRole("button", { name: "Request visit", exact: true }).click();
  const secondResponse = await second;
  expect(secondResponse.status()).toBe(201);
  const secondData = await secondResponse.json();
  createdIds.push(secondData.id);
  await expect(page.getByText("Visit request sent to admin", { exact: true })).toBeVisible();

  const login = await page.request.post("/api/admin/login", { data: { password: process.env.ADMIN_PASSWORD || "estatewx2026" } });
  expect(login.ok()).toBeTruthy();
  await page.goto("/admin?tab=inquiries", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Search client or property").fill(marker);
  await expect(page.getByRole("heading", { name: `${marker} Buyer`, exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: `${marker} Visitor`, exact: true })).toBeVisible();
  const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: `${marker} Visitor`, exact: true }) });
  await card.getByRole("button", { name: "View full details" }).click();
  await expect(card).toContainText(date);
  await expect(card).toContainText(`After 3 pm, please. ${marker}`);
  await expect(card).toContainText(email);
  await expect(card).toContainText(PROPERTY_TITLE);
  await card.getByLabel("Status", { exact: true }).selectOption("contacted");
  await card.getByLabel("Internal notes").fill("Called client; requested visit is being arranged.");
  const update = page.waitForResponse((response) => response.url().includes(`/api/admin/inquiries/${secondData.id}`) && response.request().method() === "PATCH");
  await card.getByRole("button", { name: "Save follow-up" }).click();
  expect((await update).status()).toBe(200);
  await expect(page.getByText("Follow-up saved.", { exact: true })).toBeVisible();
  const inboxResponse = await page.request.get(`/api/admin/inquiries?q=${marker}`);
  expect(inboxResponse.headers()["cache-control"]).toContain("no-store");
  const inbox = await inboxResponse.json();
  expect(inbox.total).toBe(2);
  const storedVisit = inbox.items.find((item: { id: number }) => item.id === secondData.id);
  expect(storedVisit.status).toBe("contacted");
  expect(storedVisit.preferredDate).toBe(date);
  expect(storedVisit.adminNote).toContain("Called client");
  expect(storedVisit.propertyUrl).toBe(PROPERTY_PATH);
  const storedEnquiry = inbox.items.find((item: { id: number }) => item.id === firstData.id);
  expect(storedEnquiry.budget).toBe("PKR 4.5 Lakh per month");
  expect(storedEnquiry.cityName).toBe("Lahore");
});

test("Pak Property branding and WhatsApp footer fit at every breakpoint", async ({ page }, testInfo) => {
  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await page.evaluate(async () => { await document.fonts.ready; });
  for (const width of [1440, 1280, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const footer = page.getByRole("contentinfo", { name: "Pak Property footer" });
    await footer.scrollIntoViewIfNeeded();
    await expect(footer.getByText("WordbitX group of companies", { exact: true })).toBeVisible();
    const pakistan = footer.getByRole("link", { name: "Contact WordbitX Pakistan on WhatsApp: +92 325 1888841" });
    const usa = footer.getByRole("link", { name: "Contact WordbitX USA & Intl on WhatsApp: +1 (929) 619-7699" });
    await expect(pakistan).toHaveAttribute("href", /^https:\/\/wa.me\/923251888841\?/);
    await expect(usa).toHaveAttribute("href", /^https:\/\/wa.me\/19296197699\?/);
    for (const link of [pakistan, usa]) {
      const box = await link.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
    if (width === 1440 || width === 390) await footer.screenshot({ path: testInfo.outputPath(`footer-${width}.png`) });
  }
  await expect(page.locator("body")).not.toContainText("Property WX");
});

test("public SEO and protected inbox endpoints remain available", async ({ request }) => {
  for (const path of ["/", "/properties", "/keywords-for-pakistan", "/sitemap.xml", "/sitemap-index.xml", "/robots.txt"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }
  const page = await (await request.get(PROPERTY_PATH)).text();
  expect(page).toContain(`https://property.wordbitxtech.com${PROPERTY_PATH}`);
  expect(page).toContain("Pak Property");
  expect(page).toContain("See nearby properties");
  expect((await request.patch("/api/admin/inquiries/1", { data: { status: "closed", adminNote: "" } })).status()).toBe(401);
});
