import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  BOOKING_BANNER_DEFAULTS,
  HERO_DEFAULTS,
  displayTitle,
  isPlaceholderTitle,
  isSafeCtaHref,
  isSafeImageUrl,
  resolveBanner,
  validateBannerInput,
} from "../../src/lib/domain/homepage-banner.ts";

/** Banner/hero homepage — validasi isian admin & fallback frontend. */

describe("isSafeCtaHref", () => {
  it("menerima path internal, anchor, dan https", () => {
    assert.equal(isSafeCtaHref("/contact"), true);
    assert.equal(isSafeCtaHref("/menu#packages"), true);
    assert.equal(isSafeCtaHref("/membership?ref=hero"), true);
    assert.equal(isSafeCtaHref("#home_whats_new"), true);
    assert.equal(isSafeCtaHref("https://wa.me/628123"), true);
  });

  it("menolak URL berbahaya atau tidak didukung", () => {
    assert.equal(isSafeCtaHref(""), false);
    assert.equal(isSafeCtaHref("//evil.com"), false);
    assert.equal(isSafeCtaHref("/\\evil.com"), false);
    assert.equal(isSafeCtaHref("javascript:alert(1)"), false);
    assert.equal(isSafeCtaHref("http://kama.id"), false);
    assert.equal(isSafeCtaHref("contact"), false);
    assert.equal(isSafeCtaHref("#"), false);
    assert.equal(isSafeCtaHref("# spasi"), false);
    assert.equal(isSafeCtaHref("/menu page"), false);
    assert.equal(isSafeCtaHref("https://"), false);
    assert.equal(isSafeCtaHref(`/${"a".repeat(600)}`), false);
  });
});

describe("isSafeImageUrl", () => {
  it("hanya menerima https (bucket S3), path lokal ditolak", () => {
    assert.equal(isSafeImageUrl("https://x.supabase.co/storage/v1/a.webp"), true);
    assert.equal(isSafeImageUrl("https://cdn.example.com/img/kama/07-flower-bowl.jpg"), true);
    // Path lokal ditolak: gambar hanya dari bucket S3.
    assert.equal(isSafeImageUrl("/img/kama/07-flower-bowl.jpg"), false);
    assert.equal(isSafeImageUrl("//cdn.evil.com/a.jpg"), false);
    assert.equal(isSafeImageUrl("http://x.com/a.jpg"), false);
    assert.equal(isSafeImageUrl("data:image/png;base64,AAAA"), false);
  });
});

describe("isPlaceholderTitle / displayTitle", () => {
  it("label admin bawaan tidak pernah dipakai sebagai judul tampil", () => {
    assert.equal(isPlaceholderTitle("hero", "Hero"), true);
    assert.equal(isPlaceholderTitle("hero", "  hero "), true);
    assert.equal(isPlaceholderTitle("membership-banner", "Membership Banner"), true);
    assert.equal(isPlaceholderTitle("membership-banner", "Banner Membership"), true);
    assert.equal(isPlaceholderTitle("booking-banner", "Booking Banner"), true);
    assert.equal(isPlaceholderTitle("booking-banner", "Banner Booking"), true);
    assert.equal(isPlaceholderTitle("hero", ""), true);
    assert.equal(isPlaceholderTitle("hero", null), true);
    assert.equal(displayTitle("hero", "Hero"), null);
  });

  it("judul kustom dipakai apa adanya (dipangkas)", () => {
    assert.equal(isPlaceholderTitle("hero", "Rileks di Jakarta"), false);
    assert.equal(displayTitle("hero", "  Rileks di Jakarta "), "Rileks di Jakarta");
  });
});

