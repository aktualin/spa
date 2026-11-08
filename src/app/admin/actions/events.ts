"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { prisma } from "@/lib/prisma";
import { eventDatesError, eventSlugError, normalizePartnerUrl } from "@/lib/domain/events";
import {
  appendSortOrders,
  isPhotoUrl,
  parseBatchPhotoUrls,
  sequentialSortOrders,
} from "@/lib/domain/gallery";
import { moveInList } from "@/lib/domain/media";
import { normalizePath } from "@/lib/domain/page-url";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { recordPathMoves } from "@/lib/path-moves";
import { deleteImageByUrl } from "@/lib/storage";

import type { EventFormData } from "../events/event-form";
import {
  checked,
  firstIssue,
  optionalImageUrl,
  optionalText,
  parseWibInput,
  sortOrderSchema,
  text,
} from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

/** State form event: nilai yang dikirim ikut dikembalikan saat gagal. */
export type EventFormState = ActionState & {
  values?: EventFormData;
  attempt?: number;
};

const eventPath = (slug: string) => `/events/${slug}`;

const photoUrlSchema = z
  .string()
  .trim()
  .min(1, "Foto wajib diunggah.")
  .refine(isPhotoUrl, "URL foto tidak valid.");

const eventSchema = z.object({
  title: z.string().trim().min(1, "Judul event wajib diisi.").max(200, "Judul terlalu panjang."),
  description: optionalText,
  coverUrl: optionalImageUrl,
  location: optionalText,
  partnerName: optionalText,
  partnerLogoUrl: optionalImageUrl,
  isCollaboration: z.boolean(),
  isPublished: z.boolean(),
  sortOrder: sortOrderSchema,
  seoTitle: optionalText,
  seoDescription: optionalText,
});

const photoSchema = z.object({
  eventId: z.string().trim().min(1, "Event wajib diisi."),
  imageUrl: photoUrlSchema,
  caption: optionalText,
});

function revalidateEvent(...slugs: (string | null | undefined)[]) {
  updateTag(CONTENT_TAGS.events);
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/events/collaborations");
  // Homepage menampilkan event terdekat (Promo Highlight).
  revalidatePath("/");
  for (const slug of new Set(slugs)) {
    if (slug) revalidatePath(eventPath(slug));
  }
}

/** Hapus berkas lama dari storage, kecuali masih dipakai event ini. */
async function cleanupImages(urls: (string | null | undefined)[], stillUsed: Set<string>) {
  for (const url of new Set(urls)) {
    if (url && !stillUsed.has(url)) await deleteImageByUrl(url).catch(() => {});
  }
}

function readFormValues(formData: FormData): EventFormData {
  const id = String(formData.get("id") ?? "");
  return {
    id: id || null,
    slug: text(formData, "slug")?.trim() ?? "",
    title: text(formData, "title") ?? "",
    description: text(formData, "description") ?? "",
    coverUrl: text(formData, "coverUrl") ?? "",
    location: text(formData, "location") ?? "",
    startDate: text(formData, "startDate") ?? "",
    endDate: text(formData, "endDate") ?? "",
    isCollaboration: checked(formData, "isCollaboration"),
    partnerName: text(formData, "partnerName") ?? "",
    partnerLogoUrl: text(formData, "partnerLogoUrl") ?? "",
    partnerUrl: text(formData, "partnerUrl") ?? "",
    isPublished: checked(formData, "isPublished"),
    sortOrder: Number(text(formData, "sortOrder") ?? 0) || 0,
    seoTitle: text(formData, "seoTitle") ?? "",
    seoDescription: text(formData, "seoDescription") ?? "",
  };
}

