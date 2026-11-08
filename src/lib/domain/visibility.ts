/**
 * Aturan visibilitas konten.
 *
 * Fungsi-fungsi di sini murni (tidak menyentuh database), supaya bisa diuji
 * secara unit dan dipakai bersama oleh halaman publik maupun admin.
 */

/** Promo tampil publik bila published, sudah dimulai, dan belum berakhir. */
export function isPromoActive(
  promo: {
    isPublished?: boolean;
    startDate?: Date | null;
    endDate?: Date | null;
  },
  now: Date = new Date(),
): boolean {
  if (promo.isPublished === false) return false;
  if (promo.startDate && promo.startDate.getTime() > now.getTime()) return false;
  if (promo.endDate && promo.endDate.getTime() < now.getTime()) return false;
  return true;
}

export type JournalVisibilityInput = {
  status: string;
  publishedAt?: Date | null;
};

/**
 * Journal tampil publik bila status PUBLISHED dan (kalau ada) tanggal
 * publikasinya sudah lewat. Post terjadwal (SCHEDULED) ikut tampil begitu
 * waktunya tiba.
 */
export function isJournalVisible(
  post: JournalVisibilityInput,
  now: Date = new Date(),
): boolean {
  if (post.status === "PUBLISHED") {
    if (!post.publishedAt) return true;
    return post.publishedAt.getTime() <= now.getTime();
  }
  // Dicek saat dibaca (tanpa cron): SCHEDULED terbit otomatis setelah jadwalnya.
  if (post.status === "SCHEDULED") {
    return !!post.publishedAt && post.publishedAt.getTime() <= now.getTime();
  }
  return false;
}

/** Urutan tampilan journal: terbaru dulu. */
export function sortJournalByDate<T extends { publishedAt: Date | null }>(
  posts: T[],
): T[] {
  return [...posts].sort((a, b) => {
    const at = a.publishedAt?.getTime() ?? 0;
    const bt = b.publishedAt?.getTime() ?? 0;
    return bt - at;
  });
}
