"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import {
  inheritRootLocations,
  MENU_LINK_TYPES,
  MENU_LOCATIONS,
  validateMenuLabel,
  validateMenuLink,
  validateParent,
  validateStructure,
  type MenuLinkType,
  type MenuLocation,
} from "@/lib/domain/menu";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { SLUG_PATTERN } from "@/lib/domain/slug";
import { prisma } from "@/lib/prisma";

export type ActionState = { error: string | null; ok?: boolean };

export type MenuAdminRow = {
  id: string;
  parentId: string | null;
  label: string;
  linkType: MenuLinkType;
  url: string | null;
  pageId: string | null;
  page: { slug: string; title: string; published: boolean } | null;
  sortOrder: number;
  isVisible: boolean;
  openInNew: boolean;
  locations: MenuLocation[];
  panelKey: string | null;
  panelLinkLabel: string | null;
};

export type MenuPageOption = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
};

function revalidateMenu() {
  updateTag(CONTENT_TAGS.menu);
  revalidatePath("/admin/menu");
}

export async function listMenuAdmin(): Promise<MenuAdminRow[]> {
  await requireRole(CONTENT_ROLES);
  const items = await prisma.menuItem.findMany({
    include: { page: { select: { slug: true, title: true, status: true } } },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });
  return items.map((item) => ({
    id: item.id,
    parentId: item.parentId,
    label: item.label,
    linkType: item.linkType,
    url: item.url,
    pageId: item.pageId,
    page: item.page
      ? {
          slug: item.page.slug,
          title: item.page.title,
          published: item.page.status === "PUBLISHED",
        }
      : null,
    sortOrder: item.sortOrder,
    isVisible: item.isVisible,
    openInNew: item.openInNew,
    locations: item.locations,
    panelKey: item.panelKey,
    panelLinkLabel: item.panelLinkLabel,
  }));
}

export async function listMenuPageOptions(): Promise<MenuPageOption[]> {
  await requireRole(CONTENT_ROLES);
  const pages = await prisma.staticPage.findMany({
    select: { id: true, title: true, slug: true, status: true },
    orderBy: { title: "asc" },
  });
  return pages.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    published: p.status === "PUBLISHED",
  }));
}

const itemSchema = z.object({
  id: z.string().trim().optional(),
  parentId: z.string().trim().optional(),
  label: z.string(),
  linkType: z.enum(MENU_LINK_TYPES),
  url: z.string().trim().optional(),
  pageId: z.string().trim().optional(),
  isVisible: z.boolean(),
  openInNew: z.boolean(),
  locations: z.array(z.enum(MENU_LOCATIONS)),
  panelKey: z.string().trim().max(40).optional(),
  panelLinkLabel: z.string().trim().max(60).optional(),
});

