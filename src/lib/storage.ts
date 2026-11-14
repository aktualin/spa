import { randomUUID } from "node:crypto";

import {
  ALLOWED_MEDIA_TYPES,
  MAX_MEDIA_BYTES,
  type MediaMimeType,
  sanitizeFileName,
  validateMediaBytes,
} from "@/lib/domain/media";

import { deleteStoredObject, publicUrlFor, putObject } from "./storage.client";

/**
 * Supabase Storage lewat antarmuka S3-compatible. Database hanya menyimpan
 * URL publik hasil upload — file-nya sendiri tidak pernah masuk ke Postgres.
 * Operasi bucket ada di `storage.client.ts`; berkas ini mengekspor ulangnya
 * plus unggahan gambar.
 */

export { ALLOWED_MEDIA_TYPES as ALLOWED_IMAGE_TYPES, MAX_MEDIA_BYTES as MAX_IMAGE_BYTES };
export { publicUrlFor, putObject, storageKeyFromUrl, deleteStoredObject } from "./storage.client";

export type UploadResult = {
  url: string;
  key: string;
  fileName: string;
  mimeType: MediaMimeType;
  sizeBytes: number;
};

/**
 * Validasi (tipe, ukuran, nama, dan isi berkas) lalu unggah ke storage.
 * Tidak mencatat ke Media Library — lihat `storeMedia` di `@/lib/media`.
 *
 * @param folder sub-direktori logis, mis. "treatments" atau "gallery".
 */
export async function uploadImage(
  file: File,
  folder: string,
): Promise<UploadResult> {
  const body = Buffer.from(await file.arrayBuffer());
  const mimeType = validateMediaBytes(
    { name: file.name, type: file.type, size: file.size },
    body.subarray(0, 16),
  );

  const fileName = sanitizeFileName(file.name, mimeType);
  // Nama dari browser hanya dipakai setelah dirapikan (tanpa path traversal);
  // potongan acak menghindari tabrakan nama.
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "") || "misc";
  const key = `${safeFolder}/${randomUUID().slice(0, 8)}-${fileName}`;

  await putObject(key, body, mimeType);

  return { url: publicUrlFor(key), key, fileName, mimeType, sizeBytes: file.size };
}

/**
 * Dipanggil form konten saat gambar diganti/dihapus agar bucket tidak
 * menumpuk sampah. Berkas yang tercatat di Media Library TIDAK dihapus:
 * bisa dipakai konten lain, dan hanya dihapus dari halaman Media Library.
 */
export async function deleteImageByUrl(url: string): Promise<void> {
  const { prisma } = await import("@/lib/prisma");
  const inLibrary = await prisma.mediaAsset.findUnique({
    where: { url },
    select: { id: true },
  });
  if (inLibrary) return;

  await deleteStoredObject(url);
}