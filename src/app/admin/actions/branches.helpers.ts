import { revalidatePath, updateTag } from "next/cache";

import { CONTENT_TAGS } from "@/lib/content/tags";

import { text } from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

export const MODULE_PATH = "/admin/branches";

/** Textarea jam operasional: satu baris = satu entri. */
function lines(formData: FormData, name: string): string[] {
  return (text(formData, name) ?? "").split("\n");
}

export function readForm(formData: FormData) {
  return {
    name: text(formData, "name") ?? "",
    slug: text(formData, "slug") ?? "",
    area: text(formData, "area") ?? "",
    tag: text(formData, "tag"),
    address: text(formData, "address"),
    openingHours: lines(formData, "openingHours"),
    whatsappNumber: text(formData, "whatsappNumber"),
    phone: text(formData, "phone"),
    email: text(formData, "email"),
    mapsEmbedUrl: text(formData, "mapsEmbedUrl"),
    mapsUrl: text(formData, "mapsUrl"),
    latitude: text(formData, "latitude"),
    longitude: text(formData, "longitude"),
    sortOrder: text(formData, "sortOrder"),
    isPublished: formData.get("isPublished") === "on",
  };
}

export function revalidateBranches() {
  updateTag(CONTENT_TAGS.branches);
  revalidatePath("/admin/branches");
  revalidatePath("/contact");
  // Daftar cabang adalah pilihan lokasi form reservasi (/contact) dan form
  // newsletter di footer setiap halaman; kirimannya masuk ke inbox admin
  // /admin/reservations dan /admin/newsletter.
  revalidatePath("/", "layout");
}