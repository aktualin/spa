"use server";

import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import { deleteContentImages } from "./content-images";
import { CONTENT_ROLES, revalidateCatalog } from "./treatments.helpers";

export async function deleteTreatmentAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const treatment = await prisma.treatment.delete({
    where: { id },
    include: { category: { select: { kind: true } } },
  });
  if (treatment.imageUrl) {
    await deleteImageByUrl(treatment.imageUrl).catch(() => {});
  }
  await deleteContentImages("treatment", treatment.id);

  revalidateCatalog(false);
  redirect(
    treatment.category.kind === "ADDON"
      ? "/admin/treatments/addons?deleted=1"
      : "/admin/treatments?deleted=1",
  );
}

/** Dipakai halaman list; read-only tapi tetap butuh sesi. */
export async function listTreatmentsByCategory(kind: "TREATMENT" | "ADDON" = "TREATMENT") {
  await requireSession();

  return prisma.treatmentCategory.findMany({
    where: { kind },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      treatments: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: { options: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
}