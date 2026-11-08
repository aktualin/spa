import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { sanitizeHtml, stripTags } from "../../src/lib/domain/sanitize.ts";

describe("U11 sanitizeHtml — tag berbahaya", () => {
  it("membuang <script> beserta isinya", () => {
    const out = sanitizeHtml("<p>halo</p><script>alert(1)</script>");
    assert.equal(out, "<p>halo</p>");
  });

  it("membuang <script> yang tidak ditutup", () => {
    const out = sanitizeHtml("<p>halo</p><script>alert(1)");
    assert.equal(out, "<p>halo</p>");
  });

  it("membuang <iframe>, <style>, <object>, dan <embed>", () => {
    assert.equal(sanitizeHtml("<iframe src='x'></iframe>a"), "a");
    assert.equal(sanitizeHtml("<style>p{color:red}</style>a"), "a");
    assert.equal(sanitizeHtml("<object data='x'></object>a"), "a");
    assert.equal(sanitizeHtml("<embed src='x'>a"), "a");
  });

  it("membuang komentar HTML", () => {
    assert.equal(sanitizeHtml("<p>a</p><!-- rahasia -->"), "<p>a</p>");
  });

  it("membuang tag di luar daftar putih tapi menyimpan teksnya", () => {
    assert.equal(sanitizeHtml("<marquee>teks</marquee>"), "teks");
  });
});

describe("U11 sanitizeHtml — atribut", () => {
  it("membuang handler on*", () => {
    const out = sanitizeHtml('<img src="/a.jpg" onerror="alert(1)">');
    assert.equal(out, '<img src="/a.jpg">');
  });

  it("membuang atribut yang tidak diizinkan", () => {
    const out = sanitizeHtml('<p class="x" style="color:red">a</p>');
    assert.equal(out, "<p>a</p>");
  });

  it("menyimpan atribut yang diizinkan", () => {
    const out = sanitizeHtml('<a href="https://kamaspa.id" title="KAMA">a</a>');
    assert.ok(out.includes('href="https://kamaspa.id"'));
    assert.ok(out.includes('title="KAMA"'));
  });

  it("menambahkan rel noopener pada target=_blank", () => {
    const out = sanitizeHtml('<a href="https://x.id" target="_blank">a</a>');
    assert.ok(out.includes("noopener"));
    assert.ok(out.includes("noreferrer"));
  });

  it("menggabungkan rel yang sudah ada dengan noopener", () => {
    const out = sanitizeHtml(
      '<a href="https://x.id" target="_blank" rel="nofollow">a</a>',
    );
    assert.ok(out.includes("nofollow"));
    assert.ok(out.includes("noopener"));
  });
});

describe("U11 sanitizeHtml — skema URL", () => {
  it("menolak javascript:", () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">a</a>');
    assert.ok(!out.includes("javascript"));
  });

  it("menolak javascript: yang disamarkan dengan karakter kontrol", () => {
    const out = sanitizeHtml('<a href="java\tscript:alert(1)">a</a>');
    assert.ok(!out.includes("href="));
  });

  it("menolak data:", () => {
    const out = sanitizeHtml(
      '<img src="data:text/html;base64,PHNjcmlwdD4=" alt="x">',
    );
    assert.ok(!out.includes("data:"));
    // Atributnya dibuang, tapi tag <img> yang aman tetap dipertahankan.
    assert.ok(out.startsWith("<img"));
  });

  it("menolak URL protocol-relative", () => {
    const out = sanitizeHtml('<a href="//evil.com">a</a>');
    assert.ok(!out.includes("evil.com"));
  });

  it("menerima http, https, mailto, dan tel", () => {
    assert.ok(sanitizeHtml('<a href="http://x.id">a</a>').includes("http://x.id"));
    assert.ok(sanitizeHtml('<a href="https://x.id">a</a>').includes("https://x.id"));
    assert.ok(sanitizeHtml('<a href="mailto:a@x.id">a</a>').includes("mailto:"));
    assert.ok(sanitizeHtml('<a href="tel:+6281">a</a>').includes("tel:"));
  });

  it("menerima path relatif dan absolut", () => {
    assert.ok(sanitizeHtml('<img src="img/a.jpg">').includes("img/a.jpg"));
    assert.ok(sanitizeHtml('<img src="/img/a.jpg">').includes("/img/a.jpg"));
    assert.ok(sanitizeHtml('<a href="#faq">a</a>').includes("#faq"));
  });
});

describe("U11 sanitizeHtml — struktur", () => {
  it("mempertahankan tag penutup", () => {
    assert.equal(sanitizeHtml("<p>a</p><p>b</p>"), "<p>a</p><p>b</p>");
  });

  it("mempertahankan daftar dan heading", () => {
    const out = sanitizeHtml("<h2>Judul</h2><ul><li>satu</li></ul>");
    assert.equal(out, "<h2>Judul</h2><ul><li>satu</li></ul>");
  });

  it("input kosong menghasilkan string kosong", () => {
    assert.equal(sanitizeHtml(null), "");
    assert.equal(sanitizeHtml(undefined), "");
    assert.equal(sanitizeHtml(""), "");
  });
});

describe("U11 stripTags", () => {
  it("menghapus seluruh tag dan menyisakan teks", () => {
    assert.equal(stripTags("<p>halo <strong>dunia</strong></p>"), "halo dunia");
  });

  it("menghapus isi script, bukan hanya tagnya", () => {
    assert.equal(stripTags("<script>alert(1)</script>halo"), "halo");
  });

  it("input kosong menghasilkan string kosong", () => {
    assert.equal(stripTags(null), "");
    assert.equal(stripTags(undefined), "");
  });
});
