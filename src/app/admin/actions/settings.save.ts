"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { CONTENT_TAGS } from "@/lib/content/tags";
import { siteSettingsInputSchema, toSiteSettingsWrite } from "@/lib/domain/site-settings";
import { prisma } from "@/lib/prisma";

import { requireModuleRole } from "../access";
import { firstIssue } from "../promos/_kit/schema";
import { readSiteSettingsInput, type SiteSettingsFormState } from "./settings.helpers";

/**
 * Simpan Kontak & Umum. Hanya kolom milik modul ini yang ditulis; kolom SEO
 * (`gscVerification`, `faviconUrl`, `defaultOgImageUrl`, dan teks SEO bawaan)
 * tidak disentuh — teks SEO diedit lewat /admin/seo/settings.
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

  const data = {
    ...toSiteSettingsWrite(parsed.data),
    // Kolom SEO teks milik modul SEO — `undefined` = tidak ditulis ke database,
    // sehingga menyimpan Kontak & Umum tidak menimpa pengaturan SEO.
    seoSiteName: undefined,
    seoDefaultTitle: undefined,
    seoDefaultDescription: undefined,
    seoOgDescription: undefined,
    seoOgLocale: undefined,
    seoTitleTemplate: undefined,
    seoKeywords: undefined,
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