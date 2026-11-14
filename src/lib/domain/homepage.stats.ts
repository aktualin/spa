/** Statistik Brand Intro — lihat `homepage.ts`. */
import {
  type OrderedRow,
  type SimpleValidation,
  publishedInOrder,
} from "./homepage.shared.ts";
import { clean } from "./text.ts";

/** Batas isian statistik (karakter / jumlah). */
export const STAT_LIMITS = { value: 20, label: 60, max: 6 } as const;

export type StatItem = { key: string; value: string; label: string };

export type StatRowLike = OrderedRow & { id: string; value: string; label: string };

/** `null` = tabel kosong → pakai statistik statis lama. */
export function selectStats(rows: StatRowLike[]): StatItem[] | null {
  if (rows.length === 0) return null;
  return publishedInOrder(rows).map((row) => ({
    key: row.id,
    value: row.value.trim(),
    label: row.label.trim(),
  }));
}

/** Jumlah baris terbit (untuk peringatan admin "tidak ada yang tayang"). */
export function countPublished(rows: { isPublished: boolean }[]): number {
  return rows.filter((row) => row.isPublished).length;
}

export type StatRawInput = { value?: string | null; label?: string | null; isPublished?: boolean };
export type StatData = { value: string; label: string; isPublished: boolean };

export function validateStatInput(raw: StatRawInput): SimpleValidation<StatData> {
  const value = clean(raw.value);
  const label = clean(raw.label);
  if (!value) return { ok: false, error: "Angka/nilai wajib diisi." };
  if (value.length > STAT_LIMITS.value) {
    return { ok: false, error: `Angka/nilai maksimal ${STAT_LIMITS.value} karakter.` };
  }
  if (!label) return { ok: false, error: "Label wajib diisi." };
  if (label.length > STAT_LIMITS.label) {
    return { ok: false, error: `Label maksimal ${STAT_LIMITS.label} karakter.` };
  }
  return { ok: true, data: { value, label, isPublished: raw.isPublished ?? false } };
}