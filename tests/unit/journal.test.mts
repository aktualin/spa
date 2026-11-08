import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  JOURNAL_SLUG_MAX,
  JOURNAL_TAGS_PER_POST,
  collectJournalCategories,
  collectJournalTags,
  effectiveJournalStatus,
  filterJournalPosts,
  isRichTextEmpty,
  journalListHref,
  journalPath,
  normalizeJournalCategory,
  parseJournalFilter,
  parseJournalTags,
  resolveJournalSchedule,
  resolveJournalSlug,
  seoLengthState,
  validateJournalSlug,
} from "../../src/lib/domain/journal.ts";
import { planSlugRedirect } from "../../src/lib/domain/page-url.ts";

/** Modul Journal — slug, kategori/tag, penjadwalan, SEO, filter publik. */

const NOW = new Date("2026-11-08T03:00:00.000Z"); // 10.00 WIB
const PAST = new Date("2026-11-01T03:00:00.000Z");
const FUTURE = new Date("2026-11-20T03:00:00.000Z");

describe("slug & URL artikel", () => {
  it("path publik di bawah /our-story/journal", () => {
    assert.equal(journalPath("ritual-pagi"), "/our-story/journal/ritual-pagi");
  });

  it("slug kosong dibuat dari judul, slug isian dipakai apa adanya", () => {
    assert.equal(resolveJournalSlug("", "Ritual Pagi — Lulur Jawa"), "ritual-pagi-lulur-jawa");
    assert.equal(resolveJournalSlug("  slug-sendiri ", "Judul"), "slug-sendiri");
  });

  it("slug otomatis dipotong di batas panjang tanpa tanda hubung di ujung", () => {
    const slug = resolveJournalSlug("", "kata ".repeat(40));
    assert.ok(slug.length <= JOURNAL_SLUG_MAX);
    assert.equal(validateJournalSlug(slug), null);
  });

  it("menolak slug kosong, terlalu panjang, atau berpola salah", () => {
    assert.match(validateJournalSlug("") ?? "", /manual/);
    assert.match(validateJournalSlug("a".repeat(JOURNAL_SLUG_MAX + 1)) ?? "", /maksimal/);
    assert.notEqual(validateJournalSlug("Huruf-Besar"), null);
    assert.notEqual(validateJournalSlug("dua--strip"), null);
    assert.notEqual(validateJournalSlug("-awal"), null);
    assert.equal(validateJournalSlug("ritual-pagi-2"), null);
  });

  it("ganti slug artikel terbit → redirect 301 dari alamat lama", () => {
    const plan = planSlugRedirect([], journalPath("lama"), journalPath("baru"));
    assert.deepEqual(plan.upserts, [
      { fromPath: "/our-story/journal/lama", toPath: "/our-story/journal/baru" },
    ]);
  });
});

describe("kategori & tag", () => {
  it("kategori dirapikan dan mengikuti ejaan kategori yang sudah ada", () => {
    assert.equal(normalizeJournalCategory("  wellness  ", ["Wellness", "Ritual"]), "Wellness");
    assert.equal(normalizeJournalCategory("Kabar   Baru", ["Wellness"]), "Kabar Baru");
    assert.equal(normalizeJournalCategory("   ", ["Wellness"]), null);
    assert.equal(normalizeJournalCategory(null), null);
  });

  it("tag dinormalisasi: huruf kecil, tanpa #, tanpa duplikat, urutan dipertahankan", () => {
    const result = parseJournalTags("Wellness, #pijat,  wellness ,, Ritual  Pagi\nPIJAT");
    assert.deepEqual(result, { tags: ["wellness", "pijat", "ritual pagi"], error: null });
  });

  it("menolak tag terlalu panjang dan lebih dari batas jumlah", () => {
    assert.match(parseJournalTags("x".repeat(41)).error ?? "", /terlalu panjang/);
    const many = Array.from({ length: JOURNAL_TAGS_PER_POST + 1 }, (_, i) => `tag${i}`);
    const result = parseJournalTags(many.join(","));
    assert.match(result.error ?? "", /Maksimal/);
    assert.equal(result.tags.length, JOURNAL_TAGS_PER_POST);
  });

  it("mengumpulkan kategori unik dan tag terpopuler", () => {
    const posts = [
      { category: "Wellness", tags: ["pijat", "ritual"] },
      { category: "wellness", tags: ["pijat"] },
      { category: null, tags: ["aroma", "pijat"] },
      { category: "Ritual", tags: ["ritual"] },
    ];
    assert.deepEqual(collectJournalCategories(posts), ["Wellness", "Ritual"]);
    assert.deepEqual(collectJournalTags(posts), ["pijat", "ritual", "aroma"]);
  });
});

