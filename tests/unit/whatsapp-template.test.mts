import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  MAX_TEMPLATE_LENGTH,
  WHATSAPP_CONTEXTS,
  allowedPlaceholders,
  buildWhatsAppLink,
  builtInMessage,
  extractPlaceholders,
  fillTemplate,
  isSystemTemplateKey,
  normalizeWaNumber,
  renderTemplate,
  resolveWhatsAppMessage,
  validateTemplate,
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

describe("BUILD-18 fillTemplate", () => {
  it("mengisi placeholder yang dikenal", () => {
    assert.equal(
      fillTemplate("Halo kak, saya mau reservasi {{treatment}}", { treatment: "Sukma Laya" }),
      "Halo kak, saya mau reservasi Sukma Laya",
    );
  });

  it("menghapus placeholder kosong/tak dikenal dan merapikan spasi", () => {
    assert.equal(
      fillTemplate("Reservasi {{package}} {{duration}} ({{price}}) ya", {
        package: "All Day Spa",
        duration: null,
        price: "",
      }),
      "Reservasi All Day Spa ya",
    );
    assert.equal(fillTemplate("Tanya promo {{promo}}?", {}), "Tanya promo?");
    assert.equal(fillTemplate("  Halo   {{x}}  kak  "), "Halo kak");
  });

  it("mempertahankan baris baru", () => {
    assert.equal(fillTemplate("Halo kak\n{{treatment}}  ya", { treatment: "A" }), "Halo kak\nA ya");
  });
});

describe("BUILD-18 normalizeWaNumber", () => {
  it("menormalkan ke awalan 62", () => {
    assert.equal(normalizeWaNumber("0813-1605-2040"), "6281316052040");
    assert.equal(normalizeWaNumber("+62 813 1605 2040"), "6281316052040");
    assert.equal(normalizeWaNumber("81316052040"), "6281316052040");
  });

  it("menolak nomor yang tidak masuk akal", () => {
    assert.equal(normalizeWaNumber(""), null);
    assert.equal(normalizeWaNumber("123"), null);
    assert.equal(normalizeWaNumber("+1 555 0100 222"), null);
  });
});

describe("BUILD-18 konteks & teks bawaan", () => {
  it("tujuh konteks sistem tersedia", () => {
    assert.deepEqual(
      WHATSAPP_CONTEXTS.map((c) => c.key),
      ["default", "treatment", "package", "promo", "gift", "membership", "retail"],
    );
    assert.ok(isSystemTemplateKey("promo"));
    assert.ok(!isSystemTemplateKey("lainnya"));
  });

  it("teks bawaan sama dengan pesan hardcode sebelumnya", () => {
    assert.equal(builtInMessage("default"), "Halo kak, saya mau reservasi");
    assert.equal(builtInMessage("membership"), "Halo kak, saya mau join member");
    assert.equal(builtInMessage("gift"), "Halo kak, saya mau beli KAMA Gift Card");
    assert.equal(builtInMessage("retail"), "Halo kak, saya mau pesan produk {{product}}");
  });

  it("placeholder retail menerima alias lama", () => {
    assert.ok(allowedPlaceholders("retail").includes("harga"));
  });
});

describe("BUILD-18 validateTemplate", () => {
  it("menerima template valid", () => {
    assert.deepEqual(validateTemplate("treatment", "Halo, reservasi {{treatment}}"), {
      errors: [],
      warnings: [],
    });
  });

  it("menolak placeholder tak dikenal, pesan kosong, dan terlalu panjang", () => {
    assert.equal(validateTemplate("promo", "Promo {{harga}}").errors.length, 1);
    assert.equal(validateTemplate("default", "Halo {{treatment}}").errors.length, 1);
    assert.ok(validateTemplate("default", "   ").errors.length > 0);
    assert.ok(
      validateTemplate("default", "a".repeat(MAX_TEMPLATE_LENGTH + 1)).errors.length > 0,
    );
  });

  it("menolak kurung kurawal tidak lengkap", () => {
    assert.equal(validateTemplate("treatment", "Halo {{treatment}").errors.length, 1);
  });

  it("memperingatkan bila placeholder utama tidak dipakai", () => {
    const result = validateTemplate("treatment", "Halo kak, saya mau reservasi");
    assert.equal(result.errors.length, 0);
    assert.equal(result.warnings.length, 1);
  });
});

describe("BUILD-18 resolveWhatsAppMessage", () => {
  const values = { promo: "Promo Akhir Pekan" };

  it("pesan khusus konten menang", () => {
    assert.equal(
      resolveWhatsAppMessage({ context: "promo", custom: "Info {{promo}} dong", template: "X", values }),
      "Info Promo Akhir Pekan dong",
    );
  });

  it("lalu template konteks", () => {
    assert.equal(
      resolveWhatsAppMessage({ context: "promo", custom: "  ", template: "Promo {{promo}}?", values }),
      "Promo Promo Akhir Pekan?",
    );
  });

  it("lalu teks bawaan konteks", () => {
    assert.equal(
      resolveWhatsAppMessage({ context: "promo", template: null, values }),
      "Halo kak, saya mau tanya promo Promo Akhir Pekan",
    );
  });

  it("kandidat yang kosong setelah diisi dilewati", () => {
    assert.equal(
      resolveWhatsAppMessage({ context: "default", template: "{{x}}" }),
      "Halo kak, saya mau reservasi",
    );
  });
});
