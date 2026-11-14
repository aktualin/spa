"use server";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Dipakai halaman list & detail. */
export async function listAlbums() {
  await requireSession();

  return prisma.galleryAlbum.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { photos: true } } },
  });
}

export async function getAlbumWithPhotos(albumId: string) {
  await requireSession();

  return prisma.galleryAlbum.findUnique({
    where: { id: albumId },
    include: {
      photos: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }] },
    },
  });
}