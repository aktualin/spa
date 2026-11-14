"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { mediaDisplayNameError } from "@/lib/domain/media";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import type { ActionState } from "./media.types";
import { revalidateMediaPages } from "./media.usage";

const optionalMeta = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} maksimal ${max} karakter.`)
    .transform((value) => (value === "" ? null : value));

const metaSchema = z.object({
  title: optionalMeta(200, "Judul"),
  altText: optionalMeta(300, "Alt text"),
});

/** Simpan judul, alt text, dan nama file tampilan. URL berkas tidak berubah. */
export async function updateMediaAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const fileName = String(formData.get("fileName") ?? "");
  const nameError = mediaDisplayNameError(fileName);
  if (nameError) return { error: nameError };

  const parsed = metaSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    altText: String(formData.get("altText") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const existing = await prisma.mediaAsset.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return { error: "Berkas tidak ditemukan." };

  await prisma.mediaAsset.update({
    where: { id },
    data: { fileName: fileName.trim(), ...parsed.data },
  });

  revalidateMediaPages(id);
  redirect(`/admin/media/${id}?saved=1`);
}