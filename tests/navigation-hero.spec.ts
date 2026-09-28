import { test, expect } from "@playwright/test";

test("hero is photographic, borderless and has no featured listing card", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const hero = page.getByTestId("home-hero");
  await expect(hero.getByRole("heading", { level: 1 })).toHaveText("Find Your Future.Invest With Clarity.");
  const image = page.getByTestId("hero-photograph");
  await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBe(true);
  await expect(image).toHaveAttribute("loading", "eager");
  await expect(image).toHaveAttribute("fetchpriority", "high");
  await expect(hero.locator('a[href^="/property/"]')).toHaveCount(0);
  await expect(hero).not.toContainText("Demo listing");
  await expect(hero).not.toContainText("10 Marla Residential Plot");
  const header = page.getByTestId("site-header");
  await expect(header).toHaveAttribute("data-surface", "overlay");
  const headerStyles = await header.evaluate((element) => {
    const style = getComputedStyle(element);
    return { border: style.borderBottomWidth, background: style.backgroundColor, shadow: style.boxShadow };
  });
  expect(headerStyles).toEqual({ border: "0px", background: "rgba(0, 0, 0, 0)", shadow: "none" });
  await page.screenshot({ path: testInfo.outputPath("after-hero-desktop.png") });
  const brand = page.getByTestId("wordbitx-company");
  await expect(brand).toHaveCount(1);
  expect(await brand.evaluate((element) => element.nextElementSibling?.getAttribute("data-testid"))).toBe("closing-cta");
  await expect(page.getByRole("contentinfo").getByTestId("wordbitx-company")).toHaveCount(0);
  await brand.screenshot({ path: testInfo.outputPath("wordbitx-before-cta.png") });
  await expect(page.getByRole("heading", { name: "Explore Properties", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("header actions remain tappable without overflow from 320px to desktop", async ({ page }, testInfo) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("home-hero")).toBeVisible();
  await page.evaluate(async () => { await document.fonts.ready; });
  for (const width of [320, 360, 375, 390, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    const header = page.getByTestId("site-header");
    await expect(header).toHaveAttribute("data-surface", "overlay");
    const controls = [page.getByTestId("header-saved")];
    if (width < 1280) controls.push(page.getByTestId("header-menu"));
    for (const control of controls) {
      await expect(control).toBeVisible();
      const box = await control.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width, `button outside viewport ${width}`).toBeLessThanOrEqual(width);
      expect(await control.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const top = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
        return !!top && element.contains(top);
      }), `button covered at ${width}`).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `home overflow at ${width}px`).toBeLessThanOrEqual(1);
    if (width === 320 || width === 390) await page.screenshot({ path: testInfo.outputPath(`after-hero-${width}.png`) });
    await page.evaluate(() => window.scrollTo({ top: 500, behavior: "instant" }));
    await expect(header).toHaveAttribute("data-surface", "solid");
  }
});

test("mobile Saved button keeps the saved count and opens the shortlist", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.addInitScript(() => localStorage.setItem("estatewx:favorites", "[1]"));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const saved = page.getByTestId("header-saved");
  await expect(saved).toHaveAccessibleName("Saved properties, 1 saved");
  await expect(saved.locator(".header-saved-count")).toHaveText("1");
  await saved.click();
  await expect(page).toHaveURL(/\/favorites$/);
  await expect(page.getByRole("heading", { name: "Saved Properties", exact: true })).toBeVisible();
});

test("mobile menu uses the top layer, closes reliably and navigates correctly", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const menuButton = page.getByTestId("header-menu");
  await menuButton.click();
  const menu = page.getByRole("dialog", { name: "Main menu", exact: true });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("button", { name: "Close menu", exact: true })).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  for (let index = 0; index < 15; index++) {
    await page.keyboard.press("Tab");
    expect(await menu.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await page.screenshot({ path: testInfo.outputPath("mobile-menu.png") });
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(menuButton).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  await menuButton.click();
  await page.getByRole("dialog", { name: "Main menu" }).getByRole("link", { name: "All properties", exact: true }).click();
  await expect(page).toHaveURL(/\/properties$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});

test("mobile search and short-screen menu remain usable", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByTestId("header-menu").click();
  await page.getByRole("dialog", { name: "Main menu" }).getByRole("button", { name: "Search city, society or property" }).click();
  const search = page.getByRole("dialog", { name: "Search properties", exact: true });
  await expect(search).toBeVisible();
  await search.getByLabel("Search location, society or property type").fill("Gulberg");
  await page.screenshot({ path: testInfo.outputPath("mobile-search.png") });
  await search.getByRole("button", { name: "Search properties", exact: true }).click();
  await expect(page).toHaveURL(/\/properties\?q=Gulberg/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.setViewportSize({ width: 568, height: 320 });
  await page.getByTestId("header-menu").click();
  const menu = page.getByRole("dialog", { name: "Main menu" });
  const close = menu.getByRole("button", { name: "Close menu", exact: true });
  const box = await close.boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThan(320);
  await expect(menu.getByRole("link", { name: "List Your Property", exact: true })).toBeVisible();
  await close.click();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});

test("mobile hero search preserves filters and location suggestions", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const heroSearch = page.getByTestId("hero-search");
  await heroSearch.getByRole("tab", { name: "Rent", exact: true }).click();
  const form = heroSearch.getByRole("form", { name: "Find a property" });
  await form.getByLabel("Location", { exact: true }).fill("Lahore");
  await expect(form.getByRole("listbox")).toBeVisible({ timeout: 15_000 });
  await form.getByRole("listbox").getByRole("button").first().click();
  await form.getByLabel("Property type", { exact: true }).selectOption("Apartment");
  await form.getByLabel("Budget", { exact: true }).selectOption("150000-400000");
  await form.getByLabel("Bedrooms", { exact: true }).selectOption("2");
  await form.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/\/properties\/for-rent\?/);
  const url = new URL(page.url());
  expect(url.searchParams.get("city")).toBe("lahore");
  expect(url.searchParams.get("type")).toBe("Apartment");
  expect(url.searchParams.get("minPrice")).toBe("150000");
  expect(url.searchParams.get("maxPrice")).toBe("400000");
  expect(url.searchParams.get("beds")).toBe("2");
});

test("desktop property menu and key pages are responsive", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("button", { name: "Properties", exact: true }).click();
  const shortcuts = page.locator("#property-shortcuts");
  await expect(shortcuts).toBeVisible();
  const box = await shortcuts.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(1280);
  await page.keyboard.press("Escape");
  await expect(shortcuts).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/properties", "/list-property", "/contact", "/login", "/about"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { level: 1 }).waitFor();
    await page.evaluate(async () => { await document.fonts.ready; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `overflow on ${path}`).toBeLessThanOrEqual(1);
    await expect(page.getByTestId("header-saved")).toBeVisible();
    await expect(page.getByTestId("header-menu")).toBeVisible();
  }
});
