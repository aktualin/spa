/** Satu entri /menu/[slug] — lihat `catalog.ts`. */
import { cacheLife, cacheTag } from "next/cache";

import type {
  Package as StaticPackage,
  Treatment as StaticTreatment,
} from "@/data/content";
import { toMenuPackages, toMenuTreatments } from "@/lib/domain/menu-catalog";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { PACKAGE_INCLUDE, toCatalogPackage } from "./catalog.package-row";
import { CONTENT_TAGS } from "./tags";

/**
 * Satu entri /menu/[slug] (treatment utama atau package), di-cache per slug
 * supaya item baru dari admin tidak 404 (lihat getCategory).
 */
export async function getMenuEntry(
  slug: string,
): Promise<StaticTreatment | StaticPackage | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.catalog);

  const { data, usedFallback } = await safeQueryWithMeta<StaticTreatment | StaticPackage | null>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const treatment = await prisma.treatment.findFirst({
        where: {
          slug,
          isPublished: true,
          category: { isPublished: true, kind: "TREATMENT" },
        },
        include: { options: { orderBy: { sortOrder: "asc" } } },
      });
      if (treatment) {
        return toMenuTreatments([{ kind: "TREATMENT", treatments: [treatment] }])[0] ?? null;
      }
      const pkg = await prisma.package.findFirst({
        where: { slug, isPublished: true },
        include: PACKAGE_INCLUDE,
      });
      return pkg ? toMenuPackages([toCatalogPackage(pkg)])[0] : null;
    },
    null,
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}