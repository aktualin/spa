"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { InvalidPriceError, parseOptionalPriceIdr } from "@/lib/domain/pricing";
import { nextRetailSortOrder } from "@/lib/domain/retail";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import { firstIssue } from "../promos/_kit/schema";
import { readForm, revalidateRetail, retailSchema, type ActionState } from "./retail.helpers";

export async function saveRetailAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const parsed = retailSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const {
    priceIdr: rawPrice,
    imageUrl,
    description,
    whatsappMessage,
    sortOrder,
    ...rest
  } = parsed.data;

  let priceIdr: number | null;
  try {
    priceIdr = parseOptionalPriceIdr(rawPrice ?? "");
  } catch (error) {
    if (error instanceof InvalidPriceError) return { error: error.message };
    throw error;
  }

  const data = {
    ...rest,
    priceIdr,
    imageUrl,
    description: description || null,
    whatsappMessage: whatsappMessage || null,
  };

  const clash = await prisma.retailProduct.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { error: `Slug "${data.slug}" sudah dipakai produk lain.` };
  }

  if (id) {
    const previous = await prisma.retailProduct.findUnique({
      where: { id },
      select: { imageUrl: true, sortOrder: true },
    });
    if (!previous) return { error: "Produk tidak ditemukan." };
    await prisma.retailProduct.update({
      where: { id },
      data: { ...data, sortOrder: sortOrder ?? previous.sortOrder },
    });
    // Gambar lama baru dihapus setelah data tersimpan.
    if (previous.imageUrl && previous.imageUrl !== data.imageUrl) {
      await deleteImageByUrl(previous.imageUrl).catch(() => {});
    }
  } else {
    let order = sortOrder;
    if (order === null) {
      const last = await prisma.retailProduct.aggregate({ _max: { sortOrder: true } });
      order = nextRetailSortOrder(last._max.sortOrder);
    }
    await prisma.retailProduct.create({ data: { ...data, sortOrder: order } });
  }

  revalidateRetail();
  redirect("/admin/retail?saved=1");
}