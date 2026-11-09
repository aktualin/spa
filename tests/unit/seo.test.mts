import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  PUBLIC_STATIC_ROUTES,
  assessSeoText,
  buildRobots,
  faviconIcons,
  formatPageTitle,
  indexingDisabled,
  isSeoFriendlyPath,
  latestDate,
  mergePageSeo,
  normalizeSeoPath,
  pageTitle,
  parseGscVerification,
  seoPathError,
} from "../../src/lib/domain/seo.ts";
import { ADMIN_MODULES } from "../../src/app/admin/modules.ts";

/** BUILD-16 — aturan SEO murni. */

describe("judul halaman", () => {
  it("menambah akhiran brand lewat template", () => {
    assert.equal(pageTitle("Treatments"), "Treatments");
    assert.equal(formatPageTitle("Treatments"), "Treatments • KAMA Spa");
  });
  it("judul yang sudah memuat brand dipakai apa adanya", () => {
    assert.deepEqual(pageTitle("KAMA Spa Jakarta"), { absolute: "KAMA Spa Jakarta" });
    assert.equal(formatPageTitle("Spa terbaik — kama spa"), "Spa terbaik — kama spa");
  });
});

describe("assessSeoText", () => {
  it("menilai kosong/pendek/ideal/panjang", () => {
    assert.equal(assessSeoText("", "title").status, "empty");
    assert.equal(assessSeoText("Pendek", "title").status, "short");
    assert.equal(assessSeoText("a".repeat(45), "title").status, "ideal");
    assert.equal(assessSeoText("a".repeat(61), "title").status, "long");
    assert.equal(assessSeoText("a".repeat(160), "description").status, "ideal");
    assert.equal(assessSeoText("a".repeat(161), "description").status, "long");
    assert.equal(assessSeoText("  ab  ", "description").length, 2);
  });
});

describe("path", () => {
  it("menormalkan path", () => {
    assert.equal(normalizeSeoPath(""), "/");
    assert.equal(normalizeSeoPath("contact/"), "/contact");
    assert.equal(normalizeSeoPath("/our-story/journal//"), "/our-story/journal");
  });
  it("memvalidasi path entri SEO", () => {
    assert.equal(seoPathError("/contact"), null);
    assert.match(seoPathError("")!, /wajib/);
    assert.match(seoPathError("contact")!, /diawali/);
    assert.match(seoPathError("/a b")!, /spasi/);
    assert.match(seoPathError("/promos?x=1")!, /\?/);
    assert.match(seoPathError("/admin/seo")!, /admin/);
    assert.match(seoPathError("/api")!, /admin dan API/);
  });
  it("mendeteksi URL yang kurang ramah SEO", () => {
    assert.equal(isSeoFriendlyPath("/"), true);
    assert.equal(isSeoFriendlyPath("/treatments/massage/sukma-laya"), true);
    assert.equal(isSeoFriendlyPath("/treatments/Massage"), false);
    assert.equal(isSeoFriendlyPath("/promo_baru"), false);
  });
});

describe("parseGscVerification", () => {
  const code = "AbCdEf1234567890_-xyz";
  it("menerima kode saja", () => {
    assert.deepEqual(parseGscVerification(code), { ok: true, code });
  });
  it("mengekstrak dari tag meta", () => {
    assert.deepEqual(
      parseGscVerification(`<meta name="google-site-verification" content="${code}" />`),
      { ok: true, code },
    );
    assert.deepEqual(
      parseGscVerification(`<meta content='${code}' name='google-site-verification'>`),
      { ok: true, code },
    );
  });
  it("kosong = hapus", () => {
    assert.deepEqual(parseGscVerification("  "), { ok: true, code: null });
  });
  it("menolak tag lain, format DNS, dan kode tidak valid", () => {
    assert.equal(parseGscVerification('<meta name="description" content="x">').ok, false);
    assert.equal(parseGscVerification(`google-site-verification=${code}`).ok, false);
    assert.equal(parseGscVerification("kode dengan spasi").ok, false);
    assert.equal(parseGscVerification('<meta name="google-site-verification">').ok, false);
  });
});

