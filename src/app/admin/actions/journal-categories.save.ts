"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { SLUG_PATTERN, slugify } from "@/lib/domain/slug";
import { prisma } from "@/lib/prisma";

import { firstIssue } from "../promos/_kit/schema";
import {
  LIST_PATH,
  categorySchema,
  revalidateJournalCategories,
  type ActionState,
} from "./journal-categories.helpers";

export async function saveJournalCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") ?? undefined,
    sortOrder: formData.get("sortOrder") ?? 0,
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const input = parsed.data;

  // Slug kosong dibuat dari nama, supaya admin tidak wajib memikirkannya.
  const slug = (input.slug || slugify(input.name)).trim();
  if (!SLUG_PATTERN.test(slug)) {
    return { error: "Slug hanya boleh huruf kecil, angka, dan tanda hubung." };
  }

  const [slugClash, nameClash] = await Promise.all([
    prisma.journalCategory.findFirst({
      where: { slug, ...(id ? { NOT: { id } } : {}) },
      select: { id: true },
    }),
    // Nama yang sama beda huruf besar/kecil tetap dianggap kategori yang sama.
    prisma.journalCategory.findFirst({
      where: { name: { equals: input.name, mode: "insensitive" }, ...(id ? { NOT: { id } } : {}) },
      select: { name: true },
    }),
  ]);
  if (slugClash) return { error: `Slug "${slug}" sudah dipakai kategori lain.` };
  if (nameClash) return { error: `Kategori "${nameClash.name}" sudah ada.` };

  const data = {
    name: input.name,
    slug,
    sortOrder: input.sortOrder,
    isPublished: input.isPublished,
  };

  if (id) {
    const previous = await prisma.journalCategory.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!previous) return { error: "Kategori tidak ditemukan. Mungkin sudah dihapus." };
    await prisma.journalCategory.update({ where: { id }, data });
  } else {
    await prisma.journalCategory.create({ data });
  }

  revalidateJournalCategories();
  redirect(`${LIST_PATH}?saved=1`);
}