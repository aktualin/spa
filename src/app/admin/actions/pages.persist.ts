import type { Prisma } from "@prisma/client";

import { normalizePath, planSlugRedirect } from "@/lib/domain/page-url";
import { prisma } from "@/lib/prisma";

/**
 * Tulis halaman dalam satu transaksi, termasuk redirect slug lama dan
 * perebutan kembali URL dari redirect yang menutupinya. Mengembalikan true
 * bila ada redirect yang berubah.
 */
export async function persistPage(
  id: string,
  data: Prisma.StaticPageUncheckedCreateInput,
  publishedAt: Date | null,
  needsSlugRedirect: boolean,
  oldPath: string | null,
  newPath: string,
  title: string,
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    let changed = false;
    const existing = await tx.redirect.findMany({
      select: { fromPath: true, toPath: true },
    });

    const deletes = new Set<string>();
    const upserts: { fromPath: string; toPath: string }[] = [];

    if (needsSlugRedirect && oldPath) {
      const plan = planSlugRedirect(existing, oldPath, newPath);
      plan.deletes.forEach((path) => deletes.add(path));
      upserts.push(...plan.upserts);
    }
    // Halaman terbit merebut kembali URL-nya: redirect dari alamat ini akan menutupi halaman.
    if (data.status === "PUBLISHED") {
      existing
        .filter((r) => normalizePath(r.fromPath) === newPath)
        .forEach((r) => deletes.add(r.fromPath));
    }

    if (deletes.size > 0) {
      await tx.redirect.deleteMany({ where: { fromPath: { in: [...deletes] } } });
      changed = true;
    }

    const note = `Slug halaman "${title}" diubah`;
    for (const rule of upserts) {
      await tx.redirect.upsert({
        where: { fromPath: rule.fromPath },
        create: {
          fromPath: rule.fromPath,
          toPath: rule.toPath,
          statusCode: 301,
          source: "auto",
          note,
        },
        // Redirect yang sudah ada (bisa manual) hanya diarahkan ulang; asal & catatannya dipertahankan.
        update: { toPath: rule.toPath, statusCode: 301 },
      });
      changed = true;
    }

    const values = { ...data, publishedAt };
    if (id) {
      await tx.staticPage.update({ where: { id }, data: values });
    } else {
      await tx.staticPage.create({ data: values });
    }
    return changed;
  });
}