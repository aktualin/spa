import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SLUG_PATTERN, isValidSlug, slugify } from "../../src/lib/domain/slug.ts";

/** U3 — slug generator & validasi slug. */

describe("U3 slugify", () => {
  it("mengubah teks bebas menjadi slug huruf kecil dengan tanda hubung", () => {
    assert.equal(slugify("Sukma Laya"), "sukma-laya");
    assert.equal(slugify("Sukma Laya — 60 Min"), "sukma-laya-60-min");
    assert.equal(slugify("Chair Body Recovery"), "chair-body-recovery");
  });

  it("menghapus aksen", () => {
    assert.equal(slugify("Urip Padma"), "urip-padma");
    assert.equal(slugify("Samådhåna"), "samadhana");
  });

  it("tidak menghasilkan tanda hubung ganda atau di tepi", () => {
    assert.equal(slugify("  Aura   Royal  "), "aura-royal");
    assert.equal(slugify("Aura---Royal"), "aura-royal");
    assert.equal(slugify("--Aura--"), "aura");
  });

  it("menghasilkan slug kosong untuk teks tanpa karakter valid", () => {
    assert.equal(slugify("!!!"), "");
    assert.equal(slugify(""), "");
  });

  it("hasil slugify selalu valid menurut isValidSlug", () => {
    for (const value of ["Sukma Laya", "Body Massage 60", "Ürip Padma"]) {
      assert.ok(isValidSlug(slugify(value)), value);
    }
  });
});

describe("U3 isValidSlug", () => {
  it("menerima slug huruf kecil, angka, dan tanda hubung", () => {
    assert.ok(isValidSlug("sukma-laya"));
    assert.ok(isValidSlug("chair-spa-2"));
    assert.ok(isValidSlug("a"));
    assert.ok(isValidSlug("60min"));
  });

  it("menolak slug dengan huruf besar, spasi, atau tanda baca", () => {
    assert.equal(isValidSlug("Sukma-Laya"), false);
    assert.equal(isValidSlug("sukma laya"), false);
    assert.equal(isValidSlug("sukma_laya"), false);
    assert.equal(isValidSlug("sukma--laya"), false);
    assert.equal(isValidSlug("-sukma"), false);
    assert.equal(isValidSlug("sukma-"), false);
    assert.equal(isValidSlug(""), false);
  });

  it("pola SLUG_PATTERN konsisten dengan isValidSlug", () => {
    assert.equal(SLUG_PATTERN.test("sukma-laya"), isValidSlug("sukma-laya"));
    assert.equal(SLUG_PATTERN.test("Sukma"), isValidSlug("Sukma"));
  });
});
