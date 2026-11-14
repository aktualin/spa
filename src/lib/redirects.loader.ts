/** Cache ber-TTL single-flight untuk data proxy — lihat `redirects.ts`. */

const DEFAULT_TTL_MS = 30_000;
const FAILURE_BACKOFF_MS = 10_000;
// Semua request publik menunggu pemuatan yang sama (single-flight); tanpa batas
// waktu, satu query database yang menggantung akan menahan seluruh situs.
export const LOAD_TIMEOUT_MS = 3_000;

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`melebihi ${ms} ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function cacheTtlMs(): number {
  const raw = process.env.REDIRECT_CACHE_TTL_MS;
  if (raw === undefined || raw.trim() === "") return DEFAULT_TTL_MS;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_TTL_MS;
  return Math.max(0, parsed);
}

export type Cached<T> = {
  value: T;
  /** false bila belum pernah berhasil dimuat (database bermasalah sejak awal). */
  loaded: boolean;
};

export function createTtlLoader<T>(
  label: string,
  load: () => Promise<T>,
  empty: () => T,
): () => Promise<Cached<T>> {
  let cached: { value: T; loaded: boolean; expiresAt: number } | null = null;
  let inFlight: Promise<Cached<T>> | null = null;
  let failing = false;

  async function refresh(): Promise<Cached<T>> {
    try {
      const value = await withTimeout(load(), LOAD_TIMEOUT_MS);
      cached = { value, loaded: true, expiresAt: Date.now() + cacheTtlMs() };
      failing = false;
    } catch (error) {
      if (!failing) {
        console.warn(
          `[proxy] Gagal memuat ${label}; memakai data terakhir.`,
          error instanceof Error ? error.message : error,
        );
      }
      failing = true;
      // Jeda sebelum mencoba lagi agar database yang bermasalah tidak dibanjiri.
      cached = {
        value: cached?.value ?? empty(),
        loaded: cached?.loaded ?? false,
        expiresAt: Date.now() + FAILURE_BACKOFF_MS,
      };
    }
    return { value: cached.value, loaded: cached.loaded };
  }

  return () => {
    if (cached && Date.now() < cached.expiresAt) {
      return Promise.resolve({ value: cached.value, loaded: cached.loaded });
    }
    inFlight ??= refresh().finally(() => {
      inFlight = null;
    });
    return inFlight;
  };
}