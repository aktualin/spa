"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
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
});

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
    select: { id: true, sortOrder: true },
  });
  if (!section) return;

  const neighbour = await prisma.homepageSection.findFirst({
    where:
      direction === "up"
        ? { sortOrder: { lt: section.sortOrder } }
        : { sortOrder: { gt: section.sortOrder } },
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

/** Simpan isi teks/gambar sebuah section. */
export async function saveHomepageSectionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const parsed = sectionSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    subtitle: formData.get("subtitle") ?? undefined,
    bodyHtml: formData.get("bodyHtml") ?? undefined,
    imageUrl: formData.get("imageUrl") ?? undefined,
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { id, title, subtitle, bodyHtml, imageUrl } = parsed.data;

  await prisma.homepageSection.update({
    where: { id },
    data: {
      title,
      subtitle: subtitle || null,
      bodyHtml: bodyHtml ? sanitizeHtml(bodyHtml) : null,
      imageUrl: imageUrl || null,
    },
  });

  updateTag(CONTENT_TAGS.homepage);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  redirect("/admin/homepage?saved=1");
}

/**
 * Buat baris section untuk key yang belum ada. Default `isEnabled: false`
 * supaya homepage publik tetap sama sampai admin menyalakannya.
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
      isEnabled: false,
      sortOrder: (last?.sortOrder ?? 0) + 1,
    },
  });

  updateTag(CONTENT_TAGS.homepage);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  redirect("/admin/homepage?saved=1");
}
