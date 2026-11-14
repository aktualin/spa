"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { parseGscVerification } from "@/lib/domain/seo";
import { prisma } from "@/lib/prisma";

import { firstIssue } from "../promos/_kit/schema";
import { formStr } from "./form-utils";
import { revalidateSeo, settingsSchema, type ActionState } from "./seo.helpers";

/**
 * Menyimpan favicon, OG bawaan, verifikasi GSC, dan teks SEO bawaan situs.
 * HANYA kolom-kolom SEO ini yang ditulis — kolom `SiteSettings` lain milik
 * modul Kontak & Umum.
 */
export async function saveSeoSettingsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const field = (name: string) => formStr(formData, name);
  const parsed = settingsSchema.safeParse({
    faviconUrl: formData.get("faviconUrl") ?? undefined,
    defaultOgImageUrl: formData.get("defaultOgImageUrl") ?? undefined,
    seoSiteName: field("seoSiteName"),
    seoDefaultTitle: field("seoDefaultTitle"),
    seoDefaultDescription: field("seoDefaultDescription"),
    seoOgDescription: field("seoOgDescription"),
    seoOgLocale: field("seoOgLocale"),
    seoTitleTemplate: field("seoTitleTemplate"),
    // Satu keyword per baris; baris kosong dibuang oleh normalizer di schema.
    seoKeywords: field("seoKeywords").split("\n"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const gsc = parseGscVerification(field("gscVerification"));
  if (!gsc.ok) return { error: gsc.error };

  const data = {
    faviconUrl: parsed.data.faviconUrl || null,
    defaultOgImageUrl: parsed.data.defaultOgImageUrl || null,
    gscVerification: gsc.code,
    seoSiteName: parsed.data.seoSiteName || null,
    seoDefaultTitle: parsed.data.seoDefaultTitle || null,
    seoDefaultDescription: parsed.data.seoDefaultDescription || null,
    seoOgDescription: parsed.data.seoOgDescription || null,
    seoOgLocale: parsed.data.seoOgLocale || null,
    seoTitleTemplate: parsed.data.seoTitleTemplate || null,
    seoKeywords: parsed.data.seoKeywords,
  };

  // Kolom SiteSettings lain opsional/array, jadi baris singleton boleh dibuat
  // hanya dengan kolom SEO; bacaan kontak memakai fallback per kolom.
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  updateTag(CONTENT_TAGS.settings);
  revalidateSeo();
  revalidatePath("/admin/seo/settings");
  redirect("/admin/seo/settings?saved=1");
}

export async function getSeoSettingsForAdmin() {
  await requireSession();
  const row = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: {
      gscVerification: true,
      faviconUrl: true,
      defaultOgImageUrl: true,
      seoSiteName: true,
      seoDefaultTitle: true,
      seoDefaultDescription: true,
      seoOgDescription: true,
      seoOgLocale: true,
      seoTitleTemplate: true,
      seoKeywords: true,
    },
  });
  return {
    gscVerification: row?.gscVerification ?? "",
    faviconUrl: row?.faviconUrl ?? "",
    defaultOgImageUrl: row?.defaultOgImageUrl ?? "",
    seoSiteName: row?.seoSiteName ?? "",
    seoDefaultTitle: row?.seoDefaultTitle ?? "",
    seoDefaultDescription: row?.seoDefaultDescription ?? "",
    seoOgDescription: row?.seoOgDescription ?? "",
    seoOgLocale: row?.seoOgLocale ?? "",
    seoTitleTemplate: row?.seoTitleTemplate ?? "",
    seoKeywords: row?.seoKeywords ?? [],
  };
}