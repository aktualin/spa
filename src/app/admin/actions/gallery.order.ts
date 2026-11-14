"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { readDirection } from "./form-utils";
import { revalidateGallery } from "./gallery.helpers";
import { reorderSiblings } from "./reorder";

/**
 * Naikkan/turunkan urutan foto. Seluruh foto album ditulis ulang menjadi
 * 0..n-1 dalam satu transaksi, sehingga nilai sortOrder kembar (mis. data
 * lama yang semuanya 0) ikut dirapikan dan tombol selalu berpengaruh.
 */
export async function movePhotoAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const direction = readDirection(formData);
  if (!id || !direction) return;

  const photo = await prisma.galleryPhoto.findUnique({
    where: { id },
    select: { albumId: true },
  });
  if (!photo) return;

  // Urutan sama persis dengan yang tampil di admin & /gallery.
  const siblings = await prisma.galleryPhoto.findMany({
    where: { albumId: photo.albumId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    select: { id: true, sortOrder: true },
  });
  await reorderSiblings(siblings, id, direction, (rowId, sortOrder) =>
    prisma.galleryPhoto.update({ where: { id: rowId }, data: { sortOrder } }),
  );

  revalidateGallery();
  redirect(`/admin/gallery/${photo.albumId}?saved=1`);
}

/**
 * Naikkan/turunkan urutan album di /gallery. Sama seperti foto: semua album
 * ditulis ulang menjadi 0..n-1 dalam satu transaksi.
 */
export async function moveAlbumAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const direction = readDirection(formData);
  if (!id || !direction) return;

  // Urutan sama dengan getGalleryAlbums (sortOrder, lalu nama).
  const albums = await prisma.galleryAlbum.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, sortOrder: true },
  });
  if (!albums.some((album) => album.id === id)) return;

  await reorderSiblings(albums, id, direction, (rowId, sortOrder) =>
    prisma.galleryAlbum.update({ where: { id: rowId }, data: { sortOrder } }),
  );

  revalidateGallery();
  redirect("/admin/gallery?saved=1");
}