/** Penjadwalan publikasi artikel journal — lihat `journal.ts`. */
import type { JournalStatusValue } from "./journal.constants.ts";
import { isJournalVisible } from "./visibility.ts";

export type ScheduleResult =
  | { ok: true; status: JournalStatusValue; publishedAt: Date | null }
  | { ok: false; error: string };

/** Status & tanggal yang disimpan dari pilihan di form (lihat aturan di atas). */
export function resolveJournalSchedule(
  status: JournalStatusValue,
  publishedAt: Date | null,
  now: Date = new Date(),
): ScheduleResult {
  if (status === "DRAFT") return { ok: true, status, publishedAt };

  if (!publishedAt) {
    if (status === "SCHEDULED") {
      return { ok: false, error: "Tanggal publikasi wajib diisi untuk artikel terjadwal." };
    }
    return { ok: true, status: "PUBLISHED", publishedAt: now };
  }

  return {
    ok: true,
    status: publishedAt.getTime() > now.getTime() ? "SCHEDULED" : "PUBLISHED",
    publishedAt,
  };
}

/**
 * Status yang sebenarnya berlaku sekarang — dipakai label di dashboard.
 * SCHEDULED yang waktunya sudah lewat sudah tampil publik → PUBLISHED;
 * PUBLISHED bertanggal masa depan belum tampil → SCHEDULED.
 */
export function effectiveJournalStatus(
  post: { status: string; publishedAt?: Date | null },
  now: Date = new Date(),
): JournalStatusValue {
  if (post.status !== "SCHEDULED" && post.status !== "PUBLISHED") return "DRAFT";
  return isJournalVisible(post, now) ? "PUBLISHED" : "SCHEDULED";
}