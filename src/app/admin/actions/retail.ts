"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { InvalidPriceError, parseOptionalPriceIdr } from "@/lib/domain/pricing";
import {
  RETAIL_LIMITS,
  nextRetailSortOrder,
  planRetailMove,
  sortRetailProducts,
} from "@/lib/domain/retail";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";
import { richTextInput, richTextLength } from "@/lib/domain/rich-text";

import { firstIssue, optionalImageUrl, slugSchema } from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

const retailSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama produk wajib diisi.")
    .max(RETAIL_LIMITS.name, `Nama produk maksimal ${RETAIL_LIMITS.name} karakter.`),
  slug: slugSchema,
  description: z
    .string()
    .trim()
    .optional()
    // Batas dihitung dari teks terlihat, bukan markup HTML editor.
    .refine(
      (value) => !value || richTextLength(value) <= RETAIL_LIMITS.description,
      `Deskripsi maksimal ${RETAIL_LIMITS.description} karakter.`,
    ),
  // Hanya URL yang disimpan; file-nya ada di Supabase Storage/Media Library.
  imageUrl: optionalImageUrl,
  // Harga opsional: kosong berarti "Hubungi kami" (tanya via WhatsApp).
  priceIdr: z.string().trim().optional(),
  whatsappMessage: z
    .string()
    .trim()
    .max(
      RETAIL_LIMITS.whatsappMessage,
      `Pesan WhatsApp maksimal ${RETAIL_LIMITS.whatsappMessage} karakter.`,
    )
    .optional(),
  // Kosong → produk baru diletakkan di akhir daftar.
  sortOrder: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^\d+$/.test(value),
      "Urutan harus bilangan bulat 0 atau lebih.",
    )
    .transform((value) => (value ? Number(value) : null)),
  isHighlight: z.boolean(),
  isPublished: z.boolean(),
});

function text(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" ? value : undefined;
}

function readForm(formData: FormData) {
  return {
    name: text(formData, "name") ?? "",
    slug: text(formData, "slug") ?? "",
    description: richTextInput(formData.get("description")),
    imageUrl: text(formData, "imageUrl"),
    priceIdr: text(formData, "priceIdr"),
    whatsappMessage: text(formData, "whatsappMessage"),
    sortOrder: text(formData, "sortOrder"),
    isHighlight: formData.get("isHighlight") === "on",
    isPublished: formData.get("isPublished") === "on",
  };
}

function revalidateRetail() {
  updateTag(CONTENT_TAGS.retail);
  revalidatePath("/admin/retail");
  revalidatePath("/retail");
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

/**
 * Naikkan/turunkan urutan produk (tombol ↑/↓ di daftar admin). Seluruh
 * produk ditulis ulang menjadi 0..n-1 dalam satu transaksi, sehingga nilai
 * sortOrder kembar dari data lama ikut dirapikan dan tombol selalu berpengaruh.
 */
export async function moveRetailAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || (direction !== "up" && direction !== "down")) return;

  const rows = await prisma.retailProduct.findMany({
    select: { id: true, name: true, isHighlight: true, sortOrder: true },
  });
  const updates = planRetailMove(rows, id, direction);

  if (updates.length > 0) {
    await prisma.$transaction(
      updates.map((row) =>
        prisma.retailProduct.update({
          where: { id: row.id },
          data: { sortOrder: row.sortOrder },
        }),
      ),
    );
  }

  revalidateRetail();
  redirect("/admin/retail?saved=1");
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
