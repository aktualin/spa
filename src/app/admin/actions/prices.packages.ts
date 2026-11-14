"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { parseDurationMin, parsePriceIdr } from "@/lib/domain/pricing";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { tryParsePrice, type ActionState } from "./prices.helpers";

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

  const price = tryParsePrice(() => ({
    priceIdr: parsePriceIdr(rawPrice),
    durationMin: rawDuration.trim() ? parseDurationMin(rawDuration) : null,
  }));
  if (!price.ok) return { error: price.error };

  const existing = await prisma.package.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return { error: "Package tidak ditemukan." };

  await prisma.package.update({
    where: { id },
    data: price.value,
  });

  updateTag(CONTENT_TAGS.catalog);
  revalidatePath("/admin/treatments/prices");
  revalidatePath("/admin/treatments/packages");
  revalidatePath("/treatments/packages");
  revalidatePath("/menu");

  redirect("/admin/treatments/prices?saved=1");
}