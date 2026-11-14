"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { richTextInput } from "@/lib/domain/rich-text";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import { checked, firstIssue, text } from "../promos/_kit/schema";
import { albumSchema, revalidateGallery, type ActionState } from "./gallery.helpers";

/** Simpan album baru (id kosong) atau ubah album yang ada. */
export async function saveAlbumAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const parsed = albumSchema.safeParse({
    slug: text(formData, "slug"),
    name: text(formData, "name"),
    description: richTextInput(formData.get("description")),
    coverUrl: text(formData, "coverUrl"),
    isPublished: checked(formData, "isPublished"),
    sortOrder: text(formData, "sortOrder") ?? 0,
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const data = parsed.data;

  const clash = await prisma.galleryAlbum.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { error: `Slug "${data.slug}" sudah dipakai album lain.` };
  }

  // Cover lama yang diganti ikut dihapus dari storage.
  if (id) {
    const previous = await prisma.galleryAlbum.findUnique({
      where: { id },
      select: { coverUrl: true },
    });
    if (previous?.coverUrl && previous.coverUrl !== data.coverUrl) {
      await deleteImageByUrl(previous.coverUrl).catch(() => {});
    }
  }

  if (id) {
    await prisma.galleryAlbum.update({ where: { id }, data });
  } else {
    await prisma.galleryAlbum.create({ data });
  }

  revalidateGallery();
  redirect("/admin/gallery?saved=1");
}

export async function deleteAlbumAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const album = await prisma.galleryAlbum.findUnique({
    where: { id },
    include: { photos: { select: { imageUrl: true } } },
  });
  if (!album) return;

  await prisma.galleryAlbum.delete({ where: { id } });

  // Foto ikut terhapus oleh cascade; file di storage dibersihkan manual.
  for (const photo of album.photos) {
    if (photo.imageUrl) await deleteImageByUrl(photo.imageUrl).catch(() => {});
  }
  if (album.coverUrl) await deleteImageByUrl(album.coverUrl).catch(() => {});

  revalidateGallery();
  redirect("/admin/gallery?deleted=1");
}