import { revalidatePath, updateTag } from "next/cache";

import { CONTENT_TAGS } from "@/lib/content/tags";
import { richTextInput } from "@/lib/domain/rich-text";

import { revalidateRedirects } from "./redirects.helpers";

export { CONTENT_ROLES } from "@/lib/domain/roles";

export type ActionState = { error: string | null; ok?: boolean };

/** Form mengirim opsi sebagai options[0][label], options[0][durationMin], dst. */
export function parseOptions(formData: FormData) {
  const rows = new Map<number, Record<string, string>>();

  for (const [key, value] of formData.entries()) {
    const match = /^options\[(\d+)]\[(\w+)]$/.exec(key);
    if (!match) continue;
    const index = Number(match[1]);
    const row = rows.get(index) ?? {};
    row[match[2]] = String(value);
    rows.set(index, row);
  }

  return [...rows.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, row]) => row)
    // Baris yang seluruhnya kosong dianggap dihapus oleh admin.
    .filter((row) => row.label?.trim() || row.priceIdr?.trim());
}

export function readForm(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    categoryId: formData.get("categoryId"),
    tagline: formData.get("tagline") ?? undefined,
    description: richTextInput(formData.get("description")),
    note: formData.get("note") ?? undefined,
    addonSection: String(formData.get("addonSection") ?? "") || undefined,
    imageUrl: formData.get("imageUrl") ?? undefined,
    whatsappMessage: formData.get("whatsappMessage") ?? undefined,
    seoTitle: formData.get("seoTitle") ?? undefined,
    seoDescription: formData.get("seoDescription") ?? undefined,
    sortOrder: formData.get("sortOrder") ?? 0,
    isNew: formData.get("isNew") === "on",
    isBestSeller: formData.get("isBestSeller") === "on",
    isPublished: formData.get("isPublished") === "on",
    options: parseOptions(formData),
  };
}

export function revalidateCatalog(redirectsChanged: boolean) {
  updateTag(CONTENT_TAGS.catalog);
  if (redirectsChanged) revalidateRedirects();
  revalidatePath("/admin/treatments");
  revalidatePath("/admin/treatments/addons");
  revalidatePath("/menu");
  revalidatePath("/treatments");
  revalidatePath("/sitemap.xml");
}