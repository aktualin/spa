"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

export type ActionState = { error: string | null; ok?: boolean };

const seoSchema = z.object({
  path: z
    .string()
    .trim()
    .min(1, "Path wajib diisi.")
    .refine((value) => value.startsWith("/"), "Path harus diawali \"/\"."),
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  ogImageUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
});

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Input tidak valid.";
}

export async function savePageSeoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const parsed = seoSchema.safeParse({
    path: formData.get("path"),
    title: formData.get("title") ?? undefined,
    description: formData.get("description") ?? undefined,
    ogImageUrl: formData.get("ogImageUrl") ?? undefined,
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { path, title, description, ogImageUrl } = parsed.data;

  const clash = await prisma.pageSeo.findFirst({
    where: { path, ...(formData.get("id") ? { NOT: { id: String(formData.get("id")) } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { error: `Path "${path}" sudah punya entri SEO lain.` };
  }

  const data = {
    path,
    title: title || null,
    description: description || null,
    ogImageUrl: ogImageUrl || null,
  };

  const id = String(formData.get("id") ?? "");
  if (id) {
    await prisma.pageSeo.update({ where: { id }, data });
  } else {
    await prisma.pageSeo.create({ data });
  }

  updateTag(CONTENT_TAGS.seo);
  revalidatePath("/admin/seo");
  revalidatePath("/", "layout");

  redirect("/admin/seo?saved=1");
}

export async function deletePageSeoAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.pageSeo.delete({ where: { id } });

  updateTag(CONTENT_TAGS.seo);
  revalidatePath("/admin/seo");
  revalidatePath("/", "layout");

  redirect("/admin/seo?deleted=1");
}

export async function listPageSeo() {
  await requireSession();
  return prisma.pageSeo.findMany({ orderBy: { path: "asc" } });
}

export async function getPageSeo(id: string) {
  await requireSession();
  return prisma.pageSeo.findUnique({ where: { id } });
}
