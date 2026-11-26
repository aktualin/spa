import { expect, test, type Page } from "@playwright/test";

/**
 * Tier tipografi global: judul utama/hero = Playfair Display Italic,
 * judul kartu = Faesa Breages. Computed style dibaca setelah
 * document.fonts.ready supaya swap selesai (pola layout.spec.ts).
 *
 * Judul kartu legacy (.header-s) menyebut family "Romie trial" — alias
 * hiatus yang @font-face-nya di kama.css menunjuk file Faesa Breages,
 * jadi nama itulah yang muncul di computed style.
 */

async function typeOf(page: Page, selector: string) {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { family: cs.fontFamily, style: cs.fontStyle };
  }, selector);
}

test("hero homepage: H1 Playfair Display italic", async ({ page }) => {
  await page.goto("/");
  const h1 = await typeOf(page, "main h1");
  expect(h1?.family).toContain("Playfair Display");
  expect(h1?.style).toBe("italic");
});

test("/menu: H1 Playfair, judul kartu treatment tetap Faesa", async ({ page }) => {
  await page.goto("/menu");
  const h1 = await typeOf(page, "h1.header-xxl");
  expect(h1?.family).toContain("Playfair Display");
  expect(h1?.style).toBe("italic");
  const card = await typeOf(page, "h3.header-s");
  expect(card?.family).toContain("Romie trial");
  expect(card?.style).toBe("normal");
});

test("/treatments: H1 Playfair, judul kartu tetap Faesa", async ({ page }) => {
  await page.goto("/treatments");
  const h1 = await typeOf(page, "h1");
  expect(h1?.family).toContain("Playfair Display");
  expect(h1?.style).toBe("italic");
  const card = await typeOf(page, "h3.header-s");
  expect(card?.family).toContain("Romie trial");
});