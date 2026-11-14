"use server";

import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import { revalidatePromo } from "./promos.helpers";

export async function deletePromoAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const promo = await prisma.promo.delete({ where: { id } });
  if (promo.bannerUrl) {
    await deleteImageByUrl(promo.bannerUrl).catch(() => {});
  }

  revalidatePromo(promo.slug);
  redirect("/admin/promos?deleted=1");
}

export async function listPromos() {
  await requireSession();

  return prisma.promo.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
}

export async function getPromo(id: string) {
  await requireSession();

  return prisma.promo.findUnique({ where: { id } });
}