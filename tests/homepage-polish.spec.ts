import { test, expect } from "@playwright/test";

const visible = (selector: string) => `${selector}:visible`;

test("hero copy sits just above search, search is higher and dealers retain a comfortable gap", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    const intro = await page.locator(visible(".hero-search-intro")).boundingBox();
    const box = await page.locator(visible(".property-search-panel")).boundingBox();
    const heading = await page.locator("#home-dealers:visible h2").boundingBox();
    const hero = await page.getByTestId("home-hero").boundingBox();
    expect(box!.y - intro!.y - intro!.height).toBeGreaterThanOrEqual(12);
    expect(box!.y - intro!.y - intro!.height).toBeLessThanOrEqual(24);
    expect(box!.y + box!.height).toBeLessThan(hero!.height - 20);
    expect(heading!.y - box!.y - box!.height).toBeGreaterThan(30);
    expect(heading!.y - box!.y - box!.height).toBeLessThan(85);
    expect(hero!.height).toBeGreaterThanOrEqual(width < 768 ? 540 : 640);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${width}px overflow`).toBeLessThanOrEqual(1);
  }
});

test("dealers keep automatic motion while arrows, hover, keyboard and drag give manual control", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const region = page.getByTestId("dealers-marquee");
  await region.scrollIntoViewIfNeeded();
  const initial = await region.evaluate((element) => element.scrollLeft);
  await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(initial + 4);
  await region.hover();
  const paused = await region.evaluate((element) => element.scrollLeft);
  await page.waitForTimeout(350);
  expect(await region.evaluate((element) => element.scrollLeft)).toBe(paused);
  await page.getByRole("button", { name: "Next dealers and agencies", exact: true }).click();
  await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(paused + 150);
  const next = await region.evaluate((element) => element.scrollLeft);
  await page.getByRole("button", { name: "Previous dealers and agencies", exact: true }).click();
  await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeLessThan(next - 100);
  await region.focus();
  const current = await region.evaluate((element) => element.scrollLeft);
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(current + 100);
  await page.waitForTimeout(350);
  const rect = (await region.boundingBox())!;
  const beforeDrag = await region.evaluate((element) => element.scrollLeft);
  await page.mouse.move(rect.x + rect.width * .6, rect.y + rect.height / 2);
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width * .6 - 140, rect.y + rect.height / 2, { steps: 12 });
  await page.mouse.up();
  expect(await region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(beforeDrag + 90);
  await expect(page).toHaveURL(/\/$/);
});

test("reduced-motion users get a still dealer row with working manual controls", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const region = page.getByTestId("dealers-marquee");
  await region.scrollIntoViewIfNeeded();
  const before = await region.evaluate((element) => element.scrollLeft);
  await page.waitForTimeout(500);
  expect(await region.evaluate((element) => element.scrollLeft)).toBe(before);
  await page.getByRole("button", { name: "Next dealers and agencies", exact: true }).click();
  expect(await region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(before);
});

test("Popular Searches has a highlighted header and clear touchable location links", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const popular = page.locator("#popular-searches:visible");
  await popular.scrollIntoViewIfNeeded();
  await expect(popular.getByRole("heading", { name: "Popular Searches", exact: true })).toBeVisible();
  expect(await popular.locator(".popular-search-header").evaluate((element) => getComputedStyle(element).backgroundImage)).toContain("linear-gradient");
  expect(await popular.locator(".popular-location-grid a").first().evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(48);
  await popular.getByRole("button", { name: "To Rent", exact: true }).click();
  await expect(popular.locator(".popular-search-results h3")).toContainText("to rent");
  await expect(popular.locator(".popular-search-all")).toHaveAttribute("href", /\/properties\/for-rent/);
});

test("mobile housing projects are one manual horizontal row; desktop keeps its grid", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const rail = page.locator('#projects:visible [data-testid="project-rail"]');
  const region = rail.getByRole("region", { name: "New housing projects", exact: true });
  await region.scrollIntoViewIfNeeded();
  expect(await region.evaluate((element) => getComputedStyle(element).display)).toBe("flex");
  await expect(region.locator("article")).toHaveCount(4);
  const initial = await region.evaluate((element) => element.scrollLeft);
  await page.waitForTimeout(350);
  expect(await region.evaluate((element) => element.scrollLeft)).toBe(initial);
  await rail.getByRole("button", { name: "Next new housing projects", exact: true }).click();
  await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(initial);
  await expect(region.locator("article").first().getByRole("link").first()).toHaveAttribute("href", /\/projects\//);
  await page.setViewportSize({ width: 1440, height: 900 });
  expect(await region.evaluate((element) => getComputedStyle(element).display)).toBe("grid");
  await expect(rail.locator(".mobile-scroll-toolbar")).toBeHidden();
});

test("premium decision tools retain real calculations, all eight modes and keyboard navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const tools = page.locator("#tools:visible");
  await tools.scrollIntoViewIfNeeded();
  await expect(tools.getByRole("heading", { name: "Make Smarter Property Decisions", exact: true })).toBeVisible();
  await expect(tools.getByRole("tab")).toHaveCount(8);
  expect((await tools.locator(".calculators--home").boundingBox())!.height).toBeLessThan(850);
  await tools.getByLabel("Down payment", { exact: true }).fill("50");
  await expect(tools.locator(".calculator-result")).toContainText("PKR 12,500,000");
  await tools.getByRole("tab", { name: "Mortgage", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tools.getByRole("tab", { name: "Rental yield", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(tools.getByRole("tabpanel")).toContainText("Net rental yield");
  for (const name of ["Affordability", "Rent vs buy", "ROI", "Investment projection", "Construction cost", "Property tax", "Mortgage"]) {
    await tools.getByRole("tab", { name, exact: true }).click();
    await expect(tools.locator(".calculator-result")).toBeVisible();
    expect(await tools.locator(".calculator-result").textContent()).not.toMatch(/NaN|Infinity/);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await tools.getByRole("tablist").evaluate((element) => getComputedStyle(element).flexDirection)).toBe("row");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});

test("WordbitX credit is small, uses the requested legal suffix and keeps its real website", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const credit = page.locator("#wordbitx:visible");
  await credit.scrollIntoViewIfNeeded();
  await expect(credit.getByRole("link", { name: "WordbitX | SMC- Pvt. Ltd.", exact: true })).toHaveAttribute("href", "https://wordbitxtech.com/");
  expect((await credit.boundingBox())!.height).toBeLessThan(100);
  expect(await credit.locator("a").evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBeLessThanOrEqual(16);
  await expect(credit.locator(".wordbitx-contact-panel")).toHaveCount(0);
  await expect(page.getByRole("contentinfo").getByText("| SMC- Pvt. Ltd.", { exact: true })).toBeVisible();
});
