"use server";

import { InquiryStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

import { requireModuleRole } from "../access";
import { firstIssue } from "../promos/_kit/schema";
import { readInquiryStatus } from "./form-utils";

/**
 * Inbox permintaan reservasi (form halaman kontak). Data pribadi (UU PDP) —
 * hanya untuk ADMIN/EDITOR yang login; tidak pernah di-cache publik.
 * Status memakai enum InquiryStatus yang sama dengan inquiry corporate.
 */

const MODULE_PATH = "/admin/reservations";
const PAGE_SIZE = 25;

const updateSchema = z.object({
  id: z.string().trim().min(1, "Permintaan reservasi tidak valid."),
  status: z.enum(["NEW", "CONTACTED", "CLOSED"], { error: "Status tidak valid." }),
  notes: z.string().trim().max(2000, "Catatan maksimal 2000 karakter.").optional(),
});

/** Daftar reservasi terbaru per halaman, dengan filter status + jumlah per status. */
export async function listReservationRequests(params: { status?: string; page?: string }) {
  await requireModuleRole(MODULE_PATH);

  const status = readInquiryStatus(params.status);
  const where = status ? { status } : {};
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [rows, total, counts] = await Promise.all([
    prisma.reservationRequest.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, name: true, phone: true, branchSlug: true, status: true, createdAt: true },
    }),
    prisma.reservationRequest.count({ where }),
    prisma.reservationRequest.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countByStatus: Record<InquiryStatus, number> = { NEW: 0, CONTACTED: 0, CLOSED: 0 };
  for (const row of counts) countByStatus[row.status] = row._count._all;

  return { rows, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)), status, countByStatus };
}

export async function getReservationRequest(id: string) {
  await requireModuleRole(MODULE_PATH);
  return prisma.reservationRequest.findUnique({ where: { id } });
}

/** Ubah status (Baru → Sudah dihubungi → Ditutup) + catatan internal. */
export async function updateReservationAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  await requireModuleRole(MODULE_PATH);

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    notes: formData.get("notes") ?? undefined,
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { id, status, notes } = parsed.data;
  const updated = await prisma.reservationRequest.updateMany({
    where: { id },
    data: { status, notes: notes || null },
  });
  if (updated.count === 0) return { error: "Permintaan tidak ditemukan (mungkin sudah dihapus)." };

  revalidatePath(MODULE_PATH);
  revalidatePath(`${MODULE_PATH}/${id}`);
  redirect(`${MODULE_PATH}/${id}?saved=1`);
}

/** Hapus satu permintaan (spam / permintaan penghapusan data). */
export async function deleteReservationAction(formData: FormData) {
  await requireModuleRole(MODULE_PATH);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.reservationRequest.deleteMany({ where: { id } });

  revalidatePath(MODULE_PATH);
  redirect(`${MODULE_PATH}?deleted=1`);
}