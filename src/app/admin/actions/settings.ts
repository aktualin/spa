"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import {
  siteSettingsInputSchema,
  toSiteSettingsWrite,
  type SiteSettingsInput,
} from "@/lib/domain/site-settings";
import { prisma } from "@/lib/prisma";

import { requireModuleRole } from "../access";

export type ActionState = { error: string | null; ok?: boolean };

/** State form Kontak & Umum: isian dikembalikan saat gagal agar tidak hilang. */
export type SiteSettingsFormState = ActionState & {
  values?: SiteSettingsInput;
  attempt?: number;
};

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

/** Membaca baris jam operasional dari form (openingHours[0], dst) sesuai urutan. */
function readOpeningHours(formData: FormData): string[] {
  const values: string[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("openingHours[")) continue;
    values.push(String(value));
  }
  return values;
}

function readSiteSettingsInput(formData: FormData): SiteSettingsInput {
  const field = (name: string) => String(formData.get(name) ?? "");
  return {
    address: field("address"),
    openingHours: readOpeningHours(formData),
    whatsappNumber: field("whatsappNumber"),
    email: field("email"),
    phone: field("phone"),
    instagramUrl: field("instagramUrl"),
    instagramUsername: field("instagramUsername"),
    tiktokUrl: field("tiktokUrl"),
    facebookUrl: field("facebookUrl"),
    freshaUrl: field("freshaUrl"),
    mapsEmbedUrl: field("mapsEmbedUrl"),
    ga4MeasurementId: field("ga4MeasurementId"),
    footerTagline: field("footerTagline"),
    footerMembershipTitle: field("footerMembershipTitle"),
    footerMembershipLearnLabel: field("footerMembershipLearnLabel"),
    footerMembershipJoinLabel: field("footerMembershipJoinLabel"),
    partnershipIntro: field("partnershipIntro"),
    partnershipEmail: field("partnershipEmail"),
    priceDisclaimer: field("priceDisclaimer"),
    bookNowLabel: field("bookNowLabel"),
    bookNowHref: field("bookNowHref"),
    // Satu URL per baris; baris kosong dibuang oleh normalizer di schema.
    menuScanUrls: field("menuScanUrls").split("\n"),
    menuPdfUrl: field("menuPdfUrl"),
  };
}

/**
 * Simpan Kontak & Umum. Hanya kolom milik modul ini yang ditulis; kolom SEO
 * (`gscVerification`, `faviconUrl`, `defaultOgImageUrl`) tidak disentuh.
 */
export async function saveSiteSettingsAction(
  prevState: SiteSettingsFormState,
  formData: FormData,
): Promise<SiteSettingsFormState> {
  // Kontak & Umum khusus ADMIN — role diambil dari matriks di modules.ts.
  await requireModuleRole("/admin/settings/contact");

  const values = readSiteSettingsInput(formData);
  const parsed = siteSettingsInputSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: firstIssue(parsed.error),
      values,
      attempt: (prevState.attempt ?? 0) + 1,
    };
  }

  const data = toSiteSettingsWrite(parsed.data);

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

export async function getSiteSettings() {
  await requireModuleRole("/admin/settings/contact");
  return prisma.siteSettings.findUnique({ where: { id: "singleton" } });
}

/** Bacaan admin kolom milik Kontak & Umum (tanpa kolom SEO). */
export async function getContactSettingsRow() {
  await requireModuleRole("/admin/settings/contact");
  return prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: {
      address: true,
      mapsEmbedUrl: true,
      openingHours: true,
      whatsappNumber: true,
      email: true,
      phone: true,
      instagramUrl: true,
      instagramUsername: true,
      tiktokUrl: true,
      facebookUrl: true,
      freshaUrl: true,
      ga4MeasurementId: true,
      footerTagline: true,
      footerMembershipTitle: true,
      footerMembershipLearnLabel: true,
      footerMembershipJoinLabel: true,
      partnershipIntro: true,
      partnershipEmail: true,
      priceDisclaimer: true,
      bookNowLabel: true,
      bookNowHref: true,
      menuScanUrls: true,
      menuPdfUrl: true,
    },
  });
}
