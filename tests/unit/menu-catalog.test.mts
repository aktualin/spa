import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { additionalServices, packages, treatments } from "../../src/data/content.ts";
import { buildStaticCatalogSeed } from "../../src/lib/domain/catalog-seed.ts";
import {
  toMenuAddons,
  toMenuPackages,
  toMenuTreatments,
  type MenuCatalogCategory,
  type MenuCatalogPackage,
} from "../../src/lib/domain/menu-catalog.ts";
import { formatPriceLabel } from "../../src/lib/domain/pricing.ts";

const seed = buildStaticCatalogSeed({ treatments, packages, additionalServices });

/** Bentuk yang dikembalikan database setelah seed, diurutkan seperti query. */
const categories: MenuCatalogCategory[] = [...seed.categories]
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map((c) => ({
    kind: c.kind,
    treatments: seed.treatments
      .filter((t) => t.categorySlug === c.slug)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((t) => ({
        slug: t.slug,
        name: t.name,
        tagline: t.tagline,
        description: t.description,
        note: t.note,
        imageUrl: t.imageUrl,
        addonSection: t.addonSection,
        options: t.options.map((o) => ({ label: o.label, priceIdr: o.priceIdr })),
      })),
  }));

const menuPackages: MenuCatalogPackage[] = seed.packages.map((p) => ({ ...p }));

describe("kesetaraan /menu: konten statis → database → halaman", () => {
  it("treatment identik", () => {
    assert.deepStrictEqual(toMenuTreatments(categories), treatments);
  });

  it("package All Day Spa identik", () => {
    assert.deepStrictEqual(toMenuPackages(menuPackages), packages);
  });

  it("add-on identik", () => {
    assert.deepStrictEqual(toMenuAddons(categories), additionalServices);
  });
});

describe("perilaku /menu dari database", () => {
  it("treatment baru dari admin ikut tampil", () => {
    const withNew: MenuCatalogCategory[] = [
      ...categories,
      {
        kind: "TREATMENT",
        treatments: [
          {
            slug: "hot-stone",
            name: "Hot Stone",
            tagline: null,
            description: "Batu hangat.",
            note: null,
            imageUrl: "/img/x.jpg",
            addonSection: null,
            options: [{ label: "60 min", priceIdr: 400000 }],
          },
        ],
      },
    ];
    const result = toMenuTreatments(withNew);
    const added = result.find((t) => t.slug === "hot-stone");
    assert.ok(added);
    assert.equal("tagline" in added, false, "tagline kosong tidak dirender");
    assert.deepEqual(added.prices, [{ duration: "60 min", price: "400k" }]);
  });

  it("treatment tanpa harga dan add-on tanpa section tidak tampil", () => {
    const rows: MenuCatalogCategory[] = [
      { kind: "TREATMENT", treatments: [{ ...categories[0].treatments[0], options: [] }] },
      { kind: "ADDON", treatments: [{ ...categories[2].treatments[0], addonSection: null }] },
    ];
    assert.deepEqual(toMenuTreatments(rows), []);
    assert.deepEqual(toMenuAddons(rows), []);
  });

  it("add-on tidak masuk grid treatment, treatment tidak masuk add-on", () => {
    const names = toMenuTreatments(categories).map((t) => t.name);
    assert.ok(!names.includes("Body Scrub"));
    assert.ok(!toMenuAddons(categories).some((a) => a.name === "Chair Spa"));
  });

  it("durasi package jatuh ke menit bila label kosong", () => {
    const [first] = toMenuPackages([{ ...menuPackages[0], durationLabel: null, durationMin: 150 }]);
    assert.equal(first.duration, "150 min");
  });
});

describe("formatPriceLabel", () => {
  it("ribuan bulat → k, selain itu angka penuh", () => {
    assert.equal(formatPriceLabel(145000), "145k");
    assert.equal(formatPriceLabel(1500000), "1500k");
    assert.equal(formatPriceLabel(145500), "145500");
  });
});
