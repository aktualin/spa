import type { Prisma } from "@prisma/client";

import { packagePath, recordPathMoves } from "@/lib/path-moves";
import { prisma } from "@/lib/prisma";

import type { ItemRow } from "./packages.helpers";

/**
 * Tulis package + item-nya dalam satu transaksi. Item ditulis ulang utuh,
 * sama seperti opsi harga di treatment. Alamat lama package yang sudah tayang
 * tetap hidup lewat 301.
 */
export async function persistPackage(
  id: string,
  data: Prisma.PackageUncheckedCreateInput,
  items: ItemRow[],
  wasPublished: boolean,
  previousSlug: string | undefined,
) {
  return prisma.$transaction(async (tx) => {
    const saved = id
      ? await tx.package.update({ where: { id }, data })
      : await tx.package.create({ data });

    await tx.packageItem.deleteMany({ where: { packageId: saved.id } });
    if (items.length > 0) {
      await tx.packageItem.createMany({
        data: items.map((item, index) => ({
          packageId: saved.id,
          treatmentId: item.treatmentId,
          label: item.label,
          minutes: item.minutes,
          sortOrder: index,
        })),
      });
    }

    const moved =
      wasPublished && previousSlug
        ? await recordPathMoves(
            tx,
            [{ from: packagePath(previousSlug), to: packagePath(saved.slug) }],
            `Slug package "${saved.name}" diubah`,
          )
        : false;
    return { pkg: saved, redirectsChanged: moved };
  });
}