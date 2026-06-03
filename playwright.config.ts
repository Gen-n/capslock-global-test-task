import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  expect: {
    timeout: 10000,
  },
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        actionTimeout: 30000,
      },
      grepInvert: /TC06/,
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 5"],
      },
      grep: /TC06/,
    },
  ],
  reporter: process.env.CI
    ? [
        ["list"],
        ["html"],
        ["json", { outputFile: "test-results/results.json" }],
      ]
    : [["html"]],
  retries: process.env.CI ? 1 : 0,
  testDir: "./tests/e2e",
  testMatch: "**/walkInBath.e2e.ts",
  timeout: 120000,
  use: {
    baseURL: "https://test-qa.capslock.global",
    screenshot: "only-on-failure",
    trace: process.env.CI ? "retain-on-failure" : "on",
    video: "on",
  },
  workers: process.env.CI ? 4 : 3,
});
