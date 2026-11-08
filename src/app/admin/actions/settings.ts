"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { normalizeWhatsAppNumber } from "../settings/phone";

export type ActionState = { error: string | null; ok?: boolean };

const optionalUrl = z
  .union([z.string().trim().url("Format URL tidak valid."), z.literal("")])
  .optional();

const settingsSchema = z.object({
  address: z.string().trim().optional(),
  mapsEmbedUrl: z
    .union([
      z
        .string()
        .trim()
        .refine(
          (value) =>
            value.startsWith("https://www.google.com/maps/embed") ||
            value.startsWith("https://maps.google.com"),
          "URL embed harus diawali https://www.google.com/maps/embed",
        ),
      z.literal(""),
    ])
    .optional(),
  whatsappNumber: z
    .union([
      z
        .string()
        .trim()
        .regex(
          /^[0-9+\-\s()]+$/,
          "Nomor WhatsApp hanya boleh berisi angka (boleh +, spasi, atau tanda hubung).",
        ),
      z.literal(""),
    ])
    .optional(),
  email: z
    .union([z.string().trim().email("Format email tidak valid."), z.literal("")])
    .optional(),
  phone: z.string().trim().optional(),
  instagramUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  facebookUrl: optionalUrl,
  freshaUrl: optionalUrl,
});

const templateSchema = z.object({
  id: z.string().trim().optional(),
  key: z
    .string()
    .trim()
    .min(1, "Key template wajib diisi.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Key hanya boleh huruf kecil, angka, dan tanda hubung.",
    ),
  label: z.string().trim().min(1, "Label template wajib diisi."),
  message: z.string().trim().min(1, "Isi pesan wajib diisi."),
});

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Input tidak valid.";
}

/** Membaca baris jam operasional dari form (openingHours[0], dst). */
function readOpeningHours(formData: FormData): string[] {
  const values: string[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("openingHours[")) continue;
    const text = String(value).trim();
    if (text) values.push(text);
  }
  return values;
}

export async function saveSiteSettingsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const parsed = settingsSchema.safeParse({
    address: formData.get("address") ?? undefined,
    mapsEmbedUrl: formData.get("mapsEmbedUrl") ?? undefined,
    whatsappNumber: formData.get("whatsappNumber") ?? undefined,
    email: formData.get("email") ?? undefined,
    phone: formData.get("phone") ?? undefined,
    instagramUrl: formData.get("instagramUrl") ?? undefined,
    tiktokUrl: formData.get("tiktokUrl") ?? undefined,
    facebookUrl: formData.get("facebookUrl") ?? undefined,
    freshaUrl: formData.get("freshaUrl") ?? undefined,
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const data = {
    address: parsed.data.address || null,
    mapsEmbedUrl: parsed.data.mapsEmbedUrl || null,
    whatsappNumber: parsed.data.whatsappNumber
      ? normalizeWhatsAppNumber(parsed.data.whatsappNumber)
      : null,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    instagramUrl: parsed.data.instagramUrl || null,
    tiktokUrl: parsed.data.tiktokUrl || null,
    facebookUrl: parsed.data.facebookUrl || null,
    freshaUrl: parsed.data.freshaUrl || null,
    openingHours: readOpeningHours(formData),
  };

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  updateTag(CONTENT_TAGS.settings);
  revalidatePath("/admin/settings/contact");
  revalidatePath("/contact");
  revalidatePath("/", "layout");

  redirect("/admin/settings/contact?saved=1");
}

export async function saveWhatsAppTemplateAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const parsed = templateSchema.safeParse({
    id: formData.get("id") ?? undefined,
    key: formData.get("key"),
    label: formData.get("label"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { id, key, label, message } = parsed.data;

  const clash = await prisma.whatsAppTemplate.findFirst({
    where: { key, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { error: `Key "${key}" sudah dipakai template lain.` };
  }

  if (id) {
    await prisma.whatsAppTemplate.update({
      where: { id },
      data: { key, label, message },
    });
  } else {
    await prisma.whatsAppTemplate.create({ data: { key, label, message } });
  }

  updateTag(CONTENT_TAGS.settings);
  revalidatePath("/admin/settings/whatsapp");
  revalidatePath("/", "layout");

  redirect("/admin/settings/whatsapp?saved=1");
}

export async function deleteWhatsAppTemplateAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.whatsAppTemplate.delete({ where: { id } });

  updateTag(CONTENT_TAGS.settings);
  revalidatePath("/admin/settings/whatsapp");
  revalidatePath("/", "layout");

  redirect("/admin/settings/whatsapp?deleted=1");
}

export async function getSiteSettings() {
  await requireSession();
  return prisma.siteSettings.findUnique({ where: { id: "singleton" } });
}

export async function listWhatsAppTemplates() {
  await requireSession();
  return prisma.whatsAppTemplate.findMany({ orderBy: { key: "asc" } });
}
