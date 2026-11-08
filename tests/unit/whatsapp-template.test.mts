import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildWhatsAppLink,
  extractPlaceholders,
  renderTemplate,
} from "../../src/lib/domain/whatsapp-template.ts";

/** U7 — templating pesan WhatsApp. */

describe("U7 renderTemplate", () => {
  it("mengganti placeholder dengan nilainya", () => {
    assert.equal(
      renderTemplate("Halo {{nama}}, treatments {{treatmentName}}", {
        nama: "Budi",
        treatmentName: "Sukma Laya",
      }),
      "Halo Budi, treatments Sukma Laya",
    );
  });

  it("placeholder yang tidak dikenal tetap dibiarkan", () => {
    assert.equal(
      renderTemplate("Halo {{nama}}, {{harga}}", { nama: "Budi" }),
      "Halo Budi, {{harga}}",
    );
  });

  it("placeholder tanpa nilai (null/undefined) dibiarkan", () => {
    assert.equal(
      renderTemplate("Harga {{harga}}", { harga: null }),
      "Harga {{harga}}",
    );
    assert.equal(
      renderTemplate("Harga {{harga}}", { harga: undefined }),
      "Harga {{harga}}",
    );
  });

  it("nilai angka tetap dikonversi ke string", () => {
    assert.equal(renderTemplate("Harga {{harga}}", { harga: 145000 }), "Harga 145000");
    assert.equal(renderTemplate("Harga {{harga}}", { harga: 0 }), "Harga 0");
  });

  it("menghormati spasi di dalam placeholder", () => {
    assert.equal(renderTemplate("Halo {{ nama }}", { nama: "Budi" }), "Halo Budi");
  });

  it("template tanpa placeholder dikembalikan apa adanya", () => {
    assert.equal(renderTemplate("Halo kak"), "Halo kak");
  });
});

describe("U7 buildWhatsAppLink", () => {
  it("membangun URL wa.me dengan nomor digit saja", () => {
    assert.equal(
      buildWhatsAppLink("Halo kak", "6281316052040"),
      "https://wa.me/6281316052040?text=Halo%20kak",
    );
  });

  it("membuang tanda plus, spasi, dan tanda hubung dari nomor", () => {
    assert.equal(
      buildWhatsAppLink("Hi", "+62 813-1605-2040"),
      "https://wa.me/6281316052040?text=Hi",
    );
  });

  it("meng-encode spasi, &, dan tanda tanya", () => {
    const link = buildWhatsAppLink("Promo A & B?Rp 145.000", "6281316052040");
    assert.ok(link.includes("%20"), "spasi ter-encode");
    assert.ok(link.includes("%26"), "tanda & ter-encode");
    assert.ok(link.includes("%3F"), "tanda tanya ter-encode");
    assert.ok(!link.includes(" "), "tidak ada spasi mentah");
  });

  it("meng-encode emoji sebagai UTF-8 percent-encoded", () => {
    const link = buildWhatsAppLink("Halo ✨", "6281316052040");
    assert.ok(link.includes("%E2%9C%A8"), link);
    assert.ok(!link.includes("✨"), link);
  });

  it("pesan yang sudah ter-encode tidak di-encode dua kali", () => {
    const link = buildWhatsAppLink("Halo%20kak", "6281316052040");
    assert.equal(
      link,
      "https://wa.me/6281316052040?text=Halo%2520kak",
    );
  });
});

describe("U7 extractPlaceholders", () => {
  it("meng daftar placeholder unik dalam template", () => {
    assert.deepEqual(
      extractPlaceholders("{{nama}} {{nama}} {{harga}}"),
      ["nama", "harga"],
    );
  });

  it("template tanpa placeholder menghasilkan daftar kosong", () => {
    assert.deepEqual(extractPlaceholders("Halo kak"), []);
  });
});
