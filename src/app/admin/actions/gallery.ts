"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { prisma } from "@/lib/prisma";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { deleteImageByUrl } from "@/lib/storage";

import {
  checked,
  firstIssue,
  optionalImageUrl,
  optionalText,
  slugSchema,
  sortOrderSchema,
  text,
} from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

const albumSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1, "Nama album wajib diisi."),
  description: optionalText,
  coverUrl: optionalImageUrl,
  isPublished: z.boolean(),
  sortOrder: sortOrderSchema,
});

const photoSchema = z.object({
  albumId: z.string().trim().min(1, "Album wajib diisi."),
  imageUrl: z
    .string()
    .trim()
    .min(1, "Foto wajib diunggah.")
    .refine(
      (value) => /^https?:\/\//.test(value) || value.startsWith("/"),
      "URL foto tidak valid.",
    ),
  caption: optionalText,
  altText: optionalText,
  sortOrder: z.coerce.number().int().min(0).default(0),
});

// Album tidak punya halaman sendiri — seluruhnya tampil di /gallery.
function revalidateGallery() {
  updateTag(CONTENT_TAGS.gallery);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

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
    description: text(formData, "description"),
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

/** Naikkan turun urutan foto (tukar posisi dengan tetangga). */
export async function movePhotoAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || (direction !== "up" && direction !== "down")) return;

  const photo = await prisma.galleryPhoto.findUnique({
    where: { id },
    select: { id: true, albumId: true, sortOrder: true },
  });
  if (!photo) return;

  const neighbour = await prisma.galleryPhoto.findFirst({
    where: {
      albumId: photo.albumId,
      ...(direction === "up"
        ? { sortOrder: { lt: photo.sortOrder } }
        : { sortOrder: { gt: photo.sortOrder } }),
    },
    orderBy: direction === "up" ? { sortOrder: "desc" } : { sortOrder: "asc" },
    select: { id: true, sortOrder: true },
  });

  if (neighbour) {
    await prisma.$transaction([
      prisma.galleryPhoto.update({
        where: { id: photo.id },
        data: { sortOrder: neighbour.sortOrder },
      }),
      prisma.galleryPhoto.update({
        where: { id: neighbour.id },
        data: { sortOrder: photo.sortOrder },
      }),
    ]);
  }

  const album = await prisma.galleryAlbum.findUnique({
    where: { id: photo.albumId },
    select: { slug: true },
  });
  revalidateGallery();
  redirect(`/admin/gallery/${photo.albumId}?saved=1`);
}

/** Ubah caption/alt text satu foto. */
export async function updatePhotoMetaAction(formData: FormData): Promise<void> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const parsed = z
    .object({
      caption: optionalText,
      altText: optionalText,
    })
    .safeParse({
      caption: text(formData, "caption"),
      altText: text(formData, "altText"),
    });

  if (!parsed.success) return;
  if (!id) return;

  const photo = await prisma.galleryPhoto.findUnique({
    where: { id },
    select: { albumId: true, album: { select: { slug: true } } },
  });
  if (!photo) return;

  await prisma.galleryPhoto.update({
    where: { id },
    data: parsed.data,
  });

  revalidateGallery();
  redirect(`/admin/gallery/${photo.albumId}?saved=1`);
}

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
    include: { photos: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
  });
}
