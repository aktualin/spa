/** Batas & helper validasi isian admin Corporate — lihat `corporate.ts`. */
import { collapseSpaces } from "./text.ts";

export const CORPORATE_LIMITS = {
  heroTitle: 200,
  intro: 1000,
  listItem: 200,
  maxBenefits: 20,
  maxSolutions: 6,
  maxSolutionItems: 12,
  maxInSpaItems: 20,
  picName: 80,
  picPhone: 30,
  programName: 80,
  programDescription: 1000,
  maxFeatures: 15,
  stepTitle: 120,
  stepBody: 500,
  clientName: 120,
  websiteUrl: 300,
  maxClientPhotos: 30,
} as const;

export type Validation<T> = { ok: true; data: T } | { ok: false; error: string };

/** Rapikan daftar dari form: trim, buang kosong & kembar, urutan dipertahankan. */
export function cleanList(values: readonly unknown[]): string[] {
  const out: string[] = [];
  for (const value of values) {
    if (typeof value !== "string") continue;
    const item = collapseSpaces(value);
    if (item && !out.includes(item)) out.push(item);
  }
  return out;
}

export function checkList(
  items: string[],
  label: string,
  max: number,
): string | null {
  if (items.length > max) return `Maksimal ${max} ${label}.`;
  const tooLong = items.find((item) => item.length > CORPORATE_LIMITS.listItem);
  if (tooLong) {
    return `Setiap ${label} maksimal ${CORPORATE_LIMITS.listItem} karakter.`;
  }
  return null;
}

/** URL gambar: hanya https:// dari bucket S3; path lokal (`/img/…`) ditolak. */
export function readImageUrl(value: string): Validation<string | null> {
  const url = value.trim();
  if (!url) return { ok: true, data: null };
  if (/^https:\/\/\S+$/.test(url)) return { ok: true, data: url };
  return { ok: false, error: "URL gambar harus https:// (unggah lewat Media Library)." };
}