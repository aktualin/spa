import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { planCompression, renameForWebp } from "../../src/lib/domain/image-compress.ts";

describe("planCompression", () => {
  it("melewatkan GIF, gambar kecil, dan tipe lain", () => {
    assert.equal(planCompression({ type: "image/gif", size: 9_000_000, width: 4000, height: 3000 }), null);
    assert.equal(planCompression({ type: "image/jpeg", size: 100_000, width: 1200, height: 800 }), null);
    assert.equal(planCompression({ type: "image/avif", size: 3_000_000, width: 4000, height: 3000 }), null);
  });

  it("memperkecil gambar besar dengan menjaga rasio", () => {
    const plan = planCompression({ type: "image/jpeg", size: 3_500_000, width: 4800, height: 3200 });
    assert.deepEqual(plan && [plan.width, plan.height, plan.mime], [2400, 1600, "image/webp"]);
  });

  it("mengompres berkas berat walau dimensinya wajar", () => {
    const plan = planCompression({ type: "image/png", size: 2_000_000, width: 1600, height: 900 });
    assert.deepEqual(plan && [plan.width, plan.height], [1600, 900]);
  });

  it("nama berkas diganti ke .webp", () => {
    assert.equal(renameForWebp("Foto Spa.PNG"), "Foto Spa.webp");
    assert.equal(renameForWebp(""), "gambar.webp");
  });
});
