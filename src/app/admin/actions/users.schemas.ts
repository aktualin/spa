import { z } from "zod";

const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 100;

const roleField = z.enum(["ADMIN", "EDITOR"], {
  message: "Role harus ADMIN atau EDITOR.",
});

const nameField = z
  .string({ message: "Nama wajib diisi." })
  .trim()
  .min(1, "Nama wajib diisi.")
  .max(MAX_NAME_LENGTH, `Nama maksimal ${MAX_NAME_LENGTH} karakter.`);

const idField = z.string({ message: "Akun tidak ditemukan." }).trim().min(1, "Akun tidak ditemukan.");

/** Kosong = sistem membuatkan kata sandi acak. */
const optionalPasswordField = z
  .string()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

export const createUserSchema = z.object({
  email: z
    .string({ message: "Email wajib diisi." })
    .trim()
    .toLowerCase()
    .min(1, "Email wajib diisi.")
    .max(MAX_EMAIL_LENGTH, `Email maksimal ${MAX_EMAIL_LENGTH} karakter.`)
    .email("Format email tidak valid."),
  name: nameField,
  role: roleField,
  password: optionalPasswordField,
});

export const updateUserSchema = z.object({
  id: idField,
  name: nameField,
  role: roleField,
  isActive: z.boolean(),
});

export const resetPasswordSchema = z.object({
  id: idField,
  password: optionalPasswordField,
});

export const deleteUserSchema = z.object({
  id: idField,
  confirmEmail: z.string().trim().toLowerCase(),
});