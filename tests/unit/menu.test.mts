import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { footerLinks, nav } from "../../src/data/content.ts";
import {
  buildMenuTree,
  canAddChild,
  inheritRootLocations,
  depthOf,
  moveItem,
  moveSibling,
  resolveMenuHref,
  subtreeHeight,
  validateMenuLabel,
  validateMenuLink,
  validateParent,
  validateStructure,
  type MenuRow,
} from "../../src/lib/domain/menu.ts";
import {
  menuTreeToFooter,
  menuTreeToNav,
  panelPresetsFromRows,
  presetsFromMegaGroups,
  type PanelPresetRow,
} from "../../src/lib/domain/menu-nav.ts";
import { buildStaticMenuSeed, linkTypeForHref } from "../../src/lib/domain/menu-seed.ts";

function row(partial: Partial<MenuRow> & { id: string }): MenuRow {
  return {
    parentId: null,
    label: partial.id,
    linkType: "INTERNAL_URL",
    url: `/${partial.id}`,
    pageId: null,
    page: null,
    sortOrder: 0,
    isVisible: true,
    openInNew: false,
    locations: ["HEADER", "MOBILE"],
    panelKey: null,
    panelLinkLabel: null,
    ...partial,
  };
}

/** Pohon contoh: a > b > c (3 level), d akar tanpa anak. */
const tree = [
  row({ id: "a", sortOrder: 0 }),
  row({ id: "b", parentId: "a" }),
  row({ id: "c", parentId: "b" }),
  row({ id: "d", sortOrder: 1 }),
];

describe("validasi tautan menu", () => {
  it("PAGE wajib memilih halaman", () => {
    assert.match(validateMenuLink({ linkType: "PAGE", url: null, pageId: null }) ?? "", /halaman/);
    assert.equal(validateMenuLink({ linkType: "PAGE", url: null, pageId: "p1" }), null);
  });

  it("NO_LINK selalu valid", () => {
    assert.equal(validateMenuLink({ linkType: "NO_LINK", url: null, pageId: null }), null);
  });

  it("INTERNAL_URL", () => {
    assert.equal(validateMenuLink({ linkType: "INTERNAL_URL", url: "/treatments", pageId: null }), null);
    for (const url of ["treatments", "//evil.com", "/a b", "", "/admin", "/api/x", "/menu#a"]) {
      assert.notEqual(validateMenuLink({ linkType: "INTERNAL_URL", url, pageId: null }), null, url);
    }
  });

  it("EXTERNAL_URL (MNU-12/13)", () => {
    for (const url of ["https://fresha.com/x", "http://contoh.id", "mailto:a@b.id", "tel:+6281316052040"]) {
      assert.equal(validateMenuLink({ linkType: "EXTERNAL_URL", url, pageId: null }), null, url);
    }
    for (const url of ["javascript:alert(1)", "data:text/html,x", "ftp://x.id", "contoh.id", ""]) {
      assert.notEqual(validateMenuLink({ linkType: "EXTERNAL_URL", url, pageId: null }), null, url);
    }
  });

  it("ANCHOR (MNU-14)", () => {
    for (const url of ["#packages", "/menu#packages", "/corporate#in-office"]) {
      assert.equal(validateMenuLink({ linkType: "ANCHOR", url, pageId: null }), null, url);
    }
    for (const url of ["packages", "#", "#a b", "menu#x", "/admin#x", "#<script>"]) {
      assert.notEqual(validateMenuLink({ linkType: "ANCHOR", url, pageId: null }), null, url);
    }
  });

  it("label", () => {
    assert.match(validateMenuLabel("   ") ?? "", /wajib/);
    assert.match(validateMenuLabel("x".repeat(61)) ?? "", /maksimal/);
    assert.equal(validateMenuLabel("Massage"), null);
  });
});

