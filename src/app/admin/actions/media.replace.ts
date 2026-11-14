"use server";

import { revalidatePath, updateTag } from "next/cache";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteStoredObject } from "@/lib/storage";

import { IMAGE_CONTENT_TAGS } from "./media.describe";
import { replaceMediaReferences } from "./media.rewrite";
import type { ActionState } from "./media.types";
import { revalidateMediaPages, usageOf } from "./media.usage";

/**
 * Ganti berkas sebuah aset dengan berkas yang BARU SAJA diunggah lewat
 * /api/admin/upload (`uploadedId`, sudah divalidasi & tercatat sebagai aset
 * sementara). Berkas dikirim lewat route upload — bukan lewat Server Action —
 * karena batas body Server Action bawaan hanya 1 MB, sedangkan berkas boleh
 * sampai 4 MB.
 *
 * Key storage selalu baru: URL lama di-cache CDN `immutable` selama setahun,
 * jadi menimpa key lama tidak akan terlihat pengunjung. Dalam satu transaksi:
 * aset sementara dihapus, url/key/meta-nya dipindah ke aset target, lalu semua
 * kolom gambar dan isi HTML yang memakai URL lama diarahkan ke URL baru.
 * Setelah commit, objek lama dihapus dari storage.
 */
export async function replaceMediaAction(
  targetId: string,
  uploadedId: string,
): Promise<ActionState> {
  const session = await requireRole(CONTENT_ROLES);

  if (typeof targetId !== "string" || typeof uploadedId !== "string" || !targetId || !uploadedId) {
    return { error: "Permintaan tidak valid." };
  }
  if (targetId === uploadedId) return { error: "Berkas pengganti tidak valid." };

  const [target, uploaded] = await Promise.all([
    prisma.mediaAsset.findUnique({ where: { id: targetId } }),
    prisma.mediaAsset.findUnique({ where: { id: uploadedId } }),
  ]);
  if (!target) return { error: "Berkas yang akan diganti tidak ditemukan." };
  if (!uploaded) return { error: "Berkas pengganti tidak ditemukan. Unggah ulang." };

  // Hanya unggahan milik sendiri yang belum dipakai di mana pun yang boleh
  // "dilebur" ke aset lain — mencegah aset orang lain/yang sedang dipakai ikut hilang.
  if (uploaded.uploadedById !== session.userId) {
    return { error: "Berkas pengganti harus unggahan Anda sendiri." };
  }
  if ((await usageOf(uploaded.url)).length > 0) {
    return { error: "Berkas pengganti sudah dipakai konten lain. Unggah berkas baru." };
  }

  const oldUrl = target.url;
  const newUrl = uploaded.url;

  try {
    await prisma.$transaction(async (tx) => {
      // Hapus baris sementara dulu: url & storageKey bersifat unik.
      await tx.mediaAsset.delete({ where: { id: uploaded.id } });
      await tx.mediaAsset.update({
        where: { id: target.id },
        data: {
          url: newUrl,
          storageKey: uploaded.storageKey,
          mimeType: uploaded.mimeType,
          sizeBytes: uploaded.sizeBytes,
          fileName: uploaded.fileName,
          width: uploaded.width,
          height: uploaded.height,
        },
      });

      await replaceMediaReferences(tx, oldUrl, newUrl);
    });
  } catch (error) {
    console.error("[media] gagal mengganti berkas", error);
    return { error: "Gagal mengganti berkas. Tidak ada perubahan yang disimpan." };
  }

  // Referensi sudah pindah ke URL baru; objek lama aman dihapus.
  await deleteStoredObject(oldUrl).catch((error) => {
    console.error("[media] gagal menghapus berkas lama", oldUrl, error);
  });

  for (const tag of IMAGE_CONTENT_TAGS) updateTag(tag);
  revalidatePath("/", "layout");
  revalidateMediaPages(target.id);

  return { error: null, ok: true, message: "Berkas berhasil diganti." };
}