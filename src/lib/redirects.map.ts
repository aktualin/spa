/** Peta redirect & slug halaman terbit — lihat `redirects.ts`. */
import { normalizePath, type RedirectTarget } from "@/lib/domain/page-url";

import { type Cached, createTtlLoader } from "./redirects.loader";

export type RedirectMap = ReadonlyMap<string, RedirectTarget>;

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