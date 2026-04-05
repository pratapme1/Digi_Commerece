import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4184",
    trace: "on-first-retry",
    serviceWorkers: "block"
  },
  webServer: [
    {
      command: "corepack pnpm --filter @digi/attendee-web run dev",
      url: "http://127.0.0.1:4100",
      reuseExistingServer: true,
      timeout: 120_000
    },
    {
      command: "cd dist/host-flutter-web && python3 -m http.server 4184",
      url: "http://127.0.0.1:4184",
      reuseExistingServer: true,
      timeout: 30_000
    }
  ]
});
