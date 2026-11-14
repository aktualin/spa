"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { cleanupImages, revalidateEvent, type EventFormState } from "./events.helpers";
import { persistEvent } from "./events.persist";
import { readFormValues, validateEventValues } from "./events.validate";
import { revalidateRedirects } from "./redirects.helpers";

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
  const result = validateEventValues(values, formData);
  if (!result.ok) return fail(result.error);
  const data = result.data;

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

  const { saved, redirectsChanged } = await persistEvent(id, data, previous);

  if (previous) {
    const stillUsed = new Set<string>(
      [data.coverUrl, data.partnerLogoUrl, ...previous.photos.map((p) => p.imageUrl)].filter(
        (url): url is string => Boolean(url),
      ),
    );
    await cleanupImages([previous.coverUrl, previous.partnerLogoUrl], stillUsed);
  }

  if (redirectsChanged) revalidateRedirects();
  revalidateEvent(data.slug, previous?.slug);

  // Event baru langsung dibuka lagi supaya foto bisa ditambahkan.
  redirect(id ? "/admin/events?saved=1" : `/admin/events/${saved.id}?created=1`);
}