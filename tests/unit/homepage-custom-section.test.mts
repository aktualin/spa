import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  customSectionKey,
  isCustomSectionKey,
  sectionKeyLabel,
} from "../../src/app/admin/homepage/homepage-sections.ts";

describe("section konten bebas homepage", () => {
  it("nama → key custom-<slug> yang rapi", () => {
    assert.equal(customSectionKey("Ritual Musim Hujan 2026!"), "custom-ritual-musim-hujan-2026");
    assert.equal(customSectionKey("  Café   Spa  "), "custom-cafe-spa");
    assert.equal(customSectionKey("!!!"), null);
  });

  it("hanya key custom-… yang dianggap section konten (boleh dihapus)", () => {
    assert.equal(isCustomSectionKey("custom-promo"), true);
    assert.equal(isCustomSectionKey("hero"), false);
    assert.equal(isCustomSectionKey("custom-"), false);
    assert.equal(isCustomSectionKey("custom-Promo"), false);
  });

  it("label admin untuk section konten", () => {
    assert.equal(sectionKeyLabel("custom-promo"), "Section konten");
    assert.equal(sectionKeyLabel("hero"), "Hero");
  });
});
