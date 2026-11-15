import { z } from "zod";

/**
 * Skema validasi + batas input modul Pencatatan Tamu. Berkas murni — dipakai
 * Server Action (lapis aplikasi) sebelum data mencapai CHECK constraint di
 * database (migration guest_management).
 */

export const MAX_GUEST_NAME = 100;
export const MAX_GUEST_AGE = 150;
export const MAX_ATTRIBUTE_KEY = 100;
export const MAX_ATTRIBUTE_VALUE = 500;
export const MAX_ATTRIBUTES = 50;

/** Nilai jenis_kelamin yang diizinkan (CHECK constraint di SQL migration). */
export const GUEST_GENDERS = ["Laki-laki", "Perempuan", "Lainnya"] as const;
export type GuestGender = (typeof GUEST_GENDERS)[number];

/** Satu baris atribut dari form; value kosong disimpan sebagai null. */
export const guestAttributeSchema = z.object({
  key: z
    .string({ message: "Key atribut wajib diisi." })
    .trim()
    .min(1, "Key atribut wajib diisi.")
    .max(MAX_ATTRIBUTE_KEY, `Key atribut maksimal ${MAX_ATTRIBUTE_KEY} karakter.`),
  value: z
    .string()
    .trim()
    .max(MAX_ATTRIBUTE_VALUE, `Nilai atribut maksimal ${MAX_ATTRIBUTE_VALUE} karakter.`)
    .optional()
    .transform((value) => (value ? value : null)),
});

export type GuestAttributeInput = z.infer<typeof guestAttributeSchema>;

/** "" / tidak ada → null; selain itu wajib enum yang valid. */
const optionalEnum = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.union([z.null(), schema]),
  );

/** "" / tidak ada → null; selain itu wajib bilangan bulat 0–MAX_GUEST_AGE. */
const optionalAge = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.union([
    z.null(),
    z.coerce
      .number({ message: "Umur harus berupa angka." })
      .int("Umur harus bilangan bulat.")
      .min(0, "Umur tidak boleh negatif.")
      .max(MAX_GUEST_AGE, `Umur maksimal ${MAX_GUEST_AGE}.`),
  ]),
);

export const guestFormSchema = z.object({
  nama: z
    .string({ message: "Nama wajib diisi." })
    .trim()
    .min(1, "Nama wajib diisi.")
    .max(MAX_GUEST_NAME, `Nama maksimal ${MAX_GUEST_NAME} karakter.`),
  umur: optionalAge,
  jenisKelamin: optionalEnum(
    z.enum(GUEST_GENDERS, { message: "Jenis kelamin tidak valid." }),
  ),
  attributes: z
    .array(guestAttributeSchema)
    .max(MAX_ATTRIBUTES, `Maksimal ${MAX_ATTRIBUTES} atribut per tamu.`)
    .refine(
      (rows) => new Set(rows.map((row) => row.key.toLowerCase())).size === rows.length,
      "Key atribut tidak boleh duplikat.",
    ),
});

export type GuestFormValues = z.infer<typeof guestFormSchema>;
