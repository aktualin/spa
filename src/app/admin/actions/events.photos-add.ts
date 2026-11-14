"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { appendSortOrders, parseBatchPhotoUrls } from "@/lib/domain/gallery";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { firstIssue, text } from "../promos/_kit/schema";
import { photoSchema, revalidateEvent, type ActionState } from "./events.helpers";

/** Tambah satu foto (dengan caption) ke akhir galeri event. */
export async function addEventPhotoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const parsed = photoSchema.safeParse({
    eventId: text(formData, "eventId"),
    imageUrl: text(formData, "imageUrl"),
    caption: text(formData, "caption"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const data = parsed.data;
  const event = await prisma.eventItem.findUnique({
    where: { id: data.eventId },
    select: { id: true, slug: true },
  });
  if (!event) return { error: "Event tidak ditemukan." };

  await prisma.$transaction(async (tx) => {
    const last = await tx.eventPhoto.findFirst({
      where: { eventId: event.id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const [sortOrder] = appendSortOrders(last?.sortOrder ?? null, 1);
    await tx.eventPhoto.create({
      data: { eventId: event.id, imageUrl: data.imageUrl, caption: data.caption, sortOrder },
    });
  });

  revalidateEvent(event.slug);
  redirect(`/admin/events/${event.id}?saved=1#foto`);
}

/**
 * Tambah banyak foto sekaligus (berkas sudah diunggah satu per satu oleh
 * klien ke /api/admin/upload). Foto diletakkan berurutan di akhir galeri.
 */
export async function addEventPhotosAction(
  eventId: string,
  urls: string[],
): Promise<ActionState & { count?: number }> {
  await requireRole(CONTENT_ROLES);

  if (typeof eventId !== "string" || !eventId) return { error: "Event tidak ditemukan." };
  const parsed = parseBatchPhotoUrls(urls);
  if (!parsed.ok) return { error: parsed.error };

  const event = await prisma.eventItem.findUnique({
    where: { id: eventId },
    select: { id: true, slug: true },
  });
  if (!event) return { error: "Event tidak ditemukan." };

  await prisma.$transaction(async (tx) => {
    const last = await tx.eventPhoto.findFirst({
      where: { eventId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const orders = appendSortOrders(last?.sortOrder ?? null, parsed.urls.length);
    await tx.eventPhoto.createMany({
      data: parsed.urls.map((imageUrl, index) => ({
        eventId,
        imageUrl,
        sortOrder: orders[index],
      })),
    });
  });

  revalidateEvent(event.slug);
  return { error: null, ok: true, count: parsed.urls.length };
}