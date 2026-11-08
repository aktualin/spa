"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { prisma } from "@/lib/prisma";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { deleteImageByUrl } from "@/lib/storage";

import {
  checked,
  firstIssue,
  optionalImageUrl,
  optionalText,
  parseWibInput,
  slugSchema,
  sortOrderSchema,
  text,
} from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

const eventSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1, "Judul event wajib diisi."),
  description: optionalText,
  coverUrl: optionalImageUrl,
  location: optionalText,
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  isCollaboration: z.boolean(),
  isPublished: z.boolean(),
  sortOrder: sortOrderSchema,
  seoTitle: optionalText,
  seoDescription: optionalText,
});

const photoSchema = z.object({
  eventId: z.string().trim().min(1, "Event wajib diisi."),
  imageUrl: z
    .string()
    .trim()
    .min(1, "Foto wajib diunggah.")
    .refine(
      (value) => /^https?:\/\//.test(value) || value.startsWith("/"),
      "URL foto tidak valid.",
    ),
  caption: optionalText,
  sortOrder: z.coerce.number().int().min(0).default(0),
});

function revalidateEvent(slug?: string | null) {
  updateTag(CONTENT_TAGS.events);
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/events/collaborations");
  if (slug) revalidatePath(`/events/${slug}`);
}

export async function saveEventAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const startDate = parseWibInput(text(formData, "startDate"));
  const endDate = parseWibInput(text(formData, "endDate"), { endOfDay: true });

  if (startDate === undefined || endDate === undefined) {
    return { error: "Tanggal event tidak valid." };
  }

  const parsed = eventSchema.safeParse({
    slug: text(formData, "slug"),
    title: text(formData, "title"),
    description: text(formData, "description"),
    coverUrl: text(formData, "coverUrl"),
    location: text(formData, "location"),
    startDate,
    endDate,
    isCollaboration: checked(formData, "isCollaboration"),
    isPublished: checked(formData, "isPublished"),
    sortOrder: text(formData, "sortOrder") ?? 0,
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const data = parsed.data;

  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    return { error: "Tanggal berakhir harus lebih besar dari tanggal mulai." };
  }

  const clash = await prisma.eventItem.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { error: `Slug "${data.slug}" sudah dipakai event lain.` };
  }

  if (id) {
    const previous = await prisma.eventItem.findUnique({
      where: { id },
      select: { coverUrl: true },
    });
    if (previous?.coverUrl && previous.coverUrl !== data.coverUrl) {
      await deleteImageByUrl(previous.coverUrl).catch(() => {});
    }
  }

  if (id) {
    await prisma.eventItem.update({ where: { id }, data });
  } else {
    await prisma.eventItem.create({ data });
  }

  revalidateEvent(data.slug);
  redirect("/admin/events?saved=1");
}

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

  for (const photo of event.photos) {
    if (photo.imageUrl) await deleteImageByUrl(photo.imageUrl).catch(() => {});
  }
  if (event.coverUrl) await deleteImageByUrl(event.coverUrl).catch(() => {});

  revalidateEvent(event.slug);
  redirect("/admin/events?deleted=1");
}

export async function addEventPhotoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const parsed = photoSchema.safeParse({
    eventId: text(formData, "eventId"),
    imageUrl: text(formData, "imageUrl"),
    caption: text(formData, "caption"),
    sortOrder: text(formData, "sortOrder") ?? 0,
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const data = parsed.data;

  const event = await prisma.eventItem.findUnique({
    where: { id: data.eventId },
    select: { id: true, slug: true },
  });
  if (!event) return { error: "Event tidak ditemukan." };

  // Foto baru diletakkan di urutan paling akhir.
  const last = await prisma.eventPhoto.findFirst({
    where: { eventId: data.eventId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await prisma.eventPhoto.create({
    data: {
      eventId: data.eventId,
      imageUrl: data.imageUrl,
      caption: data.caption,
      sortOrder: last ? last.sortOrder + 1 : 0,
    },
  });

  revalidateEvent(event.slug);
  redirect(`/admin/events/${event.id}?saved=1`);
}

export async function deleteEventPhotoAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const photo = await prisma.eventPhoto.findUnique({
    where: { id },
    select: { imageUrl: true, event: { select: { id: true, slug: true } } },
  });
  if (!photo) return;

  await prisma.eventPhoto.delete({ where: { id } });
  if (photo.imageUrl) {
    await deleteImageByUrl(photo.imageUrl).catch(() => {});
  }

  revalidateEvent(photo.event.slug);
  redirect(`/admin/events/${photo.event.id}?deleted=1`);
}

export async function moveEventPhotoAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || (direction !== "up" && direction !== "down")) return;

  const photo = await prisma.eventPhoto.findUnique({
    where: { id },
    select: { id: true, eventId: true, sortOrder: true },
  });
  if (!photo) return;

  const neighbour = await prisma.eventPhoto.findFirst({
    where: {
      eventId: photo.eventId,
      ...(direction === "up"
        ? { sortOrder: { lt: photo.sortOrder } }
        : { sortOrder: { gt: photo.sortOrder } }),
    },
    orderBy: direction === "up" ? { sortOrder: "desc" } : { sortOrder: "asc" },
    select: { id: true, sortOrder: true },
  });

  if (neighbour) {
    await prisma.$transaction([
      prisma.eventPhoto.update({
        where: { id: photo.id },
        data: { sortOrder: neighbour.sortOrder },
      }),
      prisma.eventPhoto.update({
        where: { id: neighbour.id },
        data: { sortOrder: photo.sortOrder },
      }),
    ]);
  }

  const event = await prisma.eventItem.findUnique({
    where: { id: photo.eventId },
    select: { slug: true },
  });
  revalidateEvent(event?.slug);
  redirect(`/admin/events/${photo.eventId}?saved=1`);
}

export async function listEvents() {
  await requireSession();

  return prisma.eventItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
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
