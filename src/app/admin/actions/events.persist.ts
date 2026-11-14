import { normalizePath } from "@/lib/domain/page-url";
import { recordPathMoves } from "@/lib/path-moves";
import { prisma } from "@/lib/prisma";

import { eventPath, type EventData } from "./events.helpers";

type PreviousEvent = { slug: string; title: string; isPublished: boolean } | null;

/**
 * Simpan event dalam satu transaksi. URL publik lama tetap hidup (301) bila
 * slug event yang tayang diganti.
 */
export async function persistEvent(
  id: string | null,
  data: EventData,
  previous: PreviousEvent,
): Promise<{ saved: { id: string }; redirectsChanged: boolean }> {
  return prisma.$transaction(async (tx) => {
    const saved = id
      ? await tx.eventItem.update({ where: { id }, data, select: { id: true } })
      : await tx.eventItem.create({ data, select: { id: true } });
    let redirectsChanged =
      previous && previous.isPublished && previous.slug !== data.slug
        ? await recordPathMoves(
            tx,
            [{ from: eventPath(previous.slug), to: eventPath(data.slug) }],
            `Event "${data.title}" pindah alamat`,
          )
        : false;
    // Slug yang dulu ditinggalkan event lain bisa masih punya redirect otomatis;
    // tanpa dibersihkan, alamat event yang tayang ini akan dialihkan.
    if (data.isPublished) {
      const stale = await tx.redirect.deleteMany({
        where: { fromPath: normalizePath(eventPath(data.slug)), source: "auto" },
      });
      if (stale.count > 0) redirectsChanged = true;
    }
    return { saved, redirectsChanged };
  });
}