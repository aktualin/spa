import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { CONTENT_TAGS } from "@/lib/content/tags";
import { validatePageSlug } from "@/lib/domain/page-url";
import { sanitizeHtml } from "@/lib/domain/sanitize";

import { SEO_DESCRIPTION_MAX, SEO_TITLE_MAX } from "../pages/limits";
import { optionalText } from "../promos/_kit/schema";
import { revalidateRedirects } from "./redirects.helpers";

export type ActionState = { error: string | null; ok?: boolean };

export const pageSchema = z.object({
  title: z.string().trim().min(1, "Judul halaman wajib diisi."),
  slug: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      const message = validatePageSlug(value);
      if (message) ctx.addIssue({ code: "custom", message });
    }),
  template: z.enum(["STANDARD", "LEGAL"], { message: "Template tidak dikenal." }),
  status: z.enum(["DRAFT", "PUBLISHED"], { message: "Status tidak dikenal." }),
  bodyHtml: z.string().optional().transform((value) => sanitizeHtml(value ?? "")),
  seoTitle: optionalText.refine(
    (value) => !value || value.length <= SEO_TITLE_MAX,
    `Meta title maksimal ${SEO_TITLE_MAX} karakter.`,
  ),
  seoDescription: optionalText.refine(
    (value) => !value || value.length <= SEO_DESCRIPTION_MAX,
    `Meta description maksimal ${SEO_DESCRIPTION_MAX} karakter.`,
  ),
});

export const SLUG_TAKEN = "Slug sudah dipakai halaman lain.";

export function revalidatePages(paths: string[], redirectsChanged: boolean) {
  updateTag(CONTENT_TAGS.pages);
  if (redirectsChanged) revalidateRedirects();
  revalidatePath("/admin/pages");
  // Item menu bertipe Halaman mengikuti slug & status halaman ini.
  revalidatePath("/admin/menu");
  revalidatePath("/sitemap.xml");
  for (const path of new Set(paths)) revalidatePath(path);
}