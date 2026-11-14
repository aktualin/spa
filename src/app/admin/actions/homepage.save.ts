"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { isBannerKey, isSafeCtaHref } from "@/lib/domain/homepage-banner";
import { isToggleOnlySection } from "@/lib/domain/homepage";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { richTextInput } from "@/lib/domain/rich-text";
import { prisma } from "@/lib/prisma";

import { firstIssue, text } from "../promos/_kit/schema";
import {
  revalidateHomepageSections,
  saveBannerSection,
  sectionSchema,
  type ActionState,
} from "./homepage.helpers";

/**
 * Simpan isi teks/gambar sebuah section. Section banner (hero,
 * membership-banner, booking-banner) memakai form & validasi khusus; key
 * diambil dari DB, bukan dari form.
 */
export async function saveHomepageSectionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = text(formData, "id")?.trim() ?? "";
  if (!id) return { error: "Section tidak valid." };

  const existing = await prisma.homepageSection.findUnique({
    where: { id },
    select: { key: true },
  });
  if (!existing) return { error: "Section tidak ditemukan." };

  if (isToggleOnlySection(existing.key)) {
    return { error: "Section ini hanya bisa dinyalakan/dimatikan." };
  }

  if (isBannerKey(existing.key)) {
    const error = await saveBannerSection(id, existing.key, formData);
    if (error) return { error };

    revalidateHomepageSections();
    redirect("/admin/homepage?saved=1");
  }

  const parsed = sectionSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    subtitle: formData.get("subtitle") ?? undefined,
    bodyHtml: formData.get("bodyHtml") ?? undefined,
    imageUrl: formData.get("imageUrl") ?? undefined,
    ctaLabel: formData.get("ctaLabel") ?? undefined,
    ctaHref: formData.get("ctaHref") ?? undefined,
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { title, subtitle, bodyHtml, imageUrl, ctaLabel, ctaHref } = parsed.data;

  // Tombol hanya berarti bila label dan tujuannya lengkap; aturan tujuan aman
  // dipakai ulang dari modul banner supaya validasinya satu sumber.
  if (Boolean(ctaLabel) !== Boolean(ctaHref)) {
    return {
      error:
        "Label tombol dan tujuan tombol harus diisi berpasangan (atau dikosongkan keduanya).",
    };
  }
  if (ctaHref && !isSafeCtaHref(ctaHref)) {
    return {
      error:
        "Tujuan tombol harus berupa path internal (mis. /menu), anchor (mis. #footer), atau alamat https://….",
    };
  }

  await prisma.homepageSection.update({
    where: { id },
    data: {
      title,
      subtitle: subtitle || null,
      bodyHtml: richTextInput(bodyHtml) || null,
      imageUrl: imageUrl || null,
      ctaLabel: ctaLabel || null,
      ctaHref: ctaHref || null,
    },
  });

  revalidateHomepageSections();
  redirect("/admin/homepage?saved=1");
}