/**
 * Data yang dibaca src/proxy.ts di setiap request publik: peta redirect
 * (tabel `Redirect`), daftar slug halaman terbit (`StaticPage`), dan periode
 * promo (`Promo`, untuk 404 promo yang tidak aktif). Disimpan
 * di memori dengan TTL supaya proxy tidak menanyai database di setiap request.
 */

import {
  normalizePath,
  type RedirectTarget,
} from "@/lib/domain/page-url";

type RedirectMap = ReadonlyMap<string, RedirectTarget>;

const DEFAULT_TTL_MS = 30_000;
const FAILURE_BACKOFF_MS = 10_000;
// Semua request publik menunggu pemuatan yang sama (single-flight); tanpa batas
// waktu, satu query database yang menggantung akan menahan seluruh situs.
const LOAD_TIMEOUT_MS = 3_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
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

function createTtlLoader<T>(
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

const loadRedirects = createTtlLoader<RedirectMap>(
  "tabel Redirect",
  async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.redirect.findMany({
      select: { fromPath: true, toPath: true, statusCode: true },
    });
    const map = new Map<string, RedirectTarget>();
    for (const row of rows) {
      map.set(normalizePath(row.fromPath), {
        toPath: row.toPath,
        statusCode: row.statusCode === 302 ? 302 : 301,
      });
    }
    return map;
  },
  () => new Map(),
);

const loadPublishedSlugs = createTtlLoader<ReadonlySet<string>>(
  "daftar halaman terbit",
  async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.staticPage.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
    });
    return new Set(rows.map((row) => row.slug));
  },
  () => new Set(),
);

/** Peta `fromPath` (sudah dinormalisasi) → tujuan redirect. Tidak pernah throw. */
export async function getRedirectMap(): Promise<RedirectMap> {
  return (await loadRedirects()).value;
}

/** Slug `StaticPage` berstatus PUBLISHED. Tidak pernah throw. */
export function getPublishedPageSlugs(): Promise<Cached<ReadonlySet<string>>> {
  return loadPublishedSlugs();
}

export type PromoPeriod = {
  isPublished: boolean;
  startDate: Date | null;
  endDate: Date | null;
};

const PROMO_PERIOD_SELECT = {
  slug: true,
  isPublished: true,
  startDate: true,
  endDate: true,
} as const;

const loadPromoPeriods = createTtlLoader<ReadonlyMap<string, PromoPeriod>>(
  "periode promo",
  async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.promo.findMany({ select: PROMO_PERIOD_SELECT });
    return new Map(rows.map(({ slug, ...period }) => [slug, period]));
  },
  () => new Map(),
);

/** Periode semua promo (per slug), dari cache ber-TTL. Tidak pernah throw. */
export function getPromoPeriods(): Promise<Cached<ReadonlyMap<string, PromoPeriod>>> {
  return loadPromoPeriods();
}

/**
 * Periode satu promo langsung dari database (tanpa cache) — dipakai sebelum
 * menjawab 404, supaya promo yang baru dipublikasikan tidak ikut tertolak
 * selama cache belum diperbarui. `undefined` = database tidak bisa dibaca.
 */
export async function fetchPromoPeriod(
  slug: string,
): Promise<PromoPeriod | null | undefined> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const row = await withTimeout(
      prisma.promo.findUnique({ where: { slug }, select: PROMO_PERIOD_SELECT }),
      LOAD_TIMEOUT_MS,
    );
    if (!row) return null;
    return { isPublished: row.isPublished, startDate: row.startDate, endDate: row.endDate };
  } catch {
    return undefined;
  }
}
