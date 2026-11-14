/** Pembangun field zod untuk form cabang — lihat `branch.ts`. */
import { z } from "zod";

/** Koordinat opsional; kosong → null. Di luar rentang bumi ditolak. */
export function coordinate(label: string, max: number) {
  return z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || (Number.isFinite(Number(value)) && Math.abs(Number(value)) <= max),
      `${label} harus angka antara -${max} dan ${max}.`,
    )
    .transform((value) => (value ? Number(value) : null));
}