describe("mergePageSeo", () => {
  const site = { defaultOgImageUrl: "https://cdn.test/og.jpg" };

  it("melengkapi canonical, OG, twitter dari bawaan", () => {
    const meta = mergePageSeo("/treatments/", { title: "Treatments", description: "Desc" }, null, site);
    assert.equal(meta.title, "Treatments");
    assert.deepEqual(meta.alternates, { canonical: "/treatments" });
    const og = meta.openGraph as Record<string, unknown>;
    assert.equal(og.url, "/treatments");
    assert.equal(og.type, "website");
    assert.equal(og.siteName, "KAMA Spa");
    assert.equal(og.title, "Treatments");
    assert.equal(og.description, "Desc");
    assert.deepEqual(og.images, [{ url: site.defaultOgImageUrl }]);
    assert.deepEqual(meta.twitter, { card: "summary_large_image" });
  });

  it("override menimpa bawaan; field kosong tidak", () => {
    const meta = mergePageSeo(
      "/contact",
      { title: "Contact", description: "Bawaan" },
      { title: "Hubungi KAMA Spa", description: null, ogImageUrl: "https://cdn.test/x.jpg" },
      site,
    );
    assert.deepEqual(meta.title, { absolute: "Hubungi KAMA Spa" });
    assert.equal(meta.description, "Bawaan");
    const og = meta.openGraph as Record<string, unknown>;
    assert.equal(og.title, "Hubungi KAMA Spa");
    assert.deepEqual(og.images, [{ url: "https://cdn.test/x.jpg" }]);
  });

  it("gambar halaman diutamakan di atas OG bawaan; canonical & type halaman dipertahankan", () => {
    const meta = mergePageSeo(
      "/our-story/journal/a",
      {
        title: "A",
        alternates: { canonical: "/our-story/journal/a" },
        openGraph: { type: "article", images: [{ url: "https://cdn.test/cover.jpg" }] },
      },
      null,
      site,
    );
    const og = meta.openGraph as Record<string, unknown>;
    assert.equal(og.type, "article");
    assert.deepEqual(og.images, [{ url: "https://cdn.test/cover.jpg" }]);
  });

  it("tanpa gambar sama sekali → kartu summary", () => {
    const meta = mergePageSeo("/x", { title: "X" }, null, { defaultOgImageUrl: null });
    assert.deepEqual(meta.twitter, { card: "summary" });
    assert.equal((meta.openGraph as Record<string, unknown>).images, undefined);
  });
});

describe("favicon, robots, sitemap", () => {
  it("favicon bawaan bila kosong", () => {
    assert.deepEqual(faviconIcons(""), { icon: [{ url: "/favicon.ico", sizes: "any" }] });
    const icons = faviconIcons("https://cdn.test/f.png") as Record<string, unknown>;
    assert.deepEqual(icons.icon, [{ url: "https://cdn.test/f.png" }]);
  });
  it("mode noindex dari env", () => {
    assert.equal(indexingDisabled({}), false);
    assert.equal(indexingDisabled({ VERCEL_ENV: "production" }), false);
    assert.equal(indexingDisabled({ VERCEL_ENV: "preview" }), true);
    assert.equal(indexingDisabled({ SEO_NOINDEX: "1" }), true);
  });
  it("robots memblokir admin & api dan menyertakan sitemap", () => {
    const robots = buildRobots("https://kamaspa.id", false);
    assert.equal(robots.sitemap, "https://kamaspa.id/sitemap.xml");
    const rule = (Array.isArray(robots.rules) ? robots.rules[0] : robots.rules)!;
    assert.deepEqual(rule.disallow, ["/admin", "/admin/", "/api/"]);
    const blocked = buildRobots("https://kamaspa.id", true);
    assert.equal(blocked.sitemap, undefined);
  });
  it("latestDate mengabaikan null", () => {
    const a = new Date("2026-01-01");
    const b = new Date("2026-05-01");
    assert.equal(latestDate(null, a, undefined, b), b);
    assert.equal(latestDate(), undefined);
  });
  it("daftar halaman tetap unik, ramah SEO, tanpa admin", () => {
    const paths = PUBLIC_STATIC_ROUTES.map((route) => route.path);
    assert.equal(new Set(paths).size, paths.length);
    for (const path of paths) {
      assert.equal(isSeoFriendlyPath(path), true, path);
      assert.equal(seoPathError(path), null, path);
    }
  });
});

describe("halaman bawaan punya rumahnya di admin", () => {
  it("setiap route bawaan menyebut minimal satu modul pengisi", () => {
    for (const route of PUBLIC_STATIC_ROUTES) {
      assert.ok(
        route.contentModules.length > 0,
        `Route ${route.path} belum menunjuk modul admin mana pun.`,
      );
    }
  });

  it("modul yang ditunjuk benar-benar ada di matriks admin", () => {
    const known = new Set<string>();
    for (const m of ADMIN_MODULES) {
      known.add(m.href);
      for (const child of m.children ?? []) known.add(child.href);
    }

    for (const route of PUBLIC_STATIC_ROUTES) {
      for (const mod of route.contentModules) {
        assert.ok(
          known.has(mod.href),
          `Route ${route.path} menunjuk ${mod.href} yang bukan modul admin.`,
        );
      }
    }
  });

  it("tidak ada modul yang disebut dua kali untuk satu halaman", () => {
    for (const route of PUBLIC_STATIC_ROUTES) {
      const hrefs = route.contentModules.map((m) => m.href);
      assert.equal(new Set(hrefs).size, hrefs.length, `Modul ganda di ${route.path}.`);
    }
  });
});
