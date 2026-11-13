import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  HIGHLIGHT_DEFAULT_CTA,
  highlightStatus,
  highlightToCard,
  isDefaultVisibleSection,
  isFixedPositionSection,
  isHighlightVisible,
  reorderIds,
  selectHighlightCards,
  validateHighlightInput,
  type HighlightRowLike,
} from "../../src/lib/domain/homepage.ts";

/** Homepage — section bawaan, footer, dan kartu highlight "What's New". */

const NOW = new Date("2026-11-08T05:00:00.000Z");
const DAY = 24 * 60 * 60 * 1000;

function row(partial: Partial<HighlightRowLike> & { id: string }): HighlightRowLike {
  return {
    title: `Judul ${partial.id}`,
    isPublished: true,
    sortOrder: 0,
    ...partial,
  };
}

describe("section bawaan", () => {
  it("section lama & footer tampil walau belum ada baris DB", () => {
    for (const key of ["hero", "whats-new", "reviews", "booking-banner", "footer"]) {
      assert.equal(isDefaultVisibleSection(key), true, key);
    }
  });

  it("section baru tidak tampil sebelum dinyalakan", () => {
    for (const key of ["signature-treatments", "promo-highlight", "gallery-teaser"]) {
      assert.equal(isDefaultVisibleSection(key), false, key);
    }
  });

  it("hanya footer yang posisinya tetap", () => {
    assert.equal(isFixedPositionSection("footer"), true);
    assert.equal(isFixedPositionSection("hero"), false);
  });
});

describe("isHighlightVisible & highlightStatus", () => {
  it("draf tidak tampil", () => {
    const draft = { isPublished: false, startDate: null, endDate: null };
    assert.equal(isHighlightVisible(draft, NOW), false);
    assert.equal(highlightStatus(draft, NOW), "Draf");
  });

  it("tanpa periode langsung tampil", () => {
    const live = { isPublished: true, startDate: null, endDate: null };
    assert.equal(isHighlightVisible(live, NOW), true);
    assert.equal(highlightStatus(live, NOW), "Tayang");
  });

  it("menghormati tanggal mulai & berakhir", () => {
    const future = { isPublished: true, startDate: new Date(NOW.getTime() + DAY), endDate: null };
    const past = { isPublished: true, startDate: null, endDate: new Date(NOW.getTime() - DAY) };
    const inside = {
      isPublished: true,
      startDate: new Date(NOW.getTime() - DAY),
      endDate: new Date(NOW.getTime() + DAY),
    };
    assert.equal(isHighlightVisible(future, NOW), false);
    assert.equal(highlightStatus(future, NOW), "Terjadwal");
    assert.equal(isHighlightVisible(past, NOW), false);
    assert.equal(highlightStatus(past, NOW), "Berakhir");
    assert.equal(isHighlightVisible(inside, NOW), true);
  });
});

describe("selectHighlightCards", () => {
  it("tabel kosong → null (pakai kartu statis)", () => {
    assert.equal(selectHighlightCards([], NOW), null);
  });

  it("ada baris tapi semua draf → nol kartu, bukan kartu statis", () => {
    assert.deepEqual(selectHighlightCards([row({ id: "a", isPublished: false })], NOW), []);
  });

  it("menyaring periode dan mengurutkan berdasarkan sortOrder (stabil)", () => {
    const cards = selectHighlightCards(
      [
        row({ id: "c", sortOrder: 2 }),
        row({ id: "a", sortOrder: 0 }),
        row({ id: "x", sortOrder: 1, endDate: new Date(NOW.getTime() - DAY) }),
        row({ id: "b1", sortOrder: 1 }),
        row({ id: "b2", sortOrder: 1 }),
      ],
      NOW,
    );
    assert.deepEqual(
      cards?.map((card) => card.key),
      ["a", "b1", "b2", "c"],
    );
  });
});

describe("highlightToCard", () => {
  it("isian kosong memakai nilai bawaan kartu lama", () => {
    const card = highlightToCard(
      row({ id: "a", title: "  Karuna  ", eyebrow: "Package", href: "/menu#packages", imageUrl: "https://cdn.example.com/img/kama/06-bride.jpg" }),
    );
    assert.deepEqual(card, {
      key: "a",
      href: "/menu#packages",
      image: "https://cdn.example.com/img/kama/06-bride.jpg",
      imageAlt: "",
      tag: "Package",
      title: "Karuna",
      ctaLabel: HIGHLIGHT_DEFAULT_CTA,
    });
  });

  it("tautan & gambar tidak aman diabaikan", () => {
    const card = highlightToCard(
      row({ id: "a", href: "javascript:alert(1)", imageUrl: "//evil.com/x.jpg", ctaLabel: "Baca" }),
    );
    assert.equal(card.href, null);
    assert.equal(card.image, null);
    assert.equal(card.ctaLabel, "Baca");
  });
});

