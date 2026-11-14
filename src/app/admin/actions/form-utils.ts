import type { InquiryStatus } from "@prisma/client";

// ---------------------------------------------------------------------------
// Pembaca nilai FormData bersama untuk Server Action admin yang belum memakai
// promos/_kit/schema. Helper `text`, `checked`, dan `firstIssue` yang identik
// sudah ada di ../promos/_kit/schema — pakai yang di sana, jangan gandakan.
// ---------------------------------------------------------------------------

/** Nilai teks apa adanya; "" bila bukan string (mis. berkas). */
export function formStr(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Semua nilai dengan nama yang sama (checkbox / input ganda). */
export function formAll(formData: FormData, name: string): string[] {
  return formData.getAll(name).map((value) => String(value));
}

/** Arah pemindahan baris ("up"/"down"); null bila tidak valid. */
export function readDirection(formData: FormData): "up" | "down" | null {
  const direction = String(formData.get("direction") ?? "");
  return direction === "up" || direction === "down" ? direction : null;
}

/** Status inquiry/reservasi yang sah; null bila tidak dikenal. */
export function readInquiryStatus(value: string | undefined): InquiryStatus | null {
  return value === "NEW" || value === "CONTACTED" || value === "CLOSED" ? value : null;
}