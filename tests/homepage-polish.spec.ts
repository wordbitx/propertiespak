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

test("desktop and mobile hero copy adapts cleanly, with a larger mobile search headline", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const hero = page.locator("#home-hero:visible");
  const mobileHeading = hero.locator(".hero-headline-mobile");
  await expect(mobileHeading).toBeVisible();
  await expect(mobileHeading.locator("br")).toHaveCount(1);
  await expect(hero.locator(".hero-description-mobile")).toHaveText("Buy, sell or rent property anywhere across Pakistan.");
  expect(await mobileHeading.evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(28);
  await expect(hero.locator(".hero-headline-desktop")).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(hero.locator(".hero-headline-desktop")).toBeVisible();
  await expect(hero.locator(".hero-headline-mobile")).toBeHidden();
});

test("Featured Properties cards share one rhythm: stacked price, equal heights, no dead gap under the call to action", async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const cards = page.locator("#featured:visible .property-rail-item article");
    await expect(cards.first()).toBeVisible();
    await expect(cards).toHaveCount(8);

    // The price and the type chip are stacked on every card, so a long price
    // such as "PKR 2.8 Lakh / month" cannot add a line the short ones lack.
    await expect(cards.locator('[data-property-type-stack="true"]')).toHaveCount(8);

    const report = await cards.evaluateAll((articles) => articles.map((article) => {
      const block = article.querySelector<HTMLElement>(".property-card-price-block");
      const price = block?.querySelector("p")?.getBoundingClientRect();
      const type = block?.querySelector("span")?.getBoundingClientRect();
      const cta = Array.from(article.querySelectorAll("a")).find((link) => link.textContent?.trim().startsWith("View Details"))?.getBoundingClientRect();
      return {
        stacked: !!block && getComputedStyle(block).flexDirection === "column",
        typeUnderPrice: !!price && !!type && type.top >= price.bottom - 1,
        height: Math.round(article.getBoundingClientRect().height),
        // Distance from the bottom of the call to action to the bottom of the
        // card. It has to be the same on every card and near zero.
        gapUnderCta: Math.round(article.getBoundingClientRect().bottom - (cta?.bottom ?? 0)),
        ctaHeight: Math.round(cta?.height ?? 0),
      };
    }));

    expect(report.every((card) => card.stacked && card.typeUnderPrice), `${width}px stacking`).toBe(true);
    // Every card in the rail is exactly as tall as its tallest sibling.
    expect(new Set(report.map((card) => card.height)).size, `${width}px equal heights`).toBe(1);
    // ...and the call to action lands on that shared bottom edge everywhere,
    // leaving no empty band underneath it.
    expect(new Set(report.map((card) => card.gapUnderCta)).size, `${width}px cta gap`).toBe(1);
    expect(Math.max(...report.map((card) => card.gapUnderCta)), `${width}px cta gap value`).toBeLessThanOrEqual(20);
  }
});

test("Explore Properties cards consistently stack type below price on desktop and mobile", async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const cards = width < 768
      ? page.locator("#explore:visible .property-rail-item article")
      : page.locator("#explore:visible .home-explore-grid article");
    await expect(cards.first()).toBeVisible();
    await expect(cards).toHaveCount(16);
    await expect(cards.locator('[data-property-type-stack="true"]')).toHaveCount(16);
    expect(await cards.evaluateAll((articles) => articles.every((article) => {
      const block = article.querySelector<HTMLElement>(".property-card-price-block");
      const price = block?.querySelector("p")?.getBoundingClientRect();
      const type = block?.querySelector("span")?.getBoundingClientRect();
      return !!block && getComputedStyle(block).flexDirection === "column" && !!price && !!type && type.top >= price.bottom - 1;
    }))).toBe(true);
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

test("new housing projects auto-advance horizontally at mobile and desktop with manual controls", async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const rail = page.locator('#projects:visible [data-testid="project-rail"]');
    const region = rail.getByRole("region", { name: "New housing projects", exact: true });
    await region.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await expect(rail).toHaveAttribute("data-auto-play", "true");
    expect(await region.evaluate((element) => getComputedStyle(element).display)).toBe("flex");
    await expect(region.locator("article")).toHaveCount(6);
    const initial = await region.evaluate((element) => element.scrollLeft);
    await expect.poll(() => region.evaluate((element) => element.scrollLeft), { timeout: 7000 }).toBeGreaterThan(initial + 4);
    await rail.getByRole("button", { name: "Next new housing projects", exact: true }).click();
    await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(initial + 100);
    await expect(region.locator("article").first().getByRole("link").first()).toHaveAttribute("href", /\/projects\//);
    if (width === 1440) await expect(rail.locator(".mobile-scroll-toolbar")).toBeVisible();
  }
});

