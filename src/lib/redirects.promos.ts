/** Periode promo untuk proxy — lihat `redirects.ts`. */
import {
  type Cached,
  LOAD_TIMEOUT_MS,
  createTtlLoader,
  withTimeout,
} from "./redirects.loader";

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