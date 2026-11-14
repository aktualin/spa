import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { CONTENT_TAGS } from "@/lib/content/tags";
import { isPhotoUrl } from "@/lib/domain/gallery";
import { deleteImageByUrl } from "@/lib/storage";

import type { EventFormData } from "../events/event-form";
import { optionalImageUrl, optionalText, sortOrderSchema } from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

/** State form event: nilai yang dikirim ikut dikembalikan saat gagal. */
export type EventFormState = ActionState & {
  values?: EventFormData;
  attempt?: number;
};

export const eventPath = (slug: string) => `/events/${slug}`;

/** Bentuk data event siap tulis ke Prisma (hasil validasi form). */
export type EventData = {
  slug: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  location: string | null;
  partnerName: string | null;
  partnerLogoUrl: string | null;
  isCollaboration: boolean;
  isPublished: boolean;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  startDate: Date | null;
  endDate: Date | null;
  partnerUrl: string | null;
};

export const photoUrlSchema = z
  .string()
  .trim()
  .min(1, "Foto wajib diunggah.")
  .refine(isPhotoUrl, "URL foto tidak valid.");

export const eventSchema = z.object({
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

export const photoSchema = z.object({
  eventId: z.string().trim().min(1, "Event wajib diisi."),
  imageUrl: photoUrlSchema,
  caption: optionalText,
});

export function revalidateEvent(...slugs: (string | null | undefined)[]) {
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
export async function cleanupImages(urls: (string | null | undefined)[], stillUsed: Set<string>) {
  for (const url of new Set(urls)) {
    if (url && !stillUsed.has(url)) await deleteImageByUrl(url).catch(() => {});
  }
}

