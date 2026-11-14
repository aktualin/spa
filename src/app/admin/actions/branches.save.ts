"use server";

import { redirect } from "next/navigation";

import { branchInputSchema, nextBranchSortOrder } from "@/lib/domain/branch";
import { prisma } from "@/lib/prisma";

import { requireModuleRole } from "../access";
import { firstIssue } from "../promos/_kit/schema";
import { MODULE_PATH, readForm, revalidateBranches, type ActionState } from "./branches.helpers";

export async function saveBranchAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireModuleRole(MODULE_PATH);

  const id = String(formData.get("id") ?? "");
  const parsed = branchInputSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { sortOrder, ...data } = parsed.data;

  const clash = await prisma.branch.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { error: `Slug "${data.slug}" sudah dipakai cabang lain.` };
  }

  if (id) {
    const previous = await prisma.branch.findUnique({
      where: { id },
      select: { sortOrder: true },
    });
    if (!previous) return { error: "Cabang tidak ditemukan." };
    await prisma.branch.update({
      where: { id },
      data: { ...data, sortOrder: sortOrder ?? previous.sortOrder },
    });
  } else {
    let order = sortOrder;
    if (order === null) {
      const last = await prisma.branch.aggregate({ _max: { sortOrder: true } });
      order = nextBranchSortOrder(last._max.sortOrder);
    }
    await prisma.branch.create({ data: { ...data, sortOrder: order } });
  }

  revalidateBranches();
  redirect("/admin/branches?saved=1");
}

export async function deleteBranchAction(formData: FormData) {
  await requireModuleRole(MODULE_PATH);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const branch = await prisma.branch.findUnique({ where: { id }, select: { id: true } });
  if (!branch) redirect("/admin/branches");

  await prisma.branch.delete({ where: { id } });

  revalidateBranches();
  redirect("/admin/branches?deleted=1");
}