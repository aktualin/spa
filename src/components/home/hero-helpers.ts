import { isSafeCtaHref, isSafeImageUrl } from "@/lib/domain/homepage-banner";

/** Trim nilai section; null/undefined menjadi string kosong. */
export function clean(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

/** Tujuan CTA hanya dipakai bila non-kosong dan aman (lihat isSafeCtaHref). */
export function safeHref(value: string | null | undefined): string | null {
  const href = clean(value);
  return href && isSafeCtaHref(href) ? href : null;
}

/** URL gambar hanya dipakai bila non-kosong dan aman (lihat isSafeImageUrl). */
export function safeImage(value: string | null | undefined): string | null {
  const src = clean(value);
  return src && isSafeImageUrl(src) ? src : null;
}