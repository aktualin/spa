"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { prisma } from "@/lib/prisma";

export type ActionState = { error: string | null; ok?: boolean };

const ourStorySchema = z.object({
  heroTitle: z.string().trim().min(1, "Judul hero wajib diisi."),
  heroImageUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  philosophyHtml: z.string().optional(),
  valuesHtml: z.string().optional(),
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
});

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
    philosophyHtml: parsed.data.philosophyHtml
      ? sanitizeHtml(parsed.data.philosophyHtml)
      : null,
    valuesHtml: parsed.data.valuesHtml
      ? sanitizeHtml(parsed.data.valuesHtml)
      : null,
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
