/** Kartu highlight "What's New" — lihat `homepage.ts`. */
import { isSafeCtaHref, isSafeImageUrl } from "./homepage-banner.ts";
import { clean } from "./text.ts";
import { isPromoActive } from "./visibility.ts";

/** Batas panjang isian highlight (karakter). */
export const HIGHLIGHT_LIMITS = {
  eyebrow: 40,
  title: 160,
  imageAlt: 200,
  href: 500,
  ctaLabel: 40,
} as const;

/** Bentuk satu kartu di section "What's New" (dipakai data statis & DB). */
export type HighlightCard = {
  key: string;
  /** null → kartu tanpa tautan (tanpa teks tombol). */
  href: string | null;
  /** null → kotak gambar kosong berwarna latar. */
  image: string | null;
  imageAlt: string;
  tag: string;
  title: string;
  /** Kosong → pemanggil memakai fallback CB home.whats_new.cta_fallback. */
  ctaLabel: string;
};

/** Bentuk minimal baris `HomepageHighlight` yang dibaca modul ini. */
export type HighlightRowLike = {
  id: string;
  eyebrow?: string | null;
  title: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  href?: string | null;
  ctaLabel?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  isPublished: boolean;
  sortOrder: number;
};

/** Highlight tampil bila dipublikasikan dan berada di dalam periodenya. */
export function isHighlightVisible(
  row: Pick<HighlightRowLike, "isPublished" | "startDate" | "endDate">,
  now: Date = new Date(),
): boolean {
  return isPromoActive(
    { isPublished: row.isPublished, startDate: row.startDate, endDate: row.endDate },
    now,
  );
}

export type HighlightStatus = "Draf" | "Terjadwal" | "Berakhir" | "Tayang";

/** Status untuk ditampilkan di daftar admin. */
export function highlightStatus(
  row: Pick<HighlightRowLike, "isPublished" | "startDate" | "endDate">,
  now: Date = new Date(),
): HighlightStatus {
  if (!row.isPublished) return "Draf";
  if (row.startDate && row.startDate.getTime() > now.getTime()) return "Terjadwal";
  if (row.endDate && row.endDate.getTime() < now.getTime()) return "Berakhir";
  return "Tayang";
}

/** Baris DB → kartu. Tautan/gambar yang tidak aman diabaikan (pertahanan kedua). */
export function highlightToCard(row: HighlightRowLike): HighlightCard {
  const href = clean(row.href);
  const image = clean(row.imageUrl);
  const ctaLabel = clean(row.ctaLabel);
  return {
    key: row.id,
    href: href && isSafeCtaHref(href) ? href : null,
    image: image && isSafeImageUrl(image) ? image : null,
    imageAlt: clean(row.imageAlt),
    tag: clean(row.eyebrow),
    title: row.title.trim(),
    ctaLabel,
  };
}

/**
 * Kartu yang ditampilkan. `null` berarti tabel highlight kosong → pemanggil
 * memakai kartu statis lama. Urutan: `sortOrder` naik (stabil).
 */
export function selectHighlightCards(
  rows: HighlightRowLike[],
  now: Date = new Date(),
): HighlightCard[] | null {
  if (rows.length === 0) return null;
  return rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => isHighlightVisible(row, now))
    .sort((a, b) => a.row.sortOrder - b.row.sortOrder || a.index - b.index)
    .map(({ row }) => highlightToCard(row));
}