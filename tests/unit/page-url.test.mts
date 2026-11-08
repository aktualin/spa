import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { describe, it } from "node:test";

import {
  RESERVED_ROOT_SEGMENTS,
  buildPreviewUrl,
  createsRedirectLoop,
  normalizePath,
  planSlugRedirect,
  resolveRedirect,
  validatePageSlug,
  validateRedirectInput,
  type RedirectTarget,
} from "../../src/lib/domain/page-url.ts";

describe("URL-07/08/09 — validasi slug halaman", () => {
  it("menerima slug yang valid", () => {
    for (const slug of ["kebijakan-refund", "faq", "promo-2026", "a1"]) {
      assert.equal(validatePageSlug(slug), null, slug);
    }
  });

  it("menolak slug kosong", () => {
    assert.match(validatePageSlug("") ?? "", /wajib/);
  });

  it("menolak spasi dengan pesan khusus", () => {
    assert.match(validatePageSlug("kebijakan privasi") ?? "", /spasi/);
    assert.match(validatePageSlug("faq\t") ?? "", /spasi/);
  });

  it("menolak garis miring (bukan path bertingkat)", () => {
    assert.match(validatePageSlug("info/faq") ?? "", /garis miring/);
  });

  it("menolak huruf besar, garis bawah, tanda hubung di tepi atau ganda", () => {
    for (const slug of ["FAQ", "faq_baru", "-faq", "faq-", "a--b", "faq.html", "ç"]) {
      assert.match(validatePageSlug(slug) ?? "", /huruf kecil/, slug);
    }
  });

  it("menolak slug terlalu panjang", () => {
    assert.match(validatePageSlug("a".repeat(81)) ?? "", /maksimal/);
  });

  it("menolak path sistem /admin, /api, /_next", () => {
    for (const slug of ["admin", "api"]) {
      assert.match(validatePageSlug(slug) ?? "", /bentrok/, slug);
    }
    // `_next` sudah gagal di pola slug sebelum dicek daftar terlarang.
    assert.notEqual(validatePageSlug("_next"), null);
  });

  it("menolak route publik dan berkas metadata yang sudah ada", () => {
    for (const slug of ["treatments", "gallery", "contact", "sitemap", "robots", "img"]) {
      assert.match(validatePageSlug(slug) ?? "", /bentrok/, slug);
    }
  });

  it("setiap folder route di src/app ada di daftar terlarang", () => {
    const routeDirs = readdirSync(new URL("../../src/app/", import.meta.url), {
      withFileTypes: true,
    })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      // (grup), [dinamis], dan _privat tidak menjadi segmen URL.
      .filter((name) => !/^[([_]/.test(name));
    const missing = routeDirs.filter((d) => !RESERVED_ROOT_SEGMENTS.includes(d));
    assert.deepEqual(missing, [], "tambahkan folder ini ke RESERVED_ROOT_SEGMENTS");
  });
});

describe("pratinjau URL", () => {
  it("menyusun URL lengkap tanpa garis miring ganda", () => {
    assert.equal(
      buildPreviewUrl("https://kamaspa.id/", "kebijakan-refund"),
      "https://kamaspa.id/kebijakan-refund",
    );
  });

  it("null untuk slug yang belum valid", () => {
    assert.equal(buildPreviewUrl("https://kamaspa.id", "Ada Spasi"), null);
    assert.equal(buildPreviewUrl("https://kamaspa.id", "admin"), null);
  });
});

describe("normalizePath", () => {
  it("membakukan path", () => {
    assert.equal(normalizePath("/Privacy-Policy/"), "/privacy-policy");
    assert.equal(normalizePath("privacy-policy"), "/privacy-policy");
    assert.equal(normalizePath("/a//b///"), "/a/b");
    assert.equal(normalizePath("/promo?utm=1#top"), "/promo");
    assert.equal(normalizePath("/"), "/");
    assert.equal(normalizePath("  /faq  "), "/faq");
  });
});

describe("URL-02/03/04/05 — rencana redirect saat slug berubah", () => {
  it("slug tidak berubah → tidak ada perubahan", () => {
    assert.deepEqual(planSlugRedirect([], "/faq", "/faq"), { upserts: [], deletes: [] });
  });

  it("URL lama dialihkan ke URL baru", () => {
    assert.deepEqual(planSlugRedirect([], "/privacy-policy", "/kebijakan-privasi"), {
      upserts: [{ fromPath: "/privacy-policy", toPath: "/kebijakan-privasi" }],
      deletes: [],
    });
  });

  it("rantai diratakan: A→B lalu B→C menjadi A→C dan B→C", () => {
    const existing = [{ fromPath: "/a", toPath: "/b" }];
    const plan = planSlugRedirect(existing, "/b", "/c");
    assert.deepEqual(plan.upserts, [
      { fromPath: "/a", toPath: "/c" },
      { fromPath: "/b", toPath: "/c" },
    ]);
    assert.deepEqual(plan.deletes, []);
  });

  it("kembali ke slug lama tidak membentuk loop", () => {
    // Sebelumnya /a → /b. Sekarang halaman kembali dari /b ke /a.
    const existing = [{ fromPath: "/a", toPath: "/b" }];
    const plan = planSlugRedirect(existing, "/b", "/a");
    assert.deepEqual(plan.deletes, ["/a"]);
    assert.deepEqual(plan.upserts, [{ fromPath: "/b", toPath: "/a" }]);
  });

  it("redirect eksternal yang kebetulan sama teksnya tidak diubah", () => {
    const existing = [{ fromPath: "/x", toPath: "https://contoh.id/b" }];
    const plan = planSlugRedirect(existing, "/b", "/c");
    assert.deepEqual(plan.upserts, [{ fromPath: "/b", toPath: "/c" }]);
  });

  it("hasil rencana tidak pernah berisi redirect ke dirinya sendiri", () => {
    const existing = [
      { fromPath: "/a", toPath: "/b" },
      { fromPath: "/c", toPath: "/b" },
      { fromPath: "/b", toPath: "/z" },
    ];
    const plan = planSlugRedirect(existing, "/b", "/c");
    for (const r of plan.upserts) assert.notEqual(r.fromPath, r.toPath);
    assert.ok(plan.deletes.includes("/c"));
  });
});

describe("URL-12/13/14 — redirect manual", () => {
  it("menerima path internal dan https", () => {
    assert.equal(validateRedirectInput("/promo-lama", "/promos"), null);
    assert.equal(validateRedirectInput("/menu-pdf", "https://drive.google.com/x"), null);
  });

  it("menolak asal yang bukan path atau berada di area sistem", () => {
    assert.match(validateRedirectInput("promo", "/promos") ?? "", /diawali/);
    assert.match(validateRedirectInput("//evil.com", "/promos") ?? "", /diawali/);
    assert.match(validateRedirectInput("/", "/promos") ?? "", /utama/);
    assert.match(validateRedirectInput("/admin/users", "/") ?? "", /admin/);
    assert.match(validateRedirectInput("/api/x", "/") ?? "", /admin/);
  });

  it("menolak tujuan berbahaya", () => {
    for (const to of ["javascript:alert(1)", "//evil.com", "http://evil.com", "data:text/html,x", "evil.com"]) {
      assert.notEqual(validateRedirectInput("/lama", to), null, to);
    }
    assert.match(validateRedirectInput("/lama", "/admin") ?? "", /tujuan/);
  });

  it("menolak asal = tujuan", () => {
    assert.match(validateRedirectInput("/faq", "/FAQ/") ?? "", /sama/);
  });

  it("mendeteksi loop langsung dan berantai", () => {
    const existing = [
      { fromPath: "/b", toPath: "/c" },
      { fromPath: "/c", toPath: "/a" },
    ];
    assert.equal(createsRedirectLoop(existing, "/a", "/b"), true);
    assert.equal(createsRedirectLoop([{ fromPath: "/b", toPath: "/a" }], "/a", "/b"), true);
    assert.equal(createsRedirectLoop(existing, "/x", "/b"), false);
    assert.equal(createsRedirectLoop(existing, "/a", "https://contoh.id"), false);
  });

  it("mengedit redirect yang sama tidak dianggap loop terhadap dirinya", () => {
    const existing = [{ fromPath: "/a", toPath: "/b" }];
    assert.equal(createsRedirectLoop(existing, "/a", "/c"), false);
  });
});

describe("resolveRedirect (dipakai proxy)", () => {
  const map = new Map<string, RedirectTarget>([
    ["/privacy-policy", { toPath: "/kebijakan-privasi", statusCode: 301 }],
  ]);

  it("menemukan redirect dengan path yang dibakukan", () => {
    assert.deepEqual(resolveRedirect(map, "/Privacy-Policy/"), {
      toPath: "/kebijakan-privasi",
      statusCode: 301,
    });
  });

  it("null bila tidak ada", () => {
    assert.equal(resolveRedirect(map, "/faq"), null);
  });

  it("tidak pernah mengalihkan area sistem", () => {
    const sys = new Map<string, RedirectTarget>([["/admin", { toPath: "/", statusCode: 301 }]]);
    assert.equal(resolveRedirect(sys, "/admin"), null);
  });
});
