/** Slug event terbit untuk proxy — lihat `redirects.ts`. */
import {
  type Cached,
  LOAD_TIMEOUT_MS,
  createTtlLoader,
  withTimeout,
} from "./redirects.loader";

const loadPublishedEventSlugs = createTtlLoader<ReadonlySet<string>>(
  "daftar event terbit",
  async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.eventItem.findMany({
      where: { isPublished: true },
      select: { slug: true },
    });
    return new Set(rows.map((row) => row.slug));
  },
  () => new Set(),
);

/** Slug event berstatus terbit, dari cache ber-TTL. Tidak pernah throw. */
export function getPublishedEventSlugs(): Promise<Cached<ReadonlySet<string>>> {
  return loadPublishedEventSlugs();
}

/**
 * Apakah event dengan slug ini terbit, langsung dari database (tanpa cache) —
 * dipakai sebelum menjawab 404. `undefined` = database tidak bisa dibaca.
 */
export async function fetchEventPublished(slug: string): Promise<boolean | undefined> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const row = await withTimeout(
      prisma.eventItem.findFirst({ where: { slug, isPublished: true }, select: { id: true } }),
      LOAD_TIMEOUT_MS,
    );
    return Boolean(row);
  } catch {
    return undefined;
  }
}