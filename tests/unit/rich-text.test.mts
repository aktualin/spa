import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { looksLikeHtml, plainTextToHtml } from "../../src/lib/domain/rich-text.ts";

describe("plainTextToHtml", () => {
  it("paragraf dan baris baru", () => {
    assert.equal(plainTextToHtml("Baris satu\nBaris dua\n\nParagraf dua"), "<p>Baris satu<br>Baris dua</p><p>Paragraf dua</p>");
  });

  it("daftar berpoin dan bernomor", () => {
    assert.equal(plainTextToHtml("- Satu\n- Dua"), "<ul><li>Satu</li><li>Dua</li></ul>");
    assert.equal(plainTextToHtml("1. Satu\n2) Dua"), "<ol><li>Satu</li><li>Dua</li></ol>");
    assert.equal(plainTextToHtml("• Satu\nbukan poin"), "<p>• Satu<br>bukan poin</p>");
  });

  it("meloloskan karakter HTML dari teks polos", () => {
    assert.equal(plainTextToHtml("Diskon < 50% & S&K"), "<p>Diskon &lt; 50% &amp; S&amp;K</p>");
  });

  it("HTML dibiarkan apa adanya; kosong tetap kosong", () => {
    assert.equal(plainTextToHtml("<p>Sudah HTML</p>"), "<p>Sudah HTML</p>");
    assert.equal(plainTextToHtml("   \n "), "");
    assert.equal(plainTextToHtml("a\r\nb"), "<p>a<br>b</p>");
  });

  it("looksLikeHtml", () => {
    assert.equal(looksLikeHtml("<ul><li>x</li></ul>"), true);
    assert.equal(looksLikeHtml("harga < 100 > 50"), false);
  });
});
