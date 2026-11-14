import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { reorderIds } from "@/lib/domain/homepage";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { text } from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

export const STATS_PATH = "/admin/homepage/stats";
export const REVIEWS_PATH = "/admin/homepage/reviews";
export const INSTAGRAM_PATH = "/admin/homepage/instagram";

export function revalidateAll(path: string) {
  updateTag(CONTENT_TAGS.homepage);
  revalidatePath(path);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

export const ORDER = [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }];

export function idOf(formData: FormData): string {
  return text(formData, "id")?.trim() ?? "";
}

/**
 * Pola bersama tiga modul homepage (statistik, ulasan, Instagram): geser
 * urutan, terbitkan/sembunyikan, dan hapus baris. Delegate dikirim sebagai
 * closure supaya tiap model tetap memakai tipe Prisma aslinya.
 */
export async function moveHomepageRow(
  formData: FormData,
  path: string,
  listIds: () => Promise<{ id: string }[]>,
  applyOrder: (orderedIds: string[]) => Promise<unknown>,
) {
  await requireRole(CONTENT_ROLES);
  const id = idOf(formData);
  const direction = text(formData, "direction") === "up" ? "up" : "down";
  if (!id) return;
  const rows = await listIds();
  const next = reorderIds(rows.map((r) => r.id), id, direction);
  if (!next) return;
  await applyOrder(next);
  revalidateAll(path);
  redirect(`${path}?saved=1`);
}

export async function toggleHomepageRow(
  formData: FormData,
  path: string,
  setPublished: (id: string, isPublished: boolean) => Promise<unknown>,
) {
  await requireRole(CONTENT_ROLES);
  const id = idOf(formData);
  if (!id) return;
  await setPublished(id, text(formData, "isPublished") === "1");
  revalidateAll(path);
  redirect(`${path}?saved=1`);
}

export async function deleteHomepageRow(
  formData: FormData,
  path: string,
  remove: (id: string) => Promise<unknown>,
) {
  await requireRole(CONTENT_ROLES);
  const id = idOf(formData);
  if (!id) return;
  await remove(id);
  revalidateAll(path);
  redirect(`${path}?deleted=1`);
}