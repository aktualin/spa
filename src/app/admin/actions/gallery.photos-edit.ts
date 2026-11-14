"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import { firstIssue, text } from "../promos/_kit/schema";
import { photoUrlSchema, revalidateGallery, type ActionState } from "./gallery.helpers";

export async function deletePhotoAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const photo = await prisma.galleryPhoto.findUnique({
    where: { id },
    select: { imageUrl: true, album: { select: { id: true, slug: true } } },
  });
  if (!photo) return;

  await prisma.galleryPhoto.delete({ where: { id } });
  if (photo.imageUrl) {
    await deleteImageByUrl(photo.imageUrl).catch(() => {});
  }

  revalidateGallery();
  redirect(`/admin/gallery/${photo.album.id}?deleted=1`);
}

/**
 * Ganti berkas satu foto. Caption, alt text, dan urutan tidak berubah.
 * Berkas lama dihapus dari storage setelah berhasil (kecuali tercatat di
 * Media Library — `deleteImageByUrl` melewatinya).
 */
export async function replacePhotoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Foto tidak ditemukan." };

  const parsed = photoUrlSchema.safeParse(text(formData, "imageUrl") ?? "");
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const imageUrl = parsed.data;

  const photo = await prisma.galleryPhoto.findUnique({
    where: { id },
    select: { albumId: true, imageUrl: true },
  });
  if (!photo) return { error: "Foto tidak ditemukan." };

  if (photo.imageUrl === imageUrl) {
    return { error: "Pilih atau unggah foto pengganti terlebih dahulu." };
  }

  await prisma.galleryPhoto.update({ where: { id }, data: { imageUrl } });
  if (photo.imageUrl) {
    await deleteImageByUrl(photo.imageUrl).catch(() => {});
  }

  revalidateGallery();
  redirect(`/admin/gallery/${photo.albumId}?saved=1`);
}

