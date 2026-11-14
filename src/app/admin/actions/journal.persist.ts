import type { Prisma } from "@prisma/client";

import { journalPath } from "@/lib/domain/journal";
import { normalizePath } from "@/lib/domain/page-url";
import { recordPathMoves } from "@/lib/path-moves";
import { prisma } from "@/lib/prisma";

/**
 * Tulis artikel dalam satu transaksi, termasuk pindah alamat slug (301) dan
 * perebutan kembali URL dari redirect yang menutupinya. Mengembalikan true
 * bila ada redirect yang berubah.
 */
export async function persistJournalPost(opts: {
  id: string;
  payload: Prisma.JournalPostUncheckedCreateInput;
  previous: { slug: string } | null;
  needsSlugRedirect: boolean;
  title: string;
  newPath: string;
  publishing: boolean;
}): Promise<boolean> {
  const { id, payload, previous, needsSlugRedirect, title, newPath, publishing } = opts;
  return prisma.$transaction(async (tx) => {
    let changed = false;

    if (needsSlugRedirect && previous) {
      changed = await recordPathMoves(
        tx,
        [{ from: journalPath(previous.slug), to: newPath }],
        `Slug artikel journal "${title}" diubah`,
      );
    }

    // Artikel (akan) terbit merebut kembali URL-nya: redirect dari alamat ini
    // akan menutupi artikel.
    if (publishing) {
      const shadowing = (
        await tx.redirect.findMany({ select: { fromPath: true } })
      ).filter((r) => normalizePath(r.fromPath) === newPath);
      if (shadowing.length > 0) {
        await tx.redirect.deleteMany({
          where: { fromPath: { in: shadowing.map((r) => r.fromPath) } },
        });
        changed = true;
      }
    }

    if (id) {
      await tx.journalPost.update({ where: { id }, data: payload });
    } else {
      await tx.journalPost.create({ data: payload });
    }
    return changed;
  });
}