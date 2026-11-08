import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  InvalidPriceError,
  formatDuration,
  parseDurationLabel,
  parseDurationMin,
  parsePriceIdr,
  parsePriceLabel,
  tryParsePriceIdr,
} from "../../src/lib/domain/pricing.ts";

/**
 * U1 — validasi harga, dan U2 — validasi durasi.
 * Sumber: .claude/plans/05-rencana-testing.md
 */

describe("U1 parsePriceIdr", () => {
  it("menerima angka rupiah polos", () => {
    assert.equal(parsePriceIdr("145000"), 145000);
    assert.equal(parsePriceIdr(145000), 145000);
    assert.equal(parsePriceIdr("  145000  "), 145000);
  });

  it("menerima pemisah ribuan", () => {
    assert.equal(parsePriceIdr("145.000"), 145000);
    assert.equal(parsePriceIdr("1.500.000"), 1500000);
    assert.equal(parsePriceIdr("145,000"), 145000);
  });

  it("menerima 0 (item gratis)", () => {
    assert.equal(parsePriceIdr(0), 0);
    assert.equal(parsePriceIdr("0"), 0);
  });

  it("menolak nilai negatif", () => {
    assert.throws(() => parsePriceIdr(-1), InvalidPriceError);
    assert.throws(() => parsePriceIdr("-1"), InvalidPriceError);
    assert.throws(() => parsePriceIdr("-145000"), InvalidPriceError);
  });

  it("menolak nilai pecahan", () => {
    assert.throws(() => parsePriceIdr(145000.5), InvalidPriceError);
    assert.throws(() => parsePriceIdr("145000.5"), InvalidPriceError);
    assert.throws(() => parsePriceIdr("12.5"), InvalidPriceError);
  });

  it("menolak input kosong dan non-numerik", () => {
    assert.throws(() => parsePriceIdr(""), InvalidPriceError);
    assert.throws(() => parsePriceIdr("   "), InvalidPriceError);
    assert.throws(() => parsePriceIdr("abc"), InvalidPriceError);
    assert.throws(() => parsePriceIdr(Number.NaN), InvalidPriceError);
    assert.throws(() => parsePriceIdr(Number.POSITIVE_INFINITY), InvalidPriceError);
  });

  it("tryParsePriceIdr mengembalikan null untuk input tidak valid", () => {
    assert.equal(tryParsePriceIdr("145000"), 145000);
    assert.equal(tryParsePriceIdr("-1"), null);
    assert.equal(tryParsePriceIdr("abc"), null);
  });
});

describe("U1 parsePriceLabel (label gaya konten statis)", () => {
  it("mengubah sufiks k/rb/jt menjadi rupiah penuh", () => {
    assert.equal(parsePriceLabel("145k"), 145000);
    assert.equal(parsePriceLabel("650rb"), 650000);
    assert.equal(parsePriceLabel("1.5jt"), 1500000);
    assert.equal(parsePriceLabel("1000k"), 1000000);
  });

  it("menerima pemisah ribuan pada label", () => {
    assert.equal(parsePriceLabel("145.000"), 145000);
    assert.equal(parsePriceLabel("1.500.000"), 1500000);
  });

  it("mengembalikan 0 untuk label yang tidak dikenali", () => {
    assert.equal(parsePriceLabel("harga nanti"), 0);
    assert.equal(parsePriceLabel(""), 0);
  });
});

describe("U2 parseDurationMin", () => {
  it("menerima durasi wajar (15–480 menit)", () => {
    assert.equal(parseDurationMin("15"), 15);
    assert.equal(parseDurationMin("90"), 90);
    assert.equal(parseDurationMin("480"), 480);
    assert.equal(parseDurationMin(120), 120);
  });

  it("menolak durasi nol atau negatif", () => {
    assert.throws(() => parseDurationMin(0), InvalidPriceError);
    assert.throws(() => parseDurationMin("0"), InvalidPriceError);
    assert.throws(() => parseDurationMin(-30), InvalidPriceError);
    assert.throws(() => parseDurationMin("-30"), InvalidPriceError);
  });

  it("menolak pecahan dan teks", () => {
    assert.throws(() => parseDurationMin(45.5), InvalidPriceError);
    assert.throws(() => parseDurationMin("45.5"), InvalidPriceError);
    assert.throws(() => parseDurationMin("satu jam"), InvalidPriceError);
    assert.throws(() => parseDurationMin(""), InvalidPriceError);
  });
});

describe("U2 formatDuration", () => {
  it("menit di bawah satu jam tetap dalam menit", () => {
    assert.equal(formatDuration(30), "30 menit");
    assert.equal(formatDuration(45), "45 menit");
  });

  it("satu jam ke atas ditulis dalam jam", () => {
    assert.equal(formatDuration(60), "1 jam");
    assert.equal(formatDuration(90), "1.5 jam");
    assert.equal(formatDuration(120), "2 jam");
    assert.equal(formatDuration(150), "2.5 jam");
  });

  it("nilai tidak valid menghasilkan string kosong", () => {
    assert.equal(formatDuration(0), "");
    assert.equal(formatDuration(-10), "");
    assert.equal(formatDuration(Number.NaN), "");
  });
});

describe("U2 parseDurationLabel (label gaya konten statis)", () => {
  it("mengubah label statis menjadi menit", () => {
    assert.equal(parseDurationLabel("60 min"), 60);
    assert.equal(parseDurationLabel("2 hours"), 120);
    assert.equal(parseDurationLabel("2 hours 30 minute"), 150);
    assert.equal(parseDurationLabel("90 menit"), 90);
    assert.equal(parseDurationLabel("1 jam 15 menit"), 75);
  });

  it("mengembalikan 0 untuk label yang tidak dikenali", () => {
    assert.equal(parseDurationLabel("sepanjang hari"), 0);
    assert.equal(parseDurationLabel(""), 0);
  });
});
