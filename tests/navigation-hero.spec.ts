import { test, expect } from "@playwright/test";
import { visibleTestId } from "./helpers/visible";

test("hero is photographic, borderless and has no featured listing card", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const hero = visibleTestId(page, "home-hero");
  await expect(hero.locator(".hero-headline-desktop")).toHaveText(/Find Your Future\.\s*Invest With Clarity\./);
  await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(hero.getByRole("link", { name: "Explore Properties", exact: true })).toHaveAttribute("href", "#featured");
  const image = visibleTestId(page, "hero-photograph");
  await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBe(true);
  await expect(image).toHaveAttribute("loading", "eager");
  await expect(image).toHaveAttribute("fetchpriority", "high");
  await expect(hero.locator('a[href^="/property/"]')).toHaveCount(0);
  await expect(hero).not.toContainText("Demo listing");
  await expect(hero).not.toContainText("10 Marla Residential Plot");
  const header = visibleTestId(page, "site-header");
  await expect(header).toHaveAttribute("data-surface", "overlay");
  const headerStyles = await header.evaluate((element) => {
    const style = getComputedStyle(element);
    return { border: style.borderBottomWidth, background: style.backgroundColor, shadow: style.boxShadow };
  });
  expect(headerStyles).toEqual({ border: "0px", background: "rgba(0, 0, 0, 0)", shadow: "none" });
  await page.screenshot({ path: testInfo.outputPath("after-hero-desktop.png") });
  await expect(page.locator("#wordbitx")).toHaveCount(0);
  await expect(page.getByTestId("closing-cta")).toBeVisible();
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "WordbitX | Group of Companies", exact: true })).toHaveAttribute("href", "https://wordbitxtech.com/");
  await expect(page.getByRole("heading", { name: "Explore Properties", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("header actions remain tappable without overflow from 320px to desktop", async ({ page }, testInfo) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  // Next paints the page inside a hidden prerender shell before swapping it in,
  // so the id briefly exists twice; scope to the visible copy.
  await expect(visibleTestId(page, "home-hero").first()).toBeVisible();
  await page.evaluate(async () => { await document.fonts.ready; });
  for (const width of [320, 360, 375, 390, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    const header = visibleTestId(page, "site-header");
    await expect(header).toHaveAttribute("data-surface", "overlay");
    const controls = [visibleTestId(page, width < 1024 ? "header-language-mobile" : "header-saved")];
    if (width < 1280) controls.push(visibleTestId(page, "header-menu"));
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
    if (width < 1280) {
      const menu = visibleTestId(page, "header-menu");
      await expect(menu).toHaveText("");
      await expect(menu).toHaveAccessibleName("Open menu");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `home overflow at ${width}px`).toBeLessThanOrEqual(1);
    if (width === 320 || width === 390) await page.screenshot({ path: testInfo.outputPath(`after-hero-${width}.png`) });
    await page.evaluate(() => window.scrollTo({ top: 500, behavior: "instant" }));
    await expect(header).toHaveAttribute("data-surface", "solid");
  }
});

test("mobile header language switch replaces Saved while the shortlist remains in the menu", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.addInitScript(() => localStorage.setItem("estatewx:favorites", "[1]"));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const language = visibleTestId(page, "header-language-mobile");
  await expect(language).toBeVisible();
  await expect(language).toHaveText("اردو");
  await expect(language).toHaveCSS("border-top-width", "0px");
  await expect(language).toHaveCSS("border-right-width", "0px");
  await expect(visibleTestId(page, "header-saved")).toHaveCount(0);
  await visibleTestId(page, "header-menu").click();
  const menu = page.getByRole("dialog", { name: "Main menu", exact: true });
  await expect(menu.getByRole("link", { name: /Saved/ })).toBeVisible();
  await expect(menu.locator(".menu-shortcut .rounded-full")).toHaveText("1");
  await menu.getByRole("link", { name: /Saved/ }).click();
  await expect(page).toHaveURL(/\/favorites$/);
  await expect(page.getByRole("heading", { name: "Saved Properties", exact: true })).toBeVisible();
});

test("desktop Sell a property action has a green animated flag and respects reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const sell = visibleTestId(page, "header-sell-property");
  await expect(sell).toBeVisible();
  await expect(sell).toHaveAttribute("href", "/list-property");
  await expect(sell).toHaveAccessibleName("Sell a property");
  const flag = sell.locator(".header-list-property-flag");
  await expect(flag).toHaveText("SELL");
  await expect(flag).toHaveCSS("background-color", "rgb(167, 243, 192)");
  expect(await flag.evaluate((element) => getComputedStyle(element).animationName)).toBe("header-sell-flag-bob");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await flag.evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
});

test("desktop top bar and mobile header switch the shared interface between English and Urdu", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const desktopSwitch = page.locator(".header-utility-bar .header-language-switch");
  await expect(desktopSwitch).toBeVisible();
  await desktopSwitch.getByRole("button", { name: "اردو", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ur");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  const primary = page.getByRole("navigation", { name: "Primary", exact: true });
  await expect(primary.getByRole("link", { name: "ہوم", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "پراپرٹیز دیکھیں", exact: true })).toBeVisible();
  await desktopSwitch.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileSwitch = visibleTestId(page, "header-language-mobile");
  await expect(mobileSwitch).toHaveText("اردو");
  await expect(visibleTestId(page, "header-saved")).toHaveCount(0);
  await mobileSwitch.click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ur");
  await expect(mobileSwitch).toHaveText("EN");
  await mobileSwitch.click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("mobile menu uses the top layer, closes reliably and navigates correctly", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const menuButton = visibleTestId(page, "header-menu");
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

test("desktop homepage search exposes the Homes, Plots, Commercial and Beds filters", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const panel = page.getByTestId("hero-search");
  const type = panel.getByLabel("Property type", { exact: true });
  await panel.getByRole("group", { name: "Quick property category", exact: true }).getByRole("button", { name: "Homes", exact: true }).click();
  await expect(type.locator("option")).toHaveText(["All Homes", "House", "Upper Portion", "Farm House", "Penthouse", "Flat", "Lower Portion", "Room"]);
  await panel.getByLabel("Beds", { exact: true }).selectOption("3");
  await panel.getByRole("group", { name: "Quick property category", exact: true }).getByRole("button", { name: "Plots", exact: true }).click();
  await expect(type.locator("option")).toHaveText(["All Plots", "Residential Plot", "Agricultural Land", "Plot File", "Commercial Plot", "Industrial Land", "Plot Form"]);
  await panel.getByRole("group", { name: "Quick property category", exact: true }).getByRole("button", { name: "Commercial", exact: true }).click();
  await expect(type.locator("option")).toHaveText(["All Commercial", "Office", "Warehouse", "Building", "Shop", "Factory", "Other"]);
  await type.selectOption("Factory");
  await expect(panel.getByText("NEW", { exact: true })).toBeVisible();
  await expect(panel.getByRole("link", { name: /New projects/ })).toHaveAttribute("href", "/projects");
  await panel.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/\/properties\/for-sale\?category=commercial&type=Factory/);
});

test("mobile search and short-screen menu remain usable", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await visibleTestId(page, "header-menu").click();
  await page.getByRole("dialog", { name: "Main menu" }).getByRole("button", { name: "Search city, society or property" }).click();
  const search = page.getByRole("dialog", { name: "Search properties", exact: true });
  await expect(search).toBeVisible();
  await search.getByLabel("Add keyword", { exact: true }).fill("Gulberg");
  await page.screenshot({ path: testInfo.outputPath("mobile-search.png") });
  await search.getByRole("button", { name: "Find properties", exact: true }).click();
  await expect(page).toHaveURL(/\/properties\/for-sale\?q=Gulberg/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.setViewportSize({ width: 568, height: 320 });
  await visibleTestId(page, "header-menu").click();
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
  const heroSearch = visibleTestId(page, "hero-search");
  await heroSearch.getByRole("tab", { name: "Rent", exact: true }).click();
  await page.route("**/api/geocode?**", (route) => route.fulfill({ json: { results: [{ label: "Lahore", lat: 31.52, lng: 74.35, source: "estatewx", kind: "city" }] } }));
  await heroSearch.getByRole("button", { name: "Search Properties", exact: true }).click();
  const form = page.getByRole("dialog", { name: "Search properties", exact: true });
  await form.getByLabel("Select location", { exact: true }).fill("Lahore");
  await expect(form.getByRole("listbox")).toBeVisible({ timeout: 15_000 });
  await form.getByRole("listbox").getByRole("button").first().click();
  await form.getByRole("group", { name: "Property category", exact: true }).getByRole("button", { name: "Homes", exact: true }).click();
  await form.getByRole("button", { name: "Flat / Apartment", exact: true }).click();
  await form.getByLabel("Minimum price (PKR)", { exact: true }).fill("150000");
  await form.getByLabel("Maximum price (PKR)", { exact: true }).fill("400000");
  await form.getByRole("group", { name: "Bedrooms", exact: true }).getByRole("button", { name: "2+", exact: true }).click();
  await form.getByRole("button", { name: "Find properties", exact: true }).click();
  await expect(page).toHaveURL(/\/properties\/for-rent\?/);
  const url = new URL(page.url());
  expect(url.searchParams.get("city")).toBe("lahore");
  expect(url.searchParams.get("type")).toBe("Apartment");
  expect(url.searchParams.get("minPrice")).toBe("150000");
  expect(url.searchParams.get("maxPrice")).toBe("400000");
  expect(url.searchParams.get("beds")).toBe("2");
});

test("the header menu button is labelled at every width where it is the only navigation", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  // The hamburger is the sole navigation control from the narrowest phone up to
  // 1279px — the desktop nav only appears at 1280px — so it has to keep its
  // "Menu" label the whole way, otherwise it is a bare unexplained icon.
  for (const width of [320, 390, 640, 700, 900, 1100, 1279]) {
    await page.setViewportSize({ width, height: 900 });
    const button = visibleTestId(page, "header-menu");
    await expect(button, `button visible at ${width}px`).toBeVisible();
    const caption = button.locator(".header-action-caption");
    await expect(caption, `label visible at ${width}px`).toBeVisible();
    await expect(caption, `label text at ${width}px`).toHaveText("Menu");
    // Legible, not a 9px whisper that vanishes over the hero photograph.
    const size = await caption.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
    expect(size, `label size at ${width}px`).toBeGreaterThanOrEqual(10);
    const weight = await caption.evaluate((element) => getComputedStyle(element).fontWeight);
    expect(Number(weight), `label weight at ${width}px`).toBeGreaterThanOrEqual(700);
    // And the label must actually sit underneath the icon, not beside it.
    const icon = await button.locator("svg").boundingBox();
    const label = await caption.boundingBox();
    expect(label!.y, `label below icon at ${width}px`).toBeGreaterThanOrEqual(icon!.y + icon!.height - 1);
  }

  // At 1280px the full nav takes over and the button disappears, so an
  // unlabelled icon can never be stranded.
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(visibleTestId(page, "header-menu")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Primary", exact: true })).toBeVisible();
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
    await expect(visibleTestId(page, "header-language-mobile")).toBeVisible();
    await expect(visibleTestId(page, "header-menu")).toBeVisible();
  }
});
