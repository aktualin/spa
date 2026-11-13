"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { prisma } from "@/lib/prisma";
import {
  readBenefits,
  readServices,
  validateProgramInput,
} from "@/lib/domain/membership";
import { parsePriceLabel } from "@/lib/domain/pricing";
import { plainTextToHtml, richTextInput } from "@/lib/domain/rich-text";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import {
  checked,
  firstIssue,
  optionalText,
  slugSchema,
  sortOrderSchema,
  text,
} from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

const tierSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1, "Nama tier wajib diisi."),
  priceLabel: z.string().trim().min(1, "Label harga wajib diisi."),
  billingNote: optionalText,
  summary: optionalText,
  benefits: z.array(z.string().trim().min(1)).max(20, "Maksimal 20 benefit per tier."),
  terms: optionalText,
  isPublished: z.boolean(),
  sortOrder: sortOrderSchema,
});

/** Form mengirim benefit sebagai benefits[0], benefits[1], dst. */
function parseBenefits(formData: FormData): string[] {
  return formData
    .getAll("benefits")
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);
}

/** S&K tier (editor teks kaya / teks polos lama) → HTML tersanitasi atau null. */
function tierTermsHtml(terms: string | null | undefined): string | null {
  if (!terms) return null;
  const html = sanitizeHtml(plainTextToHtml(terms));
  return /\S/.test(html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ")) ? html : null;
}

function revalidateMembership(slug?: string | null) {
  updateTag(CONTENT_TAGS.membership);
  revalidatePath("/admin/membership");
  revalidatePath("/membership");
  revalidatePath("/promos/membership");
  if (slug) revalidatePath(`/promos/membership/${slug}`);
}

export async function saveTierAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const parsed = tierSchema.safeParse({
    slug: text(formData, "slug"),
    name: text(formData, "name"),
    priceLabel: text(formData, "priceLabel"),
    billingNote: text(formData, "billingNote"),
    summary: richTextInput(formData.get("summary")),
    benefits: parseBenefits(formData),
    terms: text(formData, "terms"),
    isPublished: checked(formData, "isPublished"),
    sortOrder: text(formData, "sortOrder") ?? 0,
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  // Label diketik bebas di form ini; angkanya ikut diselaraskan agar modul
  // Harga menampilkan nilai yang sama. Label non-angka ("Custom") → null.
  const data = {
    ...parsed.data,
    priceIdr: parsePriceLabel(parsed.data.priceLabel) || null,
    terms: tierTermsHtml(parsed.data.terms),
  };

  const clash = await prisma.membershipTier.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { error: `Slug "${data.slug}" sudah dipakai tier lain.` };
  }

  if (id) {
    await prisma.membershipTier.update({ where: { id }, data });
  } else {
    await prisma.membershipTier.create({ data });
  }

  revalidateMembership(data.slug);
  redirect("/admin/membership?saved=1");
}

export async function deleteTierAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const tier = await prisma.membershipTier.delete({ where: { id } });

  revalidateMembership(tier.slug);
  redirect("/admin/membership?deleted=1");
}

export async function listTiers() {
  await requireSession();

  return prisma.membershipTier.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getTier(id: string) {
  await requireSession();

  return prisma.membershipTier.findUnique({ where: { id } });
}

/* ---------- Program membership (singleton) ---------- */

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

  const all = (name: string) => formData.getAll(name).map((value) => String(value));
  const result = validateProgramInput({
    eyebrow: String(formData.get("eyebrow") ?? ""),
    title: String(formData.get("title") ?? ""),
    intro: richTextInput(formData.get("intro")),
    priceHeadline: String(formData.get("priceHeadline") ?? ""),
    bannerBody: String(formData.get("bannerBody") ?? ""),
    servicesIntro: richTextInput(formData.get("servicesIntro")),
    benefitTitles: all("benefitTitle"),
    benefitBodies: all("benefitBody"),
    serviceNames: all("serviceName"),
    serviceDescriptions: all("serviceDescription"),
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
