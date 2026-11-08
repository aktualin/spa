"use server";

import { InquiryStatus } from "@prisma/client";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import {
  STATIC_HERO_TITLE,
  STATIC_IN_SPA_HTML,
  optionalHtml,
  resolveCorporateContent,
  validateContentInput,
  validatePicInput,
} from "@/lib/domain/corporate";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { notifyCorporateInquiry } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export type ActionState = { error: string | null; ok?: boolean };

/** Konten publik berubah → cache `/corporate` dibuang. Inquiry TIDAK memakai tag ini. */
function revalidateCorporate() {
  updateTag(CONTENT_TAGS.corporate);
  revalidatePath("/corporate");
  revalidatePath("/admin/corporate");
}

function all(formData: FormData, name: string): string[] {
  return formData.getAll(name).map((value) => String(value));
}

function str(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/* ---------- Konten halaman (singleton) ---------- */

/**
 * Konten untuk form admin: baris database digabung dengan isi bawaan, jadi
 * form selalu terisi persis seperti yang tampil di halaman publik.
 */
export async function getCorporateContentForm() {
  await requireSession();

  const row = await prisma.corporateContent.findUnique({ where: { id: "singleton" } });
  return { saved: row !== null, updatedAt: row?.updatedAt ?? null, content: resolveCorporateContent(row) };
}

export async function saveCorporateContentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const result = validateContentInput({
    heroTitle: str(formData, "heroTitle"),
    intro: str(formData, "intro"),
    benefits: all(formData, "benefits"),
    solutionTitles: all(formData, "solutionTitle"),
    solutionItems: all(formData, "solutionItems"),
    inSpaItems: all(formData, "inSpaItems"),
  });
  if (!result.ok) return { error: result.error };

  // Semua HTML dari editor teks kaya wajib disanitasi sebelum disimpan.
  const data = {
    ...result.data,
    inSpaHtml: optionalHtml(sanitizeHtml(str(formData, "inSpaHtml")), STATIC_IN_SPA_HTML),
    inOfficeHtml: optionalHtml(sanitizeHtml(str(formData, "inOfficeHtml"))),
    stepsHtml: optionalHtml(sanitizeHtml(str(formData, "stepsHtml"))),
  };

  await prisma.corporateContent.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  revalidateCorporate();
  revalidatePath("/admin/corporate/content");
  redirect("/admin/corporate/content?saved=1");
}

/* ---------- PIC (kontak pihak pertama) ---------- */

export async function savePicAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const result = validatePicInput({
    name: str(formData, "picName"),
    email: str(formData, "picEmail"),
    phone: str(formData, "picPhone"),
  });
  if (!result.ok) return { error: result.error };

  const data = {
    picName: result.data.name,
    picEmail: result.data.email,
    picPhone: result.data.phone,
  };

  await prisma.corporateContent.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", heroTitle: STATIC_HERO_TITLE, ...data },
    update: data,
  });

  revalidateCorporate();
  revalidatePath("/admin/corporate/pic");
  redirect("/admin/corporate/pic?saved=1");
}

/* ---------- Inquiry (data pribadi — UU PDP) ---------- */

const INQUIRY_PAGE_SIZE = 25;

const inquirySchema = z.object({
  id: z.string().trim().min(1, "Inquiry tidak valid."),
  status: z.enum(["NEW", "CONTACTED", "CLOSED"], { error: "Status inquiry tidak valid." }),
  notes: z.string().trim().max(2000, "Catatan maksimal 2000 karakter.").optional(),
});

function readStatus(value: string | undefined): InquiryStatus | null {
  return value === "NEW" || value === "CONTACTED" || value === "CLOSED" ? value : null;
}

/**
 * Daftar inquiry (ringkas, tanpa isi pesan) per halaman. Mengandung data
 * pribadi — hanya untuk ADMIN/EDITOR yang login; tidak pernah di-cache publik.
 */
export async function listCorporateInquiries(params: { status?: string; page?: string }) {
  await requireRole(CONTENT_ROLES);

  const status = readStatus(params.status);
  const where = status ? { status } : {};
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [rows, total, counts] = await Promise.all([
    prisma.corporateInquiry.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * INQUIRY_PAGE_SIZE,
      take: INQUIRY_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        company: true,
        status: true,
        createdAt: true,
        emailSentAt: true,
        emailError: true,
      },
    }),
    prisma.corporateInquiry.count({ where }),
    prisma.corporateInquiry.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countByStatus: Record<InquiryStatus, number> = { NEW: 0, CONTACTED: 0, CLOSED: 0 };
  for (const row of counts) countByStatus[row.status] = row._count._all;

  return {
    rows,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / INQUIRY_PAGE_SIZE)),
    status,
    countByStatus,
  };
}

export async function getCorporateInquiry(id: string) {
  await requireRole(CONTENT_ROLES);
  return prisma.corporateInquiry.findUnique({ where: { id } });
}

export async function updateInquiryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const parsed = inquirySchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    notes: formData.get("notes") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }

  const { id, status, notes } = parsed.data;
  const updated = await prisma.corporateInquiry.updateMany({
    where: { id },
    data: { status, notes: notes || null },
  });
  if (updated.count === 0) return { error: "Inquiry tidak ditemukan (mungkin sudah dihapus)." };

  revalidatePath("/admin/corporate/inquiries");
  revalidatePath(`/admin/corporate/inquiries/${id}`);
  redirect(`/admin/corporate/inquiries/${id}?saved=1`);
}

/** Kirim ulang email notifikasi (mis. setelah RESEND_API_KEY diperbaiki). */
export async function resendInquiryEmailAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const result = await notifyCorporateInquiry(id);

  revalidatePath("/admin/corporate/inquiries");
  revalidatePath(`/admin/corporate/inquiries/${id}`);
  redirect(`/admin/corporate/inquiries/${id}?${result.ok ? "emailed=1" : "emailFailed=1"}`);
}

export async function deleteInquiryAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.corporateInquiry.deleteMany({ where: { id } });

  revalidatePath("/admin/corporate/inquiries");
  redirect("/admin/corporate/inquiries?deleted=1");
}
