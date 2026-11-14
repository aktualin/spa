/** Ulasan section Reviews — lihat `homepage.ts`. */
import {
  type OrderedRow,
  type SimpleValidation,
  publishedInOrder,
} from "./homepage.shared.ts";
import { clean } from "./text.ts";

/** Batas isian ulasan (karakter). */
export const REVIEW_LIMITS = { quote: 600, name: 80, location: 80, role: 60 } as const;

export type ReviewItem = {
  key: string;
  quote: string;
  name: string;
  location: string;
  role: string;
};

export type ReviewRowLike = OrderedRow & {
  id: string;
  quote: string;
  name: string;
  location?: string | null;
  role?: string | null;
};

/** `null` = tabel kosong → pakai ulasan statis lama. */
export function selectReviews(rows: ReviewRowLike[]): ReviewItem[] | null {
  if (rows.length === 0) return null;
  return publishedInOrder(rows).map((row) => ({
    key: row.id,
    quote: row.quote.trim(),
    name: row.name.trim(),
    location: clean(row.location),
    role: clean(row.role),
  }));
}

export type ReviewRawInput = {
  quote?: string | null;
  name?: string | null;
  location?: string | null;
  role?: string | null;
  isPublished?: boolean;
};
export type ReviewData = {
  quote: string;
  name: string;
  location: string | null;
  role: string | null;
  isPublished: boolean;
};

export function validateReviewInput(raw: ReviewRawInput): SimpleValidation<ReviewData> {
  const quote = clean(raw.quote);
  const name = clean(raw.name);
  const location = clean(raw.location);
  const role = clean(raw.role);
  if (!quote) return { ok: false, error: "Isi ulasan wajib diisi." };
  if (quote.length > REVIEW_LIMITS.quote) {
    return { ok: false, error: `Isi ulasan maksimal ${REVIEW_LIMITS.quote} karakter.` };
  }
  if (!name) return { ok: false, error: "Nama pemberi ulasan wajib diisi." };
  if (name.length > REVIEW_LIMITS.name) {
    return { ok: false, error: `Nama maksimal ${REVIEW_LIMITS.name} karakter.` };
  }
  if (location.length > REVIEW_LIMITS.location) {
    return { ok: false, error: `Lokasi maksimal ${REVIEW_LIMITS.location} karakter.` };
  }
  if (role.length > REVIEW_LIMITS.role) {
    return { ok: false, error: `Keterangan maksimal ${REVIEW_LIMITS.role} karakter.` };
  }
  return {
    ok: true,
    data: {
      quote,
      name,
      location: location || null,
      role: role || null,
      isPublished: raw.isPublished ?? false,
    },
  };
}