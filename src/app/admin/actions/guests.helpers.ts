import { Prisma } from "@prisma/client";

import { pairAttributeRows } from "@/lib/domain/guests";

/**
 * Operasi `guestAttribute` yang dibutuhkan helper atribut — dipenuhi baik oleh
 * PrismaClient maupun klien transaksi (TransactionClient) secara struktural.
 */
export type GuestDb = {
  guestAttribute: {
    upsert(args: Prisma.GuestAttributeUpsertArgs): Promise<unknown>;
    deleteMany(args: Prisma.GuestAttributeDeleteManyArgs): Promise<{ count: number }>;
  };
};

/**
 * Upsert satu baris atribut. Aman terhadap UNIQUE(guest_id, key): baris yang
 * sudah ada diperbarui nilainya, yang belum ada dibuat.
 */
export async function upsertAttributeRow(
  db: GuestDb,
  guestId: string,
  key: string,
  value: string | null,
): Promise<void> {
  await db.guestAttribute.upsert({
    where: { guestId_key: { guestId, key } },
    create: { guestId, key, value },
    update: { value },
  });
}

/** Hapus satu baris atribut berdasarkan key; mengembalikan jumlah baris terhapus. */
export async function deleteAttributeRow(
  db: GuestDb,
  guestId: string,
  key: string,
): Promise<number> {
  const result = await db.guestAttribute.deleteMany({ where: { guestId, key } });
  return result.count;
}

export const GUEST_MODULE_PATH = "/admin/guests";

/** Pelanggaran UNIQUE(guest_id, key) saat menulis atribut bersamaan. */
export function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

/** Bentuk mentah FormData form tamu → input `guestFormSchema`. */
export function readGuestForm(formData: FormData) {
  const text = (name: string): string => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  return {
    nama: text("nama"),
    umur: text("umur"),
    jenisKelamin: text("jenisKelamin"),
    attributes: pairAttributeRows(
      formData.getAll("attrKey"),
      formData.getAll("attrValue"),
    ),
  };
}

/** ID tamu dari FormData (field tersembunyi); "" bila tidak ada/kosong. */
export function readId(formData: FormData): string {
  const value = formData.get("id");
  return typeof value === "string" ? value.trim() : "";
}
