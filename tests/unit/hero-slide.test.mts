import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  HERO_SLIDE_LIMITS,
  isSafeVideoUrl,
  resolveHeroSlides,
  validateHeroSlideInput,
  type HeroSlideRowLike,
} from "../../src/lib/domain/hero-slide.ts";

/** Slider media hero — validasi admin & pemilihan slide publik. */

function row(partial: Partial<HeroSlideRowLike> & { id: string }): HeroSlideRowLike {
  return {
    mediaType: "IMAGE",
    imageUrl: "https://cdn.example.com/img/kama/01-incense.jpg",
    isPublished: true,
    sortOrder: 0,
    ...partial,
  };
}

describe("isSafeVideoUrl", () => {
  it("hanya menerima file langsung https (bucket S3)", () => {
    assert.equal(isSafeVideoUrl("https://cdn.example.com/video/incense-smoke.mp4"), true);
    assert.equal(isSafeVideoUrl("https://cdn.example.com/video/incense-smoke.webm"), true);
    // Path lokal ditolak: video hanya dari bucket S3.
    assert.equal(isSafeVideoUrl("/video/incense-smoke.mp4"), false);
    assert.equal(isSafeVideoUrl("https://cdn.kama.id/hero.mp4"), true);
    assert.equal(isSafeVideoUrl("https://cdn.kama.id/hero.webm?token=abc"), true);
    assert.equal(isSafeVideoUrl("https://cdn.kama.id/HERO.MP4"), true);
  });

  it("menolak halaman, protokol, dan ekstensi yang tidak didukung", () => {
    assert.equal(isSafeVideoUrl(""), false);
    assert.equal(isSafeVideoUrl("https://youtu.be/abc"), false);
    assert.equal(isSafeVideoUrl("https://vimeo.com/123"), false);
    assert.equal(isSafeVideoUrl("http://cdn.kama.id/hero.mp4"), false);
    assert.equal(isSafeVideoUrl("javascript:alert(1)"), false);
    assert.equal(isSafeVideoUrl("https://cdn.example.com/video/hero.mov"), false);
    assert.equal(isSafeVideoUrl("https://cdn.kama.id/hero.mp4?x=1 2"), false);
    assert.equal(isSafeVideoUrl(`https://cdn.example.com/video/${"a".repeat(1000)}.mp4`), false);
  });
});

describe("validateHeroSlideInput", () => {
  it("foto valid tanpa field opsional", () => {
    assert.deepEqual(
      validateHeroSlideInput({
        mediaType: "IMAGE",
        imageUrl: "https://cdn.example.com/img/kama/01-incense.jpg",
        isPublished: true,
      }),
      {
        ok: true,
        data: {
          mediaType: "IMAGE",
          imageUrl: "https://cdn.example.com/img/kama/01-incense.jpg",
          mobileImageUrl: null,
          videoUrl: null,
          imageAlt: null,
          isPublished: true,
        },
      },
    );
  });

  it("video wajib punya poster dan file .mp4/.webm", () => {
    assert.equal(
      validateHeroSlideInput({
        mediaType: "VIDEO",
        videoUrl: "https://cdn.example.com/video/hero.mp4",
        isPublished: true,
      }).ok,
      false,
    );
    assert.equal(
      validateHeroSlideInput({
        mediaType: "VIDEO",
        imageUrl: "https://cdn.example.com/img/kama/poster.jpg",
        videoUrl: "https://youtu.be/abc",
        isPublished: true,
      }).ok,
      false,
    );
    assert.equal(
      validateHeroSlideInput({
        mediaType: "VIDEO",
        imageUrl: "https://cdn.example.com/img/kama/poster.jpg",
        videoUrl: "https://cdn.example.com/video/hero.mp4",
        isPublished: true,
      }).ok,
      true,
    );
  });

  it("mengabaikan video/mobile yang tidak relevan untuk foto", () => {
    const result = validateHeroSlideInput({
      mediaType: "IMAGE",
      imageUrl: "https://cdn.example.com/img/kama/01-incense.jpg",
      mobileImageUrl: "https://cdn.example.com/img/kama/01-incense-mobile.jpg",
      videoUrl: "https://cdn.example.com/video/hero.mp4",
      isPublished: true,
    });
    assert.equal(result.ok, true);
    assert.equal(result.ok && result.data.videoUrl, null);
    assert.equal(result.ok && result.data.mobileImageUrl, "https://cdn.example.com/img/kama/01-incense-mobile.jpg");
  });

  it("menolak gambar mobile yang tidak aman dan alt terlalu panjang", () => {
    assert.equal(
      validateHeroSlideInput({
        mediaType: "IMAGE",
        imageUrl: "https://cdn.example.com/img/kama/01-incense.jpg",
        mobileImageUrl: "javascript:alert(1)",
      }).ok,
      false,
    );
    assert.equal(
      validateHeroSlideInput({
        mediaType: "IMAGE",
        imageUrl: "https://cdn.example.com/img/kama/01-incense.jpg",
        imageAlt: "a".repeat(HERO_SLIDE_LIMITS.imageAlt + 1),
      }).ok,
      false,
    );
  });
});

describe("resolveHeroSlides", () => {
  it("tabel kosong → fallback satu gambar section", () => {
    const slides = resolveHeroSlides([], {
      imageUrl: "https://cdn.example.com/img/kama/incense-smoke-poster.jpg",
      mobileImageUrl: "https://cdn.example.com/img/kama/incense-mobile.jpg",
      imageAlt: "Dupa KAMA",
    });
    assert.deepEqual(slides, [
      {
        key: "hero-fallback",
        mediaType: "IMAGE",
        imageUrl: "https://cdn.example.com/img/kama/incense-smoke-poster.jpg",
        mobileImageUrl: "https://cdn.example.com/img/kama/incense-mobile.jpg",
        videoUrl: null,
        imageAlt: "Dupa KAMA",
      },
    ]);
  });

  it("tabel kosong tanpa gambar aman → tidak ada media", () => {
    assert.deepEqual(resolveHeroSlides([], { imageUrl: "javascript:alert(1)" }), []);
  });

  it("hanya slide terbit yang valid, urut sortOrder", () => {
    const slides = resolveHeroSlides([
      row({ id: "b", sortOrder: 2, imageUrl: "https://cdn.example.com/img/kama/02-bottle-shadows.jpg" }),
      row({ id: "draft", sortOrder: 1, isPublished: false }),
      row({ id: "video", sortOrder: 3, mediaType: "VIDEO", imageUrl: "https://cdn.example.com/img/kama/poster.jpg", videoUrl: "https://cdn.example.com/video/hero.mp4", mobileImageUrl: "https://cdn.example.com/img/kama/mobile.jpg" }),
      row({ id: "bad-video", sortOrder: 4, mediaType: "VIDEO", imageUrl: "https://cdn.example.com/img/kama/poster.jpg", videoUrl: "https://youtu.be/abc" }),
      row({ id: "a", sortOrder: 1, imageUrl: "https://cdn.example.com/img/kama/01-incense.jpg" }),
    ]);

    assert.deepEqual(slides.map((slide) => slide.key), ["a", "b", "video"]);
    assert.equal(slides[2]?.mobileImageUrl, null);
    assert.equal(slides[2]?.videoUrl, "https://cdn.example.com/video/hero.mp4");
  });

  it("baris ada tetapi semua draf → tidak memakai fallback section", () => {
    const slides = resolveHeroSlides(
      [row({ id: "draft", isPublished: false })],
      { imageUrl: "https://cdn.example.com/img/kama/incense-smoke-poster.jpg" },
    );
    assert.deepEqual(slides, []);
  });
});
