"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { isSafeImageUrl } from "@/lib/domain/homepage-banner";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { prisma } from "@/lib/prisma";

export type ActionState = { error: string | null; ok?: boolean };

const ourStorySchema = z.object({
  heroTitle: z
    .string()
    .trim()
    .min(1, "Judul hero wajib diisi.")
    .max(160, "Judul hero maksimal 160 karakter."),
  // URL Supabase Storage (https://…) atau path gambar bawaan situs (/img/…).
  heroImageUrl: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || isSafeImageUrl(value), "Alamat gambar hero tidak valid."),
  philosophyHtml: z.string().optional(),
  valuesHtml: z.string().optional(),
  seoTitle: z.string().trim().max(120, "SEO title maksimal 120 karakter.").optional(),
  seoDescription: z
    .string()
    .trim()
    .max(320, "SEO description maksimal 320 karakter.")
    .optional(),
});

/** HTML editor → HTML tersanitasi; isi kosong (mis. `<p></p>`) → null. */
function richHtml(value: string | undefined): string | null {
  if (!value) return null;
  const html = sanitizeHtml(value);
  const textOnly = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
  return /\S/.test(textOnly) || /<img\b/i.test(html) ? html : null;
}

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Input tidak valid.";
}

export async function saveOurStoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const parsed = ourStorySchema.safeParse({
    heroTitle: formData.get("heroTitle"),
    heroImageUrl: formData.get("heroImageUrl") ?? undefined,
    philosophyHtml: formData.get("philosophyHtml") ?? undefined,
    valuesHtml: formData.get("valuesHtml") ?? undefined,
    seoTitle: formData.get("seoTitle") ?? undefined,
    seoDescription: formData.get("seoDescription") ?? undefined,
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const data = {
    heroTitle: parsed.data.heroTitle,
    heroImageUrl: parsed.data.heroImageUrl || null,
    philosophyHtml: richHtml(parsed.data.philosophyHtml),
    valuesHtml: richHtml(parsed.data.valuesHtml),
    seoTitle: parsed.data.seoTitle || null,
    seoDescription: parsed.data.seoDescription || null,
  };

  await prisma.ourStoryContent.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  updateTag(CONTENT_TAGS.ourStory);
  revalidatePath("/admin/our-story");
  revalidatePath("/our-story");

  redirect("/admin/our-story?saved=1");
}

export async function getOurStoryContent() {
  await requireSession();
  return prisma.ourStoryContent.findUnique({ where: { id: "singleton" } });
}
