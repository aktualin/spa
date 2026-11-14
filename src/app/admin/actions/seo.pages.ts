"use server";

import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { normalizeSeoPath, seoPathError } from "@/lib/domain/seo";
import { prisma } from "@/lib/prisma";

import { firstIssue } from "../promos/_kit/schema";
import { revalidateSeo, seoSchema, type ActionState } from "./seo.helpers";

export async function savePageSeoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const parsed = seoSchema.safeParse({
    path: formData.get("path") ?? "",
    title: formData.get("title") ?? undefined,
    description: formData.get("description") ?? undefined,
    ogImageUrl: formData.get("ogImageUrl") ?? undefined,
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const pathError = seoPathError(parsed.data.path);
  if (pathError) return { error: pathError };

  const path = normalizeSeoPath(parsed.data.path);
  const { title, description, ogImageUrl } = parsed.data;
  const id = String(formData.get("id") ?? "");

  const clash = await prisma.pageSeo.findFirst({
    where: { path, ...(id ? { NOT: { id } } : {}) },
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

  if (id) {
    await prisma.pageSeo.update({ where: { id }, data });
  } else {
    await prisma.pageSeo.create({ data });
  }

  revalidateSeo();
  redirect("/admin/seo?saved=1");
}

export async function deletePageSeoAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.pageSeo.delete({ where: { id } });

  revalidateSeo();
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