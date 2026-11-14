"use server";

import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import { parsePriceLabel } from "@/lib/domain/pricing";
import { richTextInput } from "@/lib/domain/rich-text";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { checked, firstIssue, text } from "../promos/_kit/schema";
import { termsToHtml } from "./html-utils";
import { parseBenefits, revalidateMembership, tierSchema, type ActionState } from "./membership.helpers";

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
    terms: termsToHtml(parsed.data.terms),
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