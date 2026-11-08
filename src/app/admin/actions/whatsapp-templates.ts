"use server";

/**
 * Server Action modul Template WhatsApp (bagian dari Kontak & Umum).
 *
 * Template dikunci per konteks (default, treatment, package, promo, gift,
 * membership, retail — lihat `WHATSAPP_CONTEXTS`). Key sistem tidak bisa
 * diganti atau dihapus; isi pesan divalidasi (panjang, placeholder dikenal).
 * Setiap perubahan memanggil `updateTag(CONTENT_TAGS.settings)` sehingga
 * tombol WhatsApp publik langsung memakai pesan baru tanpa redeploy.
 */
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import {
  WHATSAPP_CONTEXTS,
  getContextDefinition,
  isSystemTemplateKey,
  validateTemplate,
} from "@/lib/domain/whatsapp-template";
import { prisma } from "@/lib/prisma";

import { rolesForPath } from "../modules";

const MODULE_PATH = "/admin/settings/whatsapp";

export type WhatsAppTemplateActionState = { error: string | null };

/** Role mengikuti matriks modul (Kontak & Umum → Template WhatsApp). */
async function requireWhatsAppRole() {
  return requireRole(rolesForPath(MODULE_PATH));
}

function revalidateWhatsApp() {
  updateTag(CONTENT_TAGS.settings);
  revalidatePath(MODULE_PATH);
  revalidatePath("/", "layout");
}

/** Simpan (upsert) template sebuah konteks sistem. */
export async function saveWhatsAppTemplateAction(
  _prevState: WhatsAppTemplateActionState,
  formData: FormData,
): Promise<WhatsAppTemplateActionState> {
  await requireWhatsAppRole();

  const key = String(formData.get("key") ?? "").trim();
  const message = String(formData.get("message") ?? "")
    .replace(/\r\n/g, "\n")
    .trim();

  if (!isSystemTemplateKey(key)) {
    return { error: "Konteks template tidak dikenal." };
  }

  const { errors } = validateTemplate(key, message);
  if (errors.length > 0) return { error: errors[0] };

  const label = getContextDefinition(key).label;
  await prisma.whatsAppTemplate.upsert({
    where: { key },
    create: { key, label, message },
    update: { message },
  });

  revalidateWhatsApp();
  redirect(`${MODULE_PATH}?saved=1`);
}

/** Buat template bawaan untuk konteks yang belum punya baris di DB. */
export async function seedWhatsAppTemplatesAction() {
  await requireWhatsAppRole();

  const result = await prisma.whatsAppTemplate.createMany({
    data: WHATSAPP_CONTEXTS.map((context) => ({
      key: context.key,
      label: context.label,
      message: context.builtIn,
    })),
    skipDuplicates: true,
  });

  revalidateWhatsApp();
  redirect(`${MODULE_PATH}?seeded=${result.count}`);
}

/** Hapus template non-sistem (template sistem tidak boleh dihapus). */
export async function deleteWhatsAppTemplateAction(formData: FormData) {
  await requireWhatsAppRole();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const row = await prisma.whatsAppTemplate.findUnique({
    where: { id },
    select: { key: true },
  });
  if (!row) redirect(MODULE_PATH);
  if (isSystemTemplateKey(row.key)) {
    throw new Error(`Template sistem "${row.key}" tidak boleh dihapus.`);
  }

  await prisma.whatsAppTemplate.delete({ where: { id } });

  revalidateWhatsApp();
  redirect(`${MODULE_PATH}?deleted=1`);
}

/** Semua baris template (urut key) untuk halaman admin. */
export async function listWhatsAppTemplateRows() {
  await requireSession();
  return prisma.whatsAppTemplate.findMany({
    orderBy: { key: "asc" },
    select: { id: true, key: true, label: true, message: true, updatedAt: true },
  });
}

/** Nomor WhatsApp mentah dari pengaturan situs (untuk pratinjau tautan). */
export async function getSettingsWhatsAppNumber(): Promise<string | null> {
  await requireSession();
  const row = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: { whatsappNumber: true },
  });
  return row?.whatsappNumber ?? null;
}
