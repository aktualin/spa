/** Validasi isian form admin banner — lihat `homepage-banner.ts`. */
import {
  BANNER_DEFAULT_TITLE,
  BANNER_FIELDS,
  BANNER_LIMITS,
  type BannerKey,
} from "./homepage-banner.config.ts";
import { isSafeCtaHref, isSafeImageUrl } from "./homepage-banner.url.ts";
import { clean } from "./text.ts";

export type BannerRawInput = {
  title?: string | null;
  subtitle?: string | null;
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
  imageAlt?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
};

/** Data siap simpan ke `HomepageSection` (kosong → null). */
export type BannerData = {
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  imageAlt: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export type BannerValidation =
  | { ok: true; data: BannerData }
  | { ok: false; error: string };

/**
 * Validasi isian banner untuk `key`. Field yang tidak relevan untuk section
 * tersebut (mis. gambar pada booking-banner) diabaikan dan disimpan null.
 */
export function validateBannerInput(key: BannerKey, raw: BannerRawInput): BannerValidation {
  const config = BANNER_FIELDS[key];
  const fail = (error: string): BannerValidation => ({ ok: false, error });

  const title = clean(raw.title);
  const subtitle = config.subtitle ? clean(raw.subtitle) : "";
  const imageUrl = config.image ? clean(raw.imageUrl) : "";
  const mobileImageUrl = config.image ? clean(raw.mobileImageUrl) : "";
  const imageAlt = config.image ? clean(raw.imageAlt) : "";
  const ctaLabel = clean(raw.ctaLabel);
  const ctaHref = clean(raw.ctaHref);

  if (title.length > BANNER_LIMITS.title) {
    return fail(`Judul maksimal ${BANNER_LIMITS.title} karakter.`);
  }
  if (subtitle.length > BANNER_LIMITS.subtitle) {
    return fail(`${config.subtitleLabel} maksimal ${BANNER_LIMITS.subtitle} karakter.`);
  }
  if (imageUrl && !isSafeImageUrl(imageUrl)) {
    return fail("Alamat gambar utama tidak valid.");
  }
  if (mobileImageUrl && !isSafeImageUrl(mobileImageUrl)) {
    return fail("Alamat gambar mobile tidak valid.");
  }
  if (imageAlt.length > BANNER_LIMITS.imageAlt) {
    return fail(`Teks alt maksimal ${BANNER_LIMITS.imageAlt} karakter.`);
  }
  if ((imageUrl || mobileImageUrl) && !imageAlt && !config.decorativeImage) {
    return fail("Teks alt wajib diisi bila gambar diganti.");
  }
  if (ctaLabel.length > BANNER_LIMITS.ctaLabel) {
    return fail(`Label tombol maksimal ${BANNER_LIMITS.ctaLabel} karakter.`);
  }
  if (ctaHref.length > BANNER_LIMITS.ctaHref) {
    return fail(`Tujuan tombol maksimal ${BANNER_LIMITS.ctaHref} karakter.`);
  }
  if (Boolean(ctaLabel) !== Boolean(ctaHref)) {
    return fail("Label tombol dan tujuan tombol harus diisi berpasangan (atau dikosongkan keduanya).");
  }
  if (ctaHref && !isSafeCtaHref(ctaHref)) {
    return fail(
      "Tujuan tombol harus berupa path internal (mis. /menu), anchor (mis. #home_whats_new), atau alamat https://….",
    );
  }

  return {
    ok: true,
    data: {
      // Judul kosong → label admin bawaan, supaya frontend memakai teks hardcode.
      title: title || BANNER_DEFAULT_TITLE[key],
      subtitle: subtitle || null,
      imageUrl: imageUrl || null,
      mobileImageUrl: mobileImageUrl || null,
      imageAlt: imageAlt || null,
      ctaLabel: ctaLabel || null,
      ctaHref: ctaHref || null,
    },
  };
}