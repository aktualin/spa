"use server";

import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import { sortRetailProducts } from "@/lib/domain/retail";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import { revalidateRetail } from "./retail.helpers";

export async function deleteRetailAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const product = await prisma.retailProduct.findUnique({
    where: { id },
    select: { imageUrl: true },
  });
  if (!product) redirect("/admin/retail");

  await prisma.retailProduct.delete({ where: { id } });
  if (product.imageUrl) {
    await deleteImageByUrl(product.imageUrl).catch(() => {});
  }

  revalidateRetail();
  redirect("/admin/retail?deleted=1");
}

/** Tampilkan/sembunyikan produk langsung dari daftar admin. */
export async function toggleRetailPublishedAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const product = await prisma.retailProduct.findUnique({
    where: { id },
    select: { isPublished: true },
  });
  if (!product) return;

  await prisma.retailProduct.update({
    where: { id },
    data: { isPublished: !product.isPublished },
  });

  revalidateRetail();
  redirect("/admin/retail?saved=1");
}

/**
 * Dipakai halaman list; read-only tapi tetap butuh sesi. Urutannya sama
 * dengan halaman publik /retail (Highlight/Kolaborasi lebih dulu).
 */
export async function listRetailProducts() {
  await requireSession();
  const rows = await prisma.retailProduct.findMany();
  return sortRetailProducts(rows);
}

export async function getRetailProduct(id: string) {
  await requireSession();
  return prisma.retailProduct.findUnique({ where: { id } });
}