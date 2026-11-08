import type { Prisma } from "@prisma/client";

import { normalizePath, planSlugRedirect } from "@/lib/domain/page-url";

export type PathMove = { from: string; to: string };

/**
 * Catat perpindahan URL publik sebagai redirect 301 (rantai diratakan, loop
 * dicegah — lihat planSlugRedirect). Mengembalikan true bila tabel Redirect
 * berubah, supaya pemanggil tahu perlu `updateTag(CONTENT_TAGS.redirects)`.
 */
export async function recordPathMoves(
  db: Prisma.TransactionClient,
  moves: PathMove[],
  note: string,
): Promise<boolean> {
  let changed = false;
  for (const move of moves) {
    if (normalizePath(move.from) === normalizePath(move.to)) continue;

    const existing = await db.redirect.findMany({ select: { fromPath: true, toPath: true } });
    const plan = planSlugRedirect(existing, move.from, move.to);
    if (plan.deletes.length > 0) {
      await db.redirect.deleteMany({ where: { fromPath: { in: plan.deletes } } });
    }
    for (const rule of plan.upserts) {
      await db.redirect.upsert({
        where: { fromPath: rule.fromPath },
        create: { ...rule, statusCode: 301, source: "auto", note },
        // Redirect yang sudah ada (bisa manual) hanya diarahkan ulang.
        update: { toPath: rule.toPath, statusCode: 301 },
      });
    }
    changed = true;
  }
  return changed;
}

export const treatmentPath = (categorySlug: string, treatmentSlug: string) =>
  `/treatments/${categorySlug}/${treatmentSlug}`;
export const categoryPath = (categorySlug: string) => `/treatments/${categorySlug}`;
export const packagePath = (packageSlug: string) => `/treatments/packages/${packageSlug}`;
