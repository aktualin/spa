"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { isDefaultVisibleSection } from "@/lib/domain/homepage";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import {
  HOMEPAGE_SECTION_KEYS,
  customSectionKey,
  isCustomSectionKey,
  sectionKeyLabel,
} from "../homepage/homepage-sections";
import { revalidateHomepageSections } from "./homepage.helpers";

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

  revalidateHomepageSections();
  redirect("/admin/homepage?saved=1");
}

/** Buat section konten bebas (key `custom-<slug>`), mati sampai admin menyalakannya. */
export async function createCustomSectionAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const baseKey = customSectionKey(name);
  if (!name || !baseKey) redirect("/admin/homepage?error=custom-name");

  // Nama kembar mendapat akhiran angka supaya key tetap unik.
  let key = baseKey;
  for (let n = 2; await prisma.homepageSection.findUnique({ where: { key }, select: { id: true } }); n++) {
    key = `${baseKey}-${n}`;
  }

  const last = await prisma.homepageSection.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await prisma.homepageSection.create({
    data: { key, title: name, isEnabled: false, sortOrder: (last?.sortOrder ?? 0) + 1 },
  });

  revalidateHomepageSections();
  redirect("/admin/homepage?saved=1");
}

/** Hapus section konten bebas. Section bawaan tidak bisa dihapus (hanya dimatikan). */
export async function deleteCustomSectionAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const section = id
    ? await prisma.homepageSection.findUnique({ where: { id }, select: { key: true, imageUrl: true } })
    : null;
  if (!section || !isCustomSectionKey(section.key)) return;

  await prisma.homepageSection.delete({ where: { id } });
  if (section.imageUrl) await deleteImageByUrl(section.imageUrl).catch(() => {});

  revalidateHomepageSections();
  redirect("/admin/homepage?deleted=1");
}