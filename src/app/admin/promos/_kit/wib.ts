/** Zona waktu operasional KAMA Spa (Jakarta Selatan, WIB = UTC+7). */
export const SPA_TIME_ZONE = "Asia/Jakarta";
const WIB_OFFSET = "+07:00";
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Mengubah nilai `<input type="date">` / `<input type="datetime-local">`
 * (tanpa zona waktu) menjadi Date dengan asumsi waktu WIB.
 * - "" → null
 * - format tidak dikenal / tanggal tidak valid → undefined
 * `endOfDay` dipakai untuk input tanggal saja: "2026-12-31" → 23:59:59.999 WIB.
 */
export function parseWibInput(
  value: string | undefined,
  { endOfDay = false }: { endOfDay?: boolean } = {},
): Date | null | undefined {
  const raw = value?.trim() ?? "";
  if (!raw) return null;

  let iso: string;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    iso = `${raw}T${endOfDay ? "23:59:59.999" : "00:00:00"}${WIB_OFFSET}`;
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) {
    iso = `${raw}:00${WIB_OFFSET}`;
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(raw)) {
    iso = `${raw}${WIB_OFFSET}`;
  } else {
    return undefined;
  }

  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Date → "YYYY-MM-DDTHH:mm" (WIB) untuk defaultValue datetime-local. */
export function toWibDateTimeInput(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date.getTime() + WIB_OFFSET_MS).toISOString().slice(0, 16);
}

/** Date → "YYYY-MM-DD" (WIB) untuk defaultValue input tanggal. */
export function toWibDateInput(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date.getTime() + WIB_OFFSET_MS).toISOString().slice(0, 10);
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: SPA_TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: SPA_TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** "8 Nov 2026" */
export function formatWibDate(date: Date | null | undefined): string {
  return date ? dateFormatter.format(date) : "—";
}

/** "8 Nov 2026, 10.00" */
export function formatWibDateTime(date: Date | null | undefined): string {
  return date ? `${dateTimeFormatter.format(date)} WIB` : "—";
}