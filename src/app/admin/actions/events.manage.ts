"use server";

import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { cleanupImages, revalidateEvent } from "./events.helpers";

export async function deleteEventAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const event = await prisma.eventItem.findUnique({
    where: { id },
    include: { photos: { select: { imageUrl: true } } },
  });
  if (!event) return;

  await prisma.eventItem.delete({ where: { id } });

  // Foto ikut terhapus oleh cascade; berkas di storage dibersihkan manual
  // (berkas yang tercatat di Media Library dilewati oleh deleteImageByUrl).
  await cleanupImages(
    [...event.photos.map((p) => p.imageUrl), event.coverUrl, event.partnerLogoUrl],
    new Set(),
  );

  revalidateEvent(event.slug);
  redirect("/admin/events?deleted=1");
}

export async function listEvents() {
  await requireSession();

  return prisma.eventItem.findMany({
    orderBy: [{ startDate: { sort: "desc", nulls: "first" } }, { title: "asc" }],
    include: { _count: { select: { photos: true } } },
  });
}

export async function getEventWithPhotos(id: string) {
  await requireSession();

  return prisma.eventItem.findUnique({
    where: { id },
    include: { photos: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
  });
}