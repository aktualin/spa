"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import {
  STATIC_IN_SPA_HTML,
  optionalHtml,
  resolveCorporateContent,
  validateContentInput,
} from "@/lib/domain/corporate";
import { richTextInput } from "@/lib/domain/rich-text";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { prisma } from "@/lib/prisma";

import { revalidateCorporate } from "./corporate-items.helpers";
import { readImagePair, type ActionState, type CorporateImageValues } from "./corporate.helpers";
import { formAll, formStr } from "./form-utils";

/**
 * Konten untuk form admin: baris database digabung dengan isi bawaan, jadi
 * form selalu terisi persis seperti yang tampil di halaman publik.
 */
export async function getCorporateContentForm() {
  await requireSession();

  const row = await prisma.corporateContent.findUnique({ where: { id: "singleton" } });
  const images: CorporateImageValues = {
    heroImageUrl: row?.heroImageUrl ?? "",
    heroImageAlt: row?.heroImageAlt ?? "",
    aboutImageUrl: row?.aboutImageUrl ?? "",
    aboutImageAlt: row?.aboutImageAlt ?? "",
    inSpaImageUrl: row?.inSpaImageUrl ?? "",
    inSpaImageAlt: row?.inSpaImageAlt ?? "",
  };
  return { saved: row !== null, updatedAt: row?.updatedAt ?? null, content: resolveCorporateContent(row), images };
}

export async function saveCorporateContentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const result = validateContentInput({
    heroTitle: formStr(formData, "heroTitle"),
    intro: richTextInput(formData.get("intro")),
    benefits: formAll(formData, "benefits"),
    solutionTitles: formAll(formData, "solutionTitle"),
    solutionItems: formAll(formData, "solutionItems"),
    inSpaItems: formAll(formData, "inSpaItems"),
  });
  if (!result.ok) return { error: result.error };

  const hero = readImagePair(formData, "hero");
  if (!hero.ok) return { error: hero.error };
  const about = readImagePair(formData, "about");
  if (!about.ok) return { error: about.error };
  const inSpa = readImagePair(formData, "inSpa");
  if (!inSpa.ok) return { error: inSpa.error };

  // Semua HTML dari editor teks kaya wajib disanitasi sebelum disimpan.
  const data = {
    ...result.data,
    inSpaHtml: optionalHtml(sanitizeHtml(formStr(formData, "inSpaHtml")), STATIC_IN_SPA_HTML),
    inOfficeHtml: optionalHtml(sanitizeHtml(formStr(formData, "inOfficeHtml"))),
    stepsHtml: optionalHtml(sanitizeHtml(formStr(formData, "stepsHtml"))),
    heroImageUrl: hero.data.url,
    heroImageAlt: hero.data.alt,
    aboutImageUrl: about.data.url,
    aboutImageAlt: about.data.alt,
    inSpaImageUrl: inSpa.data.url,
    inSpaImageAlt: inSpa.data.alt,
  };

  await prisma.corporateContent.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  revalidateCorporate();
  revalidatePath("/admin/corporate/content");
  redirect("/admin/corporate/content?saved=1");
}