describe("validateBannerInput", () => {
  it("isian kosong valid dan menyimpan label bawaan sebagai title", () => {
    const result = validateBannerInput("hero", {});
    assert.deepEqual(result, {
      ok: true,
      data: {
        title: "Hero",
        subtitle: null,
        imageUrl: null,
        mobileImageUrl: null,
        imageAlt: null,
        ctaLabel: null,
        ctaHref: null,
      },
    });
  });

  it("hero boleh mengganti gambar tanpa alt (dekoratif)", () => {
    const result = validateBannerInput("hero", { imageUrl: "https://x.co/a.webp" });
    assert.equal(result.ok, true);
  });

  it("membership wajib alt bila gambar utama atau mobile diisi", () => {
    const a = validateBannerInput("membership-banner", { imageUrl: "https://x.co/a.webp" });
    assert.equal(a.ok, false);
    const b = validateBannerInput("membership-banner", {
      mobileImageUrl: "https://x.co/m.webp",
      imageAlt: "  ",
    });
    assert.equal(b.ok, false);
    const c = validateBannerInput("membership-banner", {
      imageUrl: "https://x.co/a.webp",
      imageAlt: "Ruang perawatan",
    });
    assert.equal(c.ok, true);
  });

  it("label & tujuan tombol harus berpasangan", () => {
    assert.equal(validateBannerInput("booking-banner", { ctaLabel: "Hubungi" }).ok, false);
    assert.equal(validateBannerInput("booking-banner", { ctaHref: "/contact" }).ok, false);
    assert.equal(
      validateBannerInput("booking-banner", { ctaLabel: "Hubungi", ctaHref: "/contact" }).ok,
      true,
    );
  });

  it("menolak tujuan tombol yang tidak aman", () => {
    const result = validateBannerInput("hero", { ctaLabel: "Klik", ctaHref: "//evil.com" });
    assert.equal(result.ok, false);
  });

  it("menolak URL gambar yang tidak aman", () => {
    const result = validateBannerInput("hero", { imageUrl: "javascript:alert(1)" });
    assert.equal(result.ok, false);
  });

  it("menegakkan batas panjang", () => {
    assert.equal(validateBannerInput("hero", { title: "a".repeat(121) }).ok, false);
    assert.equal(validateBannerInput("hero", { title: "a".repeat(120) }).ok, true);
    assert.equal(
      validateBannerInput("hero", { ctaLabel: "a".repeat(41), ctaHref: "/" }).ok,
      false,
    );
  });

  it("mengabaikan field yang tidak relevan (booking tanpa gambar & subjudul)", () => {
    const result = validateBannerInput("booking-banner", {
      title: "Ada pertanyaan?",
      subtitle: "abaikan",
      imageUrl: "https://x.co/a.webp",
    });
    assert.ok(result.ok);
    assert.equal(result.data.title, "Ada pertanyaan?");
    assert.equal(result.data.subtitle, null);
    assert.equal(result.data.imageUrl, null);
  });
});

describe("resolveBanner", () => {
  const legacyHero = {
    key: "hero",
    title: "Hero",
    subtitle: null,
    imageUrl: null,
    mobileImageUrl: null,
    imageAlt: null,
    ctaLabel: null,
    ctaHref: null,
  };

  it("section tanpa isian → nilai bawaan persis", () => {
    assert.deepEqual(resolveBanner(legacyHero, HERO_DEFAULTS), {
      ...HERO_DEFAULTS,
      mobileImageUrl: null,
    });
    assert.deepEqual(resolveBanner(undefined, BOOKING_BANNER_DEFAULTS), {
      ...BOOKING_BANNER_DEFAULTS,
      mobileImageUrl: null,
    });
  });

  it("memakai isian admin bila ada", () => {
    const resolved = resolveBanner(
      {
        ...legacyHero,
        title: "Rileks di Jakarta",
        subtitle: "Pijat • Spa",
        imageUrl: "https://x.co/a.webp",
        mobileImageUrl: "https://x.co/m.webp",
        ctaLabel: "Pesan",
        ctaHref: "/booking",
      },
      HERO_DEFAULTS,
    );
    assert.deepEqual(resolved, {
      title: "Rileks di Jakarta",
      subtitle: "Pijat • Spa",
      imageUrl: "https://x.co/a.webp",
      imageAlt: "",
      ctaLabel: "Pesan",
      ctaHref: "/booking",
      mobileImageUrl: "https://x.co/m.webp",
    });
  });

  it("alt bawaan dipakai untuk gambar bawaan, alt admin bila diisi", () => {
    const defaults = { ...HERO_DEFAULTS, imageUrl: "https://cdn.example.com/img/a.jpg", imageAlt: "Bawaan" };
    assert.equal(resolveBanner(legacyHero, defaults).imageAlt, "Bawaan");
    assert.equal(
      resolveBanner({ ...legacyHero, imageUrl: "https://x.co/a.webp" }, defaults).imageAlt,
      "",
    );
    assert.equal(
      resolveBanner({ ...legacyHero, imageAlt: "Kustom" }, defaults).imageAlt,
      "Kustom",
    );
  });

  it("CTA tidak lengkap atau tidak aman → tombol bawaan", () => {
    assert.equal(resolveBanner({ ...legacyHero, ctaLabel: "Pesan" }, HERO_DEFAULTS).ctaHref, "/contact");
    const unsafe = resolveBanner(
      { ...legacyHero, ctaLabel: "Pesan", ctaHref: "javascript:alert(1)" },
      HERO_DEFAULTS,
    );
    assert.equal(unsafe.ctaLabel, "Book Now");
    assert.equal(unsafe.ctaHref, "/contact");
  });
});
