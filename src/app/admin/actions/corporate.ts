"use server";

import { InquiryStatus } from "@prisma/client";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { prisma } from "@/lib/prisma";

export type ActionState = { error: string | null; ok?: boolean };

const corporateContentSchema = z.object({
  heroTitle: z.string().trim().min(1, "Judul hero wajib diisi."),
  intro: z.string().trim().optional(),
  inOfficeHtml: z.string().optional(),
  inSpaHtml: z.string().optional(),
  stepsHtml: z.string().optional(),
  picName: z.string().trim().optional(),
  picEmail: z
    .union([z.string().trim().email("Format email PIC tidak valid."), z.literal("")])
    .optional(),
  picPhone: z
    .union([z.string().trim().min(8, "Nomor telepon PIC terlalu pendek."), z.literal("")])
    .optional(),
});

const inquirySchema = z.object({
  id: z.string().trim().min(1, "Inquiry tidak valid."),
  status: z.enum(["NEW", "CONTACTED", "CLOSED"], {
    error: "Status inquiry tidak valid.",
  }),
  notes: z.string().trim().optional(),
});

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Input tidak valid.";
}

/** Simpan konten Corporate Wellness (singleton). */
export async function saveCorporateContentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const parsed = corporateContentSchema.safeParse({
    heroTitle: formData.get("heroTitle"),
    intro: formData.get("intro") ?? undefined,
    inOfficeHtml: formData.get("inOfficeHtml") ?? undefined,
    inSpaHtml: formData.get("inSpaHtml") ?? undefined,
    stepsHtml: formData.get("stepsHtml") ?? undefined,
    picName: formData.get("picName") ?? undefined,
    picEmail: formData.get("picEmail") ?? undefined,
    picPhone: formData.get("picPhone") ?? undefined,
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const data = {
    heroTitle: parsed.data.heroTitle,
    intro: parsed.data.intro || null,
    // Semua HTML dari rich text editor wajib disanitasi sebelum disimpan.
    inOfficeHtml: parsed.data.inOfficeHtml
      ? sanitizeHtml(parsed.data.inOfficeHtml)
      : null,
    inSpaHtml: parsed.data.inSpaHtml ? sanitizeHtml(parsed.data.inSpaHtml) : null,
    stepsHtml: parsed.data.stepsHtml ? sanitizeHtml(parsed.data.stepsHtml) : null,
    picName: parsed.data.picName || null,
    picEmail: parsed.data.picEmail || null,
    picPhone: parsed.data.picPhone || null,
  };

  await prisma.corporateContent.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  updateTag(CONTENT_TAGS.corporate);
  revalidatePath("/admin/corporate");
  revalidatePath("/corporate");
  revalidatePath("/corporate-wellness");

  redirect("/admin/corporate?saved=1");
}

/** Ubah status & catatan satu inquiry (PII — hanya lewat action ber-role). */
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
    return { error: firstIssue(parsed.error) };
  }

  const { id, status, notes } = parsed.data;

  await prisma.corporateInquiry.update({
    where: { id },
    data: { status, notes: notes || null },
  });

  revalidatePath("/admin/corporate/inquiries");
  redirect("/admin/corporate/inquiries?saved=1");
}

export async function deleteInquiryAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.corporateInquiry.delete({ where: { id } });

  revalidatePath("/admin/corporate/inquiries");
  redirect("/admin/corporate/inquiries?deleted=1");
}

/** Konten Corporate Wellness untuk form admin. */
export async function getCorporateContent() {
  await requireSession();
  return prisma.corporateContent.findUnique({ where: { id: "singleton" } });
}

/**
 * Daftar inquiry corporate. Mengandung PII (nama, email, telepon) sehingga
 * hanya boleh dipanggil dari Server Action/Component yang sudah role-checked.
 */
export async function listCorporateInquiries(status?: string) {
  await requireRole(CONTENT_ROLES);

  const where =
    status === "NEW" || status === "CONTACTED" || status === "CLOSED"
      ? { status: status as InquiryStatus }
      : {};

  return prisma.corporateInquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}
