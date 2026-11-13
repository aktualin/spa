import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildNewsletterCampaignEmail,
  generateUnsubscribeToken,
  validateNewsletterCampaignInput,
  validateNewsletterSettingsInput,
  validateNewsletterSubscribe,
} from "../../src/lib/domain/newsletter.ts";

describe("validateNewsletterSubscribe", () => {
  it("accepts a valid email and lowercases it", () => {
    const result = validateNewsletterSubscribe({ email: "Foo@Bar.com" });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.data.email, "foo@bar.com");
  });

  it("rejects an invalid email", () => {
    const result = validateNewsletterSubscribe({ email: "not-an-email" });
    assert.equal(result.ok, false);
  });

  it("rejects a missing email", () => {
    const result = validateNewsletterSubscribe({});
    assert.equal(result.ok, false);
  });

  it("passes through honeypot and branchSlug untouched", () => {
    const result = validateNewsletterSubscribe({
      email: "a@b.com",
      branchSlug: "kramat-pela",
      website: "bot-filled",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.branchSlug, "kramat-pela");
      assert.equal(result.data.website, "bot-filled");
    }
  });

  it("rejects an email over the length limit", () => {
    const longEmail = `${"a".repeat(250)}@b.com`;
    const result = validateNewsletterSubscribe({ email: longEmail });
    assert.equal(result.ok, false);
  });
});

describe("generateUnsubscribeToken", () => {
  it("returns a non-empty, URL-safe, unique token each time", () => {
    const a = generateUnsubscribeToken();
    const b = generateUnsubscribeToken();
    assert.ok(a.length > 0);
    assert.notEqual(a, b);
    assert.match(a, /^[A-Za-z0-9_-]+$/);
  });
});

describe("validateNewsletterCampaignInput", () => {
  it("accepts a minimal valid campaign", () => {
    const result = validateNewsletterCampaignInput({
      subject: "Promo Akhir Tahun",
      previewText: "",
      bodyHtml: "<p>Halo</p>",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.subject, "Promo Akhir Tahun");
      assert.equal(result.data.previewText, null);
    }
  });

  it("rejects an empty subject", () => {
    const result = validateNewsletterCampaignInput({
      subject: "   ",
      previewText: "",
      bodyHtml: "<p>Halo</p>",
    });
    assert.equal(result.ok, false);
  });

  it("rejects an empty body", () => {
    const result = validateNewsletterCampaignInput({
      subject: "Subjek",
      previewText: "",
      bodyHtml: "",
    });
    assert.equal(result.ok, false);
  });

  it("rejects a subject over the length limit", () => {
    const result = validateNewsletterCampaignInput({
      subject: "a".repeat(200),
      previewText: "",
      bodyHtml: "<p>Halo</p>",
    });
    assert.equal(result.ok, false);
  });
});

describe("validateNewsletterSettingsInput", () => {
  it("accepts empty optional fields, converting to null", () => {
    const result = validateNewsletterSettingsInput({
      headerHtml: "",
      footerHtml: "",
      senderName: "",
      replyTo: "",
      physicalAddress: "",
      unsubscribeNotice: "",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.headerHtml, null);
      assert.equal(result.data.replyTo, null);
    }
  });

  it("rejects an invalid reply-to email", () => {
    const result = validateNewsletterSettingsInput({
      headerHtml: "",
      footerHtml: "",
      senderName: "",
      replyTo: "not-an-email",
      physicalAddress: "",
      unsubscribeNotice: "",
    });
    assert.equal(result.ok, false);
  });
});

describe("buildNewsletterCampaignEmail", () => {
  const base = {
    subject: "Subjek Kampanye",
    previewText: "Lihat promo terbaru",
    bodyHtml: "<p>Isi kampanye dengan <a href=\"https://kamaspa.id\">tautan</a>.</p>",
    headerHtml: "<p>Header global</p>",
    footerHtml: "<p>Footer global</p>",
    unsubscribeUrl: "https://kamaspa.id/api/newsletter-unsubscribe?token=abc123",
    physicalAddress: "Jl. Contoh No. 1, Jakarta Selatan",
    unsubscribeNotice: "Anda menerima email ini karena berlangganan newsletter KAMA Spa.",
  };

  it("wraps header, body, and footer in that order", () => {
    const { html } = buildNewsletterCampaignEmail(base);
    const headerIndex = html.indexOf("Header global");
    const bodyIndex = html.indexOf("Isi kampanye");
    const footerIndex = html.indexOf("Footer global");
    assert.ok(headerIndex > -1 && bodyIndex > -1 && footerIndex > -1);
    assert.ok(headerIndex < bodyIndex);
    assert.ok(bodyIndex < footerIndex);
  });

  it("injects a hidden preheader with the preview text", () => {
    const { html } = buildNewsletterCampaignEmail(base);
    assert.match(html, /display:none[^>]*>Lihat promo terbaru/);
  });

  it("includes the unsubscribe link in the html", () => {
    const { html } = buildNewsletterCampaignEmail(base);
    assert.ok(html.includes(base.unsubscribeUrl));
  });

  it("produces a plain-text fallback without HTML tags, including the unsubscribe URL", () => {
    const { text } = buildNewsletterCampaignEmail(base);
    assert.ok(!/<[a-z][\s\S]*>/i.test(text));
    assert.ok(text.includes(base.unsubscribeUrl));
  });

  it("works without an optional header/footer", () => {
    const { html } = buildNewsletterCampaignEmail({
      ...base,
      headerHtml: null,
      footerHtml: null,
      physicalAddress: null,
      unsubscribeNotice: null,
    });
    assert.ok(html.includes("Isi kampanye"));
    assert.ok(html.includes(base.unsubscribeUrl));
  });
});
