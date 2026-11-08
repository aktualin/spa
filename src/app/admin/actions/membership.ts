"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { prisma } from "@/lib/prisma";
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
    summary: text(formData, "summary"),
    benefits: parseBenefits(formData),
    terms: text(formData, "terms"),
    isPublished: checked(formData, "isPublished"),
    sortOrder: text(formData, "sortOrder") ?? 0,
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const data = parsed.data;

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
