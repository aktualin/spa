import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { CONTENT_TAGS } from "@/lib/content/tags";
import { siteSettingsInputSchema } from "@/lib/domain/site-settings";

export type ActionState = { error: string | null; ok?: boolean };

export const optionalUrl = z.union([z.string().trim().url("URL gambar tidak valid."), z.literal("")]).optional();

export const seoSchema = z.object({
  path: z.string().trim(),
  title: z.string().trim().max(200, "Meta title maksimal 200 karakter.").optional(),
  description: z
    .string()
    .trim()
    .max(500, "Meta description maksimal 500 karakter.")
    .optional(),
  ogImageUrl: optionalUrl,
});

// Batas & normalisasi teks SEO mengikuti schema Kontak & Umum (satu sumber).
const seoShape = siteSettingsInputSchema.shape;

export const settingsSchema = z.object({
  faviconUrl: optionalUrl,
  defaultOgImageUrl: optionalUrl,
  seoSiteName: seoShape.seoSiteName,
  seoDefaultTitle: seoShape.seoDefaultTitle,
  seoDefaultDescription: seoShape.seoDefaultDescription,
  seoOgDescription: seoShape.seoOgDescription,
  seoOgLocale: seoShape.seoOgLocale,
  seoTitleTemplate: seoShape.seoTitleTemplate,
  seoKeywords: seoShape.seoKeywords,
});

/** Perubahan SEO tampil tanpa redeploy: tag cache + seluruh layout publik. */
export function revalidateSeo() {
  updateTag(CONTENT_TAGS.seo);
  revalidatePath("/admin/seo");
  revalidatePath("/", "layout");
}