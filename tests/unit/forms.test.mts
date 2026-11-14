import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isBotSubmission,
  validateNewsletter,
  validateReservation,
} from "../../src/lib/domain/forms.ts";

/** Formulir publik newsletter & reservasi: validasi murni + pertahanan bot. */

function newsletter(overrides: Record<string, unknown> = {}) {
  return {
    email: "tamu@contoh.id",
    website: "",
    elapsedMs: 5000,
    ...overrides,
  };
}

function reservation(overrides: Record<string, unknown> = {}) {
  return {
    name: "Budi",
    phone: "0813-1605-2040",
    website: "",
    elapsedMs: 5000,
    ...overrides,
  };
}

describe("validateNewsletter", () => {
  it("menerima isian minimal dan mengisi data yang sudah dirapikan", () => {
    const result = validateNewsletter(newsletter());
    assert.ok(result.ok);
    if (!result.ok) return;
    assert.equal(result.data.email, "tamu@contoh.id");
    assert.equal(result.data.name, undefined);
    assert.equal(result.data.branchSlug, undefined);
  });

  it("trim email, nama, dan cabang; nama & cabang opsional", () => {
    const result = validateNewsletter(
      newsletter({ email: "  Tamu@Contoh.id  ", name: "  Budi  ", branchSlug: " kemang " }),
    );
    assert.ok(result.ok);
    if (!result.ok) return;
    assert.equal(result.data.email, "Tamu@Contoh.id");
    assert.equal(result.data.name, "Budi");
    assert.equal(result.data.branchSlug, "kemang");
  });

  it("menolak email kosong atau salah format", () => {
    for (const email of ["", "   ", "bukan-email", "a@b", "@contoh.id"]) {
      const result = validateNewsletter(newsletter({ email }));
      assert.equal(result.ok, false, email);
      if (!result.ok) assert.equal(result.error, "Format email tidak valid.");
    }
    assert.equal(validateNewsletter({ website: "", elapsedMs: 5000 }).ok, false);
  });

  it("menolak nama lebih dari 120 karakter dan cabang lebih dari 60", () => {
    assert.equal(validateNewsletter(newsletter({ name: "x".repeat(120) })).ok, true);
    const nama = validateNewsletter(newsletter({ name: "x".repeat(121) }));
    assert.equal(nama.ok, false);
    if (!nama.ok) assert.equal(nama.error, "Nama maks. 120 karakter.");
    assert.equal(validateNewsletter(newsletter({ branchSlug: "x".repeat(61) })).ok, false);
  });

  it("honeypot terisi ditolak dengan pesan generik", () => {
    const result = validateNewsletter(newsletter({ website: "http://spam.example" }));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error, "Terjadi kesalahan. Coba lagi.");
  });

  it("elapsedMs wajib angka bulat 0..86_400_000", () => {
    assert.equal(validateNewsletter(newsletter({ elapsedMs: 0 })).ok, true);
    assert.equal(validateNewsletter(newsletter({ elapsedMs: 86_400_000 })).ok, true);
    for (const elapsedMs of [undefined, -1, 1.5, 86_400_001, "5000", NaN]) {
      assert.equal(validateNewsletter(newsletter({ elapsedMs })).ok, false, String(elapsedMs));
    }
  });

  it("bukan objek → ditolak, tidak melempar", () => {
    for (const raw of [null, undefined, "x", 42, []]) {
      assert.equal(validateNewsletter(raw).ok, false);
    }
  });
});

