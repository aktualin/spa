/** Feed Instagram section Socials — lihat `homepage.ts`. */
import { isSafeCtaHref, isSafeImageUrl } from "./homepage-banner.ts";
import {
  type OrderedRow,
  type SimpleValidation,
  publishedInOrder,
} from "./homepage.shared.ts";
import { clean } from "./text.ts";

/** Batas isian feed Instagram (karakter / jumlah). */
export const INSTAGRAM_LIMITS = { imageAlt: 200, href: 500, max: 12 } as const;

export type InstagramItem = {
  key: string;
  imageUrl: string;
  imageAlt: string;
  /** null → tautan profil Instagram. */
  href: string | null;
};

export type InstagramRowLike = OrderedRow & {
  id: string;
  imageUrl: string;
  imageAlt?: string | null;
  href?: string | null;
};

/**
 * `null` = tabel kosong → pertahankan grid foto bawaan. Foto dengan alamat
 * gambar tidak aman dibuang; tautan tidak aman jatuh ke tautan profil.
 */
export function selectInstagramPosts(rows: InstagramRowLike[]): InstagramItem[] | null {
  if (rows.length === 0) return null;
  return publishedInOrder(rows)
    .filter((row) => isSafeImageUrl(clean(row.imageUrl)))
    .slice(0, INSTAGRAM_LIMITS.max)
    .map((row) => {
      const href = clean(row.href);
      return {
        key: row.id,
        imageUrl: clean(row.imageUrl),
        imageAlt: clean(row.imageAlt),
        href: href && isSafeCtaHref(href) ? href : null,
      };
    });
}

export type InstagramRawInput = {
  imageUrl?: string | null;
  imageAlt?: string | null;
  href?: string | null;
  isPublished?: boolean;
};
export type InstagramData = {
  imageUrl: string;
  imageAlt: string | null;
  href: string | null;
  isPublished: boolean;
};

export function validateInstagramInput(raw: InstagramRawInput): SimpleValidation<InstagramData> {
  const imageUrl = clean(raw.imageUrl);
  const imageAlt = clean(raw.imageAlt);
  const href = clean(raw.href);
  if (!imageUrl) return { ok: false, error: "Foto wajib diunggah atau dipilih." };
  if (!isSafeImageUrl(imageUrl)) return { ok: false, error: "Alamat gambar tidak valid." };
  if (imageAlt.length > INSTAGRAM_LIMITS.imageAlt) {
    return { ok: false, error: `Teks alt maksimal ${INSTAGRAM_LIMITS.imageAlt} karakter.` };
  }
  if (href.length > INSTAGRAM_LIMITS.href) {
    return { ok: false, error: `Tautan maksimal ${INSTAGRAM_LIMITS.href} karakter.` };
  }
  if (href && !isSafeCtaHref(href)) {
    return {
      ok: false,
      error: "Tautan harus berupa path internal (mis. /menu) atau alamat https://….",
    };
  }
  return {
    ok: true,
    data: {
      imageUrl,
      imageAlt: imageAlt || null,
      href: href || null,
      isPublished: raw.isPublished ?? false,
    },
  };
}