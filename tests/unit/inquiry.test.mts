import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  extractClientIp,
  isFilledTooFast,
  isHoneypotFilled,
  validateInquiry,
} from "../../src/lib/domain/inquiry.ts";

/** Payload minimal yang valid — dipakai sebagai dasar tiap kasus. */
function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: "Roy Pratama",
    email: "roy@perusahaan.co.id",
    message: "Kami ingin program wellness untuk 30 karyawan.",
    ...overrides,
  };
}

describe("U13 validateInquiry", () => {
  it("menerima payload minimal yang valid", () => {
    const result = validateInquiry(validPayload());
    assert.equal(result.ok, true);
  });

  it("menolak nama kosong", () => {
    const result = validateInquiry(validPayload({ name: "" }));
    assert.equal(result.ok, false);
  });

  it("menolak email tidak valid", () => {
    const result = validateInquiry(validPayload({ email: "bukan-email" }));
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /email/i);
  });

  it("menolak pesan yang terlalu singkat", () => {
    const result = validateInquiry(validPayload({ message: "halo" }));
    assert.equal(result.ok, false);
  });

  it("menolak pesan yang melebihi 5000 karakter", () => {
    const result = validateInquiry(
      validPayload({ message: "a".repeat(5001) }),
    );
    assert.equal(result.ok, false);
  });

  it("mengubah field opsional yang kosong menjadi undefined", () => {
    const result = validateInquiry(
      validPayload({ company: "", phone: "", website: "" }),
    );
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.company, undefined);
      assert.equal(result.data.phone, undefined);
      assert.equal(result.data.website, undefined);
    }
  });

  it("menolak input yang bukan objek", () => {
    assert.equal(validateInquiry(null).ok, false);
    assert.equal(validateInquiry("teks").ok, false);
  });
});

describe("U13 isHoneypotFilled", () => {
  it("field kosong berarti bukan bot", () => {
    assert.equal(isHoneypotFilled(""), false);
    assert.equal(isHoneypotFilled("   "), false);
    assert.equal(isHoneypotFilled(undefined), false);
  });

  it("field terisi berarti bot", () => {
    assert.equal(isHoneypotFilled("https://spam.example"), true);
  });
});

describe("U13 isFilledTooFast", () => {
  const NOW = 1_000_000;

  it("submit di bawah 3 detik dianggap bot", () => {
    assert.equal(isFilledTooFast(NOW - 500, NOW), true);
  });

  it("submit setelah 3 detik lebih diterima", () => {
    assert.equal(isFilledTooFast(NOW - 10_000, NOW), false);
  });

  it("startedAt yang tidak dikirim tidak memblokir submit", () => {
    assert.equal(isFilledTooFast(undefined, NOW), false);
    assert.equal(isFilledTooFast("bukan angka", NOW), false);
  });
});

describe("U13 extractClientIp", () => {
  /** Header palsu dengan antarmuka `get()` yang sama dengan `Headers`. */
  function headers(map: Record<string, string>) {
    return { get: (name: string) => map[name.toLowerCase()] ?? null };
  }

  it("mengambil IP pertama dari x-forwarded-for", () => {
    const ip = extractClientIp(
      headers({ "x-forwarded-for": "203.0.113.5, 70.41.3.18" }),
    );
    assert.equal(ip, "203.0.113.5");
  });

  it("jatuh ke x-real-ip bila x-forwarded-for tidak ada", () => {
    const ip = extractClientIp(headers({ "x-real-ip": "203.0.113.9" }));
    assert.equal(ip, "203.0.113.9");
  });

  it('mengembalikan "unknown" bila tidak ada header IP', () => {
    assert.equal(extractClientIp(headers({})), "unknown");
  });
});
