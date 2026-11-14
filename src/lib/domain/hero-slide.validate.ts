/** Validasi isian form admin slide hero — lihat `hero-slide.ts`. */
import { isSafeImageUrl } from "./homepage-banner.ts";
import { HERO_SLIDE_LIMITS, type HeroSlideMediaType } from "./hero-slide.types.ts";
import { isSafeVideoUrl, normalizeMediaType } from "./hero-slide.url.ts";
import { clean } from "./text.ts";

export type HeroSlideRawInput = {
  mediaType?: string | null;
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
  videoUrl?: string | null;
  imageAlt?: string | null;
  isPublished?: boolean;
};

export type HeroSlideData = {
  mediaType: HeroSlideMediaType;
  imageUrl: string;
  mobileImageUrl: string | null;
  videoUrl: string | null;
  imageAlt: string | null;
  isPublished: boolean;
};

export type HeroSlideValidation =
  | { ok: true; data: HeroSlideData }
  | { ok: false; error: string };

/** Validasi isian form admin; field yang tidak relevan dinolkan. */
export function validateHeroSlideInput(raw: HeroSlideRawInput): HeroSlideValidation {
  const fail = (error: string): HeroSlideValidation => ({ ok: false, error });

  const mediaType = normalizeMediaType(raw.mediaType);
  if (!mediaType) return fail("Tipe media harus Foto atau Video.");

  const imageUrl = clean(raw.imageUrl);
  const mobileImageUrl = clean(raw.mobileImageUrl);
  const videoUrl = clean(raw.videoUrl);
  const imageAlt = clean(raw.imageAlt);

  if (!imageUrl) {
    return fail(
      mediaType === "VIDEO"
        ? "Poster video wajib diisi agar hero tetap tampil saat autoplay diblokir."
        : "Gambar slide wajib diisi.",
    );
  }
  if (!isSafeImageUrl(imageUrl)) {
    return fail("Alamat gambar/poster tidak valid.");
  }
  if (mediaType === "IMAGE" && mobileImageUrl && !isSafeImageUrl(mobileImageUrl)) {
    return fail("Alamat gambar mobile tidak valid.");
  }
  if (mediaType === "VIDEO") {
    if (!videoUrl) return fail("URL video wajib diisi.");
    if (!isSafeVideoUrl(videoUrl)) {
      return fail("URL video harus berupa file langsung .mp4/.webm dari https:// (bucket S3).");
    }
  }
  if (imageAlt.length > HERO_SLIDE_LIMITS.imageAlt) {
    return fail(`Teks alt maksimal ${HERO_SLIDE_LIMITS.imageAlt} karakter.`);
  }

  return {
    ok: true,
    data: {
      mediaType,
      imageUrl,
      mobileImageUrl:
        mediaType === "IMAGE" && mobileImageUrl ? mobileImageUrl : null,
      videoUrl: mediaType === "VIDEO" ? videoUrl : null,
      imageAlt: imageAlt || null,
      isPublished: Boolean(raw.isPublished),
    },
  };
}