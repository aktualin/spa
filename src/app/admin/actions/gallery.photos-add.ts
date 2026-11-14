"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { appendSortOrders, parseBatchPhotoUrls } from "@/lib/domain/gallery";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { firstIssue, text } from "../promos/_kit/schema";
import { photoSchema, revalidateGallery, type ActionState } from "./gallery.helpers";

/** Tambah satu foto ke album. */
export async function addPhotoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const parsed = photoSchema.safeParse({
    albumId: text(formData, "albumId"),
    imageUrl: text(formData, "imageUrl"),
    caption: text(formData, "caption"),
    altText: text(formData, "altText"),
    sortOrder: text(formData, "sortOrder") ?? 0,
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const data = parsed.data;

  const album = await prisma.galleryAlbum.findUnique({
    where: { id: data.albumId },
    select: { id: true, slug: true },
  });
  if (!album) return { error: "Album tidak ditemukan." };

  // Foto baru diletakkan di urutan paling akhir.
  const last = await prisma.galleryPhoto.findFirst({
    where: { albumId: data.albumId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await prisma.galleryPhoto.create({
    data: {
      albumId: data.albumId,
      imageUrl: data.imageUrl,
      caption: data.caption,
      altText: data.altText,
      sortOrder: last ? last.sortOrder + 1 : 0,
    },
  });

  revalidateGallery();
  redirect(`/admin/gallery/${album.id}?saved=1`);
}

/**
 * Tambah banyak foto sekaligus (berkas sudah diunggah satu per satu oleh
 * klien ke /api/admin/upload). Foto diletakkan berurutan di akhir album.
 */
export async function addPhotosAction(
  albumId: string,
  urls: string[],
): Promise<ActionState & { count?: number }> {
  await requireRole(CONTENT_ROLES);

  if (typeof albumId !== "string" || !albumId) {
    return { error: "Album tidak ditemukan." };
  }
  const parsed = parseBatchPhotoUrls(urls);
  if (!parsed.ok) return { error: parsed.error };

  const album = await prisma.galleryAlbum.findUnique({
    where: { id: albumId },
    select: { id: true },
  });
  if (!album) return { error: "Album tidak ditemukan." };

  await prisma.$transaction(async (tx) => {
    const last = await tx.galleryPhoto.findFirst({
      where: { albumId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const orders = appendSortOrders(last?.sortOrder ?? null, parsed.urls.length);
    await tx.galleryPhoto.createMany({
      data: parsed.urls.map((imageUrl, index) => ({
        albumId,
        imageUrl,
        sortOrder: orders[index],
      })),
    });
  });

  revalidateGallery();
  return { error: null, ok: true, count: parsed.urls.length };
}