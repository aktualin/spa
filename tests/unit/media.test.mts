import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  MAX_MEDIA_BYTES,
  MediaValidationError,
  formatBytes,
  moveInList,
  sanitizeFileName,
  sniffImageType,
  validateMediaBytes,
  validateMediaFile,
} from "../../src/lib/domain/media.ts";

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const ascii = (s: string) => new Uint8Array([...s].map((c) => c.charCodeAt(0)));
const WEBP = ascii("RIFF\0\0\0\0WEBPVP8 ");
const GIF = ascii("GIF89a\0\0\0\0\0\0");
const AVIF = ascii("\0\0\0\x1cftypavif");

describe("validateMediaFile", () => {
  it("menerima gambar yang valid", () => {
    assert.equal(validateMediaFile({ name: "spa.JPG", type: "image/jpeg", size: 1000 }), "image/jpeg");
    assert.equal(validateMediaFile({ name: "a.jpeg", type: "image/jpeg", size: 1 }), "image/jpeg");
    assert.equal(validateMediaFile({ name: "hero.gif", type: "image/gif", size: MAX_MEDIA_BYTES }), "image/gif");
  });

  it("menolak tipe, ukuran, dan nama yang salah", () => {
    const bad = [
      { name: "doc.pdf", type: "application/pdf", size: 10 },
      { name: "x.svg", type: "image/svg+xml", size: 10 },
      { name: "big.png", type: "image/png", size: MAX_MEDIA_BYTES + 1 },
      { name: "kosong.png", type: "image/png", size: 0 },
      { name: "   ", type: "image/png", size: 10 },
      { name: "../etc/passwd.png", type: "image/png", size: 10 },
      { name: "a\\b.png", type: "image/png", size: 10 },
      { name: "foto.png", type: "image/jpeg", size: 10 },
      { name: "tanpa-ekstensi", type: "image/png", size: 10 },
      { name: `${"a".repeat(201)}.png`, type: "image/png", size: 10 },
    ];
    for (const file of bad) {
      assert.throws(() => validateMediaFile(file), MediaValidationError, file.name);
    }
  });
});

describe("sniffImageType & validateMediaBytes", () => {
  it("mengenali magic number", () => {
    assert.equal(sniffImageType(JPEG), "image/jpeg");
    assert.equal(sniffImageType(PNG), "image/png");
    assert.equal(sniffImageType(WEBP), "image/webp");
    assert.equal(sniffImageType(GIF), "image/gif");
    assert.equal(sniffImageType(AVIF), "image/avif");
    assert.equal(sniffImageType(ascii("<svg xmlns=")), null);
  });

  it("menolak isi yang tidak cocok dengan tipe", () => {
    assert.equal(validateMediaBytes({ name: "a.png", type: "image/png", size: 10 }, PNG), "image/png");
    assert.throws(
      () => validateMediaBytes({ name: "a.png", type: "image/png", size: 10 }, ascii("<?php echo 1;")),
      MediaValidationError,
    );
    assert.throws(
      () => validateMediaBytes({ name: "a.png", type: "image/png", size: 10 }, JPEG),
      MediaValidationError,
    );
  });
});

describe("sanitizeFileName", () => {
  it("merapikan nama berkas", () => {
    assert.equal(sanitizeFileName("Foto Spa (1).JPG", "image/jpeg"), "foto-spa-1.jpg");
    assert.equal(sanitizeFileName("Café Ålesund.png", "image/png"), "cafe-alesund.png");
    assert.equal(sanitizeFileName("___.webp", "image/webp"), "media.webp");
    assert.equal(sanitizeFileName("x.jpeg", "image/jpeg"), "x.jpg");
    assert.ok(sanitizeFileName(`${"a".repeat(300)}.png`, "image/png").length <= 84);
  });
});

describe("formatBytes & moveInList", () => {
  it("format ukuran", () => {
    assert.equal(formatBytes(1536 * 1024), "1,5 MB");
    assert.equal(formatBytes(2048), "2 KB");
    assert.equal(formatBytes(10), "1 KB");
  });

  it("memindah urutan", () => {
    assert.deepEqual(moveInList(["a", "b", "c"], "b", "up"), ["b", "a", "c"]);
    assert.deepEqual(moveInList(["a", "b", "c"], "b", "down"), ["a", "c", "b"]);
    assert.deepEqual(moveInList(["a", "b"], "a", "up"), ["a", "b"]);
    assert.deepEqual(moveInList(["a", "b"], "z", "down"), ["a", "b"]);
  });
});

describe("helper Media Library", () => {
  it("validasi nama tampilan", async () => {
    const { mediaDisplayNameError } = await import("../../src/lib/domain/media.ts");
    assert.equal(mediaDisplayNameError("Foto lobi.jpg"), null);
    assert.equal(mediaDisplayNameError("  Foto  "), null);
    assert.ok(mediaDisplayNameError(""));
    assert.ok(mediaDisplayNameError("   "));
    assert.ok(mediaDisplayNameError("a".repeat(121)));
    assert.equal(mediaDisplayNameError("a".repeat(120)), null);
    assert.ok(mediaDisplayNameError("a/b.jpg"));
    assert.ok(mediaDisplayNameError("a\\b.jpg"));
    assert.ok(mediaDisplayNameError("a\nb"));
  });

  it("tipe dari ekstensi & pecah key storage", async () => {
    const { mimeTypeFromFileName, splitStorageKey } = await import("../../src/lib/domain/media.ts");
    assert.equal(mimeTypeFromFileName("x.JPEG"), "image/jpeg");
    assert.equal(mimeTypeFromFileName("x.webp?v=2"), "image/webp");
    assert.equal(mimeTypeFromFileName("x.svg"), null);
    assert.equal(mimeTypeFromFileName("tanpa-ekstensi"), null);
    assert.deepEqual(splitStorageKey("gallery/ab12-foto.jpg"), { folder: "gallery", fileName: "ab12-foto.jpg" });
    assert.deepEqual(splitStorageKey("foto.jpg"), { folder: "misc", fileName: "foto.jpg" });
  });

  it("ambil URL gambar dari HTML", async () => {
    const { extractImageUrls } = await import("../../src/lib/domain/media.ts");
    const html = `<p>a</p><img src="https://x/a.jpg" alt=""><IMG alt='b' src='https://x/b.png'/><img src=https://x/c.gif><img src="https://x/a.jpg">`;
    assert.deepEqual(extractImageUrls(html), ["https://x/a.jpg", "https://x/b.png", "https://x/c.gif"]);
    assert.deepEqual(extractImageUrls("<p>tanpa gambar</p>"), []);
  });
});
