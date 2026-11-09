/**
 * Aturan slider media hero homepage (`HeroSlide`).
 *
 * Teks/CTA tetap berasal dari `HomepageSection` berkey "hero"; modul ini hanya
 * mengurus media. Modul murni (tanpa I/O) supaya bisa diuji langsung dengan
 * `node --test`.
 *
 * Semantik fallback:
 * - Tabel slide KOSONG → pakai gambar fallback dari section hero (perilaku lama).
 * - Tabel berisi baris → hanya slide terbit yang valid yang tampil. Bila semua
 *   draf, hero tampil tanpa media (pilihan admin tidak boleh memunculkan lagi
 *   gambar fallback secara diam-diam).
 */
import { BANNER_LIMITS, isSafeImageUrl } from "./homepage-banner.ts";

export const HERO_SLIDE_INTERVAL_MS = 6000;

export const HERO_SLIDE_LIMITS = {
  imageUrl: BANNER_LIMITS.imageUrl,
  videoUrl: 1000,
  imageAlt: BANNER_LIMITS.imageAlt,
} as const;

export type HeroSlideMediaType = "IMAGE" | "VIDEO";

export type HeroSlideRowLike = {
  id: string;
  mediaType: string;
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
  videoUrl?: string | null;
  imageAlt?: string | null;
  isPublished: boolean;
  sortOrder: number;
};

export type HeroSlideView = {
  key: string;
  mediaType: HeroSlideMediaType;
  imageUrl: string;
  mobileImageUrl: string | null;
  videoUrl: string | null;
  imageAlt: string;
};

export type HeroSlideSectionLike = {
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
  imageAlt?: string | null;
};

function clean(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function isInternalPath(value: string): boolean {
  return /^\/(?![/\\])[^\s]*$/.test(value);
}

function hasVideoExtension(path: string): boolean {
  const pathname = path.split(/[?#]/, 1)[0] ?? path;
  return /\.(mp4|webm)$/i.test(pathname);
}

/**
 * URL video: path internal (`/video/…mp4`) atau `https://…` dengan ekstensi
 * `.mp4`/`.webm`. URL halaman YouTube/Vimeo bukan direct file dan ditolak.
 */
export function isSafeVideoUrl(value: string): boolean {
  if (!value || value.length > HERO_SLIDE_LIMITS.videoUrl) return false;
  if (/\s/.test(value)) return false;

  if (value.startsWith("/")) {
    return isInternalPath(value) && hasVideoExtension(value);
  }

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.length > 0 &&
      hasVideoExtension(url.pathname)
    );
  } catch {
    return false;
  }
}

function normalizeMediaType(value: string | null | undefined): HeroSlideMediaType | null {
  const normalized = clean(value).toUpperCase();
  return normalized === "IMAGE" || normalized === "VIDEO" ? normalized : null;
}

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
      return fail("URL video harus berupa file langsung .mp4/.webm (https atau /video/…).");
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

function toView(row: HeroSlideRowLike): HeroSlideView | null {
  const mediaType = normalizeMediaType(row.mediaType);
  if (!mediaType || !row.isPublished) return null;

  const imageUrl = clean(row.imageUrl);
  if (!isSafeImageUrl(imageUrl)) return null;

  const videoUrl = clean(row.videoUrl);
  if (mediaType === "VIDEO" && !isSafeVideoUrl(videoUrl)) return null;

  const mobileImageUrl = clean(row.mobileImageUrl);

  return {
    key: row.id,
    mediaType,
    imageUrl,
    mobileImageUrl:
      mediaType === "IMAGE" && mobileImageUrl && isSafeImageUrl(mobileImageUrl)
        ? mobileImageUrl
        : null,
    videoUrl: mediaType === "VIDEO" ? videoUrl : null,
    imageAlt: clean(row.imageAlt),
  };
}

/**
 * Slide yang dirender hero. Urutan: `sortOrder` naik (stabil). Tabel kosong →
 * satu slide fallback dari gambar section (bila aman).
 */
export function resolveHeroSlides(
  rows: HeroSlideRowLike[],
  section?: HeroSlideSectionLike | null,
): HeroSlideView[] {
  if (rows.length === 0) {
    const imageUrl = clean(section?.imageUrl);
    if (!isSafeImageUrl(imageUrl)) return [];
    const mobileImageUrl = clean(section?.mobileImageUrl);
    return [
      {
        key: "hero-fallback",
        mediaType: "IMAGE",
        imageUrl,
        mobileImageUrl:
          mobileImageUrl && isSafeImageUrl(mobileImageUrl) ? mobileImageUrl : null,
        videoUrl: null,
        imageAlt: clean(section?.imageAlt),
      },
    ];
  }

  return rows
    .map((row, index) => ({ row, index }))
    .sort(
      (a, b) =>
        a.row.sortOrder - b.row.sortOrder || a.index - b.index,
    )
    .map(({ row }) => toView(row))
    .filter((view): view is HeroSlideView => view !== null);
}
