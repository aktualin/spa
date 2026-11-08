/**
 * Aturan modul Cabang (`Branch`): batas isian admin, urutan tampil, dan
 * validasi form.
 *
 * Satu cabang menyimpan sendiri alamat, jam, dan kontaknya. Kolom yang
 * dibiarkan kosong diisi dari Kontak & Umum saat dibaca (lihat
 * `src/lib/content/branches.ts`) — keduanya sama-sama data admin, jadi itu
 * bukan konten statis.
 *
 * Modul murni (tanpa I/O) supaya bisa diuji langsung dengan `node --test`.
 */
import { z } from "zod";

import {
  MAX_OPENING_HOURS,
  MAX_OPENING_HOURS_LENGTH,
  isValidPhone,
  normalizeOpeningHours,
  normalizeWhatsAppNumber,
  parseMapsEmbedInput,
} from "./site-settings.ts";
import { SLUG_PATTERN } from "./slug.ts";

/** Batas panjang isian form cabang. */
export const BRANCH_LIMITS = {
  name: 120,
  area: 120,
  tag: 40,
  address: 300,
} as const;

/* ---------- urutan tampil ---------- */

export type BranchOrderRow = {
  id: string;
  name: string;
  sortOrder: number;
};

/**
 * Urutan baku daftar cabang: `sortOrder`, lalu nama dan id supaya hasilnya
 * stabil. Dipakai bersama oleh daftar admin dan halaman publik agar urutannya
 * selalu sama.
 */
export function compareBranches(a: BranchOrderRow, b: BranchOrderRow): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  const byName = a.name.localeCompare(b.name, "id");
  if (byName !== 0) return byName;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export function sortBranches<T extends BranchOrderRow>(rows: readonly T[]): T[] {
  return [...rows].sort(compareBranches);
}

/**
 * Menaikkan/menurunkan satu cabang dalam urutan tampil. Hasilnya `sortOrder`
 * baru 0..n-1 untuk seluruh cabang, sehingga nilai kembar dari data lama ikut
 * dirapikan. Hanya baris yang nilainya berubah yang dikembalikan.
 */
export function planBranchMove(
  rows: readonly BranchOrderRow[],
  id: string,
  direction: "up" | "down",
): { id: string; sortOrder: number }[] {
  const ordered = sortBranches(rows);
  const index = ordered.findIndex((row) => row.id === id);
  const target = direction === "up" ? index - 1 : index + 1;

  if (index >= 0 && target >= 0 && target < ordered.length) {
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
  }

  return ordered
    .map((row, position) => ({ id: row.id, sortOrder: position, previous: row.sortOrder }))
    .filter((row) => row.sortOrder !== row.previous)
    .map(({ id: rowId, sortOrder }) => ({ id: rowId, sortOrder }));
}

/** true bila cabang bisa dinaikkan/diturunkan (ada tetangga ke arah itu). */
export function canMoveBranch(
  ordered: readonly BranchOrderRow[],
  index: number,
  direction: "up" | "down",
): boolean {
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || index >= ordered.length) return false;
  return target >= 0 && target < ordered.length;
}

/** `sortOrder` untuk cabang baru: di akhir daftar. */
export function nextBranchSortOrder(maxSortOrder: number | null | undefined): number {
  return typeof maxSortOrder === "number" && Number.isFinite(maxSortOrder)
    ? maxSortOrder + 1
    : 0;
}

/* ---------- koordinat peta ---------- */

export type MapPoint = { latitude: number; longitude: number };

/**
 * Titik tengah peta: rata-rata koordinat cabang yang punya koordinat.
 * Mengembalikan `null` bila belum ada satu pun — peta lalu tidak dirender,
 * daripada memakai koordinat hardcode.
 */
