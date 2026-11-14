import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { readDirection, reorderUpdates } from "@/lib/domain/corporate";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { formStr } from "./form-utils";

export type ActionState = { error: string | null; ok?: boolean };

/** Urutan tampil — sama persis dengan bacaan publik (`src/lib/content/corporate.ts`). */
export const ORDER = [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }, { id: "asc" as const }];

/** Konten publik berubah → cache `/corporate` dibuang. Inquiry TIDAK memakai tag ini. */
export function revalidateCorporate() {
  updateTag(CONTENT_TAGS.corporate);
  revalidatePath("/corporate");
  revalidatePath("/admin/corporate");
}

/**
 * Pola bersama tiga daftar corporate (program, langkah, klien): geser urutan
 * dan hapus baris. Delegate dikirim sebagai closure supaya tiap model tetap
 * memakai tipe Prisma aslinya.
 */
export async function moveCorporateItem(
  formData: FormData,
  anchor: string,
  listRows: () => Promise<{ id: string; sortOrder: number }[]>,
  applyUpdates: (updates: { id: string; sortOrder: number }[]) => Promise<unknown>,
) {
  await requireRole(CONTENT_ROLES);

  const id = formStr(formData, "id");
  const direction = readDirection(formData.get("direction"));
  if (!id || !direction) return;

  const rows = await listRows();
  const updates = reorderUpdates(rows, id, direction);
  if (updates.length > 0) {
    await applyUpdates(updates);
  }

  revalidateCorporate();
  redirect(`/admin/corporate?saved=1#${anchor}`);
}

export async function deleteCorporateItem(
  formData: FormData,
  anchor: string,
  remove: (id: string) => Promise<unknown>,
) {
  await requireRole(CONTENT_ROLES);

  const id = formStr(formData, "id");
  if (!id) return;
  await remove(id);

  revalidateCorporate();
  redirect(`/admin/corporate?deleted=1#${anchor}`);
}