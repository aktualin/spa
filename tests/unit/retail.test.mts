import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseOptionalPriceIdr } from "../../src/lib/domain/pricing.ts";
import {
  canMoveRetail,
  nextRetailSortOrder,
  planRetailMove,
  sortRetailProducts,
  type RetailOrderRow,
} from "../../src/lib/domain/retail.ts";

function row(
  id: string,
  sortOrder: number,
  isHighlight = false,
  name = id.toUpperCase(),
): RetailOrderRow {
  return { id, name, sortOrder, isHighlight };
}

describe("sortRetailProducts", () => {
  it("menaruh Highlight/Kolaborasi lebih dulu, lalu sortOrder, lalu nama", () => {
    const sorted = sortRetailProducts([
      row("a", 0, false, "Zebra"),
      row("b", 5, true),
      row("c", 1, true),
      row("d", 0, false, "Aardvark"),
    ]);
    assert.deepEqual(
      sorted.map((r) => r.id),
      ["c", "b", "d", "a"],
    );
  });

  it("tidak mengubah array asal", () => {
    const rows = [row("b", 1), row("a", 0)];
    sortRetailProducts(rows);
    assert.deepEqual(rows.map((r) => r.id), ["b", "a"]);
  });
});

describe("planRetailMove", () => {
  it("menukar dengan tetangga dan merapikan sortOrder menjadi 0..n-1", () => {
    const rows = [row("a", 0), row("b", 0), row("c", 0)];
    // Urutan awal (nama): A, B, C → turunkan A → B, A, C. B sudah 0.
    assert.deepEqual(planRetailMove(rows, "a", "down"), [
      { id: "a", sortOrder: 1 },
      { id: "c", sortOrder: 2 },
    ]);
  });

  it("hanya mengembalikan baris yang berubah", () => {
    const rows = [row("a", 0), row("b", 1), row("c", 2)];
    assert.deepEqual(planRetailMove(rows, "c", "up"), [
      { id: "c", sortOrder: 1 },
      { id: "b", sortOrder: 2 },
    ]);
  });

  it("tidak memindahkan melewati batas daftar", () => {
    const rows = [row("a", 0), row("b", 1)];
    assert.deepEqual(planRetailMove(rows, "a", "up"), []);
    assert.deepEqual(planRetailMove(rows, "b", "down"), []);
  });

  it("tidak menukar produk Highlight dengan produk biasa", () => {
    const rows = [row("h", 0, true), row("a", 1)];
    assert.deepEqual(planRetailMove(rows, "a", "up"), []);
    assert.deepEqual(planRetailMove(rows, "h", "down"), []);
  });

  it("id tak dikenal tidak memindahkan apa pun", () => {
    const rows = [row("a", 0), row("b", 1)];
    assert.deepEqual(planRetailMove(rows, "x", "up"), []);
  });
});

describe("canMoveRetail", () => {
  const ordered = sortRetailProducts([row("h1", 0, true), row("h2", 1, true), row("a", 2), row("b", 3)]);

  it("menonaktifkan tombol di batas daftar dan batas kelompok", () => {
    assert.equal(canMoveRetail(ordered, 0, "up"), false);
    assert.equal(canMoveRetail(ordered, 0, "down"), true);
    assert.equal(canMoveRetail(ordered, 1, "down"), false);
    assert.equal(canMoveRetail(ordered, 2, "up"), false);
    assert.equal(canMoveRetail(ordered, 2, "down"), true);
    assert.equal(canMoveRetail(ordered, 3, "down"), false);
  });
});

describe("nextRetailSortOrder", () => {
  it("meletakkan produk baru di akhir", () => {
    assert.equal(nextRetailSortOrder(null), 0);
    assert.equal(nextRetailSortOrder(undefined), 0);
    assert.equal(nextRetailSortOrder(4), 5);
  });
});

describe("harga produk retail", () => {
  it("kosong berarti tanpa harga (Hubungi kami)", () => {
    assert.equal(parseOptionalPriceIdr(""), null);
    assert.equal(parseOptionalPriceIdr("  "), null);
  });

  it("menerima angka polos dan pemisah ribuan", () => {
    assert.equal(parseOptionalPriceIdr("250000"), 250000);
    assert.equal(parseOptionalPriceIdr("250.000"), 250000);
  });

  it("menolak teks, negatif, dan pecahan", () => {
    assert.throws(() => parseOptionalPriceIdr("abc"));
    assert.throws(() => parseOptionalPriceIdr("-5000"));
    assert.throws(() => parseOptionalPriceIdr("12.5"));
  });
});