export async function saveMenuItemAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const parsed = itemSchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined,
    parentId: String(formData.get("parentId") ?? "") || undefined,
    label: String(formData.get("label") ?? ""),
    linkType: formData.get("linkType"),
    url: String(formData.get("url") ?? ""),
    pageId: String(formData.get("pageId") ?? ""),
    isVisible: formData.get("isVisible") === "on",
    openInNew: formData.get("target") === "_blank",
    locations: formData.getAll("locations").map(String),
    panelKey: String(formData.get("panelKey") ?? ""),
    panelLinkLabel: String(formData.get("panelLinkLabel") ?? ""),
  });
  if (!parsed.success) return { error: "Isian menu tidak valid." };
  const input = parsed.data;

  const labelError = validateMenuLabel(input.label);
  if (labelError) return { error: labelError };

  const url = ["PAGE", "NO_LINK"].includes(input.linkType) ? null : input.url || null;
  const pageId = input.linkType === "PAGE" ? input.pageId || null : null;
  const linkError = validateMenuLink({ linkType: input.linkType, url, pageId });
  if (linkError) return { error: linkError };

  if (pageId && !(await prisma.staticPage.findUnique({ where: { id: pageId }, select: { id: true } }))) {
    return { error: "Halaman tujuan tidak ditemukan. Mungkin sudah dihapus." };
  }

  const all = await prisma.menuItem.findMany({
    select: { id: true, parentId: true, sortOrder: true },
  });

  let parentId: string | null;
  if (input.id) {
    const current = all.find((row) => row.id === input.id);
    if (!current) return { error: "Item menu tidak ditemukan. Mungkin sudah dihapus." };
    // Posisi diubah lewat susunan (drag-and-drop), bukan dari form ini.
    parentId = current.parentId;
  } else {
    parentId = input.parentId ?? null;
    const parentError = validateParent(all, null, parentId);
    if (parentError) return { error: parentError };
  }

  const isRoot = parentId === null;
  if (isRoot && input.locations.length === 0) {
    return { error: "Pilih minimal satu lokasi tampil (Header, Mobile, atau Footer)." };
  }
  if (isRoot && input.panelKey && !SLUG_PATTERN.test(input.panelKey)) {
    return { error: "Kunci panel hanya boleh huruf kecil, angka, dan tanda hubung." };
  }

  const data = {
    label: input.label.trim(),
    linkType: input.linkType,
    url,
    pageId,
    isVisible: input.isVisible,
    openInNew: input.openInNew,
    // Lokasi & panel hanya berlaku untuk level 1; anak mengikuti induknya.
    locations: isRoot ? input.locations : [],
    panelKey: isRoot ? input.panelKey || null : null,
    panelLinkLabel: isRoot ? input.panelLinkLabel || null : null,
  };

  if (input.id) {
    await prisma.menuItem.update({ where: { id: input.id }, data });
  } else {
    const siblingOrders = all.filter((row) => row.parentId === parentId).map((row) => row.sortOrder);
    await prisma.menuItem.create({
      data: {
        ...data,
        parentId,
        sortOrder: siblingOrders.length ? Math.max(...siblingOrders) + 1 : 0,
      },
    });
  }

  revalidateMenu();
  redirect("/admin/menu?saved=1");
}

export async function deleteMenuItemAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  // Sub-menu ikut terhapus (onDelete: Cascade); UI sudah meminta konfirmasi.
  await prisma.menuItem.deleteMany({ where: { id } });
  revalidateMenu();
  redirect("/admin/menu?deleted=1");
}

const structureSchema = z
  .array(
    z.object({
      id: z.string().min(1),
      parentId: z.string().min(1).nullable(),
      sortOrder: z.number().int().min(0),
    }),
  )
  .max(500);

export async function saveMenuStructureAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("structure") ?? "[]"));
  } catch {
    return { error: "Data susunan menu tidak valid." };
  }
  const parsed = structureSchema.safeParse(raw);
  if (!parsed.success) return { error: "Data susunan menu tidak valid." };
  const structure = parsed.data;

  const existing = await prisma.menuItem.findMany({
    select: { id: true, parentId: true, locations: true },
  });
  const existingIds = new Set(existing.map((row) => row.id));
  const sentIds = new Set(structure.map((row) => row.id));
  if (
    existingIds.size !== sentIds.size ||
    [...existingIds].some((id) => !sentIds.has(id))
  ) {
    return {
      error: "Menu sudah diubah di tempat lain. Muat ulang halaman, lalu susun kembali.",
    };
  }

  const structureError = validateStructure(structure);
  if (structureError) return { error: structureError };

  const locationsById = new Map(existing.map((row) => [row.id, row.locations]));
  const next = inheritRootLocations(
    existing,
    structure.map((row) => ({ ...row, locations: locationsById.get(row.id) ?? [] })),
  );

  await prisma.$transaction(
    next.map((row) =>
      prisma.menuItem.update({
        where: { id: row.id },
        data: {
          parentId: row.parentId,
          sortOrder: row.sortOrder,
          // Anak tidak menyimpan lokasi; akar baru mewarisi lokasi akar lamanya.
          locations: row.parentId === null ? row.locations : [],
        },
      }),
    ),
  );

  revalidateMenu();
  redirect("/admin/menu?saved=1");
}