export function branchesCenter(
  branches: readonly { latitude: number | null; longitude: number | null }[],
): MapPoint | null {
  const points = branches.flatMap((b) =>
    b.latitude !== null && b.longitude !== null
      ? [{ latitude: b.latitude, longitude: b.longitude }]
      : [],
  );
  if (points.length === 0) return null;
  const sum = points.reduce(
    (acc, p) => ({ latitude: acc.latitude + p.latitude, longitude: acc.longitude + p.longitude }),
    { latitude: 0, longitude: 0 },
  );
  return {
    latitude: sum.latitude / points.length,
    longitude: sum.longitude / points.length,
  };
}

/* ---------- skema form admin ---------- */

const blank = (value: string) => value.trim() === "";

/** Koordinat opsional; kosong → null. Di luar rentang bumi ditolak. */
function coordinate(label: string, max: number) {
  return z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || (Number.isFinite(Number(value)) && Math.abs(Number(value)) <= max),
      `${label} harus angka antara -${max} dan ${max}.`,
    )
    .transform((value) => (value ? Number(value) : null));
}

export const branchInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama cabang wajib diisi.")
    .max(BRANCH_LIMITS.name, `Nama cabang maksimal ${BRANCH_LIMITS.name} karakter.`),
  slug: z
    .string()
    .trim()
    .min(1, "Slug wajib diisi.")
    .regex(SLUG_PATTERN, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
  area: z
    .string()
    .trim()
    .min(1, "Area wajib diisi.")
    .max(BRANCH_LIMITS.area, `Area maksimal ${BRANCH_LIMITS.area} karakter.`),
  tag: z
    .string()
    .trim()
    .max(BRANCH_LIMITS.tag, `Label maksimal ${BRANCH_LIMITS.tag} karakter.`)
    .optional()
    .transform((value) => (value ? value : null)),
  address: z
    .string()
    .trim()
    .max(BRANCH_LIMITS.address, `Alamat maksimal ${BRANCH_LIMITS.address} karakter.`)
    .optional()
    .transform((value) => (value ? value : null)),
  openingHours: z
    .array(
      z
        .string()
        .max(
          MAX_OPENING_HOURS_LENGTH,
          `Satu baris jam operasional maks. ${MAX_OPENING_HOURS_LENGTH} karakter.`,
        ),
    )
    .transform(normalizeOpeningHours)
    .refine(
      (lines) => lines.length <= MAX_OPENING_HOURS,
      `Jam operasional maks. ${MAX_OPENING_HOURS} baris.`,
    ),
  whatsappNumber: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || normalizeWhatsAppNumber(value) !== null,
      "Nomor WhatsApp tidak valid. Tulis 08xx atau +62xx (8–15 digit, hanya angka).",
    )
    .transform((value) => (value ? normalizeWhatsAppNumber(value) : null)),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || isValidPhone(value),
      "Nomor telepon tidak valid (8–15 digit; boleh +, spasi, atau tanda hubung).",
    )
    .transform((value) => (value ? value : null)),
  email: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || z.email().safeParse(value).success,
      "Format email tidak valid.",
    )
    .transform((value) => (value ? value.toLowerCase() : null)),
  mapsEmbedUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || parseMapsEmbedInput(value) !== null,
      "URL embed Google Maps harus diawali https://www.google.com/maps/embed? — atau tempel kode <iframe> dari Google Maps.",
    )
    .transform((value) => (value ? parseMapsEmbedInput(value) : null)),
  mapsUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => blank(value ?? "") || /^https:\/\//.test(value ?? ""),
      "Tautan rute harus diawali https://",
    )
    .transform((value) => (value ? value : null)),
  latitude: coordinate("Lintang", 90),
  longitude: coordinate("Bujur", 180),
  // Kosong → cabang baru diletakkan di akhir daftar.
  sortOrder: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^\d+$/.test(value),
      "Urutan harus bilangan bulat 0 atau lebih.",
    )
    .transform((value) => (value ? Number(value) : null)),
  isPublished: z.boolean(),
});

export type BranchParsed = z.output<typeof branchInputSchema>;