describe("resolveMenuHref", () => {
  it("PAGE mengikuti slug halaman terbit (MNU-09/10)", () => {
    assert.equal(
      resolveMenuHref({ linkType: "PAGE", url: null, page: { slug: "faq", published: true } }),
      "/faq",
    );
  });

  it("PAGE yang halamannya hilang atau draf → null", () => {
    assert.equal(resolveMenuHref({ linkType: "PAGE", url: null, page: null }), null);
    assert.equal(
      resolveMenuHref({ linkType: "PAGE", url: null, page: { slug: "faq", published: false } }),
      null,
    );
  });

  it("NO_LINK → null", () => {
    assert.equal(resolveMenuHref({ linkType: "NO_LINK", url: "/x", page: null }), null);
  });
});

describe("struktur: kedalaman, siklus, induk (MNU-04/06/07/08)", () => {
  it("kedalaman & tinggi subpohon", () => {
    assert.equal(depthOf(tree, "a"), 1);
    assert.equal(depthOf(tree, "c"), 3);
    assert.equal(subtreeHeight(tree, "a"), 3);
    assert.equal(subtreeHeight(tree, "c"), 1);
  });

  it("tambah sub-menu hanya sampai level 3", () => {
    assert.equal(canAddChild(tree, "b"), true);
    assert.equal(canAddChild(tree, "c"), false);
    assert.match(validateParent(tree, null, "c") ?? "", /3 level/);
    assert.equal(validateParent(tree, null, "b"), null);
  });

  it("tidak boleh menjadi induk dirinya sendiri", () => {
    assert.match(validateParent(tree, "a", "a") ?? "", /dirinya sendiri/);
  });

  it("tidak boleh pindah ke dalam turunannya sendiri", () => {
    assert.match(validateParent(tree, "a", "c") ?? "", /siklus/);
  });

  it("pindah yang membuat cucu jadi level 4 ditolak", () => {
    // b (punya anak c) dipindah ke bawah d: b level 2, c level 3 → boleh.
    assert.equal(validateParent(tree, "b", "d"), null);
    // a (tinggi 3) dipindah ke bawah d → c menjadi level 4.
    assert.match(validateParent(tree, "a", "d") ?? "", /3 level/);
  });

  it("induk tidak dikenal ditolak", () => {
    assert.match(validateParent(tree, null, "zzz") ?? "", /tidak ditemukan/);
  });

  it("validateStructure mendeteksi siklus, induk hilang, dan level 4", () => {
    assert.equal(validateStructure(tree), null);
    assert.match(
      validateStructure([{ id: "x", parentId: "y" }, { id: "y", parentId: "x" }]) ?? "",
      /siklus/,
    );
    assert.match(validateStructure([{ id: "x", parentId: "x" }]) ?? "", /dirinya sendiri/);
    assert.match(validateStructure([{ id: "x", parentId: "hilang" }]) ?? "", /tidak ditemukan/);
    assert.match(
      validateStructure([...tree, { id: "e", parentId: "c" }]) ?? "",
      /3 level/,
    );
  });
});

