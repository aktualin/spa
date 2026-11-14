"use server";

import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import { validateHighlightInput } from "@/lib/domain/homepage";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import { checked, parseWibInput, text } from "../promos/_kit/schema";
import { LIST_PATH, revalidateHighlights, type ActionState } from "./homepage-highlights.helpers";

/** Semua highlight, urut seperti di homepage. */
export async function listHomepageHighlights() {
  await requireSession();

  return prisma.homepageHighlight.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getHomepageHighlight(id: string) {
  await requireSession();
  return prisma.homepageHighlight.findUnique({ where: { id } });
}

/** Buat atau ubah highlight (id kosong = baru, ditaruh paling bawah). */
export async function saveHomepageHighlightAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = text(formData, "id")?.trim() ?? "";

  // Awal periode = 00:00 WIB, akhir periode = 23:59:59.999 WIB.
  const startDate = parseWibInput(text(formData, "startDate"));
  const endDate = parseWibInput(text(formData, "endDate"), { endOfDay: true });
  if (startDate === undefined || endDate === undefined) {
    return { error: "Tanggal periode tidak valid." };
  }

  const result = validateHighlightInput({
    eyebrow: text(formData, "eyebrow"),
    title: text(formData, "title"),
    imageUrl: text(formData, "imageUrl"),
    imageAlt: text(formData, "imageAlt"),
    href: text(formData, "href"),
    ctaLabel: text(formData, "ctaLabel"),
    startDate,
    endDate,
    isPublished: checked(formData, "isPublished"),
  });
  if (!result.ok) return { error: result.error };
  const data = result.data;

  if (id) {
    const previous = await prisma.homepageHighlight.findUnique({
      where: { id },
      select: { imageUrl: true },
    });
    if (!previous) return { error: "Highlight tidak ditemukan." };

    // `body` tidak ada di form (kartu What's New tidak menampilkan ringkasan),
    // jadi nilainya tidak ikut diubah.
    await prisma.homepageHighlight.update({ where: { id }, data });

    if (previous.imageUrl && previous.imageUrl !== data.imageUrl) {
      await deleteImageByUrl(previous.imageUrl).catch(() => {});
    }
  } else {
    const last = await prisma.homepageHighlight.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    await prisma.homepageHighlight.create({
      data: { ...data, sortOrder: last ? last.sortOrder + 1 : 0 },
    });
  }

  revalidateHighlights();
  redirect(`${LIST_PATH}?saved=1`);
}