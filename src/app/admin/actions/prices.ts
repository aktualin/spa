"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import {
  formatMembershipPriceLabel,
  InvalidPriceError,
  parseDurationMin,
  parseOptionalPriceIdr,
  parsePriceIdr,
} from "@/lib/domain/pricing";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

export type ActionState = { error: string | null; ok?: boolean };

const priceRowSchema = z.object({
  priceIdr: z.string().trim(),
  durationMin: z.string().trim(),
});

/**
 * Simpan harga & durasi per TreatmentOption. Semua baris dikirim sekaligus
 * (satu form berisi seluruh tabel), jadi penulisan dilakukan per baris.
 */
export async function updateOptionPriceAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  type PriceRow = { priceIdr: string; durationMin: string };
  const rows = new Map<string, PriceRow>();

  for (const [key, value] of formData.entries()) {
    const match = /^options\[([^\]]+)]\[(priceIdr|durationMin)]$/.exec(key);
    if (!match) continue;
    const field = match[2] as keyof PriceRow;
    const row = rows.get(match[1]) ?? { priceIdr: "", durationMin: "" };
    row[field] = String(value);
    rows.set(match[1], row);
  }

  if (rows.size === 0) {
    return { error: "Tidak ada baris harga untuk disimpan." };
  }

  for (const [optionId, row] of rows) {
    const parsed = priceRowSchema.safeParse(row);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
    }

    let priceIdr: number;
    let durationMin: number;
    try {
      priceIdr = parsePriceIdr(parsed.data.priceIdr);
      durationMin = parseDurationMin(parsed.data.durationMin);
    } catch (error) {
      if (error instanceof InvalidPriceError) return { error: error.message };
      throw error;
    }

    try {
      await prisma.treatmentOption.update({
        where: { id: optionId },
        data: { priceIdr, durationMin },
      });
    } catch {
      return { error: `Baris harga "${optionId}" tidak ditemukan.` };
    }
  }

  updateTag(CONTENT_TAGS.catalog);
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/treatments/prices");
  revalidatePath("/admin/treatments");
  revalidatePath("/menu");
  revalidatePath("/treatments");

  redirect("/admin/treatments/prices?saved=1");
}

/** Simpan harga package (durasi package opsional). */
export async function updatePackagePriceAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Package tidak ditemukan." };

  const rawPrice = String(formData.get("priceIdr") ?? "");
  const rawDuration = String(formData.get("durationMin") ?? "");

  let priceIdr: number;
  let durationMin: number | null = null;
  try {
    priceIdr = parsePriceIdr(rawPrice);
    if (rawDuration.trim()) durationMin = parseDurationMin(rawDuration);
  } catch (error) {
    if (error instanceof InvalidPriceError) return { error: error.message };
    throw error;
  }

  const existing = await prisma.package.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return { error: "Package tidak ditemukan." };

  await prisma.package.update({
    where: { id },
    data: { priceIdr, durationMin },
  });

  updateTag(CONTENT_TAGS.catalog);
  revalidatePath("/admin/treatments/prices");
  revalidatePath("/admin/treatments/packages");
  revalidatePath("/treatments/packages");
  revalidatePath("/menu");

  redirect("/admin/treatments/prices?saved=1");
}

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
  let priceIdr: number | null;
  try {
    priceIdr = parseOptionalPriceIdr(String(formData.get("priceIdr") ?? ""));
  } catch (error) {
    if (error instanceof InvalidPriceError) return { error: error.message };
    throw error;
  }

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
  let priceIdr: number | null;
  try {
    priceIdr = parseOptionalPriceIdr(String(formData.get("priceIdr") ?? ""));
  } catch (error) {
    if (error instanceof InvalidPriceError) return { error: error.message };
    throw error;
  }

  const existing = id
    ? await prisma.retailProduct.findUnique({ where: { id }, select: { id: true } })
    : null;
  if (!existing) return { error: "Produk retail tidak ditemukan." };

  await prisma.retailProduct.update({ where: { id }, data: { priceIdr } });

  updateTag(CONTENT_TAGS.retail);
  revalidatePath("/admin/retail");
  revalidatePath("/retail");

  redirect("/admin/treatments/prices?saved=1");
}
