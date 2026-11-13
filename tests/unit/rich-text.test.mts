import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatHtmlForEditing, looksLikeHtml, plainTextToHtml, richTextInput, richTextLength, toPlainText, toSafeHtml } from "../../src/lib/domain/rich-text.ts";

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

describe("toSafeHtml", () => {
  it("teks polos lama tetap jadi paragraf", () => {
    assert.equal(toSafeHtml("Satu\n\nDua"), "<p>Satu</p><p>Dua</p>");
  });

  it("HTML editor dipertahankan, bagian berbahaya dibuang", () => {
    const html = toSafeHtml('<h2>Judul</h2><p onclick="x()">Isi <a href="javascript:alert(1)">tautan</a></p><script>alert(1)</script>');
    assert.equal(html, "<h2>Judul</h2><p>Isi <a>tautan</a></p>");
  });

  it("tabel, kutipan, dan gambar https ikut dirender", () => {
    const html = toSafeHtml('<blockquote>Kutip</blockquote><table><tr><td>A</td></tr></table><img src="https://cdn.example.com/a.jpg" alt="A">');
    assert.ok(html.includes("<blockquote>Kutip</blockquote>"));
    assert.ok(html.includes("<td>A</td>"));
    assert.ok(html.includes('<img src="https://cdn.example.com/a.jpg" alt="A">'));
  });

  it("kosong → string kosong", () => {
    assert.equal(toSafeHtml(null), "");
    assert.equal(toSafeHtml("   "), "");
  });
});

describe("toPlainText", () => {
  it("membuang tag tanpa menempelkan kata", () => {
    assert.equal(toPlainText("<p>Pijat <strong>hangat</strong></p><p>Rileks&amp;segar</p>"), "Pijat hangat Rileks&segar");
  });

  it("memotong rapi di batas kata", () => {
    assert.equal(toPlainText("Satu dua tiga empat lima", 14), "Satu dua tiga…");
  });
});

describe("richTextInput & richTextLength", () => {
  it("menyanitasi HTML dan mengosongkan isi kosong dari editor", () => {
    assert.equal(richTextInput('<p onclick="x">Halo</p><script>1</script>'), "<p>Halo</p>");
    assert.equal(richTextInput("<p><br></p>"), "");
    assert.equal(richTextInput(null), "");
    assert.equal(richTextInput("Teks polos\nbaris dua"), "Teks polos\nbaris dua");
    assert.equal(richTextInput('<p><img src="https://cdn.example.com/a.jpg"></p>'), '<p><img src="https://cdn.example.com/a.jpg"></p>');
  });

  it("panjang dihitung dari teks terlihat, bukan markup", () => {
    assert.equal(richTextLength("<h2>Abc</h2><p><strong>de</strong></p>"), 6);
  });
});

describe("formatHtmlForEditing", () => {
  it("satu blok per baris tanpa mengubah isi", () => {
    assert.equal(
      formatHtmlForEditing("<h2>A</h2><p>B</p><ul><li>C</li><li>D</li></ul>"),
      "<h2>A</h2>\n<p>B</p>\n<ul>\n<li>C</li>\n<li>D</li>\n</ul>",
    );
  });
});
