/** Validasi isian form highlight & urutan — lihat `homepage.ts`. */
import { isSafeCtaHref, isSafeImageUrl } from "./homepage-banner.ts";
import { HIGHLIGHT_LIMITS } from "./homepage.highlights.ts";
import { clean } from "./text.ts";

export type HighlightRawInput = {
  eyebrow?: string | null;
  title?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  href?: string | null;
  ctaLabel?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  isPublished?: boolean;
};

export type HighlightData = {
  eyebrow: string | null;
  title: string;
  imageUrl: string | null;
  imageAlt: string | null;
  href: string | null;
  ctaLabel: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isPublished: boolean;
};

export type HighlightValidation =
  | { ok: true; data: HighlightData }
  | { ok: false; error: string };

export function validateHighlightInput(raw: HighlightRawInput): HighlightValidation {
  const fail = (error: string): HighlightValidation => ({ ok: false, error });

  const eyebrow = clean(raw.eyebrow);
  const title = clean(raw.title);
  const imageUrl = clean(raw.imageUrl);
  const imageAlt = clean(raw.imageAlt);
  const href = clean(raw.href);
  const ctaLabel = clean(raw.ctaLabel);
  const startDate = raw.startDate ?? null;
  const endDate = raw.endDate ?? null;

  if (!title) return fail("Judul highlight wajib diisi.");
  if (title.length > HIGHLIGHT_LIMITS.title) {
    return fail(`Judul maksimal ${HIGHLIGHT_LIMITS.title} karakter.`);
  }
  if (eyebrow.length > HIGHLIGHT_LIMITS.eyebrow) {
    return fail(`Label kategori maksimal ${HIGHLIGHT_LIMITS.eyebrow} karakter.`);
  }
  if (imageUrl && !isSafeImageUrl(imageUrl)) {
    return fail("Alamat gambar tidak valid.");
  }
  if (imageAlt.length > HIGHLIGHT_LIMITS.imageAlt) {
    return fail(`Teks alt maksimal ${HIGHLIGHT_LIMITS.imageAlt} karakter.`);
  }
  if (href.length > HIGHLIGHT_LIMITS.href) {
    return fail(`Tujuan tautan maksimal ${HIGHLIGHT_LIMITS.href} karakter.`);
  }
  if (href && !isSafeCtaHref(href)) {
    return fail(
      "Tujuan tautan harus berupa path internal (mis. /menu), anchor (mis. #home_whats_new), atau alamat https://….",
    );
  }
  if (ctaLabel.length > HIGHLIGHT_LIMITS.ctaLabel) {
    return fail(`Label tombol maksimal ${HIGHLIGHT_LIMITS.ctaLabel} karakter.`);
  }
  if (ctaLabel && !href) {
    return fail("Label tombol hanya dipakai bila tujuan tautan diisi.");
  }
  if (startDate && endDate && endDate.getTime() < startDate.getTime()) {
    return fail("Tanggal berakhir harus sama dengan atau setelah tanggal mulai.");
  }

  return {
    ok: true,
    data: {
      eyebrow: eyebrow || null,
      title,
      imageUrl: imageUrl || null,
      imageAlt: imageAlt || null,
      href: href || null,
      ctaLabel: ctaLabel || null,
      startDate,
      endDate,
      isPublished: raw.isPublished ?? false,
    },
  };
}