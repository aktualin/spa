"use server";

import { updateTag } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import {
  CONTENT_IMAGE_TAG,
  MAX_CONTENT_IMAGES,
  type ContentImageEntityType,
  type ContentImageRow,
} from "@/lib/domain/content-image";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

const CONTENT_ROLES = ["ADMIN", "EDITOR"] as const;

const rowsSchema = z
  .array(
    z.object({
      // Hanya URL yang disimpan; file-nya ada di Supabase Storage.
      imageUrl: z.string().trim().url("URL gambar tidak valid."),
      altText: z
        .string()
        .trim()
        .max(160, "Teks alt maksimal 160 karakter.")
        .nullish(),
    }),
  )
  .max(MAX_CONTENT_IMAGES, `Maksimal ${MAX_CONTENT_IMAGES} gambar per konten.`);

/**
 * Tulis ulang daftar gambar sebuah entitas: delete + create dalam satu
 * transaksi (pola sama dengan treatmentOption di saveTreatmentAction), lalu
 * invalidate tag cache konten publik entitas tersebut.
 *
 * Dipanggil server action entitas induk (saveTreatmentAction dst.) setelah
 * entitasnya tersimpan — bukan langsung dari form.
 */
export async function syncContentImages(
  entityType: ContentImageEntityType,
  entityId: string,
  rows: ContentImageRow[],
): Promise<void> {
  await requireRole(CONTENT_ROLES);

  const parsed = rowsSchema.safeParse(rows);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Daftar gambar tidak valid.");
  }

  // Gambar yang dibuang admin ikut dihapus dari bucket supaya tidak menumpuk
  // file yatim. Kegagalan hapus tidak boleh menggagalkan simpan.
  const previous = await prisma.contentImage.findMany({
    where: { entityType, entityId },
    select: { imageUrl: true },
  });
  const kept = new Set(parsed.data.map((row) => row.imageUrl));
  const removed = previous
    .map((row) => row.imageUrl)
    .filter((url) => !kept.has(url));

  await prisma.$transaction([
    prisma.contentImage.deleteMany({ where: { entityType, entityId } }),
    prisma.contentImage.createMany({
      data: parsed.data.map((row, index) => ({
        entityType,
        entityId,
        imageUrl: row.imageUrl,
        altText: row.altText ?? null,
        sortOrder: index,
      })),
    }),
  ]);

  for (const url of removed) {
    await deleteImageByUrl(url).catch(() => {});
  }

  updateTag(CONTENT_IMAGE_TAG[entityType]);
}

/** Buang semua gambar sebuah entitas; dipanggil saat entitas induk dihapus. */
export async function deleteContentImages(
  entityType: ContentImageEntityType,
  entityId: string,
): Promise<void> {
  await requireRole(CONTENT_ROLES);

  const previous = await prisma.contentImage.findMany({
    where: { entityType, entityId },
    select: { imageUrl: true },
  });
  await prisma.contentImage.deleteMany({ where: { entityType, entityId } });

  for (const { imageUrl } of previous) {
    await deleteImageByUrl(imageUrl).catch(() => {});
  }

  updateTag(CONTENT_IMAGE_TAG[entityType]);
}
