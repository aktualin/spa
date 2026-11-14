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
  const MESSAGE = "Halo kak, saya mau reservasi";

  it("meng-encode pesan ke dalam URL wa.me dengan nomor yang diberikan", () => {
    const link = waLink(MESSAGE, "6281316052040");
    assert.ok(link.startsWith("https://wa.me/6281316052040?text="));
    assert.ok(link.includes("Halo%20kak"));
  });

  it("nomor boleh ditulis dengan tanda baca; dirapikan ke digit saja", () => {
    assert.ok(
      waLink(MESSAGE, "+62 813-1605-2040").startsWith("https://wa.me/6281316052040?text="),
    );
  });

  it("memakai nomor PIC bila admin mengisinya", () => {
    assert.ok(
      corporateWhatsApp("0812-3456-7890", "6281314856565", MESSAGE)?.startsWith(
        "https://wa.me/6281234567890",
      ),
    );
  });

  it("jatuh ke nomor situs bila nomor PIC tidak masuk akal", () => {
    assert.ok(
      corporateWhatsApp("123", "6281314856565", MESSAGE)?.startsWith(
        "https://wa.me/6281314856565",
      ),
    );
  });

  it("jatuh ke nomor situs bila PIC kosong", () => {
    for (const pic of [null, undefined, "", "   "]) {
      assert.ok(
        corporateWhatsApp(pic, "0813-1485-6565", MESSAGE)?.startsWith(
          "https://wa.me/6281314856565",
        ),
      );
    }
  });

  it("null bila kedua nomor kosong — tombol disembunyikan, bukan link rusak", () => {
    assert.equal(corporateWhatsApp(null, null, MESSAGE), null);
    assert.equal(corporateWhatsApp(undefined, "", MESSAGE), null);
    assert.equal(corporateWhatsApp("123", "abc", MESSAGE), null);
  });

  it("pesan tetap ter-encode pada link corporate", () => {
    const link = corporateWhatsApp("0812-3456-7890", null, MESSAGE);
    assert.ok(link?.includes("text=Halo%20kak"));
  });
});
