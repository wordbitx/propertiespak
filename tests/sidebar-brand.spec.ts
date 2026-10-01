import { test, expect } from "@playwright/test";
import { visibleTestId } from "./helpers/visible";

test("sidebar keeps its navy-backed logo on mobile and tablet before and after scrolling", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    for (const top of [0, 500]) {
      await page.evaluate((scrollTop) => window.scrollTo({ top: scrollTop, behavior: "instant" }), top);
      await expect(visibleTestId(page, "site-header")).toHaveAttribute("data-surface", top ? "solid" : "overlay");
      const menu = page.getByRole("dialog", { name: "Main menu", exact: true });
      await expect(async () => {
        await visibleTestId(page, "header-menu").click();
        await expect(menu).toBeVisible({ timeout: 1500 });
      }).toPass({ timeout: 15_000 });

      const brand = menu.getByRole("link", { name: "Properties Pak home", exact: true });
      const logo = brand.locator(".brand-lockup-mark");
      await expect(logo).toBeVisible();
      await expect(brand.locator(".brand-lockup-name")).toHaveCSS("color", "rgb(6, 28, 51)");
      await expect(brand.locator(".brand-lockup-tagline")).toHaveCSS("color", "rgb(74, 96, 121)");

      const paints = await logo.evaluate((element) => {
        // SVG paint-server IDs are document-wide, not scoped to each SVG. A
        // hidden header logo must never supply the sidebar's navy/white fills.
        return [element.querySelector("rect[fill^='url(']"), element.querySelector("path[fill^='url(']")].map((shape) => {
          const id = shape?.getAttribute("fill")?.match(/^url\(#(.+)\)$/)?.[1];
          const gradient = id ? document.getElementById(id) : null;
          return {
            local: !!gradient && element.contains(gradient),
            stops: [...(gradient?.querySelectorAll("stop") ?? [])].map((stop) => stop.getAttribute("stop-color")),
          };
        });
      });
      expect(paints, `sidebar logo paint at ${width}px with ${top ? "solid" : "overlay"} header`).toEqual([
        { local: true, stops: ["#0A1A3A", "#050E26"] },
        { local: true, stops: ["#FFFFFF", "#E4E8EE"] },
      ]);

      const box = (await logo.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(box.width).toBeGreaterThanOrEqual(38);
      if (width === 390 && top === 0) {
        await menu.screenshot({ path: testInfo.outputPath("sidebar-navy-logo.png") });
      }
      await menu.getByRole("button", { name: "Close menu", exact: true }).click();
      await expect(menu).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    }
  }
});
