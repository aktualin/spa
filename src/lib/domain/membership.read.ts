/** Pembacaan kolom JSON program membership — lihat `membership.ts`. */
import type { ProgramBenefit, ProgramService } from "./membership.types.ts";
import { isRecord } from "./record.ts";

/** Kolom JSON `benefits` → daftar benefit; entri rusak dibuang. */
export function readBenefits(value: unknown): ProgramBenefit[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) =>
    isRecord(item) && typeof item.title === "string" && item.title.trim()
      ? [{ title: item.title, body: typeof item.body === "string" ? item.body : "" }]
      : [],
  );
}

/** Kolom JSON `services` → daftar layanan; entri rusak dibuang. */
export function readServices(value: unknown): ProgramService[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) =>
    isRecord(item) && typeof item.name === "string" && item.name.trim()
      ? [
          {
            name: item.name,
            description: typeof item.description === "string" ? item.description : "",
          },
        ]
      : [],
  );
}