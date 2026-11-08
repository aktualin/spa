/**
 * Pembungkus query database yang aman.
 *
 * Prinsip dari plan arsitektur: "browsing tidak pernah rusak total meski DB
 * down". Semua bacaan data publik melewati helper ini — kalau query gagal,
 * nilai cadangan statis dikembalikan, bukan exception.
 */

export type SafeQueryResult<T> = {
  data: T;
  /** true kalau data diambil dari fallback, bukan dari database. */
  usedFallback: boolean;
};

/**
 * Menjalankan `query`; kalau gagal (DB tidak terjangkau, tabel belum ada,
 * dan sejenisnya) mengembalikan `fallback`.
 */
export async function safeQuery<T>(
  query: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await query();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[content] database tidak terbaca, memakai data statis:", error);
    }
    return fallback;
  }
}

/** Versi `safeQuery` yang ikut memberi tahu apakah fallback terpakai. */
export async function safeQueryWithMeta<T>(
  query: () => Promise<T>,
  fallback: T,
): Promise<SafeQueryResult<T>> {
  try {
    return { data: await query(), usedFallback: false };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[content] database tidak terbaca, memakai data statis:", error);
    }
    return { data: fallback, usedFallback: true };
  }
}
