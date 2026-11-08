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
  optionalText,
  text,
} from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

const giftCardSchema = z.object({
  title: z.string().trim().min(1, "Judul gift card wajib diisi.").max(120, "Judul maksimal 120 karakter."),
  subtitle: optionalText.refine((v) => !v || v.length <= 200, "Subjudul maksimal 200 karakter."),
  bodyHtml: z.string().trim().min(1, "Isi gift card wajib diisi."),
  imageUrl: optionalImageUrl,
  termsHtml: optionalText,
  whatsappMessage: optionalText.refine(
    (v) => !v || v.length <= 500,
    "Pesan WhatsApp maksimal 500 karakter.",
  ),
});

/** HTML editor → HTML tersanitasi; null bila tidak ada teks yang terlihat. */
function cleanHtml(value: string | null): string | null {
  if (!value) return null;
  const html = sanitizeHtml(value);
  return /\S/.test(html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ")) ? html : null;
}

export async function saveGiftCardAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const parsed = giftCardSchema.safeParse({
    title: text(formData, "title"),
    subtitle: text(formData, "subtitle"),
    bodyHtml: text(formData, "bodyHtml"),
    imageUrl: text(formData, "imageUrl"),
    termsHtml: text(formData, "termsHtml"),
    whatsappMessage: text(formData, "whatsappMessage"),
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const data = parsed.data;

  // HTML dari rich text editor WAJIB disanitasi sebelum disimpan.
  const bodyHtml = cleanHtml(data.bodyHtml);
  if (!bodyHtml) return { error: "Isi gift card wajib diisi." };

  const previous = await prisma.giftCardInfo.findUnique({
    where: { id: "singleton" },
    select: { imageUrl: true },
  });

  if (previous?.imageUrl && previous.imageUrl !== data.imageUrl) {
    await deleteImageByUrl(previous.imageUrl).catch(() => {});
  }

  const fields = {
    title: data.title,
    subtitle: data.subtitle,
    bodyHtml,
    imageUrl: data.imageUrl,
    termsHtml: cleanHtml(data.termsHtml),
    whatsappMessage: data.whatsappMessage,
  };

  await prisma.giftCardInfo.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...fields },
    update: fields,
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
