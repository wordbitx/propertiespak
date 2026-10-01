import { randomUUID } from "node:crypto";
import { test, expect, type Page } from "@playwright/test";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const accountEmails: string[] = [];

async function createAccount(page: Page) {
  const email = `profile-scroll-${randomUUID()}@example.com`;
  accountEmails.push(email);

  await page.goto("/login?mode=register", { waitUntil: "domcontentloaded" });
  const registration = page.locator("form").filter({
    has: page.getByRole("heading", { name: "Create an account", exact: true }),
  });
  await registration.getByLabel("Full name", { exact: true }).fill("Scroll QA");
  await registration.getByLabel("Email", { exact: true }).fill(email);
  await registration.getByLabel("Password", { exact: true }).fill("scroll-qa-password");
  await registration.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome back, Scroll");
}

function profileDialog(page: Page) {
  return page.getByRole("dialog", { name: "Complete Your Professional Profile", exact: true });
}

async function expectDashboardToScroll(page: Page) {
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  const viewport = page.viewportSize()!;
  await page.mouse.move(viewport.width - 30, viewport.height / 2);
  // Real wheel input catches overflow:hidden; scrollTo alone can bypass it.
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
}

test.afterAll(async () => {
  try {
    if (accountEmails.length) {
      await pool.query(
        "delete from favorites where user_id in (select id from users where email = any($1::text[]))",
        [accountEmails],
      );
      await pool.query("delete from users where email = any($1::text[])", [accountEmails]);
    }
  } finally {
    await pool.end();
  }
});

for (const scenario of [
  { name: "desktop", viewport: { width: 1440, height: 1000 }, dismiss: "close" },
  { name: "mobile", viewport: { width: 390, height: 844 }, dismiss: "skip" },
  { name: "short screen", viewport: { width: 568, height: 320 }, dismiss: "escape" },
]) {
  test(`new account profile setup is visible and dashboard scrolls after dismissal on ${scenario.name}`, async ({ page }) => {
    await page.setViewportSize(scenario.viewport);
    await createAccount(page);
    const dialog = profileDialog(page);
    await expect(dialog).toBeVisible();
    await expect(page.locator('[role="dialog"][aria-labelledby="profile-setup-title"]')).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");

    // The setup form itself must scroll, including on short/mobile screens.
    const content = dialog.locator("div.overflow-y-auto");
    await content.hover({ position: { x: 12, y: 12 } });
    await page.mouse.wheel(0, 500);
    await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

    if (scenario.dismiss === "skip") {
      await dialog.getByRole("button", { name: "Skip for Now", exact: true }).click();
    } else if (scenario.dismiss === "escape") {
      await page.keyboard.press("Escape");
    } else {
      await dialog.getByRole("button", { name: "Close profile setup", exact: true }).click();
    }
    await expectDashboardToScroll(page);

    if (scenario.dismiss === "skip") {
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(page.getByRole("button", { name: "Complete Profile", exact: true })).toBeVisible();
      // Wait past the 600ms first-login timer to confirm Skip suppresses it.
      await page.waitForTimeout(1000);
      await expectDashboardToScroll(page);
    }

    // One visible instance handles both the first-login prompt and later edits.
    // Closing it must restore, rather than erase, the previous body style.
    await page.evaluate(() => { document.body.style.overflow = "auto"; });
    await page.getByRole("button", { name: "Complete Profile", exact: true }).click();
    await expect(dialog).toBeVisible();
    await expect(page.locator('[role="dialog"][aria-labelledby="profile-setup-title"]')).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");
    await dialog.getByRole("button", { name: "Close profile setup", exact: true }).click();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("auto");
    await expectDashboardToScroll(page);
  });
}

test("completing the first-login profile unlocks scrolling and still allows later edits", async ({ page }) => {
  await createAccount(page);
  const dialog = profileDialog(page);
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Agency / Company Name", { exact: true }).fill("Scroll QA Agency");
  await dialog.getByRole("button", { name: "Complete Profile", exact: true }).click();
  await expect(page.getByRole("button", { name: "Edit professional profile", exact: true })).toBeVisible();
  await expectDashboardToScroll(page);

  await page.getByRole("button", { name: "Edit professional profile", exact: true }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Agency / Company Name", { exact: true })).toHaveValue("Scroll QA Agency");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog.getByText("Profile saved.", { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  await dialog.getByRole("button", { name: "Close profile setup", exact: true }).click();
  await expectDashboardToScroll(page);
});
