import type { Locator, Page } from "@playwright/test";

/**
 * A locator for the *visible* element carrying the given test id.
 *
 * Next renders the page inside a hidden prerender shell (`<div id="S:0" hidden>`)
 * and then swaps it into place, so for a short window the document holds two
 * copies of the same subtree — one visible, one `display:none`. Playwright's
 * strict mode counts both, so tests scope to the visible copy instead of
 * assuming the id is unique in the DOM.
 */
export function visibleTestId(page: Page, id: string): Locator {
  return page.locator(`[data-testid="${id}"]:visible`);
}
