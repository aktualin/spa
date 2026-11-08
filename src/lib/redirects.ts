/**
 * Data yang dibaca src/proxy.ts di setiap request publik: peta redirect
 * (tabel `Redirect`) dan daftar slug halaman terbit (`StaticPage`). Disimpan
 * di memori dengan TTL supaya proxy tidak menanyai database di setiap request.
 */

import {
  normalizePath,
  type RedirectTarget,
} from "@/lib/domain/page-url";

type RedirectMap = ReadonlyMap<string, RedirectTarget>;

const DEFAULT_TTL_MS = 30_000;
const FAILURE_BACKOFF_MS = 10_000;

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
      const value = await load();
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
