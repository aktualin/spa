import { expect, test } from "@playwright/test";

/**
 * Menu page regression tests.
 *
 * The footer and the Service Menu dropdown link to `/menu#…` anchors. Those
 * anchors only work when the section exists *and* clears the fixed header —
 * the second half is easy to break with a spacing change.
 */

const SECTIONS = ["massage", "body", "face", "head", "bath", "packages"] as const;

test.beforeEach(async ({ page }) => {
  await page.goto("/menu");
  await page.waitForLoadState("networkidle");
});

test("the menu page exposes every anchor the navigation links to", async ({
  page,
}) => {
  for (const id of SECTIONS) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
});

test("the menu sections appear in the order the navigation lists them", async ({
  page,
}) => {
  const ids = await page.evaluate(
    (wanted) =>
      [...document.querySelectorAll("main section[id]")]
        .map((el) => el.id)
        .filter((id) => (wanted as string[]).includes(id)),
    [...SECTIONS] as string[],
  );

  expect(ids).toEqual([...SECTIONS]);
});

test("anchoring a section clears the fixed header", async ({ page }) => {
  const headerHeight = await page.evaluate(
    () => document.querySelector("header")!.getBoundingClientRect().height,
  );

  for (const id of SECTIONS) {
    await page.evaluate((target) => {
      const el = document.getElementById(target)!;
      const offset = parseFloat(getComputedStyle(el).scrollMarginTop);
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - offset,
        behavior: "instant",
      });
    }, id);

    const top = await page.evaluate(
      (target) => document.getElementById(target)!.getBoundingClientRect().top,
      id,
    );

    // The section must start below the header, with the breathing room the
    // global `scroll-margin-top` rule adds.
    expect(top).toBeGreaterThanOrEqual(headerHeight);
    expect(top).toBeLessThanOrEqual(headerHeight + 40);
  }
});

test("every navigation link to the menu resolves to an existing anchor", async ({
  page,
}) => {
  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="/menu#"]')].map((a) =>
      a.getAttribute("href")!,
    ),
  );

  expect(hrefs.length).toBeGreaterThan(0);

  for (const href of new Set(hrefs)) {
    const id = href.split("#")[1];
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
});

test("the menu page does not overflow horizontally", async ({ page }) => {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth);
});
