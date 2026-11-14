"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { readBenefits, readServices, validateProgramInput } from "@/lib/domain/membership";
import { richTextInput } from "@/lib/domain/rich-text";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { prisma } from "@/lib/prisma";

import { formAll } from "./form-utils";
import { revalidateMembership, type ActionState } from "./membership.helpers";

/** Program yang tersimpan, atau null bila belum pernah disimpan. */
export async function getProgram() {
  await requireSession();

  const row = await prisma.membershipProgram.findUnique({ where: { id: "singleton" } });
  if (!row) return null;
  return {
    ...row,
    benefits: readBenefits(row.benefits),
    services: readServices(row.services),
  };
}

export async function saveProgramAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const result = validateProgramInput({
    eyebrow: String(formData.get("eyebrow") ?? ""),
    title: String(formData.get("title") ?? ""),
    intro: richTextInput(formData.get("intro")),
    priceHeadline: String(formData.get("priceHeadline") ?? ""),
    bannerBody: String(formData.get("bannerBody") ?? ""),
    servicesIntro: richTextInput(formData.get("servicesIntro")),
    benefitTitles: formAll(formData, "benefitTitle"),
    benefitBodies: formAll(formData, "benefitBody"),
    serviceNames: formAll(formData, "serviceName"),
    serviceDescriptions: formAll(formData, "serviceDescription"),
  });
  if (!result.ok) return { error: result.error };

  // S&K dari editor teks kaya: disanitasi; kosong (tanpa teks terlihat) = null.
  const rawTerms = String(formData.get("termsHtml") ?? "");
  const termsHtml = rawTerms.trim() ? sanitizeHtml(rawTerms) : "";
  const hasTerms = /\S/.test(termsHtml.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " "));

  const fields = { ...result.data, termsHtml: hasTerms ? termsHtml : null };
  await prisma.membershipProgram.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...fields },
    update: fields,
  });

  revalidateMembership();
  // Kalimat harga & deskripsi juga tampil di banner membership homepage.
  updateTag(CONTENT_TAGS.homepage);
  revalidatePath("/");
  revalidatePath("/admin/membership/program");
  redirect("/admin/membership/program?saved=1");
}