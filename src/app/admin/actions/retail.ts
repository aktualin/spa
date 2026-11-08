"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { InvalidPriceError, parsePriceIdr } from "@/lib/domain/pricing";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { SLUG_PATTERN } from "@/lib/domain/slug";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

export type ActionState = { error: string | null; ok?: boolean };

const retailSchema = z.object({
  name: z.string().trim().min(1, "Nama produk wajib diisi."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug wajib diisi.")
    .regex(SLUG_PATTERN, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
  description: z.string().trim().optional(),
  // Hanya URL yang disimpan; file-nya ada di Supabase Storage.
  imageUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  // Harga opsional: kosong berarti "tanyakan via WhatsApp".
  priceIdr: z.string().trim().optional(),
  whatsappMessage: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isHighlight: z.boolean(),
  isPublished: z.boolean(),
});

function readForm(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? undefined,
    imageUrl: formData.get("imageUrl") ?? undefined,
    priceIdr: formData.get("priceIdr") ?? undefined,
    whatsappMessage: formData.get("whatsappMessage") ?? undefined,
    sortOrder: formData.get("sortOrder") ?? 0,
    isHighlight: formData.get("isHighlight") === "on",
    isPublished: formData.get("isPublished") === "on",
  };
}

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Input tidak valid.";
}

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

  const { priceIdr: rawPrice, imageUrl, description, whatsappMessage, ...rest } =
    parsed.data;

  let priceIdr: number | null = null;
  if (rawPrice) {
    try {
      priceIdr = parsePriceIdr(rawPrice);
    } catch (error) {
      if (error instanceof InvalidPriceError) return { error: error.message };
      throw error;
    }
  }

  const data = {
    ...rest,
    priceIdr,
    imageUrl: imageUrl || null,
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
      select: { imageUrl: true },
    });
    if (!previous) return { error: "Produk tidak ditemukan." };
    if (previous.imageUrl && previous.imageUrl !== data.imageUrl) {
      await deleteImageByUrl(previous.imageUrl).catch(() => {});
    }
    await prisma.retailProduct.update({ where: { id }, data });
  } else {
    await prisma.retailProduct.create({ data });
  }

  updateTag(CONTENT_TAGS.retail);
  revalidatePath("/admin/retail");
  revalidatePath("/retail");

  redirect("/admin/retail?saved=1");
}

export async function deleteRetailAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const product = await prisma.retailProduct.delete({ where: { id } });
  if (product.imageUrl) {
    await deleteImageByUrl(product.imageUrl).catch(() => {});
  }

  updateTag(CONTENT_TAGS.retail);
  revalidatePath("/admin/retail");
  revalidatePath("/retail");
  redirect("/admin/retail?deleted=1");
}

/** Dipakai halaman list; read-only tapi tetap butuh sesi. */
export async function listRetailProducts() {
  await requireSession();
  return prisma.retailProduct.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getRetailProduct(id: string) {
  await requireSession();
  return prisma.retailProduct.findUnique({ where: { id } });
}
