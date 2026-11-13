/**
 * Bacaan publik gambar konten multi-slot (ContentImage).
 *
 * Setiap entitas konten bisa punya 0..N gambar; halaman publik merender satu
 * gambar sebagai <img> biasa dan lebih dari satu sebagai carousel. DB tidak
 * terbaca atau entitas tanpa gambar → daftar kosong (empty state), bukan error.
 */
import { cacheLife, cacheTag } from "next/cache";

import {
  CONTENT_IMAGE_TAG,
  type ContentImageEntityType,
} from "@/lib/domain/content-image";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type ContentImage = {
  imageUrl: string;
  altText: string | null;
};

const ORDER = [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }] as const;

async function fetchRows(
  entityType: ContentImageEntityType,
  entityId: string,
): Promise<ContentImage[]> {
  const { prisma } = await import("@/lib/prisma");
  return prisma.contentImage.findMany({
    where: { entityType, entityId },
    orderBy: [...ORDER],
    select: { imageUrl: true, altText: true },
  });
}

/** Gambar sebuah entitas, urut sortOrder (urutan sama dengan di admin). */
export async function getContentImages(
  entityType: ContentImageEntityType,
  entityId: string,
): Promise<ContentImage[]> {
  "use cache";
  cacheTag(CONTENT_IMAGE_TAG[entityType]);

  const { data, usedFallback } = await safeQueryWithMeta(
    () => fetchRows(entityType, entityId),
    [],
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

/**
 * Gambar entri katalog berdasarkan slug: slug bisa milik Treatment atau
 * Package, jadi id-nya dicari dulu. Dipakai `/menu/[slug]`,
 * `/treatments/[kategori]/[slug]`, dan `/treatments/packages/[slug]`.
 * Keduanya berbagi tag cache `catalog`, dan hanya entitas published yang
 * gambarnya dikembalikan.
 */
export async function getCatalogImagesBySlug(slug: string): Promise<ContentImage[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.catalog);

  const { data, usedFallback } = await safeQueryWithMeta<ContentImage[]>(async () => {
    const { prisma } = await import("@/lib/prisma");

    const treatment = await prisma.treatment.findFirst({
      where: { slug, isPublished: true },
      select: { id: true },
    });
    if (treatment) return fetchRows("treatment", treatment.id);

    const pkg = await prisma.package.findFirst({
      where: { slug, isPublished: true },
      select: { id: true },
    });
    return pkg ? fetchRows("package", pkg.id) : [];
  }, []);

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}
