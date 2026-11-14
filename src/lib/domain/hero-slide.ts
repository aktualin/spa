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
 *
 * Implementasinya dipecah ke berkas `hero-slide.*.ts` di folder ini; berkas
 * ini hanya mengekspor ulang simbol publiknya.
 */

export {
  HERO_SLIDE_INTERVAL_MS,
  HERO_SLIDE_LIMITS,
  type HeroSlideMediaType,
  type HeroSlideRowLike,
  type HeroSlideView,
  type HeroSlideSectionLike,
} from "./hero-slide.types.ts";
export { isSafeVideoUrl } from "./hero-slide.url.ts";
export {
  type HeroSlideRawInput,
  type HeroSlideData,
  type HeroSlideValidation,
  validateHeroSlideInput,
} from "./hero-slide.validate.ts";
export { resolveHeroSlides } from "./hero-slide.resolve.ts";