/** Visibilitas artikel journal untuk proxy — lihat `redirects.ts`. */
import {
  type Cached,
  LOAD_TIMEOUT_MS,
  createTtlLoader,
  withTimeout,
} from "./redirects.loader";

export type JournalVisibility = {
  status: string;
  publishedAt: Date | null;
};

const JOURNAL_VISIBILITY_SELECT = { status: true, publishedAt: true } as const;

const loadJournalVisibility = createTtlLoader<ReadonlyMap<string, JournalVisibility>>(
  "visibilitas artikel journal",
  async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.journalPost.findMany({
      select: { slug: true, ...JOURNAL_VISIBILITY_SELECT },
    });
    return new Map(rows.map(({ slug, ...visibility }) => [slug, visibility]));
  },
  () => new Map(),
);

/** Status & tanggal terbit semua artikel journal (per slug), dari cache ber-TTL. Tidak pernah throw. */
export function getJournalVisibility(): Promise<
  Cached<ReadonlyMap<string, JournalVisibility>>
> {
  return loadJournalVisibility();
}

/**
 * Status satu artikel journal langsung dari database (tanpa cache) — dipakai
 * sebelum menjawab 404, supaya artikel yang baru diterbitkan tidak tertolak
 * selama cache belum diperbarui. `undefined` = database tidak bisa dibaca.
 */
export async function fetchJournalVisibility(
  slug: string,
): Promise<JournalVisibility | null | undefined> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const row = await withTimeout(
      prisma.journalPost.findUnique({ where: { slug }, select: JOURNAL_VISIBILITY_SELECT }),
      LOAD_TIMEOUT_MS,
    );
    if (!row) return null;
    return { status: row.status, publishedAt: row.publishedAt };
  } catch {
    return undefined;
  }
}