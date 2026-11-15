/**
 * Aturan domain modul Pencatatan Tamu (modul 23). Berkas murni (tanpa
 * Prisma/Next.js) sehingga bisa diimpor dari Server Action, komponen klien,
 * maupun unit test.
 *
 * Skema zod + batas panjang input ada di ./guests.schema.ts dan diekspor
 * ulang dari sini. CHECK constraint `jenis_kelamin` hidup di SQL migration
 * (guest_management); validasi zod adalah lapis pertama di aplikasi.
 */

export {
  GUEST_GENDERS,
  type GuestGender,
  MAX_GUEST_NAME,
  MAX_GUEST_AGE,
  MAX_ATTRIBUTE_KEY,
  MAX_ATTRIBUTE_VALUE,
  MAX_ATTRIBUTES,
  guestAttributeSchema,
  type GuestAttributeInput,
  guestFormSchema,
  type GuestFormValues,
} from "./guests.schema.ts";

import type { GuestGender } from "./guests.schema.ts";

/** Data utama tamu — bentuk baris tabel `kama.guests`. */
export type Guest = {
  id: string;
  nama: string | null;
  umur: number | null;
  jenisKelamin: GuestGender | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Atribut tambahan key-value — bentuk baris tabel `kama.guest_attributes`. */
export type GuestAttribute = {
  id: string;
  guestId: string;
  key: string;
  value: string | null;
};

/** State `useActionState` untuk Server Action modul Tamu. */
export type GuestActionState = {
  error: string | null;
  ok?: boolean;
};

export const initialGuestState: GuestActionState = { error: null };

/**
 * Memasangkan baris key-value dinamis dari FormData (`attrKey[]` dipasangkan
 * dengan `attrValue[]` berdasarkan urutan). Baris dengan key kosong (baris
 * baru yang belum diisi) diabaikan.
 */
export function pairAttributeRows(
  keys: FormDataEntryValue[],
  values: FormDataEntryValue[],
): { key: string; value: string }[] {
  const rows: { key: string; value: string }[] = [];
  keys.forEach((entry, index) => {
    const key = typeof entry === "string" ? entry.trim() : "";
    if (!key) return;
    const value = values[index];
    rows.push({ key, value: typeof value === "string" ? value : "" });
  });
  return rows;
}
