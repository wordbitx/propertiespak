import "dotenv/config";
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 90_000,
  workers: 1,
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000",
    browserName: "chromium",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    actionTimeout: 20_000,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
