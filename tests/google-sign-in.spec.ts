import { test, expect } from "@playwright/test";

const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());

test("configured Google OAuth is offered for sign-in, account creation and property listing", async ({ page }) => {
  test.skip(!googleConfigured, "Set server-side Google OAuth variables to exercise the configured flow.");

  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("link", { name: "Continue with Google", exact: true })).toHaveAttribute(
    "href",
    "/api/auth/google?returnTo=/account",
  );
  await expect(page.getByRole("link", { name: "Sign up with Google", exact: true })).toHaveAttribute(
    "href",
    "/api/auth/google?returnTo=/account",
  );

  await page.goto("/list-property", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("link", { name: "Continue with Google", exact: true })).toHaveAttribute(
    "href",
    "/api/auth/google?returnTo=/list-property",
  );

  // The endpoint must respond with a top-level OAuth redirect. It must never
  // put the client secret in the URL or let Next.js treat this as an API fetch.
  const response = await page.request.get("/api/auth/google?returnTo=/list-property", { maxRedirects: 0 });
  expect(response.status()).toBe(302);
  const locationHeader = response.headers().location;
  expect(locationHeader).toBeTruthy();
  const location = new URL(locationHeader!);
  expect(location.origin).toBe("https://accounts.google.com");
  expect(location.searchParams.get("client_id")).toBe(process.env.GOOGLE_CLIENT_ID?.trim());
  expect(location.searchParams.get("redirect_uri")).toContain("/api/auth/google/callback");
  expect(location.searchParams.get("prompt")).toBe("select_account");
  expect(location.searchParams.has("client_secret")).toBe(false);
  expect(location.searchParams.has("returnTo")).toBe(false);
});
