import { expect, test } from "@playwright/test";

/**
 * Contact-channel regression tests.
 *
 * WhatsApp is the single contact channel of the site, and every link must
 * carry the right pre-filled message: the branch address for a location,
 * the generic booking text for the floating button, the member text for
 * the membership calls-to-action, and the office text for the footer's
 * office line — which stays on its own number, separate from booking.
 */

const FILLER = "https://wa.me/";

test("the floating WhatsApp button carries the generic booking message", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const fab = page.getByRole("link", { name: "Chat via WhatsApp" }).first();
  const href = await fab.getAttribute("href");

  expect(href).toBeTruthy();
  expect(href).toContain(FILLER);
  expect(decodeURIComponent(href!)).toContain("Hi KAMA, I'd like to make a reservation");
});

test("the membership call-to-action joins through WhatsApp", async ({ page }) => {
  await page.goto("/membership");
  await page.waitForLoadState("networkidle");

  const cta = page.getByRole("link", { name: "Join KAMA Now" }).first();
  const href = decodeURIComponent((await cta.getAttribute("href"))!);

  expect(href).toContain(FILLER);
  expect(href).toContain("Hi KAMA, I'd like to join the membership");
});

test("the footer partnership link opens the e-mail client", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const mail = page.getByRole("link", { name: "marketing@kamaspa.id" }).first();
  await expect(mail).toHaveAttribute("href", "mailto:marketing@kamaspa.id");
});

test("the footer office WhatsApp shows the office number and opens wa.me", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const office = page.getByRole("link", { name: /Office WhatsApp/ }).first();
  await expect(office).toBeVisible();
  await expect(office).toContainText("0811 8807 2287");

  const href = await office.getAttribute("href");
  expect(href).toContain("https://wa.me/6281188072287");
  expect(decodeURIComponent(href!)).toContain(
    "Hi KAMA, I'd like to speak with the office team",
  );
});

test("the booking button stays on the booking number, separate from the office line", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const fab = page.getByRole("link", { name: "Chat via WhatsApp" }).first();
  const fabHref = await fab.getAttribute("href");

  expect(fabHref).toContain("wa.me/6281316052040");
  expect(fabHref).not.toContain("6281188072287");
});
