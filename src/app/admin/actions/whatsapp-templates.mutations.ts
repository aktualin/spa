"use server";

import { redirect } from "next/navigation";

import {
  WHATSAPP_CONTEXTS,
  getContextDefinition,
  isSystemTemplateKey,
  validateTemplate,
} from "@/lib/domain/whatsapp-template";
import { prisma } from "@/lib/prisma";

import {
  MODULE_PATH,
  requireWhatsAppRole,
  revalidateWhatsApp,
  type WhatsAppTemplateActionState,
} from "./whatsapp-templates.helpers";

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