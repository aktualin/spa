"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import { revalidateCategories } from "./categories.helpers";

export async function listCategories() {
  await requireRole(CONTENT_ROLES);
  return prisma.treatmentCategory.findMany({
    orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { treatments: true } } },
  });
}

export async function getCategory(id: string) {
  await requireRole(CONTENT_ROLES);
  return prisma.treatmentCategory.findUnique({
    where: { id },
    include: { _count: { select: { treatments: true } } },
  });
}

export async function deleteCategoryAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const category = await prisma.treatmentCategory.findUnique({
    where: { id },
    include: { _count: { select: { treatments: true } } },
  });
  if (!category) redirect("/admin/treatments/categories");
  // Tombol hapus sudah disembunyikan bila masih ada isi; ini penjaga di server.
  if (category._count.treatments > 0) redirect(`/admin/treatments/categories/${id}?notEmpty=1`);

  await prisma.treatmentCategory.delete({ where: { id } });
  if (category.imageUrl) await deleteImageByUrl(category.imageUrl).catch(() => {});

  revalidateCategories(false);
  redirect("/admin/treatments/categories?deleted=1");
}