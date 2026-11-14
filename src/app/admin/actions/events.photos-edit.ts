"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { firstIssue, optionalText, text } from "../promos/_kit/schema";
import { cleanupImages, photoUrlSchema, revalidateEvent, type ActionState } from "./events.helpers";

/** Ubah caption satu foto. */
export async function updateEventPhotoCaptionAction(formData: FormData): Promise<void> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const caption = optionalText.safeParse(text(formData, "caption"));
  if (!caption.success) return;

  const photo = await prisma.eventPhoto.findUnique({
    where: { id },
    select: { eventId: true, event: { select: { slug: true } } },
  });
  if (!photo) return;

  await prisma.eventPhoto.update({ where: { id }, data: { caption: caption.data } });

  revalidateEvent(photo.event.slug);
  redirect(`/admin/events/${photo.eventId}?saved=1#foto`);
}

/**
 * Ganti berkas satu foto. Caption dan urutan tidak berubah. Berkas lama
 * dihapus dari storage (kecuali tercatat di Media Library atau masih dipakai
 * di event ini).
 */
export async function replaceEventPhotoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Foto tidak ditemukan." };

  const parsed = photoUrlSchema.safeParse(text(formData, "imageUrl") ?? "");
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const imageUrl = parsed.data;

  const photo = await prisma.eventPhoto.findUnique({
    where: { id },
    select: {
      eventId: true,
      imageUrl: true,
      event: {
        select: {
          slug: true,
          coverUrl: true,
          partnerLogoUrl: true,
          photos: { select: { id: true, imageUrl: true } },
        },
      },
    },
  });
  if (!photo) return { error: "Foto tidak ditemukan." };
  if (photo.imageUrl === imageUrl) {
    return { error: "Pilih atau unggah foto pengganti terlebih dahulu." };
  }

  await prisma.eventPhoto.update({ where: { id }, data: { imageUrl } });

  const stillUsed = new Set<string>(
    [
      imageUrl,
      photo.event.coverUrl,
      photo.event.partnerLogoUrl,
      ...photo.event.photos.filter((p) => p.id !== id).map((p) => p.imageUrl),
    ].filter((url): url is string => Boolean(url)),
  );
  await cleanupImages([photo.imageUrl], stillUsed);

  revalidateEvent(photo.event.slug);
  redirect(`/admin/events/${photo.eventId}?saved=1#foto`);
}