import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isWhatsAppHref, safeTrackLabel } from "../../src/lib/domain/analytics.ts";

describe("analytics", () => {
  it("mengenali tautan WhatsApp", () => {
    assert.equal(isWhatsAppHref("https://wa.me/6281?text=hai"), true);
    assert.equal(isWhatsAppHref("https://api.whatsapp.com/send?phone=1"), true);
    assert.equal(isWhatsAppHref("https://example.com/wa.me"), false);
    assert.equal(isWhatsAppHref("/contact"), false);
    assert.equal(isWhatsAppHref(null), false);
  });

  it("label aman, selain itu unknown", () => {
    assert.equal(safeTrackLabel("Treatment"), "treatment");
    assert.equal(safeTrackLabel("corporate_inquiry"), "corporate_inquiry");
    assert.equal(safeTrackLabel("Halo kak 0812"), "unknown");
    assert.equal(safeTrackLabel(null), "unknown");
  });
});
