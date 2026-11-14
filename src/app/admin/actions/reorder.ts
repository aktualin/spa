import type { Prisma } from "@prisma/client";

import { sequentialSortOrders } from "@/lib/domain/gallery";
import { moveInList } from "@/lib/domain/media";
import { prisma } from "@/lib/prisma";

/**
 * Geser satu baris naik/turun, lalu tulis ulang sortOrder seluruh saudaranya
 * menjadi 0..n-1 dalam satu transaksi. Hanya baris yang nilainya berubah yang
 * di-update, sehingga sortOrder kembar (mis. data lama yang semuanya 0) ikut
 * dirapikan dan tombol selalu berpengaruh.
 */
export async function reorderSiblings(
  siblings: { id: string; sortOrder: number }[],
  id: string,
  direction: "up" | "down",
  update: (id: string, sortOrder: number) => Prisma.PrismaPromise<unknown>,
): Promise<void> {
  const current = new Map(siblings.map((row) => [row.id, row.sortOrder]));
  const ordered = moveInList(
    siblings.map((row) => row.id),
    id,
    direction,
  );
  const updates = sequentialSortOrders(ordered).filter(
    (row) => current.get(row.id) !== row.sortOrder,
  );

  if (updates.length > 0) {
    await prisma.$transaction(updates.map((row) => update(row.id, row.sortOrder)));
  }
}