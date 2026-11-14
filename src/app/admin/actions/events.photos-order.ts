"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { cleanupImages, revalidateEvent } from "./events.helpers";
import { reorderSiblings } from "./reorder";

export async function deleteEventPhotoAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const photo = await prisma.eventPhoto.findUnique({
    where: { id },
    select: {
      imageUrl: true,
      event: {
        select: {
          id: true,
          slug: true,
          coverUrl: true,
          partnerLogoUrl: true,
          photos: { select: { id: true, imageUrl: true } },
        },
      },
    },
  });
  if (!photo) return;

  await prisma.eventPhoto.delete({ where: { id } });

  const stillUsed = new Set<string>(
    [
      photo.event.coverUrl,
      photo.event.partnerLogoUrl,
      ...photo.event.photos.filter((p) => p.id !== id).map((p) => p.imageUrl),
    ].filter((url): url is string => Boolean(url)),
  );
  await cleanupImages([photo.imageUrl], stillUsed);

  revalidateEvent(photo.event.slug);
  redirect(`/admin/events/${photo.event.id}?photoDeleted=1#foto`);
}

/**
 * Naikkan/turunkan urutan foto. Seluruh foto event ditulis ulang menjadi
 * 0..n-1 dalam satu transaksi, sehingga sortOrder kembar (mis. data lama yang
 * semuanya 0) ikut dirapikan dan tombol selalu berpengaruh.
 */
export async function moveEventPhotoAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || (direction !== "up" && direction !== "down")) return;

  const photo = await prisma.eventPhoto.findUnique({
    where: { id },
    select: { eventId: true, event: { select: { slug: true } } },
  });
  if (!photo) return;

  // Urutan sama persis dengan yang tampil di admin & halaman publik.
  const siblings = await prisma.eventPhoto.findMany({
    where: { eventId: photo.eventId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true, sortOrder: true },
  });
  await reorderSiblings(siblings, id, direction, (rowId, sortOrder) =>
    prisma.eventPhoto.update({ where: { id: rowId }, data: { sortOrder } }),
  );

  revalidateEvent(photo.event.slug);
  redirect(`/admin/events/${photo.eventId}?saved=1#foto`);
}