describe("penjadwalan", () => {
  it("draf disimpan apa adanya, termasuk tanggal rencana", () => {
    assert.deepEqual(resolveJournalSchedule("DRAFT", FUTURE, NOW), {
      ok: true,
      status: "DRAFT",
      publishedAt: FUTURE,
    });
  });

  it("terjadwal wajib bertanggal", () => {
    const result = resolveJournalSchedule("SCHEDULED", null, NOW);
    assert.equal(result.ok, false);
  });

  it("terjadwal di masa depan tetap SCHEDULED; yang sudah lewat menjadi PUBLISHED", () => {
    assert.deepEqual(resolveJournalSchedule("SCHEDULED", FUTURE, NOW), {
      ok: true,
      status: "SCHEDULED",
      publishedAt: FUTURE,
    });
    assert.deepEqual(resolveJournalSchedule("SCHEDULED", PAST, NOW), {
      ok: true,
      status: "PUBLISHED",
      publishedAt: PAST,
    });
  });

  it("terbit tanpa tanggal memakai waktu sekarang; bertanggal masa depan menjadi SCHEDULED", () => {
    assert.deepEqual(resolveJournalSchedule("PUBLISHED", null, NOW), {
      ok: true,
      status: "PUBLISHED",
      publishedAt: NOW,
    });
    assert.deepEqual(resolveJournalSchedule("PUBLISHED", FUTURE, NOW), {
      ok: true,
      status: "SCHEDULED",
      publishedAt: FUTURE,
    });
  });

  it("status efektif: terjadwal yang waktunya tiba terhitung terbit tanpa disimpan ulang", () => {
    assert.equal(effectiveJournalStatus({ status: "SCHEDULED", publishedAt: PAST }, NOW), "PUBLISHED");
    assert.equal(effectiveJournalStatus({ status: "SCHEDULED", publishedAt: FUTURE }, NOW), "SCHEDULED");
    assert.equal(effectiveJournalStatus({ status: "PUBLISHED", publishedAt: FUTURE }, NOW), "SCHEDULED");
    assert.equal(effectiveJournalStatus({ status: "PUBLISHED", publishedAt: null }, NOW), "PUBLISHED");
    assert.equal(effectiveJournalStatus({ status: "DRAFT", publishedAt: PAST }, NOW), "DRAFT");
  });
});

describe("isi & SEO", () => {
  it("isi editor kosong terdeteksi; gambar saja dianggap berisi", () => {
    assert.equal(isRichTextEmpty(""), true);
    assert.equal(isRichTextEmpty("<p><br></p><p>&nbsp;</p>"), true);
    assert.equal(isRichTextEmpty("<p>Halo</p>"), false);
    assert.equal(isRichTextEmpty('<p><img src="https://x/a.jpg"></p>'), false);
  });

  it("menilai panjang meta SEO terhadap panjang ideal", () => {
    assert.equal(seoLengthState(0, 60), "empty");
    assert.equal(seoLengthState(20, 60), "short");
    assert.equal(seoLengthState(55, 60), "ideal");
    assert.equal(seoLengthState(61, 60), "long");
  });
});

describe("filter daftar publik", () => {
  const posts = [
    { slug: "a", category: "Wellness", tags: ["pijat", "ritual"] },
    { slug: "b", category: "Ritual", tags: ["ritual"] },
    { slug: "c", category: null, tags: [] },
  ];

  it("menyaring per kategori dan/atau tag tanpa membedakan huruf besar/kecil", () => {
    assert.deepEqual(filterJournalPosts(posts, { category: "wellness" }).map((p) => p.slug), ["a"]);
    assert.deepEqual(filterJournalPosts(posts, { tag: "RITUAL" }).map((p) => p.slug), ["a", "b"]);
    assert.deepEqual(
      filterJournalPosts(posts, { category: "Ritual", tag: "ritual" }).map((p) => p.slug),
      ["b"],
    );
    assert.equal(filterJournalPosts(posts).length, 3);
  });

  it("membaca filter dari query string dengan aman", () => {
    assert.deepEqual(parseJournalFilter({ category: "  Wellness ", tag: "#Pijat" }), {
      category: "Wellness",
      tag: "pijat",
    });
    assert.deepEqual(parseJournalFilter({ category: ["Ritual", "x"], tag: "  " }), {
      category: "Ritual",
    });
    assert.equal(parseJournalFilter({ category: "x".repeat(500) }).category?.length, 80);
  });

  it("membuat URL daftar dengan filter", () => {
    assert.equal(journalListHref(), "/our-story/journal");
    assert.equal(
      journalListHref({ category: "Ritual Pagi", tag: "pijat" }),
      "/our-story/journal?category=Ritual+Pagi&tag=pijat",
    );
  });
});
