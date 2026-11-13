import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  MAX_BATCH_PHOTOS,
  appendSortOrders,
  isPhotoUrl,
  parseBatchPhotoUrls,
  photoAltText,
  precheckUploadFile,
  sequentialSortOrders,
} from "../../src/lib/domain/gallery.ts";
import { moveInList } from "../../src/lib/domain/media.ts";

describe("sequentialSortOrders", () => {
  it("memberi urutan rapat 0..n-1 sesuai posisi", () => {
    assert.deepEqual(sequentialSortOrders(["a", "b", "c"]), [
      { id: "a", sortOrder: 0 },
      { id: "b", sortOrder: 1 },
      { id: "c", sortOrder: 2 },
    ]);
  });

  it("dipadu moveInList: menaikkan album kedua", () => {
    const ids = moveInList(["a", "b", "c"], "b", "up");
    assert.deepEqual(
      sequentialSortOrders(ids).map((row) => row.id),
      ["b", "a", "c"],
    );
  });

  it("daftar kosong → kosong", () => {
    assert.deepEqual(sequentialSortOrders([]), []);
  });
});

describe("appendSortOrders", () => {
  it("album kosong mulai dari 0", () => {
    assert.deepEqual(appendSortOrders(null, 3), [0, 1, 2]);
  });

  it("berlanjut setelah sortOrder terbesar", () => {
    assert.deepEqual(appendSortOrders(4, 2), [5, 6]);
  });

  it("jumlah 0 atau negatif → kosong", () => {
    assert.deepEqual(appendSortOrders(4, 0), []);
    assert.deepEqual(appendSortOrders(4, -1), []);
  });
});

describe("isPhotoUrl", () => {
  it("hanya menerima URL https (bucket S3)", () => {
    assert.equal(isPhotoUrl("https://x.supabase.co/storage/v1/object/public/media/a.jpg"), true);
    assert.equal(isPhotoUrl("https://cdn.example.com/img/kama/01-incense.jpg"), true);
    // Semua media dari bucket S3: path lokal dan http polos ditolak.
    assert.equal(isPhotoUrl("/img/kama/01-incense.jpg"), false);
    assert.equal(isPhotoUrl("http://a/1.jpg"), false);
  });

  it("menolak skema lain, protocol-relative, dan kosong", () => {
    assert.equal(isPhotoUrl("javascript:alert(1)"), false);
    assert.equal(isPhotoUrl("//evil.example/a.jpg"), false);
    assert.equal(isPhotoUrl(""), false);
    assert.equal(isPhotoUrl("https://a b.jpg"), false);
  });
});

describe("parseBatchPhotoUrls", () => {
  it("merapikan spasi dan membuang URL kembar", () => {
    assert.deepEqual(parseBatchPhotoUrls([" https://a/1.jpg ", "https://a/1.jpg", "https://cdn.example.com/img/2.jpg"]), {
      ok: true,
      urls: ["https://a/1.jpg", "https://cdn.example.com/img/2.jpg"],
    });
  });

  it("menolak input bukan array / berisi bukan string", () => {
    assert.equal(parseBatchPhotoUrls("https://a/1.jpg").ok, false);
    assert.equal(parseBatchPhotoUrls([1]).ok, false);
  });

  it("menolak URL tidak sah", () => {
    const result = parseBatchPhotoUrls(["https://a/1.jpg", "data:image/png;base64,AAA"]);
    assert.equal(result.ok, false);
  });

  it("menolak daftar kosong dan melebihi batas", () => {
    assert.equal(parseBatchPhotoUrls([]).ok, false);
    const many = Array.from({ length: MAX_BATCH_PHOTOS + 1 }, (_, i) => `https://a/${i}.jpg`);
    assert.equal(parseBatchPhotoUrls(many).ok, false);
    assert.equal(parseBatchPhotoUrls(many.slice(0, MAX_BATCH_PHOTOS)).ok, true);
  });
});

describe("precheckUploadFile", () => {
  it("berkas sah → null", () => {
    assert.equal(precheckUploadFile({ name: "spa.jpg", type: "image/jpeg", size: 1000 }), null);
    assert.equal(precheckUploadFile({ name: "anim.gif", type: "image/gif", size: 1000 }), null);
  });

  it("tipe, ukuran, dan ekstensi salah → pesan bahasa Indonesia", () => {
    assert.match(
      precheckUploadFile({ name: "doc.pdf", type: "application/pdf", size: 10 }) ?? "",
      /tidak didukung/,
    );
    assert.match(
      precheckUploadFile({ name: "big.jpg", type: "image/jpeg", size: 5 * 1024 * 1024 }) ?? "",
      /melebihi batas 4 MB/,
    );
    assert.match(
      precheckUploadFile({ name: "foto.png", type: "image/jpeg", size: 10 }) ?? "",
      /Ekstensi/,
    );
  });
});

describe("photoAltText", () => {
  it("memakai alt text bila ada", () => {
    assert.equal(photoAltText({ altText: "Ruang pijat", caption: "Cap" }, "Interior"), "Ruang pijat");
  });

  it("alt kosong/spasi → caption", () => {
    assert.equal(photoAltText({ altText: "  ", caption: "Lulur kunyit" }, "Interior"), "Lulur kunyit");
    assert.equal(photoAltText({ altText: null, caption: "Lulur kunyit" }, "Interior"), "Lulur kunyit");
  });

  it("alt & caption kosong → nama album", () => {
    assert.equal(photoAltText({ altText: "", caption: null }, "Interior"), "Foto Interior — KAMA Spa");
    assert.equal(photoAltText({ altText: null, caption: null }, " "), "Foto galeri KAMA Spa");
  });
});
