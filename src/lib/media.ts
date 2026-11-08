/**
 * Unggah berkas sekaligus mencatatnya di Media Library (`MediaAsset`).
 * Semua unggahan admin lewat sini, sehingga setiap gambar bisa dicari,
 * dipakai ulang, diganti, dan dihapus dari halaman Media Library.
 */
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/storage";

export type StoredMedia = {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

export async function storeMedia(
  file: File,
  folder: string,
  uploadedById: string | null,
): Promise<StoredMedia> {
  const uploaded = await uploadImage(file, folder);
  const safeFolder = uploaded.key.split("/")[0];

  const last = await prisma.mediaAsset.findFirst({
    where: { folder: safeFolder },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const asset = await prisma.mediaAsset.create({
    data: {
      url: uploaded.url,
      storageKey: uploaded.key,
      fileName: uploaded.fileName,
      mimeType: uploaded.mimeType,
      sizeBytes: uploaded.sizeBytes,
      folder: safeFolder,
      sortOrder: (last?.sortOrder ?? -1) + 1,
      uploadedById,
    },
    select: { id: true, url: true, fileName: true, mimeType: true, sizeBytes: true },
  });
  return asset;
}
