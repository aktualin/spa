import { defineConfig } from "@playwright/test";

/**
 * Playwright config for the KAMA Spa site.
 *
 * The tests run against a **production build** on port 3311 (the dev server
 * on port 3000 may stay running alongside it). A production server is used
 * because the dev server hot-reloads, which makes interaction tests flaky.
 *
 * Three projects mirror the viewports the layout is designed against:
 *   - mobile  390 x 844  (default breakpoint)
 *   - tablet  768 x 1024 (legacy max-width: 991px rules apply)
 *   - desktop 1440 x 900  (`xl` = 1280px → full desktop navigation)
 */
const PORT = Number(process.env.PORT ?? 3311);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  // Hanya spec e2e; tests/unit/*.test.mts dijalankan oleh `npm run test:unit`
  // (node --test). Tanpa filter ini Playwright ikut memuatnya dan gagal karena
  // loader CJS/ESM berbeda.
  testMatch: /\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : [["list"]],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  // Test yang mengubah data bersama (menu navigasi, katalog) dikeluarkan dari proyek
  // biasa dan dijalankan terakhir, supaya test header/footer lain tidak melihat
  // menu yang sedang diubah.
  projects: [
    {
      name: "mobile",
      testIgnore: /admin-(menu|catalog)\.spec\.ts/,
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      },
    },
    {
      name: "tablet",
      testIgnore: /admin-(menu|catalog)\.spec\.ts/,
      use: {
        browserName: "chromium",
        viewport: { width: 768, height: 1024 },
        hasTouch: true,
      },
    },
    {
      name: "desktop",
      testIgnore: /admin-(menu|catalog)\.spec\.ts/,
      use: {
        browserName: "chromium",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "admin-flows",
      testMatch: /admin-(menu|catalog)\.spec\.ts/,
      dependencies: ["mobile", "tablet", "desktop"],
      use: {
        browserName: "chromium",
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command: `npm run build && npx next start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 180_000,
    // Cache proxy dipersingkat agar data uji redirect cepat terlihat (lihat
    // PROXY_CACHE_TTL_MS di tests/redirects.spec.ts). Jangan 0: tanpa cache
    // setiap request menanyai database dan test paralel jadi timeout.
    env: { REDIRECT_CACHE_TTL_MS: "1000" },
  },
});
