/** Perencanaan & resolusi redirect — lihat `page-url.ts`. */
import { isSystemPath, normalizePath } from "./page-url.path.ts";

export type RedirectRule = { fromPath: string; toPath: string };

/**
 * True bila menambah `fromPath → toPath` membentuk putaran, dengan mengikuti
 * rantai redirect yang sudah ada mulai dari `toPath`.
 */
export function createsRedirectLoop(
  existing: readonly RedirectRule[],
  fromPath: string,
  toPath: string,
): boolean {
  const map = new Map(
    existing
      .filter((r) => normalizePath(r.fromPath) !== normalizePath(fromPath))
      .map((r) => [normalizePath(r.fromPath), r.toPath]),
  );
  const start = normalizePath(fromPath);
  let current = toPath;
  for (let step = 0; step <= map.size; step += 1) {
    if (!current.startsWith("/")) return false; // eksternal = ujung rantai
    const key = normalizePath(current);
    if (key === start) return true;
    const next = map.get(key);
    if (next === undefined) return false;
    current = next;
  }
  return true;
}

export type SlugRedirectPlan = {
  /** Redirect yang dibuat/diubah (upsert berdasarkan fromPath). */
  upserts: RedirectRule[];
  /** fromPath redirect yang harus dihapus. */
  deletes: string[];
};

/**
 * Perubahan redirect saat URL halaman pindah dari `oldPath` ke `newPath`:
 * 1. URL lama dialihkan ke URL baru.
 * 2. Redirect lain yang menuju URL lama diarahkan langsung ke URL baru
 *    (rantai A→B→C diratakan menjadi A→C).
 * 3. Redirect yang berasal dari URL baru dihapus — halaman kini hidup di sana,
 *    jadi alamat itu tidak boleh lagi dialihkan (sekaligus mencegah loop saat
 *    slug dikembalikan ke nilai lama).
 */
export function planSlugRedirect(
  existing: readonly RedirectRule[],
  oldPath: string,
  newPath: string,
): SlugRedirectPlan {
  const from = normalizePath(oldPath);
  const to = normalizePath(newPath);
  if (from === to) return { upserts: [], deletes: [] };

  const deletes = existing
    .filter((r) => normalizePath(r.fromPath) === to)
    .map((r) => r.fromPath);

  const upserts: RedirectRule[] = existing
    .filter(
      (r) =>
        r.toPath.startsWith("/") &&
        normalizePath(r.toPath) === from &&
        normalizePath(r.fromPath) !== to &&
        normalizePath(r.fromPath) !== from,
    )
    .map((r) => ({ fromPath: r.fromPath, toPath: to }));

  upserts.push({ fromPath: from, toPath: to });
  return { upserts, deletes };
}

export type RedirectTarget = { toPath: string; statusCode: number };

/** Dipakai proxy: cari tujuan redirect untuk pathname permintaan. */
export function resolveRedirect(
  map: ReadonlyMap<string, RedirectTarget>,
  pathname: string,
): RedirectTarget | null {
  if (isSystemPath(pathname)) return null;
  return map.get(normalizePath(pathname)) ?? null;
}