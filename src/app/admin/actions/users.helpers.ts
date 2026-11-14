import { Prisma } from "@prisma/client";

import {
  generateTemporaryPassword,
  validatePasswordStrength,
} from "@/lib/domain/password-policy";

/**
 * `temporaryPassword` hanya terisi bila sistem membuatkan kata sandi acak.
 * Nilainya dikirim sekali sebagai hasil aksi (tidak disimpan, tidak dicatat di
 * log, tidak masuk URL) supaya ADMIN bisa menyampaikannya ke pemilik akun.
 */
export type ActionState = {
  error: string | null;
  ok?: boolean;
  temporaryPassword?: string;
  email?: string;
};

export function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

/** Transaksi serializable bentrok dengan perubahan lain yang bersamaan. */
export function isWriteConflict(error: unknown): boolean {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  ) {
    return true;
  }
  return error instanceof Error && /could not serialize/i.test(error.message);
}

export const CONFLICT_ERROR =
  "Data akun sedang diubah oleh admin lain pada saat yang sama. Muat ulang halaman lalu coba lagi.";

export const LAST_ADMIN_ERROR =
  "Minimal harus ada satu akun ADMIN aktif. Aktifkan atau naikkan role akun lain terlebih dahulu.";

/** Kata sandi dari form, atau kata sandi acak bila dikosongkan. */
export function resolvePassword(
  typed: string | undefined,
  email: string,
): { password: string; generated: boolean } | { error: string } {
  if (typed === undefined) {
    return { password: generateTemporaryPassword(), generated: true };
  }
  const error = validatePasswordStrength(typed, { email });
  return error ? { error } : { password: typed, generated: false };
}