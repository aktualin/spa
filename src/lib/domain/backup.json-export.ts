/** Aturan ekspor JSON (tanpa I/O) — lihat `backup.ts`. */
import { PERSONAL_DATA_MODELS, SENSITIVE_FIELDS } from "./backup.constants.ts";
import { WIB_OFFSET_MS } from "./wib.ts";

/** Daftar model yang diekspor; data inquiry hanya ikut bila diminta eksplisit. */
export function exportModels(
  all: readonly string[],
  options: { includePersonalData: boolean },
): string[] {
  return all.filter(
    (model) => options.includePersonalData || !PERSONAL_DATA_MODELS.includes(model),
  );
}

/** Salinan baris tanpa field sensitif (lapis kedua setelah `omit` di query). */
export function redactRow(model: string, row: Record<string, unknown>): Record<string, unknown> {
  const hidden = SENSITIVE_FIELDS[model];
  if (!hidden?.length) return row;
  const copy: Record<string, unknown> = { ...row };
  for (const field of hidden) delete copy[field];
  return copy;
}

/** `AdminUser` → `adminUser` (nama delegate Prisma Client). */
export function delegateName(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1);
}

/** `kamaspa-data-20261108-153000.json` (waktu WIB). */
export function exportFileName(date: Date): string {
  const wib = new Date(date.getTime() + WIB_OFFSET_MS).toISOString(); // 2026-11-08T15:30:00.000Z
  const stamp = `${wib.slice(0, 10).replaceAll("-", "")}-${wib.slice(11, 19).replaceAll(":", "")}`;
  return `kamaspa-data-${stamp}.json`;
}