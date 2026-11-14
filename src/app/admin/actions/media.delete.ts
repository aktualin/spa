"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { moveInList } from "@/lib/domain/media";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteStoredObject } from "@/lib/storage";

import { revalidateMediaPages, usageOf } from "./media.usage";

/**
 * Buang unggahan sementara yang batal dipakai sebagai pengganti (mis. galat
 * setelah unggah). Hanya untuk unggahan milik sendiri yang belum dipakai.
 */
export async function discardUploadAction(uploadedId: string): Promise<void> {
  const session = await requireRole(CONTENT_ROLES);
  if (typeof uploadedId !== "string" || !uploadedId) return;

  const asset = await prisma.mediaAsset.findUnique({ where: { id: uploadedId } });
  if (!asset || asset.uploadedById !== session.userId) return;
  if ((await usageOf(asset.url)).length > 0) return;

  await deleteStoredObject(asset.url).catch(() => {});
  await prisma.mediaAsset.delete({ where: { id: asset.id } }).catch(() => {});
  revalidateMediaPages();
}

/** Hapus berkas yang tidak dipakai di mana pun: objek storage dulu, lalu barisnya. */
export async function deleteMediaAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const asset = id ? await prisma.mediaAsset.findUnique({ where: { id } }) : null;
  if (!asset) redirect("/admin/media");

  if ((await usageOf(asset.url)).length > 0) {
    redirect(`/admin/media/${asset.id}?blocked=1`);
  }

  try {
    await deleteStoredObject(asset.url);
  } catch (error) {
    console.error("[media] gagal menghapus objek storage", asset.url, error);
    redirect(`/admin/media/${asset.id}?error=storage`);
  }

  await prisma.mediaAsset.delete({ where: { id: asset.id } });

  revalidateMediaPages();
  redirect("/admin/media?deleted=1");
}

/** Kembali ke halaman daftar dengan filter yang sama (hanya path /admin/media). */
function safeBack(value: FormDataEntryValue | null): string {
  const back = typeof value === "string" ? value : "";
  return /^\/admin\/media(?:[/?]|$)/.test(back) && !back.includes("//") ? back : "/admin/media";
}

/** Naik/turun satu posisi di dalam foldernya; sortOrder ditulis ulang 0..n. */
export async function moveMediaAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  const back = safeBack(formData.get("back"));
  if (!id || (direction !== "up" && direction !== "down")) redirect(back);

  const asset = await prisma.mediaAsset.findUnique({ where: { id }, select: { folder: true } });
  if (!asset) redirect(back);

  const siblings = await prisma.mediaAsset.findMany({
    where: { folder: asset.folder },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: { id: true, sortOrder: true },
  });

  const current = new Map(siblings.map((row) => [row.id, row.sortOrder]));
  const ordered = moveInList(
    siblings.map((row) => row.id),
    id,
    direction,
  );
  const changes = ordered
    .map((rowId, index) => ({ id: rowId, sortOrder: index }))
    .filter((row) => current.get(row.id) !== row.sortOrder);

  if (changes.length > 0) {
    await prisma.$transaction(
      changes.map((row) =>
        prisma.mediaAsset.update({ where: { id: row.id }, data: { sortOrder: row.sortOrder } }),
      ),
    );
  }

  revalidateMediaPages();
  redirect(back);
}