import { expect, test } from "@playwright/test";

/**
 * Hero media slider — memastikan slide dari database benar-benar dirender
 * dan kontrol titik memindahkan media aktif. Rotasi otomatis tidak diuji
 * dengan waktu (flaky); perilakunya diverifikasi manual dan lewat domain test.
 */

test("hero menampilkan slide video + foto dan kontrol titik", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const controls = page.getByRole("group", { name: "Pilih visual hero" });
  await expect(controls).toBeVisible();

  const dots = controls.getByRole("button");
  await expect(dots).toHaveCount(4);
  await expect(dots.nth(0)).toHaveAttribute("aria-current", "true");

  const video = page.locator("header video").first();
  await expect(video).toHaveAttribute("poster", "/img/kama/incense-smoke-poster.jpg");
  await expect(page.locator("header video source").first()).toHaveAttribute(
    "src",
    "/video/incense-smoke.mp4",
  );

  await dots.nth(2).click();
  await expect(dots.nth(2)).toHaveAttribute("aria-current", "true");
  await expect(page.locator('[data-hero-slide="2"]')).toHaveAttribute(
    "data-active",
    "true",
  );
});
