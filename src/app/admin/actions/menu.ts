"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

export type ActionState = { error: string | null; ok?: boolean };

const menuItemSchema = z.object({
  id: z.string().trim().optional(),
  label: z.string().trim().min(1, "Label menu wajib diisi."),
  url: z
    .string()
    .trim()
    .min(1, "URL wajib diisi.")
    .refine(
      (value) => value.startsWith("/") || value.startsWith("https://"),
      "URL harus diawali \"/\" (halaman internal) atau \"https://\" (tautan luar).",
    ),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isVisible: z.boolean(),
  openInNew: z.boolean(),
  parentId: z.string().trim().optional(),
});

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Input tidak valid.";
}

export async function saveMenuItemAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const rawParent = String(formData.get("parentId") ?? "").trim();
  const parsed = menuItemSchema.safeParse({
    id: formData.get("id") ?? undefined,
    label: formData.get("label"),
    url: formData.get("url"),
    sortOrder: formData.get("sortOrder") ?? 0,
    isVisible: formData.get("isVisible") === "on",
    openInNew: formData.get("openInNew") === "on",
    parentId: rawParent || undefined,
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { id, label, url, sortOrder, isVisible, openInNew } = parsed.data;
  const parentId = parsed.data.parentId || null;

  if (id) {
    const item = await prisma.menuItem.findUnique({
      where: { id },
      select: { id: true, parentId: true },
    });
    if (!item) return { error: "Item menu tidak ditemukan." };

    // Sub-menu hanya satu level: tidak boleh menjadi anak dari anaknya sendiri.
    if (parentId) {
      const parent = await prisma.menuItem.findUnique({
        where: { id: parentId },
        select: { parentId: true },
      });
      if (!parent) return { error: "Induk menu tidak ditemukan." };
      if (parent.parentId) {
        return { error: "Sub-menu hanya boleh satu level." };
      }
      if (parentId === id) {
        return { error: "Item menu tidak boleh menjadi induk dirinya sendiri." };
      }

      // Item yang sudah punya anak tidak boleh dipindahkan, supaya tidak
      // terbentuk sub-menu bertingkat lebih dari satu.
      const childCount = await prisma.menuItem.count({ where: { parentId: id } });
      if (childCount > 0) {
        return {
          error: "Item ini masih punya sub-menu. Pindahkan atau hapus sub-menu dulu.",
        };
      }
    }

    await prisma.menuItem.update({
      where: { id },
      data: { label, url, sortOrder, isVisible, openInNew, parentId },
    });
  } else {
    await prisma.menuItem.create({
      data: { label, url, sortOrder, isVisible, openInNew, parentId },
    });
  }

  updateTag(CONTENT_TAGS.menu);
  revalidatePath("/admin/menu");
  revalidatePath("/", "layout");

  redirect("/admin/menu?saved=1");
}

export async function deleteMenuItemAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Anak ikut terhapus (cascade di schema) supaya tidak ada nav item yatim.
  await prisma.menuItem.delete({ where: { id } });

  updateTag(CONTENT_TAGS.menu);
  revalidatePath("/admin/menu");
  revalidatePath("/", "layout");

  redirect("/admin/menu?deleted=1");
}

/** Naikkan/turunkan urutan item di antara sesame parent-nya. */
export async function moveMenuItemAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id) return;

  const item = await prisma.menuItem.findUnique({
    where: { id },
    select: { id: true, sortOrder: true, parentId: true },
  });
  if (!item) return;

  const neighbour = await prisma.menuItem.findFirst({
    where: {
      parentId: item.parentId,
      ...(direction === "up"
        ? { sortOrder: { lt: item.sortOrder } }
        : { sortOrder: { gt: item.sortOrder } }),
    },
    orderBy: direction === "up" ? { sortOrder: "desc" } : { sortOrder: "asc" },
    select: { id: true, sortOrder: true },
  });
  if (!neighbour) return;

  await prisma.$transaction([
    prisma.menuItem.update({
      where: { id: item.id },
      data: { sortOrder: neighbour.sortOrder },
    }),
    prisma.menuItem.update({
      where: { id: neighbour.id },
      data: { sortOrder: item.sortOrder },
    }),
  ]);

  updateTag(CONTENT_TAGS.menu);
  revalidatePath("/admin/menu");
  revalidatePath("/", "layout");

  redirect("/admin/menu?saved=1");
}

/** Daftar menu (root + anak) untuk halaman admin. */
export async function listMenuItems() {
  await requireSession();

  const items = await prisma.menuItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    include: { children: { orderBy: [{ sortOrder: "asc" }, { label: "asc" }] } },
  });

  return items.filter((item) => item.parentId === null);
}