test("Explore more tools and guides follow Dealers in a manual horizontal rail", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const explore = page.locator("#explore-more:visible");
  await expect(explore.getByRole("heading", { name: "Explore more on Properties Pak", exact: true })).toBeVisible();
  expect(await explore.evaluate((element) => element.previousElementSibling?.id)).toBe("home-dealers");
  const cards = explore.locator(".explore-more-card");
  await expect(cards).toHaveCount(8);
  // Every card stays on this website — nothing links out to another portal.
  const expected = [
    ["New Projects", "The best investment opportunities", "/properties/new-projects"],
    ["Construction Cost Calculator", "Get construction cost estimate", "/tools/construction-cost-calculator"],
    ["Home Loan Calculator", "Find affordable loan packages", "/tools/mortgage-calculator"],
    ["Area Guides", "Explore housing societies in Pakistan", "/towns"],
    ["Plot Finder", "Find plots in any housing society", "/properties?category=plot"],
    ["Property Trends", "Find popular areas to buy property", "/blog"],
    ["All Calculators", "Every investment tool in one place", "/tools"],
    ["Compare Listings", "Line up shortlisted homes side by side", "/compare"],
  ];
  for (const [index, [label, description, href]] of expected.entries()) {
    await expect(cards.nth(index).locator(".explore-more-title")).toHaveText(label);
    await expect(cards.nth(index).locator(".explore-more-description")).toHaveText(description);
    await expect(cards.nth(index)).toHaveAttribute("href", href);
    await expect(cards.nth(index)).not.toHaveAttribute("target", "_blank");
  }
  expect(await page.evaluate(() => document.documentElement.innerHTML.includes("zameen.com"))).toBe(false);
  await explore.getByRole("button", { name: "Scroll to more resources", exact: true }).click();
  await expect.poll(() => explore.locator(".explore-more-viewport").evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await expect(page.locator("#tools")).toHaveCount(0);
  await expect(page.locator("#explore-more .calculators--home")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});

test("footer branding keeps the transparent mark and the AI assistant stays a compact corner shortcut", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#wordbitx")).toHaveCount(0);
  const assistant = page.getByRole("button", { name: "Open the Properties Pak AI assistant", exact: true });
  await expect(assistant).toHaveAttribute("aria-expanded", "false");
  const footer = page.getByRole("contentinfo", { name: "Properties Pak footer" });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await footer.scrollIntoViewIfNeeded();
    const footerLogo = footer.locator(".brand-lockup-mark").first();
    await expect(footerLogo).toHaveAttribute("viewBox", "553.5 48 460 460");
    await expect(footerLogo.locator('rect[width="48"][height="48"]')).toHaveCount(0);
    const credit = footer.getByRole("link", { name: "WordbitX | Group of Companies", exact: true });
    await expect(credit).toHaveAttribute("href", "https://wordbitxtech.com/");
    const brand = credit.locator(".footer-wordbitx-x");
    const colors = await credit.evaluate((element) => ({
      name: getComputedStyle(element).color,
      x: getComputedStyle(element.querySelector(".footer-wordbitx-x")!).color,
    }));
    expect(colors.x).not.toBe(colors.name);
    expect(await brand.textContent()).toBe("X");
    const box = await assistant.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
    expect(box!.height).toBeLessThanOrEqual(56);
    const assistantLabel = assistant.locator(".ai-launcher-label");
    await expect(assistantLabel).toHaveText("AI Assistant");
    if (width < 1024) await expect(assistantLabel).toBeHidden();
    else await expect(assistantLabel).toBeVisible();
  }
});

test("the AI assistant answers property questions from live inventory", async ({ page }) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const launcher = page.getByRole("button", { name: "Open the Properties Pak AI assistant", exact: true });
  await launcher.click();
  const panel = page.getByRole("dialog", { name: "Properties Pak AI assistant", exact: true });
  await expect(panel).toBeVisible();
  await expect(panel.locator(".ai-turn--assistant .ai-bubble").first()).toContainText("Properties Pak assistant");

  // A natural-language question becomes a real, filtered search.
  await panel.getByRole("textbox").fill("3 bedroom houses for sale in Lahore under 2 crore");
  await panel.getByRole("button", { name: "Send your question" }).click();
  await expect(panel.locator(".ai-turn--user").last()).toContainText("3 bedroom houses for sale in Lahore under 2 crore");
  const answer = panel.locator(".ai-turn--assistant").last();
  await expect(answer.locator(".ai-bubble")).toContainText("3 bedroom", { timeout: 15_000 });
  await expect(answer.locator(".ai-bubble")).toContainText("Lahore");
  const cards = answer.locator(".ai-listings li");
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThan(0);
  for (const price of await cards.locator(".ai-listing-price").allTextContents()) expect(price).toMatch(/PKR/);
  await expect(answer.locator(".ai-more")).toHaveAttribute("href", /\/properties\?.*city=lahore/);

  // A follow-up refines the same search instead of starting over.
  await panel.getByRole("textbox").fill("in Islamabad instead");
  await panel.getByRole("button", { name: "Send your question" }).click();
  await expect(panel.locator(".ai-turn--assistant").last().locator(".ai-bubble")).toContainText("Islamabad", { timeout: 15_000 });

  // Non-listing questions answer from the site's own tools and pages.
  await panel.getByRole("textbox").fill("how much will my monthly instalment be");
  await panel.getByRole("button", { name: "Send your question" }).click();
  await expect(panel.locator(".ai-turn--assistant").last().getByRole("link", { name: /Mortgage calculator/ })).toHaveAttribute("href", "/tools/mortgage-calculator");

  // A human hand-off is still one tap away.
  await panel.getByRole("textbox").fill("I want to talk to a human");
  await panel.getByRole("button", { name: "Send your question" }).click();
  await expect(panel.locator(".ai-turn--assistant").last().getByRole("link", { name: /Contact Properties Pak/ })).toHaveAttribute("href", "/contact");

  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(launcher).toHaveAttribute("aria-expanded", "false");
  expect(failures).toEqual([]);
});