/** Simpan event baru (id kosong) atau ubah event yang ada. */
export async function saveEventAction(
  prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  await requireRole(CONTENT_ROLES);

  const values = readFormValues(formData);
  const fail = (error: string): EventFormState => ({
    error,
    values,
    attempt: (prevState.attempt ?? 0) + 1,
  });

  const id = values.id;
  const slugError = eventSlugError(values.slug);
  if (slugError) return fail(slugError);

  const startDate = parseWibInput(values.startDate);
  const endDate = parseWibInput(values.endDate, { endOfDay: true });
  if (startDate === undefined) return fail("Tanggal mulai tidak valid.");
  if (endDate === undefined) return fail("Tanggal selesai tidak valid.");
  const datesError = eventDatesError(startDate, endDate);
  if (datesError) return fail(datesError);

  const partnerUrl = normalizePartnerUrl(values.partnerUrl);
  if (partnerUrl === undefined) {
    return fail("Tautan mitra tidak valid. Contoh: https://namabrand.com");
  }

  const parsed = eventSchema.safeParse({
    title: values.title,
    description: values.description,
    coverUrl: values.coverUrl,
    location: values.location,
    partnerName: values.partnerName,
    partnerLogoUrl: values.partnerLogoUrl,
    isCollaboration: values.isCollaboration,
    isPublished: values.isPublished,
    sortOrder: text(formData, "sortOrder") ?? 0,
    seoTitle: values.seoTitle,
    seoDescription: values.seoDescription,
  });
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const data = { ...parsed.data, slug: values.slug, startDate, endDate, partnerUrl };

  const clash = await prisma.eventItem.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) return fail(`Slug "${data.slug}" sudah dipakai event lain.`);

  const previous = id
    ? await prisma.eventItem.findUnique({
        where: { id },
        select: {
          slug: true,
          title: true,
          isPublished: true,
          coverUrl: true,
          partnerLogoUrl: true,
          photos: { select: { imageUrl: true } },
        },
      })
    : null;
  if (id && !previous) return fail("Event tidak ditemukan. Mungkin sudah dihapus.");

  // URL publik lama tetap hidup (301) bila slug event yang tayang diganti.
  const { saved, redirectsChanged } = await prisma.$transaction(async (tx) => {
    const saved = id
      ? await tx.eventItem.update({ where: { id }, data, select: { id: true } })
      : await tx.eventItem.create({ data, select: { id: true } });
    let redirectsChanged =
      previous && previous.isPublished && previous.slug !== data.slug
        ? await recordPathMoves(
            tx,
            [{ from: eventPath(previous.slug), to: eventPath(data.slug) }],
            `Event "${data.title}" pindah alamat`,
          )
        : false;
    // Slug yang dulu ditinggalkan event lain bisa masih punya redirect otomatis;
    // tanpa dibersihkan, alamat event yang tayang ini akan dialihkan.
    if (data.isPublished) {
      const stale = await tx.redirect.deleteMany({
        where: { fromPath: normalizePath(eventPath(data.slug)), source: "auto" },
      });
      if (stale.count > 0) redirectsChanged = true;
    }
    return { saved, redirectsChanged };
  });

  if (previous) {
    const stillUsed = new Set<string>(
      [data.coverUrl, data.partnerLogoUrl, ...previous.photos.map((p) => p.imageUrl)].filter(
        (url): url is string => Boolean(url),
      ),
    );
    await cleanupImages([previous.coverUrl, previous.partnerLogoUrl], stillUsed);
  }

  if (redirectsChanged) {
    updateTag(CONTENT_TAGS.redirects);
    revalidatePath("/admin/redirects");
  }
  revalidateEvent(data.slug, previous?.slug);

  // Event baru langsung dibuka lagi supaya foto bisa ditambahkan.
  redirect(id ? "/admin/events?saved=1" : `/admin/events/${saved.id}?created=1`);
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

  // Foto ikut terhapus oleh cascade; berkas di storage dibersihkan manual
  // (berkas yang tercatat di Media Library dilewati oleh deleteImageByUrl).
  await cleanupImages(
    [...event.photos.map((p) => p.imageUrl), event.coverUrl, event.partnerLogoUrl],
    new Set(),
  );

  revalidateEvent(event.slug);
  redirect("/admin/events?deleted=1");
}

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
  const current = new Map(siblings.map((row) => [row.id, row.sortOrder]));
  const ordered = moveInList(
    siblings.map((row) => row.id),
    id,
    direction,
  );
  const updates = sequentialSortOrders(ordered).filter(
    (row) => current.get(row.id) !== row.sortOrder,
  );

  if (updates.length > 0) {
    await prisma.$transaction(
      updates.map((row) =>
        prisma.eventPhoto.update({
          where: { id: row.id },
          data: { sortOrder: row.sortOrder },
        }),
      ),
    );
  }

  revalidateEvent(photo.event.slug);
  redirect(`/admin/events/${photo.eventId}?saved=1#foto`);
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