describe("validateReservation", () => {
  it("menerima isian minimal (nama + telepon)", () => {
    const result = validateReservation(reservation());
    assert.ok(result.ok);
    if (!result.ok) return;
    assert.equal(result.data.name, "Budi");
    assert.equal(result.data.phone, "0813-1605-2040");
    assert.equal(result.data.email, undefined);
    assert.equal(result.data.message, undefined);
  });

  it("trim semua isian; email kosong diperbolehkan, pesan opsional", () => {
    const result = validateReservation(
      reservation({
        name: "  Budi  ",
        phone: " +62 813-1605-2040 ",
        email: "  ",
        message: "  Mau reservasi besok  ",
        branchSlug: " kemang ",
      }),
    );
    assert.ok(result.ok);
    if (!result.ok) return;
    assert.equal(result.data.name, "Budi");
    assert.equal(result.data.phone, "+62 813-1605-2040");
    assert.equal(result.data.email, "");
    assert.equal(result.data.message, "Mau reservasi besok");
    assert.equal(result.data.branchSlug, "kemang");
  });

  it("menerima email valid bila diisi", () => {
    const result = validateReservation(reservation({ email: "Tamu@Contoh.id" }));
    assert.ok(result.ok);
    if (result.ok) assert.equal(result.data.email, "Tamu@Contoh.id");
  });

  it("nama wajib, maks 120 karakter", () => {
    const kosong = validateReservation(reservation({ name: "   " }));
    assert.equal(kosong.ok, false);
    if (!kosong.ok) assert.equal(kosong.error, "Nama wajib diisi.");
    assert.equal(validateReservation(reservation({ name: "x".repeat(120) })).ok, true);
    const panjang = validateReservation(reservation({ name: "x".repeat(121) }));
    assert.equal(panjang.ok, false);
    if (!panjang.ok) assert.equal(panjang.error, "Nama maks. 120 karakter.");
    assert.equal(validateReservation({ phone: "081316052040", website: "", elapsedMs: 5000 }).ok, false);
  });

  it("telepon wajib 8–15 digit; huruf dan nomor pendek ditolak", () => {
    for (const phone of ["", "123", "0813abc", "+62 813 1605 2040 1234 567"]) {
      const result = validateReservation(reservation({ phone }));
      assert.equal(result.ok, false, phone);
      if (!result.ok) assert.equal(result.error, "Nomor telepon tidak valid (8–15 digit).");
    }
    assert.equal(validateReservation(reservation({ phone: "+62 813 1605 2040" })).ok, true);
  });

  it("email salah format ditolak", () => {
    const result = validateReservation(reservation({ email: "bukan-email" }));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error, "Format email tidak valid.");
  });

  it("pesan maks 1000 karakter; cabang maks 60", () => {
    assert.equal(validateReservation(reservation({ message: "x".repeat(1000) })).ok, true);
    const pesan = validateReservation(reservation({ message: "x".repeat(1001) }));
    assert.equal(pesan.ok, false);
    if (!pesan.ok) assert.equal(pesan.error, "Pesan maks. 1000 karakter.");
    assert.equal(validateReservation(reservation({ branchSlug: "x".repeat(61) })).ok, false);
  });

  it("honeypot terisi ditolak dengan pesan generik", () => {
    const result = validateReservation(reservation({ website: "isi-bot" }));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error, "Terjadi kesalahan. Coba lagi.");
  });

  it("elapsedMs wajib angka bulat 0..86_400_000", () => {
    assert.equal(validateReservation(reservation({ elapsedMs: 86_400_000 })).ok, true);
    for (const elapsedMs of [undefined, -1, 2.5, 86_400_001]) {
      assert.equal(validateReservation(reservation({ elapsedMs })).ok, false, String(elapsedMs));
    }
  });
});

describe("isBotSubmission", () => {
  it("honeypot terisi → bot, walau pengisian lambat", () => {
    assert.equal(isBotSubmission({ website: "http://spam.example", elapsedMs: 60_000 }), true);
    // Spasi pun dianggap terisi (form asli selalu mengirim string kosong).
    assert.equal(isBotSubmission({ website: " ", elapsedMs: 60_000 }), true);
  });

  it("terlalu cepat (< 3000 ms) → bot", () => {
    assert.equal(isBotSubmission({ website: "", elapsedMs: 0 }), true);
    assert.equal(isBotSubmission({ website: "", elapsedMs: 2999 }), true);
  });

  it("tepat di batas 3000 ms dan honeypot kosong → manusia", () => {
    assert.equal(isBotSubmission({ website: "", elapsedMs: 3000 }), false);
    assert.equal(isBotSubmission({ website: "", elapsedMs: 5000 }), false);
    assert.equal(isBotSubmission({ elapsedMs: 10_000 }), false);
  });

  it("kedua pertahanan independen: cepat + honeypot tetap bot", () => {
    assert.equal(isBotSubmission({ website: "x", elapsedMs: 100 }), true);
  });
});