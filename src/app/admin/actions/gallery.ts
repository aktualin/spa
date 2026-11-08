"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { prisma } from "@/lib/prisma";
import {
  appendSortOrders,
  isPhotoUrl,
  parseBatchPhotoUrls,
  sequentialSortOrders,
} from "@/lib/domain/gallery";
import { moveInList } from "@/lib/domain/media";
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

const photoUrlSchema = z
  .string()
  .trim()
  .min(1, "Foto wajib diunggah.")
  .refine(isPhotoUrl, "URL foto tidak valid.");

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
  imageUrl: photoUrlSchema,
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

function readDirection(formData: FormData): "up" | "down" | null {
  const direction = String(formData.get("direction") ?? "");
  return direction === "up" || direction === "down" ? direction : null;
}

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
  const current = new Map(siblings.map((row) => [row.id, row.sortOrder]));
  const ordered = moveInList(
    siblings.map((row) => row.id),
    id,
    direction,
  );
  const updates = sequentialSortOrders(ordered).filter(
    (row) => current.get(row.id) !== row.sortOrder,
  );

  if (updates.length > 0) {
    await prisma.$transaction(
      updates.map((row) =>
        prisma.galleryPhoto.update({
          where: { id: row.id },
          data: { sortOrder: row.sortOrder },
        }),
      ),
    );
  }

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

  const current = new Map(albums.map((row) => [row.id, row.sortOrder]));
  const ordered = moveInList(
    albums.map((row) => row.id),
    id,
    direction,
  );
  const updates = sequentialSortOrders(ordered).filter(
    (row) => current.get(row.id) !== row.sortOrder,
  );

  if (updates.length > 0) {
    await prisma.$transaction(
      updates.map((row) =>
        prisma.galleryAlbum.update({
          where: { id: row.id },
          data: { sortOrder: row.sortOrder },
        }),
      ),
    );
  }

  revalidateGallery();
  redirect("/admin/gallery?saved=1");
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
    select: { albumId: true },
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
    include: {
      photos: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }] },
    },
  });
}
