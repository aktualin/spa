"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { normalizePath, pagePath } from "@/lib/domain/page-url";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { revalidatePages } from "./pages.helpers";

export async function deletePageAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const page = await prisma.staticPage.findUnique({
    where: { id },
    select: { slug: true },
  });
  if (!page) redirect("/admin/pages?deleted=1");

  const path = pagePath(page.slug);

  // Redirect yang menuju halaman ini ikut dihapus agar tidak mengarah ke 404.
  const removed = await prisma.$transaction(async (tx) => {
    const pointing = (
      await tx.redirect.findMany({ select: { fromPath: true, toPath: true } })
    ).filter((r) => r.toPath.startsWith("/") && normalizePath(r.toPath) === path);

    if (pointing.length > 0) {
      await tx.redirect.deleteMany({
        where: { fromPath: { in: pointing.map((r) => r.fromPath) } },
      });
    }
    await tx.staticPage.delete({ where: { id } });
    return pointing.length;
  });

  revalidatePages([path], removed > 0);
  redirect(`/admin/pages?deleted=1${removed > 0 ? `&cleaned=${removed}` : ""}`);
}

export async function listPages() {
  await requireRole(CONTENT_ROLES);

  return prisma.staticPage.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      template: true,
      status: true,
      updatedAt: true,
    },
  });
}

export async function getPage(id: string) {
  await requireRole(CONTENT_ROLES);

  return prisma.staticPage.findUnique({
    where: { id },
    include: { _count: { select: { menuItems: true } } },
  });
}