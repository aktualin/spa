"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { formatMembershipPriceLabel } from "@/lib/domain/pricing";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { parseOptionalPrice, type ActionState } from "./prices.helpers";

/**
 * Simpan harga tier membership. Angka ditulis ke `priceIdr` dan label tampil
 * ("Rp 1,5jt") dibentuk ulang dari angka itu. Isian kosong = harga non-angka:
 * label lama (contoh "Custom") dipertahankan.
 */
export async function updateMembershipPriceAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const price = parseOptionalPrice(formData);
  if (!price.ok) return { error: price.error };
  const priceIdr = price.value;

  const tier = id
    ? await prisma.membershipTier.findUnique({
        where: { id },
        select: { slug: true, priceLabel: true },
      })
    : null;
  if (!tier) return { error: "Tier membership tidak ditemukan." };

  await prisma.membershipTier.update({
    where: { id },
    data: {
      priceIdr,
      priceLabel:
        priceIdr === null ? tier.priceLabel : formatMembershipPriceLabel(priceIdr),
    },
  });

  updateTag(CONTENT_TAGS.membership);
  revalidatePath("/admin/membership");
  revalidatePath("/membership");
  revalidatePath("/promos/membership");
  revalidatePath(`/promos/membership/${tier.slug}`);

  redirect("/admin/treatments/prices?saved=1");
}

/** Simpan harga produk retail. Kosong = harga tidak ditampilkan. */
export async function updateRetailPriceAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const price = parseOptionalPrice(formData);
  if (!price.ok) return { error: price.error };

  const existing = id
    ? await prisma.retailProduct.findUnique({ where: { id }, select: { id: true } })
    : null;
  if (!existing) return { error: "Produk retail tidak ditemukan." };

  await prisma.retailProduct.update({ where: { id }, data: { priceIdr: price.value } });

  updateTag(CONTENT_TAGS.retail);
  revalidatePath("/admin/retail");
  revalidatePath("/retail");

  redirect("/admin/treatments/prices?saved=1");
}