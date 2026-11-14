"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { pagePath } from "@/lib/domain/page-url";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { firstIssue, text } from "../promos/_kit/schema";
import { SLUG_TAKEN, pageSchema, revalidatePages, type ActionState } from "./pages.helpers";
import { persistPage } from "./pages.persist";

export async function savePageAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");

  const parsed = pageSchema.safeParse({
    title: text(formData, "title") ?? "",
    slug: text(formData, "slug") ?? "",
    template: text(formData, "template"),
    status: text(formData, "status"),
    bodyHtml: text(formData, "bodyHtml"),
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }
  const data = parsed.data;

  const clash = await prisma.staticPage.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) return { error: SLUG_TAKEN };

  const previous = id
    ? await prisma.staticPage.findUnique({
        where: { id },
        select: { slug: true, publishedAt: true },
      })
    : null;
  if (id && !previous) {
    return { error: "Halaman tidak ditemukan. Mungkin sudah dihapus." };
  }

  const newPath = pagePath(data.slug);
  const oldPath = previous ? pagePath(previous.slug) : null;
  const publishedAt =
    previous?.publishedAt ?? (data.status === "PUBLISHED" ? new Date() : null);
  const needsSlugRedirect =
    previous !== null && previous.publishedAt !== null && previous.slug !== data.slug;

  let redirectsChanged = false;

  try {
    redirectsChanged = await persistPage(
      id,
      data,
      publishedAt,
      needsSlugRedirect,
      oldPath,
      newPath,
      data.title,
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: SLUG_TAKEN };
    }
    throw error;
  }

  revalidatePages(oldPath ? [oldPath, newPath] : [newPath], redirectsChanged);
  redirect("/admin/pages?saved=1");
}