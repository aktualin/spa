import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { hashPassword, verifyPassword } from "../../src/lib/password.ts";

/** U9 — hashing & verifikasi kata sandi. */

describe("U9 hashPassword", () => {
  it("hash tidak pernah sama dengan kata sandi asli", async () => {
    const plain = "KamaSpa2026!";
    const hash = await hashPassword(plain);
    assert.notEqual(hash, plain);
    assert.ok(!hash.includes(plain));
  });

  it("format tersimpan adalah scrypt$salt$hash", async () => {
    const hash = await hashPassword("rahasia");
    const parts = hash.split("$");
    assert.equal(parts.length, 3);
    assert.equal(parts[0], "scrypt");
    assert.match(parts[1], /^[0-9a-f]+$/);
    assert.match(parts[2], /^[0-9a-f]+$/);
  });

  it("hash yang sama untuk input sama tetap berbeda (salt acak)", async () => {
    const a = await hashPassword("sama");
    const b = await hashPassword("sama");
    assert.notEqual(a, b);
  });
});

describe("U9 verifyPassword", () => {
  it("kata sandi benar terverifikasi true", async () => {
    const hash = await hashPassword("Budi2026!");
    assert.equal(await verifyPassword("Budi2026!", hash), true);
  });

  it("kata sandi salah terverifikasi false", async () => {
    const hash = await hashPassword("Budi2026!");
    assert.equal(await verifyPassword("budi2026!", hash), false);
    assert.equal(await verifyPassword("", hash), false);
  });

  it("hash dengan format tidak valid ditolak", async () => {
    assert.equal(await verifyPassword("apa saja", "bukan-hash"), false);
    assert.equal(await verifyPassword("apa saja", "scrypt$"), false);
    assert.equal(await verifyPassword("apa saja", "bcrypt$salt$hash"), false);
    assert.equal(await verifyPassword("apa saja", "scrypt$$aa"), false);
  });

  // CATATAN: hash dengan hex rusak ("scrypt$aa$zz") masih lolos verifikasi —
  // bug di src/lib/password.ts yang dilaporkan terpisah (di luar area
  // kepemilikan file agent ini). Test ini sengaja tidak mengunci perilaku itu.

});
