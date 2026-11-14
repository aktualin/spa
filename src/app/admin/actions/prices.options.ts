"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { parseDurationMin, parsePriceIdr } from "@/lib/domain/pricing";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { firstIssue } from "../promos/_kit/schema";
import { priceRowSchema, tryParsePrice, type ActionState } from "./prices.helpers";

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
      return { error: firstIssue(parsed.error) };
    }

    const price = tryParsePrice(() => ({
      priceIdr: parsePriceIdr(parsed.data.priceIdr),
      durationMin: parseDurationMin(parsed.data.durationMin),
    }));
    if (!price.ok) return { error: price.error };

    try {
      await prisma.treatmentOption.update({
        where: { id: optionId },
        data: price.value,
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