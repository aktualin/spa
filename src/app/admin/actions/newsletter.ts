"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

import { requireModuleRole } from "../access";

/**
 * Inbox pendaftar newsletter (form footer). Data pribadi (UU PDP) —
 * hanya untuk ADMIN/EDITOR yang login; tidak pernah di-cache publik.
 * Guard mengikuti matriks role modul di modules.ts.
 */

const MODULE_PATH = "/admin/newsletter";
const PAGE_SIZE = 25;

/** Daftar pendaftar terbaru per halaman (tanpa filter status). */
export async function listNewsletterSignups(params: { page?: string }) {
  await requireModuleRole(MODULE_PATH);

  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const [rows, total] = await Promise.all([
    prisma.newsletterSignup.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, email: true, name: true, branchSlug: true, createdAt: true },
    }),
    prisma.newsletterSignup.count(),
  ]);

  return {
    rows,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Hapus satu pendaftar (spam / permintaan penghapusan data). */
export async function deleteNewsletterSignupAction(formData: FormData) {
  await requireModuleRole(MODULE_PATH);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.newsletterSignup.deleteMany({ where: { id } });

  revalidatePath(MODULE_PATH);
  redirect(`${MODULE_PATH}?deleted=1`);
}