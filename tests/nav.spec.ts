import { expect, test } from "@playwright/test";

/**
 * Navigation regression tests.
 *
 * The header is the one piece of UI that exists on every route and has two
 * completely different layouts (drawer below `xl`, mega menu from `xl` up),
 * so it is worth pinning the behaviour down with real measurements.
 */

const DESKTOP = "desktop";

test.beforeEach(async ({ page }) => {
  // Test nav butuh DOM + JS (header/drawer/mega menu), bukan media. Tanpa ini
  // event load/networkidle tersandera unduhan hero dari S3 saat worker paralel
  // dan beforeEach timeout sebelum test sempat jalan.
  await page.route("**/*", (route) => {
    const type = route.request().resourceType();
    if (type === "image" || type === "media") return route.abort();
    return route.continue();
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
});

test("header does not cause horizontal overflow", async ({ page }) => {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth);
});

test("mobile drawer opens flush under the header", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === DESKTOP, "desktop has no drawer");

  const header = page.getByRole("banner");
  const drawer = page.locator("#mobile-navigation");

  await expect(drawer).toBeHidden();

  const headerBox = (await header.boundingBox())!;
  await page.getByRole("button", { name: /buka menu/i }).click();

  await expect(drawer).toBeVisible();

  // The drawer must start exactly where the header ends (the drawer has a
  // short entrance animation, so poll until it settles).
  await expect
    .poll(async () => {
      const drawerBox = (await drawer.boundingBox())!;
      const headerBoxNow = (await header.boundingBox())!;
      return Math.abs(drawerBox.y - (headerBoxNow.y + headerBoxNow.height));
    })
    .toBeLessThanOrEqual(1);

  // The page behind the drawer must not scroll.
  const bodyPosition = await page.evaluate(
    () => getComputedStyle(document.body).position,
  );
  expect(bodyPosition).toBe("fixed");
});

test("mobile drawer keeps the call to action visible", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === DESKTOP, "desktop has no drawer");

  await page.getByRole("button", { name: /buka menu/i }).click();

  const cta = page.locator("#mobile-navigation").getByRole("link", {
    name: "Book Now",
  });
  await expect(cta).toBeVisible();

  const box = (await cta.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
});

test("mobile drawer keeps the call to action pinned to the bottom", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === DESKTOP, "desktop has no drawer");

  await page.getByRole("button", { name: /buka menu/i }).click();

  const drawer = page.locator("#mobile-navigation");
  const accordion = drawer.getByRole("button", { name: "Menu" });
  await accordion.click();

  // The accordion list is long enough to push the content past the fold.
  await expect(drawer.locator("#mobile-group-services")).toBeVisible();

  const cta = drawer.getByRole("link", { name: "Book Now" });
  await expect(cta).toBeVisible();

  const box = (await cta.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
  expect(box.y).toBeGreaterThan(viewport.height / 2);
});

test("the floating whatsapp button never covers the drawer", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === DESKTOP, "desktop has no drawer");

  await page.getByRole("button", { name: /buka menu/i }).click();

  const drawerButton = page
    .locator("#mobile-navigation")
    .getByRole("link", { name: "Chat via WhatsApp" });
  await expect(drawerButton).toBeVisible();

  const box = (await drawerButton.boundingBox())!;
  const coveredByDrawer = await page.evaluate(
    ({ x, y }) => document.elementFromPoint(x, y)?.closest("#mobile-navigation") !== null,
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
  );

  // The floating WhatsApp button sits in the same corner — it must not end up
  // on top of the one inside the drawer.
  expect(coveredByDrawer).toBe(true);
});

test("mobile accordion lists the menu links", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === DESKTOP, "desktop has no drawer");

  await page.getByRole("button", { name: /buka menu/i }).click();

  const accordion = page
    .locator("#mobile-navigation")
    .getByRole("button", { name: "Menu" });
  await accordion.click();

  const group = page.locator("#mobile-group-services");
  await expect(group).toBeVisible();
  await expect(group.getByRole("link", { name: "Massage" })).toBeVisible();
  await expect(
    group.getByRole("link", { name: "All Day Spa Packages" }),
  ).toBeVisible();
});

test("escape closes the mobile drawer", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === DESKTOP, "desktop has no drawer");

  await page.getByRole("button", { name: /buka menu/i }).click();
  await expect(page.locator("#mobile-navigation")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-navigation")).toBeHidden();

  const bodyPosition = await page.evaluate(
    () => getComputedStyle(document.body).position,
  );
  expect(bodyPosition).not.toBe("fixed");
});

test("desktop header keeps the dropdown groups first", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== DESKTOP, "desktop only");

  const nav = page.locator("header nav");
  const items = await nav.locator("ul > li").allTextContents();
  const cta = await nav.getByRole("link", { name: "Book Now" }).textContent();

  expect([...items.map((t) => t.trim()), cta?.trim()]).toEqual([
    "Menu",
    "Corporate Wellness",
    "Contact",
    "Service Menu",
    "Book Now",
  ]);
});

test("the Service Menu link opens the price list in a new tab", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== DESKTOP, "desktop only");

  const link = page
    .locator("header nav")
    .getByRole("link", { name: "Service Menu" });

  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", /noopener/);
  await expect(link).toHaveAttribute(
    "href",
    /drive\.google\.com\/file\/d\/1UfW-JFOno47KCLi-PwID4XdrCDHkwIfc/,
  );
});

test("desktop mega menu is attached to its trigger", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== DESKTOP, "desktop only");

  const trigger = page
    .locator("header nav")
    .getByRole("button", { name: "Menu" });
  await trigger.click();

  const panel = page.locator("#desktop-group-services");
  await expect(panel).toBeVisible();

  const triggerBox = (await trigger.boundingBox())!;
  const panelBox = (await panel.boundingBox())!;

  // The panel hangs from its trigger, not from the page gutter.
  expect(Math.abs(panelBox.x - triggerBox.x)).toBeLessThanOrEqual(2);

  // It must start at the bottom edge of the header, never overlapping it.
  const headerBox = (await page.getByRole("banner").boundingBox())!;
  expect(Math.abs(panelBox.y - (headerBox.y + headerBox.height))).toBeLessThanOrEqual(2);

  // The legacy stylesheet indents every list; the panel must not inherit it.
  const firstLink = await panel.getByRole("link").first().boundingBox();
  expect(firstLink!.x - panelBox.x).toBeLessThanOrEqual(26);

  // It must stay inside the viewport.
  const viewport = page.viewportSize()!;
  expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(viewport.height + 1);
});

test("desktop mega menu opens on hover and closes on escape", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== DESKTOP, "desktop only");

  const trigger = page
    .locator("header nav")
    .getByRole("button", { name: "Menu" });
  const panel = page.locator("#desktop-group-services");

  await trigger.hover();
  await expect(panel).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();

  // Focus returns to the trigger that opened the panel.
  await expect(trigger).toBeFocused();
});

test("desktop mega menu has no duplicated corporate links", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== DESKTOP, "desktop only");

  await page
    .locator("header nav")
    .getByRole("button", { name: "Menu" })
    .click();

  const links = await page
    .locator("#desktop-group-services")
    .getByRole("link")
    .allTextContents();

  const corporate = links.filter((l) => l.trim() === "Corporate Wellness");
  expect(corporate).toHaveLength(0);
});
