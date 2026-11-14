import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { CONTENT_TAGS } from "@/lib/content/tags";
import { BANNER_LIMITS, validateBannerInput, type BannerKey } from "@/lib/domain/homepage-banner";
import { prisma } from "@/lib/prisma";

import { firstIssue, text } from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

export const sectionSchema = z.object({
  id: z.string().trim().min(1, "Section tidak valid."),
  title: z.string().trim().min(1, "Judul section wajib diisi."),
  subtitle: z.string().trim().optional(),
  bodyHtml: z.string().optional(),
  imageUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  ctaLabel: z.string().trim().optional(),
  ctaHref: z.string().trim().optional(),
});

/**
 * Bentuk isian form banner (hero, membership-banner, booking-banner). Zod
 * hanya memastikan tipe & batas panjang kasar; aturan isi (CTA berpasangan,
 * href aman, alt wajib) ada di `validateBannerInput` supaya bisa diuji.
 */
const optionalText = (max: number) =>
  z.string().max(max * 2, "Isian terlalu panjang.").optional();

export const bannerSchema = z.object({
  id: z.string().trim().min(1, "Section tidak valid."),
  title: optionalText(BANNER_LIMITS.title),
  subtitle: optionalText(BANNER_LIMITS.subtitle),
  imageUrl: optionalText(BANNER_LIMITS.imageUrl),
  mobileImageUrl: optionalText(BANNER_LIMITS.imageUrl),
  imageAlt: optionalText(BANNER_LIMITS.imageAlt),
  ctaLabel: optionalText(BANNER_LIMITS.ctaLabel),
  ctaHref: optionalText(BANNER_LIMITS.ctaHref),
});

/** Perubahan section homepage tampil di admin + homepage publik. */
export function revalidateHomepageSections() {
  updateTag(CONTENT_TAGS.homepage);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

/**
 * Simpan section banner (hero, membership-banner, booking-banner).
 * Mengembalikan pesan galat, atau null bila berhasil.
 */
export async function saveBannerSection(
  id: string,
  key: BannerKey,
  formData: FormData,
): Promise<string | null> {
  const shape = bannerSchema.safeParse({
    id,
    title: text(formData, "title"),
    subtitle: text(formData, "subtitle"),
    imageUrl: text(formData, "imageUrl"),
    mobileImageUrl: text(formData, "mobileImageUrl"),
    imageAlt: text(formData, "imageAlt"),
    ctaLabel: text(formData, "ctaLabel"),
    ctaHref: text(formData, "ctaHref"),
  });
  if (!shape.success) {
    return firstIssue(shape.error);
  }

  const result = validateBannerInput(key, shape.data);
  if (!result.ok) {
    return result.error;
  }

  // `bodyHtml` tidak dipakai banner, jadi tidak ikut diubah.
  await prisma.homepageSection.update({ where: { id }, data: result.data });
  return null;
}