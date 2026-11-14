import { expect, test } from "@playwright/test";

/**
 * Layout regression tests.
 *
 * The header is fixed, so every page has to reserve its height exactly once
 * (the `<Navigation />` spacer). A second offset — a hardcoded
 * `padding-top` on `.main-wrapper`, or a huge top padding on `.page-hero` —
 * pushes the content down without any visible cause, which is exactly the
 * kind of bug that survives a visual review.
 */

const HERO_ROUTES = [
  "/menu",
  "/menu/sukma-laya",
  "/membership",
  "/contact",
  "/corporate",
  "/privacy-policy",
  "/terms-conditions",
];

/** The hero must not start lower than this below the header. */
const MAX_HERO_GAP = 160;

test("the page content starts right below the fixed header", async ({ page }) => {
  await page.goto("/menu");
  await page.waitForLoadState("networkidle");

  const { heroTop, headerHeight } = await page.evaluate(() => ({
    heroTop: document.querySelector("main section")!.getBoundingClientRect().top,
    headerHeight: document.querySelector("header")!.getBoundingClientRect().height,
  }));

  expect(Math.abs(heroTop - headerHeight)).toBeLessThanOrEqual(1);
});

test("the main wrapper does not reserve the header height a second time", async ({
  page,
}) => {
  await page.goto("/menu");
  await page.waitForLoadState("networkidle");

  const padding = await page.evaluate(
    () => getComputedStyle(document.querySelector("main")!).paddingTop,
  );

  expect(parseFloat(padding)).toBe(0);
});

test("the hero content is not pushed far below the header", async ({ page }) => {
  // Ukur tata letak statis, bukan animasi: tanpa ini pengukuran bisa jatuh di
  // tengah transisi reveal (translateY 26px → 0) dan gap terbaca birkaç px
  // lebih besar dari keadaan settled.
  await page.emulateMedia({ reducedMotion: "reduce" });
  // Tujuh route berurutan dalam satu test: beri anggaran 3x lipat.
  test.slow();
  // Geometri butuh DOM + CSS + JS ter-hidrasi, BUKAN media S3. Abort image/media
  // supaya event load cepat dan deterministik; menunggu load (bukan
  // domcontentloaded) memastikan skrip client selesai sebelum mengukur.
  await page.route("**/*", (route) => {
    const type = route.request().resourceType();
    if (type === "image" || type === "media") return route.abort();
    return route.continue();
  });
  for (const route of HERO_ROUTES) {
    await page.goto(route, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));

    const { headerHeight, contentTop } = await page.evaluate(() => {
      const hero = document.querySelector(".page-hero");
      const first = hero?.querySelector(".eyebrow-s, h1, .header-xxl, p");
      return {
        headerHeight: document.querySelector("header")!.getBoundingClientRect().height,
        contentTop: first ? first.getBoundingClientRect().top : null,
      };
    });

    expect(contentTop, `no hero content on ${route}`).not.toBeNull();
    expect(contentTop! - headerHeight, `hero too low on ${route}`).toBeLessThanOrEqual(
      MAX_HERO_GAP,
    );
  }
});
