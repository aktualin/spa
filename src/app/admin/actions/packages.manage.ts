"use server";

import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import { deleteContentImages } from "./content-images";
import { revalidatePackages } from "./packages.helpers";

export async function deletePackageAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const pkg = await prisma.package.delete({ where: { id } });
  if (pkg.imageUrl) {
    await deleteImageByUrl(pkg.imageUrl).catch(() => {});
  }
  await deleteContentImages("package", pkg.id);

  revalidatePackages(pkg.slug);
  redirect("/admin/treatments/packages?deleted=1");
}

/** Dipakai halaman list; read-only tapi tetap butuh sesi. */
export async function listPackages() {
  await requireSession();

  return prisma.package.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: { treatment: { select: { name: true } } },
      },
    },
  });
}