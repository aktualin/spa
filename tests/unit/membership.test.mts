import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { membership as homeMembership } from "../../src/data/content.ts";
import { membership as pageMembership } from "../../src/data/pages.ts";
import {
  PROGRAM_LIMITS,
  readBenefits,
  readServices,
  staticMembershipProgram,
  validateProgramInput,
  type ProgramInput,
} from "../../src/lib/domain/membership.ts";

function input(overrides: Partial<ProgramInput> = {}): ProgramInput {
  return {
    eyebrow: "Membership",
    title: "Judul",
    intro: "Intro",
    priceHeadline: "Just Rp 1.5jt a month.",
    bannerBody: "Body",
    servicesIntro: "Intro layanan",
    benefitTitles: ["Benefit A", ""],
    benefitBodies: ["Isi A", ""],
    serviceNames: ["Face Ritual"],
    serviceDescriptions: ["Wajah"],
    ...overrides,
  };
}

describe("staticMembershipProgram", () => {
  it("sama dengan konten statis lama (tampilan tidak berubah)", () => {
    const p = staticMembershipProgram();
    assert.equal(p.title, pageMembership.title);
    assert.equal(p.priceHeadline, pageMembership.price);
    assert.equal(p.priceHeadline, homeMembership.price);
    assert.equal(p.bannerBody, homeMembership.body);
    assert.deepEqual(p.benefits, pageMembership.benefits);
    assert.deepEqual(p.services, pageMembership.services);
    assert.equal(p.termsHtml, null);
  });
});

describe("readBenefits & readServices", () => {
  it("membuang entri rusak dari kolom JSON", () => {
    assert.deepEqual(readBenefits([{ title: "A", body: "x" }, { title: "" }, null, "x", { title: "B" }]), [
      { title: "A", body: "x" },
      { title: "B", body: "" },
    ]);
    assert.deepEqual(readBenefits({ title: "A" }), []);
    assert.deepEqual(readServices([{ name: "S", description: 1 }, { description: "x" }]), [
      { name: "S", description: "" },
    ]);
  });
});

describe("validateProgramInput", () => {
  it("menerima isian valid dan membuang baris kosong", () => {
    const r = validateProgramInput(input());
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.deepEqual(r.data.benefits, [{ title: "Benefit A", body: "Isi A" }]);
      assert.deepEqual(r.data.services, [{ name: "Face Ritual", description: "Wajah" }]);
    }
  });

  it("menolak field wajib kosong dan teks terlalu panjang", () => {
    assert.equal(validateProgramInput(input({ title: "  " })).ok, false);
    assert.equal(validateProgramInput(input({ priceHeadline: "x".repeat(PROGRAM_LIMITS.priceHeadline + 1) })).ok, false);
  });

  it("menolak benefit tanpa judul, tanpa benefit, atau terlalu banyak", () => {
    const noTitle = validateProgramInput(input({ benefitTitles: [""], benefitBodies: ["isi"] }));
    assert.equal(noTitle.ok, false);
    if (!noTitle.ok) assert.match(noTitle.error, /Benefit baris 1/);
    assert.equal(validateProgramInput(input({ benefitTitles: [], benefitBodies: [] })).ok, false);
    const many = Array.from({ length: PROGRAM_LIMITS.maxBenefits + 1 }, (_, i) => `B${i}`);
    assert.equal(validateProgramInput(input({ benefitTitles: many, benefitBodies: [] })).ok, false);
  });

  it("essential services boleh kosong", () => {
    assert.equal(validateProgramInput(input({ serviceNames: [], serviceDescriptions: [] })).ok, true);
  });
});