describe("drag-and-drop & naik/turun (MNU-05/16)", () => {
  const flat = [
    row({ id: "p", sortOrder: 0 }),
    row({ id: "q", sortOrder: 1 }),
    row({ id: "r", sortOrder: 2 }),
    row({ id: "p1", parentId: "p", sortOrder: 0 }),
  ];

  const order = (rows: MenuRow[], parentId: string | null) =>
    rows
      .filter((r) => r.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((r) => r.id);

  it("sisip sebelum target", () => {
    const result = moveItem(flat, "r", "p", "before");
    assert.equal(result.error, null);
    assert.deepEqual(order(result.rows!, null), ["r", "p", "q"]);
  });

  it("sisip sesudah target", () => {
    const result = moveItem(flat, "p", "q", "after");
    assert.deepEqual(order(result.rows!, null), ["q", "p", "r"]);
  });

  it("jadikan anak target, ditaruh paling akhir", () => {
    const result = moveItem(flat, "q", "p", "inside");
    assert.deepEqual(order(result.rows!, "p"), ["p1", "q"]);
    assert.deepEqual(order(result.rows!, null), ["p", "r"]);
  });

  it("pindah anak keluar ke akar", () => {
    const result = moveItem(flat, "p1", "q", "after");
    assert.deepEqual(order(result.rows!, null), ["p", "q", "p1", "r"]);
    assert.deepEqual(order(result.rows!, "p"), []);
  });

  it("drop yang membentuk siklus ditolak", () => {
    const result = moveItem(flat, "p", "p1", "inside");
    assert.match(result.error ?? "", /siklus/);
  });

  it("drop ke diri sendiri ditolak", () => {
    assert.notEqual(moveItem(flat, "p", "p", "before").error, null);
  });

  it("drop yang melewati 3 level ditolak", () => {
    const result = moveItem(tree, "d", "c", "inside");
    assert.match(result.error ?? "", /3 level/);
  });

  it("naik/turun menukar saudara dan tidak melewati batas", () => {
    assert.deepEqual(order(moveSibling(flat, "q", -1), null), ["q", "p", "r"]);
    assert.deepEqual(order(moveSibling(flat, "r", 1), null), ["p", "q", "r"]);
  });
});

describe("pohon publik per lokasi (MNU-11/15)", () => {
  const rows = [
    row({ id: "h", locations: ["HEADER"] }),
    row({ id: "m", locations: ["MOBILE"], sortOrder: 1 }),
    row({ id: "f", locations: ["FOOTER"], sortOrder: 2, linkType: "NO_LINK", url: null }),
    row({ id: "f1", parentId: "f", locations: [] }),
    row({ id: "hidden", isVisible: false, sortOrder: 3 }),
    row({ id: "hc", parentId: "h", isVisible: false }),
    row({ id: "broken", linkType: "PAGE", url: null, page: null, sortOrder: 4 }),
    row({ id: "brokenChild", parentId: "broken" }),
  ];

  it("lokasi dibaca dari item level 1, anak mengikuti", () => {
    assert.deepEqual(buildMenuTree(rows, "HEADER").map((n) => n.id), ["h"]);
    assert.deepEqual(buildMenuTree(rows, "MOBILE").map((n) => n.id), ["m"]);
    const footer = buildMenuTree(rows, "FOOTER");
    assert.deepEqual(footer.map((n) => n.id), ["f"]);
    assert.deepEqual(footer[0].children.map((n) => n.id), ["f1"]);
  });

  it("item tersembunyi beserta anaknya tidak tampil", () => {
    assert.deepEqual(buildMenuTree(rows, "HEADER")[0].children, []);
  });

  it("tautan halaman yang hilang dibuang bersama sub-menunya (tidak ada tautan rusak)", () => {
    const all = buildMenuTree(
      rows.map((r) => ({ ...r, locations: ["HEADER"] })),
      "HEADER",
    );
    assert.ok(!all.some((n) => n.id === "broken"));
  });
});

describe("kesetaraan visual: menu statis → database → header/footer", () => {
  const seed = buildStaticMenuSeed(nav, footerLinks);
  const rows: MenuRow[] = seed.map((item) => ({
    id: item.key,
    parentId: item.parentKey,
    label: item.label,
    linkType: item.linkType,
    url: item.url,
    pageId: null,
    page: null,
    sortOrder: item.sortOrder,
    isVisible: true,
    openInNew: item.openInNew,
    locations: item.locations,
    panelKey: item.panelKey,
    panelLinkLabel: item.panelLinkLabel,
  }));
  const presets = presetsFromMegaGroups(nav.megaGroups);

  it("setiap item seed lolos validasi", () => {
    for (const item of seed) {
      assert.equal(
        validateMenuLink({ linkType: item.linkType, url: item.url, pageId: null }),
        null,
        `${item.label} ${item.url}`,
      );
      assert.equal(validateMenuLabel(item.label), null, item.label);
    }
    assert.equal(validateStructure(rows), null);
  });

  it("header identik dengan nav statis", () => {
    const result = menuTreeToNav(buildMenuTree(rows, "HEADER"), presets);
    assert.deepStrictEqual(result.primary, nav.primary);
    assert.deepStrictEqual(result.megaGroups, nav.megaGroups);
  });

  it("menu mobile identik dengan nav statis", () => {
    const result = menuTreeToNav(buildMenuTree(rows, "MOBILE"), presets);
    assert.deepStrictEqual(result.primary, nav.primary);
    assert.deepStrictEqual(result.megaGroups, nav.megaGroups);
  });

  it("footer identik dengan footerLinks statis", () => {
    assert.deepStrictEqual(menuTreeToFooter(buildMenuTree(rows, "FOOTER")), footerLinks);
  });

  it("jenis tautan ditebak dari href", () => {
    assert.equal(linkTypeForHref("/menu#massage"), "ANCHOR");
    assert.equal(linkTypeForHref("/contact"), "INTERNAL_URL");
    assert.equal(linkTypeForHref("https://drive.google.com/x"), "EXTERNAL_URL");
    assert.equal(linkTypeForHref("mailto:a@b.id"), "EXTERNAL_URL");
  });

  it("kartu highlight pertama grup mega dibawa ke baris akar seed", () => {
    nav.primary.forEach((item, index) => {
      const root = seed.find((s) => s.key === `header-${index}`);
      assert.ok(root, `akar header-${index}`);
      const highlight = item.mega ? nav.megaGroups[item.mega].highlights[0] : undefined;
      assert.equal(root.highlightImageUrl, highlight?.image ?? null);
      assert.equal(root.highlightLabel, highlight?.label ?? null);
      assert.equal(root.highlightHref, highlight?.href ?? null);
      assert.equal(root.highlightBadge, highlight?.badge ?? null);
      assert.equal(root.highlightEyebrow, highlight?.eyebrow ?? null);
    });
  });

  it("kolom, tautan, dan item footer tidak membawa highlight", () => {
    const headerRoots = new Set(nav.primary.map((_, index) => `header-${index}`));
    for (const item of seed) {
      if (headerRoots.has(item.key)) continue;
      assert.equal(item.highlightImageUrl, null, item.key);
      assert.equal(item.highlightLabel, null, item.key);
      assert.equal(item.highlightHref, null, item.key);
      assert.equal(item.highlightBadge, null, item.key);
      assert.equal(item.highlightEyebrow, null, item.key);
    }
  });

  it("preset dari baris seed (jalur DB) membangun kembali kartu highlight pertama", () => {
    const presetRows: PanelPresetRow[] = seed.map((item) => ({
      id: item.key,
      parentId: item.parentKey,
      panelKey: item.panelKey,
      panelWidth: null,
      highlightImageUrl: item.highlightImageUrl,
      highlightLabel: item.highlightLabel,
      highlightHref: item.highlightHref,
      highlightBadge: item.highlightBadge,
      highlightEyebrow: item.highlightEyebrow,
    }));
    const result = menuTreeToNav(
      buildMenuTree(rows, "HEADER"),
      panelPresetsFromRows(presetRows),
    );
    assert.deepStrictEqual(result.primary, nav.primary);
    // Seed hanya membawa highlights[0]; lebar panel diturunkan dari jumlah kolom.
    for (const [key, group] of Object.entries(nav.megaGroups)) {
      assert.deepStrictEqual(result.megaGroups[key], {
        ...group,
        highlights: group.highlights.slice(0, 1),
      });
    }
  });

  it("highlight yang belum lengkap tidak menghasilkan kartu", () => {
    const presets = panelPresetsFromRows([
      {
        id: "x",
        parentId: null,
        panelKey: "p",
        panelWidth: null,
        highlightImageUrl: "https://cdn.example.com/img/a.jpg",
        highlightLabel: null,
        highlightHref: "/menu",
        highlightBadge: null,
        highlightEyebrow: null,
      },
    ]);
    assert.deepEqual(presets, {});
  });
});

describe("lokasi saat anak naik menjadi level 1", () => {
  it("mewarisi lokasi akar lamanya", () => {
    const before = [
      row({ id: "f", locations: ["FOOTER"] }),
      row({ id: "f1", parentId: "f", locations: [] }),
    ];
    const after = before.map((r) => (r.id === "f1" ? { ...r, parentId: null } : r));
    const result = inheritRootLocations(before, after);
    assert.deepEqual(result.find((r) => r.id === "f1")?.locations, ["FOOTER"]);
  });

  it("akar yang sudah punya lokasi tidak diubah", () => {
    const rows = [row({ id: "h", locations: ["HEADER"] })];
    assert.deepEqual(inheritRootLocations(rows, rows), rows);
  });
});
