import type { Prisma } from "@prisma/client";

import { normalizePath } from "@/lib/domain/page-url";
import { recordPathMoves } from "@/lib/path-moves";
import { prisma } from "@/lib/prisma";

import { promoPath } from "./promos.helpers";

/**
 * Tulis promo dalam satu transaksi. Ganti slug promo yang sedang tayang:
 * alamat lama dialihkan (301); redirect otomatis lama yang menutupi alamat
 * promo yang tayang ini dibersihkan. Mengembalikan true bila redirect berubah.
 */
export async function persistPromo(
  id: string,
  data: Prisma.PromoUncheckedCreateInput,
  previous: { slug: string; isPublished: boolean } | null,
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    if (id) {
      await tx.promo.update({ where: { id }, data });
    } else {
      await tx.promo.create({ data });
    }

    let changed =
      previous && previous.isPublished && previous.slug !== data.slug
        ? await recordPathMoves(
            tx,
            [{ from: promoPath(previous.slug), to: promoPath(data.slug) }],
            `Promo "${data.title}" pindah alamat`,
          )
        : false;
    if (data.isPublished) {
      const stale = await tx.redirect.deleteMany({
        where: { fromPath: normalizePath(promoPath(data.slug)), source: "auto" },
      });
      if (stale.count > 0) changed = true;
    }
    return changed;
  });
}