describe("validateHighlightInput", () => {
  it("judul wajib", () => {
    const result = validateHighlightInput({ title: "   " });
    assert.equal(result.ok, false);
  });

  it("menerima isian lengkap dan mengosongkan string kosong jadi null", () => {
    const result = validateHighlightInput({
      eyebrow: " Promo ",
      title: "Promo Akhir Tahun",
      imageUrl: "https://xyz.supabase.co/storage/v1/object/public/media/a.jpg",
      imageAlt: "",
      href: "/promos/akhir-tahun",
      ctaLabel: "",
      isPublished: true,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.data.eyebrow, "Promo");
    assert.equal(result.data.imageAlt, null);
    assert.equal(result.data.ctaLabel, null);
    assert.equal(result.data.startDate, null);
  });

  it("menolak tautan tidak aman", () => {
    for (const href of ["javascript:alert(1)", "//evil.com", "http://example.com", "mailto:a@b.c"]) {
      assert.equal(validateHighlightInput({ title: "A", href }).ok, false, href);
    }
    for (const href of ["/menu", "#home_whats_new", "https://wa.me/628123"]) {
      assert.equal(validateHighlightInput({ title: "A", href }).ok, true, href);
    }
  });

  it("menolak gambar tidak aman", () => {
    assert.equal(validateHighlightInput({ title: "A", imageUrl: "javascript:x" }).ok, false);
    assert.equal(validateHighlightInput({ title: "A", imageUrl: "https://cdn.example.com/img/kama/a.jpg" }).ok, true);
  });

  it("label tombol tanpa tautan ditolak", () => {
    assert.equal(validateHighlightInput({ title: "A", ctaLabel: "Baca" }).ok, false);
  });

  it("tanggal berakhir sebelum tanggal mulai ditolak", () => {
    const result = validateHighlightInput({
      title: "A",
      startDate: new Date(NOW.getTime() + DAY),
      endDate: NOW,
    });
    assert.equal(result.ok, false);
  });

  it("batas panjang", () => {
    assert.equal(validateHighlightInput({ title: "x".repeat(161) }).ok, false);
    assert.equal(validateHighlightInput({ title: "A", eyebrow: "x".repeat(41) }).ok, false);
  });
});

describe("reorderIds", () => {
  it("menukar dengan tetangga", () => {
    assert.deepEqual(reorderIds(["a", "b", "c"], "b", "up"), ["b", "a", "c"]);
    assert.deepEqual(reorderIds(["a", "b", "c"], "b", "down"), ["a", "c", "b"]);
  });

  it("null di ujung atau id tidak dikenal", () => {
    assert.equal(reorderIds(["a", "b"], "a", "up"), null);
    assert.equal(reorderIds(["a", "b"], "b", "down"), null);
    assert.equal(reorderIds(["a", "b"], "z", "up"), null);
  });
});

import {
  INSTAGRAM_LIMITS,
  selectInstagramPosts,
  selectReviews,
  selectStats,
  validateInstagramInput,
  validateReviewInput,
  validateStatInput,
} from "../../src/lib/domain/homepage.ts";

describe("statistik, ulasan, feed Instagram", () => {
  it("tabel kosong → null (pakai fallback statis)", () => {
    assert.equal(selectStats([]), null);
    assert.equal(selectReviews([]), null);
    assert.equal(selectInstagramPosts([]), null);
  });

  it("ada baris tapi tak ada yang terbit → daftar kosong, bukan null", () => {
    assert.deepEqual(selectStats([{ id: "a", value: "1", label: "x", isPublished: false, sortOrder: 0 }]), []);
  });

  it("hanya baris terbit, urut sortOrder", () => {
    const out = selectStats([
      { id: "b", value: "2", label: "dua", isPublished: true, sortOrder: 1 },
      { id: "a", value: "1", label: "satu", isPublished: true, sortOrder: 0 },
      { id: "c", value: "3", label: "tiga", isPublished: false, sortOrder: 2 },
    ]);
    assert.deepEqual(out?.map((s) => s.key), ["a", "b"]);
  });

  it("ulasan: lokasi/peran kosong menjadi string kosong", () => {
    const out = selectReviews([
      { id: "a", quote: " q ", name: " N ", location: null, role: undefined, isPublished: true, sortOrder: 0 },
    ]);
    assert.deepEqual(out, [{ key: "a", quote: "q", name: "N", location: "", role: "" }]);
  });

  it("Instagram: gambar tak aman dibuang, tautan tak aman jadi profil, maks 12", () => {
    const rows = Array.from({ length: 14 }, (_, i) => ({
      id: String(i),
      imageUrl: "https://cdn.example.com/img/a.jpg",
      isPublished: true,
      sortOrder: i,
    }));
    assert.equal(selectInstagramPosts(rows)?.length, INSTAGRAM_LIMITS.max);
    const out = selectInstagramPosts([
      { id: "x", imageUrl: "javascript:alert(1)", isPublished: true, sortOrder: 0 },
      { id: "y", imageUrl: "https://cdn.example.com/img/a.jpg", href: "javascript:alert(1)", isPublished: true, sortOrder: 1 },
    ]);
    assert.equal(out?.length, 1);
    assert.equal(out?.[0].href, null);
  });

  it("validasi statistik", () => {
    assert.equal(validateStatInput({ value: "", label: "x" }).ok, false);
    assert.equal(validateStatInput({ value: "12", label: "" }).ok, false);
    assert.equal(validateStatInput({ value: "1".repeat(21), label: "x" }).ok, false);
    assert.equal(validateStatInput({ value: "12", label: "years" }).ok, true);
  });

  it("validasi ulasan", () => {
    assert.equal(validateReviewInput({ quote: "", name: "A" }).ok, false);
    assert.equal(validateReviewInput({ quote: "q", name: "" }).ok, false);
    assert.equal(validateReviewInput({ quote: "q".repeat(601), name: "A" }).ok, false);
    const ok = validateReviewInput({ quote: "q", name: "A", location: " ", isPublished: true });
    assert.ok(ok.ok && ok.data.location === null && ok.data.isPublished);
  });

  it("validasi Instagram", () => {
    assert.equal(validateInstagramInput({ imageUrl: "" }).ok, false);
    assert.equal(validateInstagramInput({ imageUrl: "javascript:x" }).ok, false);
    assert.equal(validateInstagramInput({ imageUrl: "https://cdn.example.com/img/a.jpg", href: "javascript:x" }).ok, false);
    assert.equal(validateInstagramInput({ imageUrl: "https://cdn.example.com/img/a.jpg", href: "https://instagram.com/p/1" }).ok, true);
  });
});
