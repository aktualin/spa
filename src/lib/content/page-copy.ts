/**
 * Bacaan teks halaman publik (`ContentBlock`).
 *
 * Satu query mengembalikan semua blok sebagai `Record<key, value>`; halaman
 * memakai helper `copy()` untuk mengambil nilai. Tanpa fallback statis: blok
 * yang belum ada di DB bernilai kosong dan pemanggil wajib menangani empty
 * state (menyembunyikan elemen atau menampilkan pesan kosong dari DB).
 */
import { cacheLife, cacheTag } from "next/cache";

import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type PageCopy = Record<string, string>;

export async function getPageCopy(): Promise<PageCopy> {
  "use cache";
  cacheTag(CONTENT_TAGS.pageCopy);

  const { data, usedFallback } = await safeQueryWithMeta<PageCopy>(async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.contentBlock.findMany({
      select: { key: true, value: true },
    });
    return Object.fromEntries(rows.map((row) => [row.key, row.value]));
  }, {});

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

/** Nilai blok yang sudah di-trim; blok kosong/tidak ada → string kosong. */
export function copy(blocks: PageCopy, key: string): string {
  return (blocks[key] ?? "").trim();
}

/** Untuk teks yang boleh memuat HTML tersanitasi dari admin. */
export function copyHtml(blocks: PageCopy, key: string): string {
  return copy(blocks, key);
}
