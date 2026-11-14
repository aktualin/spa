"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { notifyCorporateInquiry } from "@/lib/email";
import { prisma } from "@/lib/prisma";

import { firstIssue } from "../promos/_kit/schema";
import type { ActionState } from "./corporate.helpers";

const inquirySchema = z.object({
  id: z.string().trim().min(1, "Inquiry tidak valid."),
  status: z.enum(["NEW", "CONTACTED", "CLOSED"], { error: "Status inquiry tidak valid." }),
  notes: z.string().trim().max(2000, "Catatan maksimal 2000 karakter.").optional(),
});

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