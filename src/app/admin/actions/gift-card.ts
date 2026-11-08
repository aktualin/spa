"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { prisma } from "@/lib/prisma";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { deleteImageByUrl } from "@/lib/storage";

import {
  firstIssue,
  optionalImageUrl,
  text,
} from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

const giftCardSchema = z.object({
  title: z.string().trim().min(1, "Judul gift card wajib diisi."),
  bodyHtml: z.string().trim().min(1, "Isi gift card wajib diisi."),
  imageUrl: optionalImageUrl,
});

export async function saveGiftCardAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const parsed = giftCardSchema.safeParse({
    title: text(formData, "title"),
    bodyHtml: text(formData, "bodyHtml"),
    imageUrl: text(formData, "imageUrl"),
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const data = parsed.data;

  // HTML dari rich text editor WAJIB disanitasi sebelum disimpan.
  const bodyHtml = sanitizeHtml(data.bodyHtml);

  const previous = await prisma.giftCardInfo.findUnique({
    where: { id: "singleton" },
    select: { imageUrl: true },
  });

  if (previous?.imageUrl && previous.imageUrl !== data.imageUrl) {
    await deleteImageByUrl(previous.imageUrl).catch(() => {});
  }

  await prisma.giftCardInfo.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      title: data.title,
      bodyHtml,
      imageUrl: data.imageUrl,
    },
    update: {
      title: data.title,
      bodyHtml,
      imageUrl: data.imageUrl,
    },
  });

  updateTag(CONTENT_TAGS.giftCard);
  revalidatePath("/admin/gift-card");
  revalidatePath("/gift-card");
  revalidatePath("/");

  redirect("/admin/gift-card?saved=1");
}

export async function getGiftCard() {
  await requireSession();

  return prisma.giftCardInfo.findUnique({ where: { id: "singleton" } });
}
