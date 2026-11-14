"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { richTextInput } from "@/lib/domain/rich-text";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import { checked, firstIssue, parseWibInput, text } from "../promos/_kit/schema";
import { termsToHtml } from "./html-utils";
import { promoSchema, revalidatePromo, type ActionState } from "./promos.helpers";
import { persistPromo } from "./promos.persist";

export async function savePromoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  // Awal periode = 00:00 WIB, akhir periode = 23:59:59.999 WIB.
  const startDate = parseWibInput(text(formData, "startDate"));
  const endDate = parseWibInput(text(formData, "endDate"), { endOfDay: true });

  if (startDate === undefined || endDate === undefined) {
    return { error: "Tanggal promo tidak valid." };
  }

  const parsed = promoSchema.safeParse({
    slug: text(formData, "slug"),
    title: text(formData, "title"),
    description: richTextInput(formData.get("description")),
    bannerUrl: text(formData, "bannerUrl"),
    terms: text(formData, "terms"),
    startDate,
    endDate,
    isPublished: checked(formData, "isPublished"),
    sortOrder: text(formData, "sortOrder") ?? 0,
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
    whatsappMessage: text(formData, "whatsappMessage"),
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  // S&K dari editor teks kaya (atau teks polos lama) disimpan sebagai HTML
  // yang sudah disanitasi.
  const termsHtml = termsToHtml(parsed.data.terms);
  const data = { ...parsed.data, terms: termsHtml };

  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    return { error: "Tanggal berakhir harus lebih besar dari tanggal mulai." };
  }

  const clash = await prisma.promo.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { error: `Slug "${data.slug}" sudah dipakai promo lain.` };
  }

  const previous = id
    ? await prisma.promo.findUnique({
        where: { id },
        select: { bannerUrl: true, slug: true, isPublished: true },
      })
    : null;

  const redirectsChanged = await persistPromo(id, data, previous);

  // Banner lama dibuang setelah simpan berhasil.
  if (previous?.bannerUrl && previous.bannerUrl !== data.bannerUrl) {
    await deleteImageByUrl(previous.bannerUrl).catch(() => {});
  }

  if (redirectsChanged) updateTag(CONTENT_TAGS.redirects);
  revalidatePromo(data.slug);
  redirect("/admin/promos?saved=1");
}