import { revalidatePath, updateTag } from "next/cache";

import { CONTENT_TAGS } from "@/lib/content/tags";
import { InvalidPriceError, parseDurationMin, parsePriceIdr } from "@/lib/domain/pricing";
import { richTextInput } from "@/lib/domain/rich-text";

import { revalidateRedirects } from "./redirects.helpers";

export type ActionState = { error: string | null; ok?: boolean };

/** Harga wajib; durasi package opsional — kosong berarti tidak ditampilkan. */
export function parsePackagePrice(
  rawPrice: string,
  rawDuration: string,
): { priceIdr: number; durationMin: number | null } | { error: string } {
  try {
    const priceIdr = parsePriceIdr(rawPrice);
    const durationMin = rawDuration ? parseDurationMin(rawDuration) : null;
    return { priceIdr, durationMin };
  } catch (error) {
    if (error instanceof InvalidPriceError) return { error: error.message };
    throw error;
  }
}

export type ItemRow = { treatmentId: string | null; label: string | null; minutes: number | null };

/**
 * Form mengirim item sebagai items[0][treatmentId], items[0][label], dst.
 * Baris tanpa treatment dan tanpa label dianggap dihapus oleh admin.
 */
export function parseItems(formData: FormData): ItemRow[] {
  const rows = new Map<number, Record<string, string>>();

  for (const [key, value] of formData.entries()) {
    const match = /^items\[(\d+)]\[(\w+)]$/.exec(key);
    if (!match) continue;
    const index = Number(match[1]);
    const row = rows.get(index) ?? {};
    row[match[2]] = String(value);
    rows.set(index, row);
  }

  return [...rows.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, row]) => {
      const minutes = Number.parseInt(row.minutes ?? "", 10);
      return {
        treatmentId: row.treatmentId?.trim() || null,
        label: row.label?.trim() || null,
        minutes: Number.isFinite(minutes) && minutes > 0 ? minutes : null,
      };
    })
    .filter((row) => row.treatmentId || row.label);
}

export function readForm(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    subtitle: formData.get("subtitle") ?? undefined,
    quote: formData.get("quote") ?? undefined,
    description: richTextInput(formData.get("description")),
    imageUrl: formData.get("imageUrl") ?? undefined,
    priceIdr: formData.get("priceIdr") ?? "",
    durationMin: formData.get("durationMin") ?? "",
    durationLabel: formData.get("durationLabel") ?? undefined,
    sortOrder: formData.get("sortOrder") ?? 0,
    isNew: formData.get("isNew") === "on",
    isBestSeller: formData.get("isBestSeller") === "on",
    isPublished: formData.get("isPublished") === "on",
    seoTitle: formData.get("seoTitle") ?? undefined,
    seoDescription: formData.get("seoDescription") ?? undefined,
    whatsappMessage: formData.get("whatsappMessage") ?? undefined,
  };
}

export function revalidatePackages(slug?: string, redirectsChanged = false) {
  updateTag(CONTENT_TAGS.catalog);
  if (redirectsChanged) revalidateRedirects();
  revalidatePath("/admin/treatments/packages");
  revalidatePath("/admin/treatments/prices");
  revalidatePath("/treatments/packages");
  revalidatePath("/menu");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/treatments/packages/${slug}`);
}