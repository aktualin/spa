/**
 * Aturan modul Events: status event berdasarkan tanggal, pengelompokan untuk
 * halaman publik, validasi tanggal/slug/tautan mitra, dan format tanggal.
 *
 * Modul murni (tanpa I/O) supaya bisa diuji langsung dengan `node --test`.
 *
 * ATURAN STATUS (dievaluasi terhadap waktu sekarang, zona WIB):
 * - Mulai event  = `startDate` (input tanggal → pukul 00.00 WIB).
 * - Akhir event  = `endDate` (→ pukul 23.59 WIB); bila kosong, akhir hari
 *   tanggal mulai (event satu hari).
 * - "Akan datang"        : sekarang < mulai.
 * - "Sedang berlangsung" : mulai ≤ sekarang ≤ akhir.
 * - "Sudah lewat"        : sekarang > akhir.
 * - "Tanggal menyusul"   : tanpa tanggal sama sekali. Event biasa dianggap
 *   masih akan datang; event kolaborasi dianggap arsip (sudah lewat).
 *
 * PENGELOMPOKAN HALAMAN PUBLIK:
 * - Upcoming (/events)                 : semua event yang belum lewat
 *   (akan datang, sedang berlangsung, tanggal menyusul) — termasuk kolaborasi.
 * - Past (/events, "Telah berlalu")    : event biasa yang sudah lewat.
 * - Past collaborations
 *   (/events/collaborations)           : event kolaborasi yang sudah lewat.
 *
 * Implementasinya dipecah ke berkas `events.*.ts` di folder ini; berkas ini
 * hanya mengekspor ulang simbol publiknya.
 */

export { EVENT_TIME_ZONE, endOfWibDay } from "./events.time.ts";
export {
  type EventPhase,
  type EventLike,
  EVENT_PHASE_LABEL,
  eventEndsAt,
  eventPhase,
  isEventUpcoming,
  isEventPast,
} from "./events.phase.ts";
export { groupEvents } from "./events.group.ts";
export {
  RESERVED_EVENT_SLUGS,
  eventSlugError,
  eventDatesError,
  normalizePartnerUrl,
} from "./events.validate.ts";
export { formatEventDateRange } from "./events.format.ts";