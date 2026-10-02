import { test, expect } from "@playwright/test";

const RECENT = "propertiespak:recent-properties";

test("generous local hero, header-only map, relocated popular searches and responsive Explore", async ({ page }) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("console", (message) => { if (message.type() === "error" && /hydrat|React|runtime/i.test(message.text())) failures.push(message.text()); });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const hero = page.getByTestId("home-hero");
  await expect(page.locator("#map")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Discover Properties by Location", exact: true })).toHaveCount(0);
  expect(await page.locator("#commercial").evaluate((element) => element.nextElementSibling?.id)).toBe("popular-searches");
  await expect(page.locator("#recent-properties")).toHaveCount(0);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    expect((await hero.boundingBox())!.height).toBeGreaterThanOrEqual(width < 768 ? 540 : 640);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${width}px overflow`).toBeLessThanOrEqual(1);
    await expect(page.getByTestId("header-map")).toBeVisible();
    if (width < 768) {
      await expect(page.locator("#markets")).toBeHidden();
      await expect(page.locator('#explore [data-testid="property-rail"]')).toBeVisible();
      expect(await page.locator(".property-search-input-like").evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
    } else {
      await expect(page.locator("#markets")).toBeVisible();
      await expect(page.locator("#explore .home-explore-grid")).toBeVisible();
      await expect(page.locator("#explore article")).toHaveCount(16);
      if (width === 1440) {
        const rows = await page.locator("#explore article").evaluateAll((cards) =>
          new Set(cards.map((card) => Math.round(card.getBoundingClientRect().top))).size,
        );
        expect(rows).toBe(4);
      }
    }
  }
  await expect.poll(() => page.getByTestId("hero-photograph").evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  expect(failures).toEqual([]);
});

test("mobile Explore is one manual row with four desktop rows and paginates further listings", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const rail = page.locator('#explore [data-testid="property-rail"]');
  const viewport = rail.getByRole("region", { name: "Explore properties", exact: true });
  await viewport.scrollIntoViewIfNeeded();
  await expect(rail.locator("article")).toHaveCount(16);
  expect(await rail.locator(".property-rail-track").evaluate((element) => getComputedStyle(element).flexWrap)).toBe("nowrap");
  const start = await viewport.evaluate((element) => element.scrollLeft);
  await page.waitForTimeout(450);
  expect(await viewport.evaluate((element) => element.scrollLeft)).toBe(start);
  await viewport.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
  await expect.poll(() => rail.locator("article").count()).toBeGreaterThan(16);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator("#explore article")).toHaveCount(16);
});

test("viewed properties persist in ordered, deduplicated history; Clear Recent only clears history", async ({ page }) => {
  const listings = await (await page.request.get("/api/properties?pageSize=2")).json();
  await page.addInitScript(() => localStorage.setItem("estatewx:favorites", "[1]"));
  for (const item of [listings.items[0], listings.items[1], listings.items[0]]) {
    await page.goto(`/property/${item.slug}`, { waitUntil: "domcontentloaded" });
    await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]")[0], RECENT)).toBe(item.id);
  }
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const recent = page.locator("#recent-properties");
  await expect(recent.locator("article")).toHaveCount(2);
  const titles = await recent.locator("article h3").allTextContents();
  expect(titles).toEqual([listings.items[0].title, listings.items[1].title]);
  expect(await recent.evaluate((element) => element.previousElementSibling?.id)).toBe("featured");
  expect(await recent.locator(".property-rail-track").evaluate((element) => getComputedStyle(element).flexWrap)).toBe("nowrap");
  const desktopCardWidth = await recent.locator(".property-rail-item").first().evaluate((element) => element.getBoundingClientRect().width);
  expect(desktopCardWidth).toBeLessThanOrEqual(250);
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileCardWidth = await recent.locator(".property-rail-item").first().evaluate((element) => element.getBoundingClientRect().width);
  expect(mobileCardWidth).toBeLessThanOrEqual(230);
  await recent.getByRole("button", { name: "Clear Recent", exact: true }).click();
  await expect(recent).toHaveCount(0);
  expect(await page.evaluate((key) => localStorage.getItem(key), RECENT)).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("estatewx:favorites"))).toBe("[1]");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(recent).toHaveCount(0);
});

test("a real mobile search adds its matched properties to Recent without recording homepage suggestions", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#recent-properties")).toHaveCount(0);
  await page.getByTestId("hero-search").getByRole("button", { name: "Search Properties", exact: true }).click();
  const editor = page.getByRole("dialog", { name: "Search properties", exact: true });
  await editor.getByLabel("City", { exact: true }).selectOption("lahore");
  await editor.getByRole("button", { name: "Find properties", exact: true }).click();
  await expect(page).toHaveURL(/\/properties\/for-sale\?city=lahore/);
  await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]").length, RECENT)).toBeGreaterThan(0);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#recent-properties article").first()).toBeVisible();
  for (const title of await page.locator("#recent-properties article").allTextContents()) expect(title).toContain("Lahore");
});

test("bad stored history is harmless and all history is bounded to 24 unique valid IDs", async ({ page }) => {
  await page.addInitScript(({ key }) => localStorage.setItem(key, JSON.stringify([null, "1", -5, 0, 1.2, ...Array.from({ length: 50 }, (_, index) => index + 1), 2])), { key: RECENT });
  await page.goto("/property/premium-office-space-gulberg-lahore", { waitUntil: "domcontentloaded" });
  await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]").length, RECENT)).toBe(24);
  const ids = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), RECENT);
  expect(new Set(ids).size).toBe(24);
  expect(ids.every((id: number) => Number.isSafeInteger(id) && id > 0)).toBe(true);
});

test("dealer cards have local temporary imagery and preserve real profile links", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const cards = page.locator('.dealer-belt-group:not([aria-hidden="true"]) .dealer-showcase-card');
  expect(await cards.count()).toBeGreaterThan(0);
  await expect(cards.first().locator("img")).toHaveCount(1);
  const temporary = cards.locator('img[data-agency-placeholder="true"]').first();
  await expect(temporary).toHaveAttribute("src", /\/_next\/static\/media\//);
  await expect(temporary).toHaveAttribute("alt", "Temporary agency image");
  await expect.poll(() => temporary.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(cards.first()).toHaveAttribute("href", /\/dealers\//);
});

test("header map clusters large datasets and mouse dragging never triggers hover auto-pan", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByTestId("header-map").click();
  const dialog = page.getByRole("dialog", { name: "Property map", exact: true });
  const map = dialog.locator(".leaflet-container");
  await expect(map).toBeVisible();
  await expect(dialog.locator(".header-map-status")).not.toContainText(/[0-9]/);
  await expect.poll(async () => Number(await map.getAttribute("data-map-rendered-markers"))).toBeGreaterThan(0);
  await expect.poll(() => dialog.locator(".ewx-cluster").count()).toBeGreaterThan(0);
  const count = await map.getAttribute("data-map-rendered-markers");
  expect(Number(count)).toBeLessThan(50);
  const zoomBeforeWheel = Number(await map.getAttribute("data-map-zoom"));
  await map.hover();
  await page.mouse.wheel(0, 160);
  await expect.poll(() => map.getAttribute("data-map-zoom")).not.toBe(String(zoomBeforeWheel));
  await map.evaluate((element) => { element.dataset.mapInstanceCheck = "same"; });
  const cluster = dialog.locator(".ewx-cluster").first();
  await expect(cluster.locator(".ewx-cluster-pin svg")).toHaveCount(1);
  await expect(cluster).not.toContainText(/[0-9]/);
  await expect(cluster).toHaveAttribute("title", /nearby property locations/i);
  await cluster.hover();
  await expect(map.locator(".leaflet-popup")).toHaveCount(0);
  const before = await map.getAttribute("data-map-center");
  const rect = (await map.boundingBox())!;
  await page.mouse.move(rect.x + rect.width * .6, rect.y + rect.height * .6);
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width * .6 + 75, rect.y + rect.height * .6 + 35, { steps: 15 });
  await page.mouse.up();
  await expect.poll(() => map.getAttribute("data-map-center")).not.toBe(before);
  await expect(map).toHaveAttribute("data-map-instance-check", "same");
  await expect(map.locator(".leaflet-popup")).toHaveCount(0);
  await page.waitForTimeout(600);
  expect(Number(await map.getAttribute("data-map-rendered-markers"))).toBeLessThan(50);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});
