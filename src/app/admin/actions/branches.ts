"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import {
  branchInputSchema,
  nextBranchSortOrder,
  planBranchMove,
  sortBranches,
} from "@/lib/domain/branch";
import { prisma } from "@/lib/prisma";

import { requireModuleRole } from "../access";
import { firstIssue } from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

const MODULE_PATH = "/admin/branches";

function text(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" ? value : undefined;
}

/** Textarea jam operasional: satu baris = satu entri. */
function lines(formData: FormData, name: string): string[] {
  return (text(formData, name) ?? "").split("\n");
}

function readForm(formData: FormData) {
  return {
    name: text(formData, "name") ?? "",
    slug: text(formData, "slug") ?? "",
    area: text(formData, "area") ?? "",
    tag: text(formData, "tag"),
    address: text(formData, "address"),
    openingHours: lines(formData, "openingHours"),
    whatsappNumber: text(formData, "whatsappNumber"),
    phone: text(formData, "phone"),
    email: text(formData, "email"),
    mapsEmbedUrl: text(formData, "mapsEmbedUrl"),
    mapsUrl: text(formData, "mapsUrl"),
    latitude: text(formData, "latitude"),
    longitude: text(formData, "longitude"),
    sortOrder: text(formData, "sortOrder"),
    isPublished: formData.get("isPublished") === "on",
  };
}

function revalidateBranches() {
  updateTag(CONTENT_TAGS.branches);
  revalidatePath("/admin/branches");
  revalidatePath("/contact");
  // Daftar cabang muncul di form newsletter pada footer setiap halaman.
  revalidatePath("/", "layout");
}

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

/**
 * Naikkan/turunkan urutan cabang (tombol ↑/↓ di daftar admin). Seluruh
 * cabang ditulis ulang menjadi 0..n-1 dalam satu transaksi, sehingga nilai
 * sortOrder kembar dari data lama ikut dirapikan dan tombol selalu berpengaruh.
 */
export async function moveBranchAction(formData: FormData) {
  await requireModuleRole(MODULE_PATH);

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || (direction !== "up" && direction !== "down")) return;

  const rows = await prisma.branch.findMany({
    select: { id: true, name: true, sortOrder: true },
  });
  const updates = planBranchMove(rows, id, direction);

  if (updates.length > 0) {
    await prisma.$transaction(
      updates.map((row) =>
        prisma.branch.update({ where: { id: row.id }, data: { sortOrder: row.sortOrder } }),
      ),
    );
  }

  revalidateBranches();
  redirect("/admin/branches?saved=1");
}

/** Tampilkan/sembunyikan cabang langsung dari daftar admin. */
export async function toggleBranchPublishedAction(formData: FormData) {
  await requireModuleRole(MODULE_PATH);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const branch = await prisma.branch.findUnique({
    where: { id },
    select: { isPublished: true },
  });
  if (!branch) return;

  await prisma.branch.update({
    where: { id },
    data: { isPublished: !branch.isPublished },
  });

  revalidateBranches();
  redirect("/admin/branches?saved=1");
}

/** Dipakai halaman list; read-only tapi tetap butuh sesi. */
export async function listBranches() {
  await requireSession();
  const rows = await prisma.branch.findMany();
  return sortBranches(rows);
}

export async function getBranch(id: string) {
  await requireSession();
  return prisma.branch.findUnique({ where: { id } });
}
