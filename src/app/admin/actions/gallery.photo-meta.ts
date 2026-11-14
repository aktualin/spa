"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { optionalText, text } from "../promos/_kit/schema";
import { revalidateGallery } from "./gallery.helpers";

/** Ubah caption/alt text satu foto. */
export async function updatePhotoMetaAction(formData: FormData): Promise<void> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const parsed = z
    .object({
      caption: optionalText,
      altText: optionalText,
    })
    .safeParse({
      caption: text(formData, "caption"),
      altText: text(formData, "altText"),
    });

  if (!parsed.success) return;
  if (!id) return;

  const photo = await prisma.galleryPhoto.findUnique({
    where: { id },
    select: { albumId: true },
  });
  if (!photo) return;

  await prisma.galleryPhoto.update({
    where: { id },
    data: parsed.data,
  });

  revalidateGallery();
  redirect(`/admin/gallery/${photo.albumId}?saved=1`);
}