"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import {
  BANNER_LIMITS,
  isBannerKey,
  isSafeCtaHref,
  validateBannerInput,
} from "@/lib/domain/homepage-banner";
import {
  FIXED_POSITION_SECTION_KEYS,
  isDefaultVisibleSection,
  isFixedPositionSection,
  isToggleOnlySection,
} from "@/lib/domain/homepage";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { prisma } from "@/lib/prisma";

import {
  HOMEPAGE_SECTION_KEYS,
  sectionKeyLabel,
} from "../homepage/homepage-sections";

export type ActionState = { error: string | null; ok?: boolean };

const sectionSchema = z.object({
  id: z.string().trim().min(1, "Section tidak valid."),
  title: z.string().trim().min(1, "Judul section wajib diisi."),
  subtitle: z.string().trim().optional(),
  bodyHtml: z.string().optional(),
  imageUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  ctaLabel: z.string().trim().optional(),
  ctaHref: z.string().trim().optional(),
});

/**
 * Bentuk isian form banner (hero, membership-banner, booking-banner). Zod
 * hanya memastikan tipe & batas panjang kasar; aturan isi (CTA berpasangan,
 * href aman, alt wajib) ada di `validateBannerInput` supaya bisa diuji.
 */
const optionalText = (max: number) =>
  z.string().max(max * 2, "Isian terlalu panjang.").optional();

const bannerSchema = z.object({
  id: z.string().trim().min(1, "Section tidak valid."),
  title: optionalText(BANNER_LIMITS.title),
  subtitle: optionalText(BANNER_LIMITS.subtitle),
  imageUrl: optionalText(BANNER_LIMITS.imageUrl),
  mobileImageUrl: optionalText(BANNER_LIMITS.imageUrl),
  imageAlt: optionalText(BANNER_LIMITS.imageAlt),
  ctaLabel: optionalText(BANNER_LIMITS.ctaLabel),
  ctaHref: optionalText(BANNER_LIMITS.ctaHref),
});

function formText(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" ? value : undefined;
}

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Input tidak valid.";
}

/** Daftar section homepage + key yang belum punya baris di DB. */
export async function listHomepageSections() {
  await requireSession();

  const sections = await prisma.homepageSection.findMany({
    orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
  });

  const existingKeys = new Set(sections.map((section) => section.key));
  const missing = HOMEPAGE_SECTION_KEYS.filter((key) => !existingKeys.has(key));

  return { sections, missing };
}

/** Ubah status tampil / urutan section. */
export async function toggleHomepageSectionAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const raw = formData.get("isEnabled");
  const isEnabled = raw === "on" || raw === "1" || raw === "true";
  if (!id) return;

  await prisma.homepageSection.update({ where: { id }, data: { isEnabled } });

  updateTag(CONTENT_TAGS.homepage);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  redirect("/admin/homepage?saved=1");
}

export async function moveHomepageSectionAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id) return;

  const section = await prisma.homepageSection.findUnique({
    where: { id },
    select: { id: true, key: true, sortOrder: true },
  });
  // Footer selalu di paling bawah — tidak ikut diurutkan.
  if (!section || isFixedPositionSection(section.key)) return;

  const fixedKeys = [...FIXED_POSITION_SECTION_KEYS];
  const neighbour = await prisma.homepageSection.findFirst({
    where:
      direction === "up"
        ? { sortOrder: { lt: section.sortOrder }, key: { notIn: fixedKeys } }
        : { sortOrder: { gt: section.sortOrder }, key: { notIn: fixedKeys } },
    orderBy: direction === "up" ? { sortOrder: "desc" } : { sortOrder: "asc" },
    select: { id: true, sortOrder: true },
  });
  if (!neighbour) return;

  await prisma.$transaction([
    prisma.homepageSection.update({
      where: { id: section.id },
      data: { sortOrder: neighbour.sortOrder },
    }),
    prisma.homepageSection.update({
      where: { id: neighbour.id },
      data: { sortOrder: section.sortOrder },
    }),
  ]);

  updateTag(CONTENT_TAGS.homepage);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  redirect("/admin/homepage?saved=1");
}

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

  const id = formText(formData, "id")?.trim() ?? "";
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
    const shape = bannerSchema.safeParse({
      id,
      title: formText(formData, "title"),
      subtitle: formText(formData, "subtitle"),
      imageUrl: formText(formData, "imageUrl"),
      mobileImageUrl: formText(formData, "mobileImageUrl"),
      imageAlt: formText(formData, "imageAlt"),
      ctaLabel: formText(formData, "ctaLabel"),
      ctaHref: formText(formData, "ctaHref"),
    });
    if (!shape.success) {
      return { error: firstIssue(shape.error) };
    }

    const result = validateBannerInput(existing.key, shape.data);
    if (!result.ok) {
      return { error: result.error };
    }

    // `bodyHtml` tidak dipakai banner, jadi tidak ikut diubah.
    await prisma.homepageSection.update({ where: { id }, data: result.data });

    updateTag(CONTENT_TAGS.homepage);
    revalidatePath("/admin/homepage");
    revalidatePath("/");
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
      bodyHtml: bodyHtml ? sanitizeHtml(bodyHtml) : null,
      imageUrl: imageUrl || null,
      ctaLabel: ctaLabel || null,
      ctaHref: ctaHref || null,
    },
  });

  updateTag(CONTENT_TAGS.homepage);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  redirect("/admin/homepage?saved=1");
}

/**
 * Buat baris section untuk key yang belum ada. Status awal mengikuti tampilan
 * homepage sekarang (lihat `isDefaultVisibleSection`): section bawaan & footer
 * dibuat aktif, section baru dibuat mati — homepage publik tidak berubah.
 */
export async function createHomepageSectionAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const key = String(formData.get("key") ?? "");
  if (!(HOMEPAGE_SECTION_KEYS as readonly string[]).includes(key)) {
    return;
  }

  const existing = await prisma.homepageSection.findUnique({
    where: { key },
    select: { id: true },
  });
  if (existing) return;

  const last = await prisma.homepageSection.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await prisma.homepageSection.create({
    data: {
      key,
      title: sectionKeyLabel(key),
      isEnabled: isDefaultVisibleSection(key),
      sortOrder: (last?.sortOrder ?? 0) + 1,
    },
  });

  updateTag(CONTENT_TAGS.homepage);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  redirect("/admin/homepage?saved=1");
}
