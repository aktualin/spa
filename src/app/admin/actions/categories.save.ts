"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { richTextInput } from "@/lib/domain/rich-text";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { categoryPath, recordPathMoves, treatmentPath, type PathMove } from "@/lib/path-moves";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import { firstIssue } from "../promos/_kit/schema";
import { categorySchema, revalidateCategories, type ActionState } from "./categories.helpers";

export async function saveCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    kind: formData.get("kind"),
    description: richTextInput(formData.get("description")),
    imageUrl: formData.get("imageUrl") ?? undefined,
    sortOrder: formData.get("sortOrder") ?? 0,
    isPublished: formData.get("isPublished") === "on",
    seoTitle: formData.get("seoTitle") ?? undefined,
    seoDescription: formData.get("seoDescription") ?? undefined,
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const input = parsed.data;

  // "packages" adalah segmen tetap /treatments/packages.
  if (input.slug === "packages") {
    return { error: 'Slug "packages" dipakai halaman Packages. Pilih slug lain.' };
  }

  const clash = await prisma.treatmentCategory.findFirst({
    where: { slug: input.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) return { error: `Slug "${input.slug}" sudah dipakai kategori lain.` };

  const data = {
    name: input.name,
    slug: input.slug,
    kind: input.kind,
    description: input.description || null,
    imageUrl: input.imageUrl || null,
    sortOrder: input.sortOrder,
    isPublished: input.isPublished,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
  };

  if (!id) {
    await prisma.treatmentCategory.create({ data });
    revalidateCategories(false);
    redirect("/admin/treatments/categories?saved=1");
  }

  const previous = await prisma.treatmentCategory.findUnique({
    where: { id },
    include: { treatments: { where: { isPublished: true }, select: { slug: true } } },
  });
  if (!previous) return { error: "Kategori tidak ditemukan. Mungkin sudah dihapus." };

  if (previous.imageUrl && previous.imageUrl !== data.imageUrl) {
    await deleteImageByUrl(previous.imageUrl).catch(() => {});
  }

  const redirectsChanged = await prisma.$transaction(async (tx) => {
    await tx.treatmentCategory.update({ where: { id }, data });
    if (!previous.isPublished || previous.slug === data.slug) return false;
    // Halaman kategori dan setiap treatment di dalamnya ikut pindah alamat.
    const moves: PathMove[] = [
      { from: categoryPath(previous.slug), to: categoryPath(data.slug) },
      ...previous.treatments.map((t) => ({
        from: treatmentPath(previous.slug, t.slug),
        to: treatmentPath(data.slug, t.slug),
      })),
    ];
    return recordPathMoves(tx, moves, `Slug kategori "${data.name}" diubah`);
  });

  revalidateCategories(redirectsChanged);
  redirect("/admin/treatments/categories?saved=1");
}