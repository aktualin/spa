import { expect, test } from "@playwright/test";

/**
 * Halaman reservasi publik (/reservation): form lengkap dengan field jadwal
 * & treatment, dan CTA "Book Now" di header/drawer yang menuju ke sini.
 *
 * Sengaja tanpa submit sungguhan: pengiriman yang berhasil menulis baris ke
 * inbox admin (database bersama), jadi perilaku endpoint diuji unit
 * (tests/unit/forms.test.mts).
 */

test.beforeEach(async ({ page }) => {
  // Sama seperti nav.spec: media hero tidak dibutuhkan test ini.
  await page.route("**/*", (route) => {
    const type = route.request().resourceType();
    if (type === "image" || type === "media") return route.abort();
    return route.continue();
  });
});

test("/reservation merender form reservasi lengkap", async ({ page }) => {
  await page.goto("/reservation");
  await expect(page.locator("h1")).toContainText(/reservasi/i);

  const form = page.locator('form[data-track-form="reservation"]');
  await expect(form).toBeVisible();
  for (const name of [
    "name",
    "phone",
    "email",
    "branchSlug",
    "treatment",
    "preferredDate",
    "preferredTime",
    "guests",
    "message",
  ]) {
    await expect(form.locator(`[name="${name}"]`), name).toBeVisible();
  }
  await expect(form.locator('input[type="submit"]')).toBeVisible();
});

test("CTA Book Now menuju /reservation", async ({ page }, testInfo) => {
  await page.goto("/reservation");

  if (testInfo.project.name === "desktop") {
    const cta = page.locator("header nav").getByRole("link", { name: "Book Now" });
    await expect(cta).toHaveAttribute("href", "/reservation");
  } else {
    await page.getByRole("button", { name: /buka menu/i }).click();
    const cta = page
      .locator("#mobile-navigation")
      .getByRole("link", { name: "Book Now" });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/reservation");
  }
});
