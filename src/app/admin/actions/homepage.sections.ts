"use server";

import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import {
  FIXED_POSITION_SECTION_KEYS,
  isFixedPositionSection,
} from "@/lib/domain/homepage";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { HOMEPAGE_SECTION_KEYS } from "../homepage/homepage-sections";
import { revalidateHomepageSections } from "./homepage.helpers";

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

  revalidateHomepageSections();
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

  revalidateHomepageSections();
  redirect("/admin/homepage?saved=1");
}