import { revalidatePath, updateTag } from "next/cache";

import { requireRole } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";

import { rolesForPath } from "../modules";

export const MODULE_PATH = "/admin/settings/whatsapp";

export type WhatsAppTemplateActionState = { error: string | null };

/** Role mengikuti matriks modul (Kontak & Umum → Template WhatsApp). */
export async function requireWhatsAppRole() {
  return requireRole(rolesForPath(MODULE_PATH));
}

export function revalidateWhatsApp() {
  updateTag(CONTENT_TAGS.settings);
  revalidatePath(MODULE_PATH);
  revalidatePath("/", "layout");
}