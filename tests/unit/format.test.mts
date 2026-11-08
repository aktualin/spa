import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatIdr } from "../../src/lib/format.ts";
import { toWaNumber, waLink, corporateWhatsApp } from "../../src/lib/whatsapp.ts";

describe("U12 formatIdr", () => {
  it("memberi pemisah ribuan dan spasi setelah Rp", () => {
    assert.equal(formatIdr(145000), "Rp 145.000");
  });

  it("memformat nilai jutaan", () => {
    assert.equal(formatIdr(1500000), "Rp 1.500.000");
  });

  it("memformat nol", () => {
    assert.equal(formatIdr(0), "Rp 0");
  });

  it("tidak menampilkan angka desimal", () => {
    assert.ok(!formatIdr(145000.75).includes(","));
  });
});

describe("U12 toWaNumber", () => {
  it("mengubah awalan 0 menjadi 62", () => {
    assert.equal(toWaNumber("081316052040"), "6281316052040");
  });

  it("membuang tanda baca dan plus", () => {
    assert.equal(toWaNumber("+62 813-1605-2040"), "6281316052040");
  });

  it("melengkapi nomor yang diawali 8", () => {
    assert.equal(toWaNumber("81316052040"), "6281316052040");
  });

  it("membiarkan nomor yang sudah benar", () => {
    assert.equal(toWaNumber("6281316052040"), "6281316052040");
  });

  it("menolak nilai kosong", () => {
    assert.equal(toWaNumber(null), null);
    assert.equal(toWaNumber(undefined), null);
    assert.equal(toWaNumber("   "), null);
  });

  it("menolak nomor yang terlalu pendek atau terlalu panjang", () => {
    assert.equal(toWaNumber("62812"), null);
    assert.equal(toWaNumber("6281316052040123456"), null);
  });

  it("menolak nomor non-Indonesia", () => {
    assert.equal(toWaNumber("+1 415 555 2671"), null);
  });
});

describe("U12 waLink & corporateWhatsApp", () => {
  it("meng-encode pesan ke dalam URL wa.me", () => {
    const link = waLink("Halo kak, saya mau reservasi");
    assert.ok(link.startsWith("https://wa.me/6281316052040?text="));
    assert.ok(link.includes("Halo%20kak"));
  });

  it("memakai nomor corporate sebagai default", () => {
    assert.ok(corporateWhatsApp().startsWith("https://wa.me/6281314856565"));
  });

  it("memakai nomor PIC bila admin mengisinya", () => {
    assert.ok(
      corporateWhatsApp("0812-3456-7890").startsWith(
        "https://wa.me/6281234567890",
      ),
    );
  });

  it("jatuh ke nomor corporate bila nomor PIC tidak masuk akal", () => {
    assert.ok(corporateWhatsApp("123").startsWith("https://wa.me/6281314856565"));
  });
});
